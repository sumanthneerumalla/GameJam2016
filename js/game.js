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
// [id].cx = current x (client) px
// [id].cy = current y (client) px
// [id].dx = current speed x    px/s
// [id].dy = current speed y    px/s
// [id].sprite = SpriteName     "name"
var AllSprites = {};


addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
}, false);

// Game objects
var player = {
    speed: 100,
    x : 0,
    y : 0
};

var update = function (modifier) {
    if (38 in keysDown) { // Player holding up
        player.y -= player.speed * modifier;
    }
    if (40 in keysDown) { // Player holding down
        player.y += player.speed * modifier;
    }
    if (37 in keysDown) { // Player holding left
        player.x -= player.speed * modifier;
    }
    if (39 in keysDown) { // Player holding right
        player.x += player.speed * modifier;
    }
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
 
	var background = document.getElementById("background");
	var player =     document.getElementById("player");
//	console.log( background );
//	console.log( player );
    ctx.drawImage(background, 0, 0);
	var k;
	for( k = 0; k < 300; k++ )
	{
	    ctx.drawImage(player,
			Math.sin(ltime/100000.0*(k+100))*30+100 + (k % 30)*40,
			Math.cos(ltime/100000.0*(k+100))*30+100 + (k / 30)*40 );
	}
}

function gameload() {
	var d = new Date();
	canvas = document.getElementById("myCanvas");
	ctx = canvas.getContext("2d");

	$('#PlayerName').change(function(){
		localStorage.pid = this.value;
		console.log( this.value );
		doSend( '{"pid":"'+localStorage.pid+'"}' );
	});

	starttime = d.getTime();
	setTimeout( render, 16 );
}


function GetallResponse( req, data )
{
    //console.log( "response: " + data );
	AllSprites = JSON.parse( data );
}

function CommsLoop()
{
    setTimeout( CommsLoop, 100 );

    var GetRequest = { op:'getall' };
    QueueOperation(GetRequest, GetallResponse );
}

setTimeout( CommsLoop, 100 );



