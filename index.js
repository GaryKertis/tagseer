var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var numUsers = 0;
var sites = {};
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
    ++numUsers;
    socket.emit('userJoined', numUsers);

    socket.on('scrolled', function(msg) {
        io.emit('dashboard update', msg);
    });

    socket.on('sendUserInfo', function(site) {
        io.emit('update info', site);
        socket.site = site;
        // add the client's username to the global list
        sites[site] = site;
        console.log(socket.site);
    });


    socket.on('disconnect', function() {
        --numUsers;
        delete sites[socket.site];
        socket.emit('userLeft', {
            users: numUsers,
            site: socket.site
        });
    });

});



http.listen(3000, function() {
    console.log('listening on *:3000');
});