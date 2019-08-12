var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var roslib = require('roslib');

var ros = new roslib.Ros();

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});

ros.connect('ws://localhost:9090', function() {
  console.log('ROS connection complete');
});

ros.on('connection', function(msg) {
  console.log('Connected to local ROS');
});

ros.on('error', function(msg) {
  console.log('Error connecting to ROS');
});

var log_topic = new roslib.Topic({
  ros: ros,
  name:"/rosout_agg",
  message_type: "rosgraph_msgs/Log",
  queue_size: 10,
  queue_length: 10
});
log_topic.subscribe(function(msg) {
  var context_msg = 'node ' + msg.name + ' logged ' + msg.msg;
  console.log(context_msg);
  io.emit('log message', context_msg);
});

io.on('connection', function (socket) {
  console.log('a user connected');
  socket.on('disconnect', function () {
    console.log('Got disconnect!');
  });

  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    console.log('message: ' + msg);
  });
});