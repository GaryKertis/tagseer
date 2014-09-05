var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
    res.sendfile('index.html');
});

app.get('/backend', function(req, res) {
    res.sendfile('backend.html');
})

io.on('connection', function(socket) {
    socket.on('scrolled', function(msg) {
        io.emit('dashboard update', msg);
        console.log(msg);
    });

});

http.listen(3000, function() {
    console.log('listening on *:3000');
});