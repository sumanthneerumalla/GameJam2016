var wsUri = "ws://" + location.host + "/ws";
var websocket;
var workqueue = [];
var wifilines = [];
var workarray = {};
var lastitem;
var SystemMessageTimeout = null;
var commsup = 0;

var uniqueid;

function IssueSystemMessage( msg )
{
	var elem = $( "#SystemMessage" );
	elem.hide();
	elem.html(  "<font size=+2>" + msg + "</font>" );
	elem.slideToggle( 'fast' );
	if( SystemMessageTimeout != null ) clearTimeout(SystemMessageTimeout);
	SystemMessageTimeout = setTimeout( function() { SystemMessageTimeout = null; $( "#SystemMessage" ).fadeOut( 'slow' ) }, 3000 );
}


function QueueOperation( objx, callback )
{
    command = JSON.stringify( objx );
	console.log( command );
	if( workarray[command] == 1 )
	{
		return;
	}

	workarray[command] = 1;
	var vp = new Object();
	vp.callback = callback;
	vp.request = command;

	workqueue.push( vp );

	if( workqueue.length == 1)
	{
		var elem = workqueue.shift();
		delete workarray[elem.request];

		if( elem.request )
		{
			doSend( elem.request );
			lastitem = elem;
			return;
		}
	}
}

function StartWebSocket()
{
	if( websocket ) websocket.close();
	workarray = {};
	workqueue = [];
	lastitem = null;
	websocket = new WebSocket(wsUri);
	websocket.onopen = function(evt) { onOpen(evt) };
	websocket.onclose = function(evt) { onClose(evt) };
	websocket.onmessage = function(evt) { onMessage(evt) };
	websocket.onerror = function(evt) { onError(evt) };
}


function onOpen(evt)
{
	doSend( '{"pid":"'+localStorage.pid+'"}' );
}

function onClose(evt)
{
	$('#SystemStatusClicker').css("color", "red" );
	commsup = 0;
}

var msg = 0;
var tickmessage = 0;
var lasthz = 0;
var time_since_hz = 10; //Make it realize it was disconnected to begin with.

function Ticker()
{
	setTimeout( Ticker, 2000 );

	lasthz = (msg - tickmessage);
	tickmessage = msg;
	if( lasthz == 0 )
	{
		time_since_hz++;
		if( time_since_hz > 3 )
		{
			$('#SystemStatusClicker').css("color", "red" );
			$('#SystemStatusClicker').prop( "value", "System Offline" );
			if( commsup != 0 ) IssueSystemMessage( "Comms Lost." );
			commsup = 0;
			StartWebSocket();
		}
		else
			$('#SystemStatusClicker').prop( "value", "System " + 0 + "Hz" );
	}
	else
	{
		time_since_hz = 0;
		$('#SystemStatusClicker').prop( "value", "System " + lasthz + "Hz" );
	}

	//UpdateValids();
}


function onMessage(evt)
{
	msg++;

	if( commsup != 1 )
	{
		commsup = 1;
		$('#SystemStatusClicker').css("color", "green" );
		IssueSystemMessage( "Comms Established." );
	}


	if( lastitem )
	{
		if( lastitem.callback )
		{
			lastitem.callback( lastitem, evt.data );
			lastitem = null;
		}
	}
	else
	{
		if( evt.data.length > 2 )
		{
			var wxresp = evt.data.substr(2).split("\t");
			//output.innerHTML = "<p>Messages: " + msg + "</p><p>RSSI: " + wxresp[0] + " / IP: " + ((wxresp.length>1)?HexToIP( wxresp[1] ):"") + "</p>";	
		}
	}


	if( workqueue.length )
	{
		var elem = workqueue.shift();
		delete workarray[elem.request];

		if( elem.request )
		{
			doSend( elem.request );
			lastitem = elem;
			return;
		}
	}

	//doSend('wx'); //keep-alive
}

function onError(evt)
{
	$('#SystemStatusClicker').css("color", "red" );
	commsup = 0;
}

function doSend(message)
{
	if( websocket )
		websocket.send(message);
}


function init()
{
	if( !localStorage.pid )
	{
		console.log( "No pid.\n" );
		localStorage.pid = Math.random();
	}
	console.log( "Load complete.\n" );
	console.log( localStorage.pid );
	Ticker();
}

window.addEventListener("load", init, false);

