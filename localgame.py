

def GotWebsocketData( thing, data ):
    print data
    cherrypy.engine.publish('websocket-broadcast', "response")


