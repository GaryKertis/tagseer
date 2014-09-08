var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static(__dirname));
app.enable('trust proxy');

var options = {
	root: __dirname
}

app.get('/', function(req, res) {
    res.sendFile('/index.html', options);
});

app.get('/backend', function(req, res) {
    res.sendFile('/backend.html', options);
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
