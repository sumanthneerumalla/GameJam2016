import argparse
import random
import os
import cherrypy
import string
import json


from ws4py.server.cherrypyserver import WebSocketPlugin, WebSocketTool
from ws4py.websocket import WebSocket
from ws4py.messaging import TextMessage


def GotWebsocketData( thing, data ):

    try:
        dats = json.loads( str(data) );
    except:
        return

    if not hasattr(thing, 'pid'):
        if 'pid' in dats:
            thing.pid = dats['pid']
        return;

    print "You are: " + thing.pid
    for each in dats:
        print each + ' = ' + str( dats[each] )

    cherrypy.engine.publish('websocket-broadcast', "response")


