function Input () {
  this.pressedKeys = {};
}

Input.prototype.setKey = function (event, status) {
  var code = event.keyCode;
  var key;

  switch(code) {
    case 32:
      key = 'SPACE'; break;
    case 37:
      key = 'LEFT'; break;
    case 38:
      key = 'UP'; break;
    case 39:
      key = 'RIGHT'; break;
    case 40:
      key = 'DOWN'; break;
    default:
      key = String.fromCharCode(code);
    }

  this.pressedKeys[key] = status;
}

Input.prototype.isDown = function(key) {
  return this.pressedKeys[key.toUpperCase()];
};