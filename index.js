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

io.on('connect', function(socket) {
    ++numUsers;
    console.log(numUsers);
    socket.emit('userJoined', numUsers);

    socket.on('scrolled', function(msg) {
        io.emit('dashboard update', msg);
    });

    socket.on('sendUserInfo', function(site) {
        io.emit('update info', site);
        socket.sites = site.hosts;
        socket.referrers = site.referrers;
        // add the client's username to the global list
        sites[site] = site.referrers;
        console.log('now connecting' + socket.sites);
    });


    socket.on('disconnect', function() {
        --numUsers;
        delete sites[socket.sites];
        delete sites[socket.referrers];
        socket.broadcast.emit('user left', {
            susers: numUsers,
            ssite: socket.sites,
            sreferrer: socket.referrers
        });
        console.log("server disconnect " + socket.sites);
    });

});



http.listen(3000, function() {
    console.log('listening on *:3000');
});