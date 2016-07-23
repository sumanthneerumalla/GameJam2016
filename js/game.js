// Create the canvas
var canvas = document.getElementById("myCanvas");
canvas.width = 512;
canvas.height = 512;
document.body.appendChild(canvas);

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

