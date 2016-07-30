import argparse
import random
import os
import cherrypy
import string
import json
import threading
import time
import math
import random

from ws4py.server.cherrypyserver import WebSocketPlugin, WebSocketTool
from ws4py.websocket import WebSocket
from ws4py.messaging import TextMessage

# TestSprite['x'] -> Position
# TestSprite['y'] -> Position
# TestSprite['dx'] > Speed
# TestSprite['dy'] > Speed
# TestSprite['sprite'] > Name of creature
# 'health'
# 'isboolet'
# 'timeleft'  (IF bullet)
# 'owner'  (IF bullet)
AllSprites = {}

booletsize = 120
eggsize = 120

StartTime = 0.0
TimeNow = 0.0
LastTickTime = 0.0
DeltaTime = 0.0
TimeSinceStart = 0.0
CanvasWidth = 4200
CanvasHeight = 1800

TimeSinceEgg = 0

def TickEvent():
    global StartTime, LastTickTime, AllSprites, TimeSinceEgg
    threading.Timer(0.1, TickEvent).start()
    TimeNow = time.time()
    DeltaTime = TimeNow - LastTickTime
    LastTickTime = TimeNow
    TimeSinceStart = TimeNow - StartTime

    # TestSprite = {}
    # TestSprite['x'] = math.sin( TimeSinceStart ) * 200 + 200;
    # TestSprite['y'] = math.cos( TimeSinceStart ) * 200 + 200;
    # TestSprite['dx'] = math.cos( TimeSinceStart );
    # TestSprite['dy'] = math.sin( TimeSinceStart );
    # TestSprite['sprite'] = 'Lig';
    # AllSprites['testsprite'] = TestSprite
    UpdateAllSprites(AllSprites, DeltaTime)

    TimeSinceEgg += DeltaTime;
    if( TimeSinceEgg > 2.0 ):
        SpawnEgg()
        TimeSinceEgg = 0

def StartGame():
    global StartTime, LastTickTime
    StartTime = time.time()
    LastTickTime = StartTime
    TickEvent()

def SpawnEgg():
    f = random.random()*100000.0;
    xStart = random.randrange(0, CanvasWidth, 1)
    yStart = random.randrange(0, CanvasHeight, 1)
    AllSprites[f] = { 'sprite':'egg', 'isboolet': False, 'isegg': True, 'timeleft':20, 'x': xStart, 'y': yStart, 'dx': 0, 'dy': 0 };


def Respawn( pid, species ):
    xStart = random.randrange(0, CanvasWidth, 1)
    yStart = random.randrange(0, CanvasHeight, 1)
    if not pid in AllSprites:
        AllSprites[pid] = {'x': xStart, 'y': yStart, 'dx': 0, 'dy': 0, 'health': 100, 'sprite':species }
    else:
        AllSprites[pid]['x'] = xStart;
        AllSprites[pid]['y'] = yStart;
        AllSprites[pid]['dx'] = 0;
        AllSprites[pid]['dy'] = 0;
        AllSprites[pid]['health'] = 100;
        AllSprites[pid]['sprite'] = species;


def UpdateAllSprites(AllSprites, DeltaTime):
    elements = [];

    players = [];
    boolets = [];
    eggs = [];

#rename spriteName if its too long and to protect against js injection
    for spriteName in AllSprites:
    #only shorten sprite name if its a string that the user entered
       if (type(spriteName) == type("string")):
       #and then only if its longer than 15 char
        if (len(str((spriteName))) >15):
          newName = str(spriteName)[0:15].replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;").replace(">", "&gt;")
          AllSprites[newName] = AllSprites.pop(spriteName)
        else:
        #otherwise only sanitize the input
          newName = str(spriteName).replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;").replace(">", "&gt;")
          AllSprites[newName] = AllSprites.pop(spriteName)
      
    for spriteName in AllSprites:
        elements.append( spriteName );
        if( 'isboolet' in AllSprites[spriteName] and AllSprites[spriteName]['isboolet'] ):
            boolets.append( spriteName )
        elif( 'isegg' in AllSprites[spriteName] and AllSprites[spriteName]['isegg'] ):
            eggs.append( spriteName )
        else:
            players.append( spriteName )

    for e in elements:
        spr = AllSprites[e];
        spr['x'] = spr['x'] + spr['dx'] * DeltaTime
        spr['y'] = spr['y'] + spr['dy'] * DeltaTime
        if 'timeleft' in spr:
            spr['timeleft']-=DeltaTime
            if spr['timeleft'] < 0:
                del AllSprites[ e ];
                continue

