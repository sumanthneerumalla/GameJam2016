// Create the canvas
var canvas = document.getElementById("myCanvas");

// Grab a reference to the canvas 2D context
var ctx = canvas.getContext("2d");

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
    speed: 100
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
function render() {
    if (bgReady) {
        ctx.drawImage(bgImage, 0, 0);
    }

    if (heroReady) {
        ctx.drawImage(heroImage, hero.x, hero.y);
    }
};

function gameload() {
    var img=document.getElementById("background");
    ctx.drawImage(img,0,0);
};
