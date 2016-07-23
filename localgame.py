import argparse
import random
import os
import cherrypy
import string
import json
import threading
import time
import math

from ws4py.server.cherrypyserver import WebSocketPlugin, WebSocketTool
from ws4py.websocket import WebSocket
from ws4py.messaging import TextMessage

AllPlayers = {}

StartTime = 0.0
TimeNow = 0.0
LastTickTime = 0.0
DeltaTime = 0.0
TimeSinceStart = 0.0

def TickEvent():
    global StartTime, LastTickTime, AllPlayers
    threading.Timer(0.1, TickEvent).start()
    TimeNow = time.time()
    DeltaTime = TimeNow - LastTickTime
    LastTickTime = TimeNow
    TimeSinceStart = TimeNow - StartTime

    TestSprite = {}
    TestSprite['x'] = math.sin( TimeSinceStart ) * 200 + 200;
    TestSprite['y'] = math.cos( TimeSinceStart ) * 200 + 200;
    TestSprite['dx'] = math.cos( TimeSinceStart );
    TestSprite['dy'] = math.sin( TimeSinceStart );
    TestSprite['sprite'] = 'Lig';
    AllPlayers['testsprite'] = TestSprite

def StartGame():
    global StartTime, LastTickTime
    StartTime = time.time()
    LastTickTime = StartTime
    TickEvent()
	

def GotWebsocketData( thing, data ):
    global AllPlayers
    try:
        dats = json.loads( str(data) );
    except:
        return

    if 'pid' in dats:
    	if hasattr(thing, 'pid'):  #Handle renaming of players.
            AllPlayers[dats['pid']] = AllPlayers[thing.pid]
            del AllPlayers[ thing.pid ];
        else:
            AllPlayers[dats['pid']] = { 'x':5, 'y':5 }

        thing.pid = dats['pid']
        return

    if not hasattr(thing, 'pid'):
        return;

    if not 'op' in dats:
        print "No operation found for " + str(data);

    if dats['op'] == 'getall':
       thing.send( json.dumps( AllPlayers ) );
       return;


    #print "You are: " + thing.pid
    #for each in dats:
    #    print each + ' = ' + str( dats[each] )
	#thing.send( "response" );


