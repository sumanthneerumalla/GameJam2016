// Create the canvas
var canvas;

// Grab a reference to the canvas 2D context
var ctx;

// Handle keyboard controls
var keysDown = {};

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
};

function gameload() {
	var d = new Date();
	canvas = document.getElementById("myCanvas");
	ctx = canvas.getContext("2d");

	starttime = d.getTime();
	setTimeout( render, 16 );
};






function response( req, data )
{
    console.log( "response: " + data );
}

function CommsLoop()
{
    setTimeout( CommsLoop, 100 );

    var MyObject = { x:5 };

    QueueOperation(MyObject, response );
}


setTimeout( CommsLoop, 100 );
