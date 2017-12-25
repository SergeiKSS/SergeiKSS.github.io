// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);


document.getElementById('play-again').addEventListener('click', function() {
    myGame.reset();
});

document.addEventListener('keydown', function(e) {
    input.setKey(e, true);
});
document.addEventListener('keyup', function(e) {
    input.setKey(e, false);
});
window.addEventListener('blur', function() {
    input.pressedKeys = {};
});

let input = new Input();

let myGame = new Game();
myGame.init();

