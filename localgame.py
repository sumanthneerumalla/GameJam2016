import argparse
import random
import os
import cherrypy

from ws4py.server.cherrypyserver import WebSocketPlugin, WebSocketTool
from ws4py.websocket import WebSocket
from ws4py.messaging import TextMessage


def GotWebsocketData( thing, data ):
    print "..." + str(data)
    cherrypy.engine.publish('websocket-broadcast', "response")


