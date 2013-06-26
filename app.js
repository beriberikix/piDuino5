var five = require("johnny-five"),
    express = require('express'),
    app = express(),
    io = require('socket.io'),
    server = require('http').createServer(app),
    io = io.listen(server),
    path = require('path'),
    localtunnel = require('localtunnel'),
    request = require('request'),
    os = require('os'),
    hbridge,
    board,
    client;

board = new five.Board({ port: "/dev/ttyAMA0" });

app.configure(function(){
  app.use(express.static('public'));
});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
  socket.emit('onBoardReady', { ready : true });
  socket.on('forward', function(data) {
    hbridge.forward();
  });
  socket.on('reverse', function(data) {
    hbridge.reverse();
  });
  socket.on('gee', function(data) {
    hbridge.gee();
  });
  socket.on('haw', function(data) {
    hbridge.haw();
  });
  socket.on('halt', function(data) {
    hbridge.halt();
  });
 });

board.on("ready", function() {
  // Create a new `hbridge` hardware instance.
  hbridge = new five.HBridge({
    "right": {
      "forward": 7,
      "reverse": 12
    },
    "left": {
      "forward": 8,
      "reverse": 13
    }
  });

  // Inject the `hbridge` hardware into
  // the Repl instance's context;
  board.repl.inject({
    hbridge: hbridge
  });

client = localtunnel.connect({
    // the localtunnel server
    host: 'http://localtunnel.me',
    // your local application port
    port: 1337
});

  // starting web server
  server.listen(1337);

// when your are assigned a url
client.on('url', function(url) {
  var device = 'mark1',
      local_ip = os.networkInterfaces().wlan0[0].address,
      localtunnel = url;

  var dhd_url = 'http://dhd-basic.appspot.com/?device=' + device + '&local_ip=' + local_ip + '&localtunnel=' + localtunnel;

  request.post(dhd_url);
});
});
