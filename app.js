var five = require('johnny-five'),
    board = new five.Board(),
    PORT = 8080,
    WebSocketServer = require('ws').Server,
    request = require('request'),
    networkInterfaces = require('os').networkInterfaces(),
    motors = {},
    led = {},
    webappURL = 'http://10.0.0.5:3000',
    localIP;

var wss = new WebSocketServer({port: PORT});

// board setup
board.on('ready', function() {
  motors = {
    left: new five.Motor({
      pins: {
        pwm: 3,
        dir: 12
      },
      invertPWM: true
    }),
    right: new five.Motor({
      pins: {
        pwm: 5,
        dir: 8
      },
      invertPWM: true
    })
  };

  led = new five.Led(13);
});

// ws setup
wss.on('connection', function(ws) {
  ws.on('message', function(data, flags) {
    if(data === 'forward') {
      forward(255);
    } else if(data === 'reverse') {
      reverse(255);
    } else if(data === 'turnRight') {
      turnRight(255);
    } else if(data === 'turnLeft') {
      turnLeft(255);
    } else if(data === 'stop') {
      stop();
    } else if(data === 'blink') {
      blink();
    } else if(data === 'noBlink') {
      noBlink();
    }
  });

  ws.on('close', function() {
    console.log('WebSocket connection closed');
  });

  ws.on('error', function(e) {
    console.log('WebSocket error: %s', e.message);
  });

});

// motor functions
var stop = function() {
  motors.left.stop();
  motors.right.stop();
};

var forward = function(speed) {
  motors.left.forward(speed);
  motors.right.forward(speed);
};

var reverse = function(speed) {
  motors.left.reverse(speed);
  motors.right.reverse(speed);
};

var turnRight = function(speed) {
  motors.left.forward(speed);
  motors.right.reverse(speed);
};

var turnLeft = function(speed) {
  motors.left.reverse(speed);
  motors.right.forward(speed);
};

var blink = function() {
  led.strobe(300);
};

var noBlink = function() {
  led.stop();
};

// send robot location to webapp
if(networkInterfaces.wlan0) {
  localIP = networkInterfaces.wlan0[0].address;
} else {
  // use en0 if on mac while developing
  localIP = networkInterfaces.en0[1].address;
}

console.log('local ip is ws://%s:%s', localIP, PORT);

webappURL += '/locate?local_ip=' + localIP;

request.post(webappURL, function(e, r, body) {
  if (e) {
    return console.error('POST request failed:', e);
  }
});