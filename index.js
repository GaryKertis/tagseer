var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var numUsers = 0;

var enableCORS = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://thelivre.com');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, *');
    res.header('Access-Control-Allow-Credentials', 'true');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    } else {
        next();
    };
};


// enable CORS!
app.use(enableCORS);

app.use(express.static(__dirname));

app.enable('trust proxy');

var options = {
    root: __dirname
}

app.get('/', function(req, res) {
    res.sendFile('/index.html', options);
});

app.get('/pixel', function(req, res) {
    res.sendFile('/pixel.js', options);
});

app.get('/backend', function(req, res) {
    res.sendFile('/backend.html', options);
})

io.on('connect', function(socket) {
    ++numUsers;
    socket.uid = Math.random();
    socket.emit('userJoined', {
        'total': numUsers,
        'id': socket.uid
    });

    console.log("User joined at" + socket.uid);

    socket.on('sendUserInfo', function(data) {
        console.log('sendUserInfo event received.')
        data.id = socket.uid;
        io.emit('update info', data);
        socket.sites = data.hosts;
        socket.referrers = data.referrers;
        // add the client's username to the global list

        console.log('now connecting ' + socket.sites);
    });


    socket.on('disconnect', function() {
        --numUsers;

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