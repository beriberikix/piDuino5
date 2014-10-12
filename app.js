var five = require('johnny-five'),
    board = new five.Board(),
    PORT = 8080,
    WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: PORT}),
    localtunnel = require('localtunnel'),
    request = require('request'),
    LOCAL_IP = require('os').networkInterfaces().wlan0[0].address;

// board setup
board.on('ready', function() {
  var motors, speed;

  speed = 100;
  motors = {
    left: new five.Motor([ 3, 12 ]),
    right: new five.Motor([ 11, 13 ])
  };

  board.repl.inject({
    motors: motors
  });
});

// app.get('/', function(req, res) {
//   res.render('index.html', { local_ip: LOCAL_IP, port: PORT });
// });

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
    } else if(data === 'halt') {
      halt(255);
    }
  });
});

// motor functions
var stop = function() {
  motors.left.stop();
  motors.right.stop();
};

var forward = function(speed) {
  motors.left.fwd(speed);
  motors.right.fwd(speed);
};

var reverse = function(speed) {
  motors.left.rev(speed);
  motors.right.rev(speed);
};

var turnRight = function(speed) {
  motors.left.fwd(speed);
  motors.right.rev(speed);
};

var turnLeft = function(speed) {
  motors.left.rev(speed);
  motors.right.fwd(speed);
};

// dial-home device/localtunnel setup
localtunnel(PORT, function(err, tunnel) {
  var device = 'mark1';

  var dhd_url = 'http://dhd-basic.appspot.com/?device=' + device;
      dhd_url += '&local_ip=' + LOCAL_IP;
      dhd_url += '&localtunnel=' + tunnel.url;
  
  request.post(dhd_url);
});