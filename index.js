var express = require('express')
var app = express();
var external = require('http');
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

app.get('/pixel', function(req, res) {
    res.sendFile('/pixel.js', options);
});

app.get('/backend', function(req, res) {
    res.sendFile('/backend.html', options);
})

var backendid;
//console.log(backendid);

io.on('connect', function(socket) {



    //console.log(socket);


    socket.on('backend_connect', function() {
        backendid = socket;
        //console.log(socket[backendid]);
    });

    if (typeof backendid !== "undefined") {

        ++numUsers;
        socket.uid = "u" + Math.round(Math.random() * (100000000 - 1) + 1);
        request = socket.request;
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

                    backendid.emit('userJoined', {
                        'total': numUsers,
                        'id': socket.uid,
                        'latitude': ipdata.latitude || 0,
                        'longitude': ipdata.longitude || 0
                    });
                });


            }).on('error', function(e) {
                console.log("Got error: " + e.message);
            });
        }



        //console.log(new Date().toString() + " a user joined, id #" + socket.uid);

        socket.on('sendUserInfo', function(data) {
            data.id = socket.uid;
            //console.log(data);
            backendid.emit('update info', data);
            // add the client's username to the global list
            //console.log(socket.uid + ' is on site ' + data.hosts);
            for (creative in data.creatives) {
                //console.log('          with data ' + creative);
            }
        });

        socket.on('update visibility', function(data) {
            data.id = socket.uid;
            backendid.emit('update backend visible', data);
        });

        socket.on('disconnect', function() {
            --numUsers;

            backendid.emit('user left', {
                susers: numUsers,
                suid: socket.uid
            });
            //console.log(new Date().toString() + " the user disconnected, id #" + socket.uid);
        });

    }

});



http.listen(3000, function() {
    console.log('listening on *:3000');
});