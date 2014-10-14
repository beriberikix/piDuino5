var five = require('johnny-five'),
    board = new five.Board(),
    PORT = 8080,
    WebSocketServer = require('ws').Server,
    localtunnel = require('localtunnel'),
    request = require('request'),
    networkInterfaces = require('os').networkInterfaces(),
    LOCAL_IP = '127.0.0.1',
    express = require('express'),
    app = express(),
    motors = {};

//configure Express
// app.set('views', __dirname);
// app.use('/bower_components',  express.static(__dirname + '/bower_components'));
// app.engine('html', require('ejs').renderFile);
// var server = app.listen(PORT, function() {
//     console.log('Listening on port %d', server.address().port);
// });

// var wss = new WebSocketServer({server: server});
var wss = new WebSocketServer({port: PORT});

// app.get('/', function(req, res) {
//   res.render('index.html');
// });

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

  board.repl.inject({
    motors: motors
  });
});

// ws setup
wss.on('connection', function(ws) {
  ws.on('message', function(data, flags) {
    if(data === 'forward') {
      forward();
    } else if(data === 'reverse') {
      reverse();
    } else if(data === 'turnRight') {
      turnRight();
    } else if(data === 'turnLeft') {
      turnLeft();
    } else if(data === 'stop') {
      stop();
    }
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

// dial-home device/localtunnel setup
localtunnel(PORT, function(err, tunnel) {
  var device = 'mark1';

  // use en0 if on mac while developing
  if(networkInterfaces.wlan0) {
    LOCAL_IP = networkInterfaces.wlan0[0].address;
  } else {
    LOCAL_IP = networkInterfaces.en0[1].address;
  }

  var dhd_url = 'http://dhd-basic.appspot.com/?device=' + device;
      dhd_url += '&local_ip=' + LOCAL_IP;
      dhd_url += '&localtunnel=' + tunnel.url;
  
  console.log(dhd_url);

  request.post(dhd_url);
});