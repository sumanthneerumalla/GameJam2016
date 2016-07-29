var music = new Audio("music/HeatOfBattle.mp3");
var effects = {"shoot": new Audio("music/shoot.mp3"),"hit": new Audio("music/hit.mp3")};

function playEffect(name){
	effects[name].currentTime = 0;
	effects[name].play();
}
music.play();

// Create the canvas
var canvas;

var titletime = 5;
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

var ImageDict = {};
var ImageArray = ["ProjG","ProjP","ProjO","Acer","Aquil","Lig","egg"];
for (var i = 0;i < ImageArray.length;i++){
	var toLoad = ImageArray[i];
	ImageDict[toLoad] = [];
	for (var k = 0; k <8; k++){
		ImageDict[toLoad][k] = new Image();
		ImageDict[toLoad][k].src = "images/"+ toLoad + k + ".png";
	}
}

var TitleScreen = new Image();
TitleScreen.src = "images/TitleTransparentSmaller.png";


//ImageDict[spr.sprite][0]

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
    myMouseHandler(mouseX,mouseY);
	playEffect("shoot");
},false);

function myMouseHandler(mouseX,mouseY) {
    if (!AllSprites[localStorage.pid]){
        return
    }
	mouseX += mapCenterX-canvas.width/2;
	mouseY += mapCenterY-canvas.height/2;

    var playerX = AllSprites[localStorage.pid].cx;
    var playerY = AllSprites[localStorage.pid].cy;
    var dx =  mouseX -playerX;
    var dy =  mouseY -playerY;

	var spr = AllSprites[localStorage.pid].sprite;

	var proj = "ProjG";
	var time = 1.0;
	var speed = 100.0;

	if( spr == "Aquil" )
	{
		proj = "ProjP";
		speed = 600.0;
		time = 1.0;
	}
	else if( spr == "Acer" )
	{
		proj = "ProjO";
		speed = 300.0;
		time = 4.0;
	}
	else if( spr == "Lig" )
	{
		proj = "ProjG";
		speed = 600.0;
		time = 1.0;
	}

    var magnitude = 1.0/Math.sqrt(dx * dx + dy * dy) * speed;
    dx *= magnitude;
    dy *= magnitude;
    var GetRequest = { op:'bul', dx: dx, dy:dy, x: playerX, y:playerY, time:time, spr:proj};
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
    if( dtime > 1000 ) dtime = 1000;
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
			var curdiff = Math.sqrt((sp.cx - mapCenterX)*(sp.cx - mapCenterX) + (sp.cy - mapCenterY)*(sp.cy - mapCenterY) );
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

		// if (!spr.currentSprite ){
		// 	spr.currentSprite = LigDown;
		// }
        //
        // if ( (spr.dx > 0) && (spr.dy == 0) ){
		// 	spr.currentSprite = LigRight
		// }
		// else if( (spr.dx <0) && (spr.dy == 0)){
		// 	spr.currentSprite = LigLeft
		// }
		// else if( (spr.dy > 0) && (spr.dx == 0) ){
		// 	spr.currentSprite = LigDown
		// }
		// else if( (spr.dy <0) && (spr.dx == 0)){
		// 	spr.currentSprite = LigUp
		// }
		// else{
		// 	spr.currentSprite = LigDown
		// }
		var faces;
		faces = (spr.timeleft)? 8:4;
		var angle = Math.atan2(-spr.dy,spr.dx)/3.14159/2*faces;
		angle = Math.round(angle+faces)%faces;
		// if (spr.timeleft){
		// 	angle = Math.atan2(-spr.dy,spr.dx);
		//
		// }

		try {		
		    ctx.drawImage(ImageDict[spr.sprite][angle], spr.cx-mapofx-playerWidth/2, spr.cy-mapofy-playerHeight/2 );
		} catch(e)
		{
		}

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

		var timeleft = 10;
		if( spr.timeleft )
		{
			spr.timeleft -= dtime/1000.0;
			timeleft = spr.timeleft;
		}
		//Can only delete one element at a time
		if( spr.timesinceserver > 2 || timeleft < 0 )
		{
			delete AllSprites[key];
			break;
		}
	}


	titletime -= dtime/500.0;
	ctx.globalAlpha = (titletime>0)?titletime:0;
	ctx.drawImage( TitleScreen, canvas.width/2-TitleScreen.width/2, canvas.height/2-TitleScreen.height/2 );
	ctx.globalAlpha = 1.0;

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
		var GetRequest = { op:'respawn', spec:$('#chooseSpecies').val() };
		QueueOperation( GetRequest, null );
	});


	starttime = d.getTime();
	setTimeout( render, 16 );
}


function GetallResponse( req, data )
{
	AllServer = JSON.parse( data );

    var Players = [];

	for( var key in AllServer )
	{
		var iir = 0.6; //Slowness
		var sv = AllServer[key];
		if( !( key in AllSprites ) ) AllSprites[key] = { cx: sv.x, cy: sv.y };

		var distx = AllSprites[key].cx - sv.x;
		var disty = AllSprites[key].cy - sv.y;
		if( Math.sqrt( distx * distx + disty * disty ) > 200 ) iir = 0.0; //If we are too far off from where the server expects, jump.

		AllSprites[key].cx = AllSprites[key].cx * (iir) + sv.x * (1.-iir);
		AllSprites[key].cy = AllSprites[key].cy * (iir) + sv.y * (1.-iir);
		AllSprites[key].dx = sv.dx;
		AllSprites[key].dy = sv.dy;
		AllSprites[key].sprite = sv.sprite;
		AllSprites[key].timesinceserver = 0;
		if( sv.timeleft ) AllSprites[key].timeleft = sv.timeleft;
		if( sv.health )
		{
			if ( sv.health != AllSprites[key].health) {
				if (key == localStorage.pid) {
					playEffect("hit");
				}
			}
			AllSprites[key].health = sv.health;
			AllSprites[key].deaths = sv.deaths?sv.deaths:0;
			AllSprites[key].kills = sv.kills?sv.kills:0;
			var p = AllSprites[key];
			p.pname = key;
			p.kdr = p.kills / (p.deaths+1);
			Players.push( p );
		}
	}

	Players.sort( function( a, b )
	{
		var kdrA = a.kills/(a.deaths+1);
		var kdrB = b.kills/(b.deaths+1);
		return kdrA < kdrB;
	} );
	var lb = "<TABLE border=1>";
	lb += "<TR><TH>Name</TH><TH>Kills</TH><TH>Deaths</TH></TR>";
	for( var i = 0; i < Players.length; i++ )
	{
		var p = Players[i];
		lb += "<TR><TD>" + p.pname + "</TD><TD>" + p.kills + "</TD><TD>" + p.deaths + "</TD></TR>";
	}
	lb += "</TABLE>";
	$("#leaderboard").html( lb );
	
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

setTimeout( CommsLoop, 100 );
