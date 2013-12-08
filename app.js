var five = require("johnny-five"),
    express = require('express'),
    app = express(),
    board = new five.Board(),
    server = require('http').createServer(app),
    path = require('path'),
    localtunnel = require('localtunnel'),
    request = require('request'),
    WebSocketServer = require('ws').Server,
    LOCAL_IP = require('os').networkInterfaces().wlan0[0].address,
    PORT = 8080,
    hbridge,
    board,
    client;

var wss = new WebSocketServer({server: server});
app.set('port', process.env.PORT || PORT); 
app.set('views', path.join(__dirname, 'views')); 
app.use(express.favicon()); 
app.use(express.logger('dev')); 
app.use(express.json()); 
app.use(express.urlencoded()); 
app.use(express.methodOverride()); 
app.use(app.router); 
app.use(express.static(path.join(__dirname, 'public')));
app.engine('html', require('ejs').renderFile);

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

app.get('/', function(req, res) {
  res.render('index.html', { local_ip: LOCAL_IP, port: PORT });
});

server.listen(PORT);

// ws setup
wss.on('connection', function(ws) {
    ws.on('message', function(data, flags) {
	console.log(data);
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
client = localtunnel.connect({
    host: 'http://localtunnel.me',
    port: PORT
});

client.on('url', function(url) {
  var device = 'mark1';

  var dhd_url = 'http://dhd-basic.appspot.com/?device=' + device;
      dhd_url += '&local_ip=' + LOCAL_IP;
      dhd_url += '&localtunnel=' + url;
  
  request.post(dhd_url);
});
