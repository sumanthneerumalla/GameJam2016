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
            AllPlayers.remove( thing.pid );
        thing.pid = dats['pid']

    if not hasattr(thing, 'pid'):
        return;

    print "You are: " + thing.pid
    for each in dats:
        print each + ' = ' + str( dats[each] )

    cherrypy.engine.publish('websocket-broadcast', "response")