#keep players within bounds of canvas
    for pname in players:
        if not pname in AllSprites:
            continue
        p = AllSprites[pname];
        if( p['x'] < 0 ):
            p['x'] = 0; 
        if( p['y'] < 0 ):
            p['y'] = 0; 
        if( p['x'] > CanvasWidth ):
            p['x'] = CanvasWidth; 
        if( p['y'] > CanvasHeight ):
            p['y'] = CanvasHeight; 

        for ename in eggs:
            if not ename in AllSprites:
                continue
            e = AllSprites[ename];
            dist = math.sqrt((e['x']-p['x'])*(e['x']-p['x']) + (e['y']-p['y'])*(e['y']-p['y']))
            if dist < eggsize and e['timeleft'] > 0.2:
                p['health'] += 25
                e['timeleft'] = 0.12
                if p['health'] > 100:
                    p['health'] = 100

        for bname in boolets:
            if not bname in AllSprites:
                continue
            b = AllSprites[bname];

            #if the owner of the bullet is this player, then we don't want to interact with it.
            if b['owner'] == pname:
                continue;

            dist = math.sqrt((b['x']-p['x'])*(b['x']-p['x']) + (b['y']-p['y'])*(b['y']-p['y']))
            if dist < booletsize:
                p['health'] -= 1
                if( p['health'] <= 0 ):
                    if not 'deaths' in AllSprites[pname]:
                        AllSprites[pname]['deaths'] = 0
                    AllSprites[pname]['deaths'] = AllSprites[pname]['deaths'] + 1
                    if not 'kills' in AllSprites[b['owner']]:
                       AllSprites[b['owner']]['kills'] = 0
                    AllSprites[b['owner']]['kills'] = AllSprites[b['owner']]['kills']+1
                    print b['owner'] + " killed " + pname
                    Respawn( pname, AllSprites[pname]['sprite'] )


def GotWebsocketData( thing, data ):
    global AllSprites
    try:
        dats = json.loads( str(data) );
    except:
        return

    if 'pid' in dats:
    	if hasattr(thing, 'pid'):  #Handle renaming of players.
            AllSprites[dats['pid']] = AllSprites[thing.pid]
            del AllSprites[ thing.pid ];
        else:
            Respawn(dats['pid'], 'Lig' )
            AllSprites[dats['pid']]['deaths'] = 0
            AllSprites[dats['pid']]['kills'] = 0

        thing.pid = dats['pid']
        return

    if not hasattr(thing, 'pid'):
        return;

    if not 'op' in dats:
        print "No operation found for " + str(data);

    if dats['op'] == 'getall':
       thing.send( json.dumps( AllSprites ) );
       return;
    elif dats['op'] == 'makeMove':
        #calculate new location of the players move
        ourPlayer = dats['p']
        ourPlayer['x'] = ourPlayer['x'] + ourPlayer['dx']
        ourPlayer['y'] = ourPlayer['y'] + ourPlayer['dy']

        #update all the sprite locations
        AllSprites[thing.pid]['dx'] = ourPlayer['dx']
        AllSprites[thing.pid]['dy'] = ourPlayer['dy']
    elif dats['op'] == 'respawn':
        AllSprites[thing.pid]['deaths'] = 0
        AllSprites[thing.pid]['kills'] = 0
        Respawn( thing.pid, dats['spec'] )
    elif dats['op'] == 'bul':
        f = random.random()*100000.0;
        AllSprites[f] = { 'sprite':dats['spr'], 'isboolet': True, 'timeleft': dats['time'], 'x': dats['x'], 'y': dats['y'], 'dx': dats['dx'], 'dy': dats['dy'], 'owner':thing.pid };


    #print "You are: " + thing.pid
    #for each in dats:
    #    print each + ' = ' + str( dats[each] )
	#thing.send( "response" );


