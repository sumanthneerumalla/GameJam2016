import argparse
import random
import os
import cherrypy
import string
import json


from ws4py.server.cherrypyserver import WebSocketPlugin, WebSocketTool
from ws4py.websocket import WebSocket
from ws4py.messaging import TextMessage

AllPlayers = {}

def GotWebsocketData( thing, data ):

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


