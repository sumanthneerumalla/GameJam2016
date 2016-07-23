var music = new Audio("music/HeatOfBattle.mp3");

music.play();

// Create the canvas
var canvas;

// Grab a reference to the canvas 2D context
var ctx;

// Handle keyboard controls
var keysDown = {};

// All Sprites (mostly players)
// [id].x = current x (server)  px
// [id].y = current y (server)  px
// [id].dx = current speed x    px/s
// [id].dy = current speed y    px/s
// [id].sprite = SpriteName     "name"
var AllServer = {};

// [id].cx = current x (client) px
// [id].cy = current y (client) px
// [id].dx = current x (client) px
// [id].dy = current y (client) px
// [id].sprite = SpriteName     "name"
var AllSprites = {};


var mapCenterX = 0;
var mapCenterY = 0;



addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
	userInputUpdate();
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
	userInputUpdate();
}, false);

// Game objects
var player = {
    speed: 100,
    x : 0,
    y : 0,
	dx: 0,
	dy:0
};

function userInputUpdate() {
    player.dx = 0;
	player.dy = 0;
	if (38 in keysDown) { // Player holding up
        player.dy -= player.speed ;
    }
    if (40 in keysDown) { // Player holding down
        player.dy += player.speed ;
    }
    if (37 in keysDown) { // Player holding left
        player.dx -= player.speed ;
    }
    if (39 in keysDown) { // Player holding right
        player.dx += player.speed ;
    }
    if (32  in keysDown){
    	player.speed = 300;
	}
	else {
		player.speed = 100;
	}

	move(); // send the players recent direction changes to the server

};

// Draw everything

var frame = 0;
var lasttime = 0;
var starttime = 0;

function render() {
	frame++;

	var d = new Date();
	var n = d.getTime(); 

	var ltime = n - starttime;
	var dtime = n - lasttime;
	lasttime = n;

	setTimeout( render, 16 );
 
	canvas.width  = window.innerWidth;
	canvas.height = window.innerHeight;

	var Lig0 =     document.getElementById("Lig0");

	// All Sprites (mostly players)
	// [id].cx = current x (client) px
	// [id].cy = current y (client) px
	// [id].dx = current speed x    px/s
	// [id].dy = current speed y    px/s
	// [id].sprite = SpriteName     "name"
	//var AllSprites = {};

	if( localStorage.pid in AllSprites )
	{
		var sp = AllSprites[localStorage.pid];
		var iir = 0.02;
		if( sp.cx && sp.cy )
		{
			mapCenterX = sp.cx * iir + mapCenterX * (1.0-iir );
			mapCenterY = sp.cy * iir + mapCenterY * (1.0-iir );
		}
	}
	var mapofx = mapCenterX - canvas.width/2;
	var mapofy = mapCenterY - canvas.height/2;

    ctx.drawImage(BackGround, -mapofx, -mapofy);

	for( var key in AllSprites )
	{
		var spr = AllSprites[key];
		spr.cx += spr.dx * dtime/1000.0;
		spr.cy += spr.dy * dtime/1000.0;
	    ctx.drawImage(Lig0, spr.cx-mapofx, spr.cy-mapofy );

		//console.log( key );
	}


/*
//	console.log( background );
//	console.log( player );
	var k;
	for( k = 0; k < 300; k++ )
	{
	    ctx.drawImage(player,
			Math.sin(ltime/100000.0*(k+100))*30+100 + (k % 30)*40,
			Math.cos(ltime/100000.0*(k+100))*30+100 + (k / 30)*40 );
	}
*/
}

function gameload() {
	var d = new Date();
	canvas = document.getElementById("myCanvas");
	ctx = canvas.getContext("2d");

	$('#PlayerName').change(function(){
		localStorage.pid = this.value;
		doSend( '{"pid":"'+localStorage.pid+'"}' );
	});

	starttime = d.getTime();
	setTimeout( render, 16 );
}


function GetallResponse( req, data )
{
	AllServer = JSON.parse( data );
	for( var key in AllServer )
	{
		var iir = 0.6; //Slowness
		var sv = AllServer[key];
		if( !( key in AllSprites ) ) AllSprites[key] = { cx: sv.x, cy: sv.y };
		AllSprites[key].cx = AllSprites[key].cx * (iir) + sv.x * (1.-iir);
		AllSprites[key].cy = AllSprites[key].cy * (iir) + sv.y * (1.-iir);
		AllSprites[key].dx = sv.dx;
		AllSprites[key].dy = sv.dy;
		AllSprites[key].sprite = sv.sprite;
	}
}

function move(){
	var GetRequest = { op:'makeMove', p: player };
	QueueOperation(GetRequest, null );
}

function CommsLoop()
{
    setTimeout( CommsLoop, 100 );

    var GetRequest = { op:'getall' };
    QueueOperation(GetRequest, GetallResponse );
}

var BackGround = new Image();
BackGround.src = "images/treesBIGGER.jpg"

var LigDown = new Image();
LigDown.src = "images/LigDown.png";

var LigUp = new Image();
LigUp.src = "images/LigUp.png";

var LigLeft = new Image();
LigLeft.src = "images/LigLeft.png";

var LigRight = new Image();
LigRight.src = "images/LigRight.png";

var AquilDown = new Image();
AquilDown.src = "images/AquilDown.png";

var AquilUp = new Image();
AquilUp.src = "images/AquilUp.png";

var AquilLeft = new Image ();
AquilLeft.src = "images/AquilLeft.png";

var AquilRight = new Image();
AquilRight.src = "images/AquilRight.png";

setTimeout( CommsLoop, 100 );



