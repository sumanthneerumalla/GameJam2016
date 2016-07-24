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
// [id].health
// [id].timesinceserver
var AllSprites = {};


var mapCenterX = 0;
var mapCenterY = 0;

var playerWidth = 100;
var playerHeight = 100;




addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
	userInputUpdate();
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
	userInputUpdate();
}, false);

addEventListener("mousedown", function (e) {
    keysDown[e.keyCode] = true;
    userInputUpdate();
    var mouseX = e.pageX;
    var mouseY = e.pageY;
    myMouseHandler(mouseX,mouseY)
},false);

function myMouseHandler(mouseX,mouseY) {
    if (!AllSprites[localStorage.pid]){
        return
    }
	mouseX += mapCenterX-canvas.width/2;
	mouseY += mapCenterY-canvas.height/2;

    var playerX = AllSprites[localStorage.pid].cx;
    var playerY = AllSprites[localStorage.pid].cy;
    var dx = playerX - mouseX;
    var dy = playerY - mouseY;
    var magnitude = Math.sqrt(dx * dx + dy * dy);
    dx /= magnitude;
    dy /= magnitude;
    var GetRequest = { op:'bul', dx: dx, dy:dy, x: playerX, y:playerY};
	console.log( GetRequest );
    QueueOperation(GetRequest, null );
}
// Game objects
var player = {
    speed: 150,
    x : 0,
    y : 0,
	dx: 0,
	dy:0
};

function userInputUpdate() {
    player.dx = 0;
	player.dy = 0;
	if ((38 in keysDown) || (87 in keysDown)) { // Player holding up
        player.dy -= player.speed ;
    }
    if ((40 in keysDown) || (83 in keysDown)) { // Player holding down
        player.dy += player.speed ;
    }
    if ((37 in keysDown) || (65 in keysDown)) { // Player holding left
        player.dx -= player.speed ;
    }
    if ((39 in keysDown) || (68 in keysDown)) { // Player holding right
        player.dx += player.speed ;
    }
    if (32  in keysDown){
    	player.speed = 300;
	}
	else {
		player.speed = 100;
	}

	move(); // send the players recent direction changes to the server

}

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
		var iir = 0.03;
		if( sp.cx && sp.cy )
		{
			var curdiff = Math.sqrt((sp.cx - mapCenterX)*(sp.cx - mapCenterX) + (sp.cy - mapCenterY)*(sp.cy - mapCenterY) )
			if( curdiff > 300 ) iir = 1;
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

		if (!spr.currentSprite ){
			spr.currentSprite = LigDown;
		}

	    if ( (spr.dx > 0) && (spr.dy == 0) ){
			spr.currentSprite = LigRight
		}
		else if( (spr.dx <0) && (spr.dy == 0)){
			spr.currentSprite = LigLeft
		}
		else if( (spr.dy > 0) && (spr.dx == 0) ){
			spr.currentSprite = LigDown
		}
		else if( (spr.dy <0) && (spr.dx == 0)){
			spr.currentSprite = LigUp
		}
		else{
			spr.currentSprite = LigDown
		}

	    ctx.drawImage(spr.currentSprite, spr.cx-mapofx-playerWidth/2, spr.cy-mapofy-playerHeight/2 );

		//console.log( key );
	}

	ctx.font = "28px Arial";
    ctx.textAlign="center"; 
	for( var key  in AllSprites )
	{
		var spr = AllSprites[key];
		if( !spr.health ) continue;
		ctx.fillStyle="#FFFFFF";
		ctx.fillText(key,spr.cx-mapofx, spr.cy-mapofy-playerHeight/2);
		ctx.strokeText(key,spr.cx-mapofx, spr.cy-mapofy-playerHeight/2);
		ctx.fillStyle="#000000";
		ctx.fillRect(spr.cx-mapofx-playerWidth/2, spr.cy-mapofy+playerHeight/2, playerWidth+2, 16);
		ctx.fillStyle="#00FF00";
		ctx.fillRect(spr.cx-mapofx+1-playerWidth/2, spr.cy-mapofy+1+playerHeight/2, playerWidth*spr.health/100.0, 14);
	}

	for( var key  in AllSprites )
	{
		var spr = AllSprites[key];
		spr.timesinceserver += dtime/1000.0;

		//Can only delete one element at a time
		if( spr.timesinceserver > 2 )
		{
			delete AllSprites[key];
			break;
		}
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

	$('#RespawnButton').click(function(){
		var GetRequest = { op:'respawn' };
		QueueOperation( GetRequest, null );
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
		AllSprites[key].timesinceserver = 0;
		if( sv.health ) AllSprites[key].health = sv.health;
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
BackGround.src = "images/treesBIGGER.jpg";

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



