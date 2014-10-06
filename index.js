var express = require('express')
var app = express();
var external = require('http');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var allsockets = [];

var UAParser = require('ua-parser-js');
var parser = new UAParser();

app.use(express.static("public"));

app.enable('trust proxy');

var options = {
    root: "public"
}

app.get('/pixel', function(req, res) {
    res.sendFile('/pixel.js', options);
});

app.get('/backend', function(req, res) {
    res.sendFile('/backend.html', options);
})

var backendid = null;

io.on('connect', function(socket) {

    socket.on('bc', function() {
        backendid = socket;

        console.log(new Date().toString() + "the backend connected.");
        console.log("io.sockets.sockets.length is " + io.sockets.sockets.length - 1);
        backendid.on('disconnect', function() {
            backendid = null;
            console.log(new Date().toString() + "the backend disconnected.");
            allsockets = [];
            for (var i = 0; i < io.sockets.sockets.length; i++) {
                if (io.sockets.sockets[i] != backendid) io.sockets.sockets[i].disconnect();
            };
        });
    });

    if (backendid !== null) {
        doSockets();
    } else {
        var timeout = setTimeout(function() {
            if (backendid === null) {
                socket.disconnect();
            }
        }, 200);
    }


    function doSockets() {

        socket.on('sui', function(data) {
            allsockets.push(socket.id);
            data.id = socket.id;
            //console.log(data);

            var ua = socket.handshake.headers['user-agent'];

            var ua_result = parser.setUA(ua).getResult();

            ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;

            if (typeof ip !== "undefined") {

                var options = {
                    host: 'www.telize.com',
                    port: 80,
                    path: '/geoip/' + ip
                };

                external.get(options, function(res) {
                    var str = "";

                    res.on('data', function(chunk) {
                        str += chunk;
                    });

                    res.on('end', function() {
                        //console.log(str);
                        ipdata = JSON.parse(str);
                        // your code here if you want to use the results !

                        if (backendid !== null && socket.connected) backendid.emit('uj', {
                            'total': allsockets.length,
                            'id': socket.id,
                            'latitude': ipdata.latitude || 0,
                            'longitude': ipdata.longitude || 0,
                            'site': data.site,
                            'browser': ua_result.browser.name || 'Unknown',
                            'device': ua_result.device.name || 'Unknown',
                            'os': ua_result.os.name || 'Unknown'
                        });
                    });


                }).on('error', function(e) {
                    console.log("Got error: " + e.message);
                });
            }

            socket.on('disconnect', function() {

                allsockets.splice(allsockets.indexOf(socket.id), 1)

                if (backendid !== null) backendid.emit('ul', {
                    susers: allsockets.length,
                    suid: socket.id
                });

                //console.log(new Date().toString() + " the user disconnected, id #" + socket.uid);
            });

            //console.log(new Date().toString() + " a user joined, id #" + socket.uid);

            socket.on('uv', function(data) {
                data.id = socket.id;
                if (backendid !== null) backendid.emit('ubv', data);
            });


        });

    }

});

var bootTimer = setInterval(function() {

    if (backendid !== null) {

        console.log(new Date().toString() + " Total clients = " + io.sockets.sockets.length);
        console.log("Registered clients = " + allsockets.length);

        for (var i = 0; i < io.sockets.sockets.length; i++) {

            var found = false;

            for (var j = 0; j < allsockets.length; j++) {
                //console.log('comparing total:' + io.sockets.sockets[i].id + 'with allsockets:' + allsockets[j]);

                if (io.sockets.sockets[i].id === allsockets[j]) {
                    found = true;
                    //console.log("Found match");

                }

            }
            if (!found) {
                if (io.sockets.sockets[i].id !== backendid.id) {
                    console.log(io.sockets.sockets[i].id + " was not found and was disconnected.");
                    io.sockets.sockets[i].disconnect();
                }
            }

        };

    }

}, 100000);


http.listen(3000, function() {
    console.log('listening on *:3000');
});