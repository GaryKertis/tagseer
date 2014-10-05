var express = require('express')
var app = express();
var external = require('http');
var http = require('http').Server(app);
var io = require('socket.io')(http);

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
        console.log("io.engine.clientsCount is " + io.engine.clientsCount);
        backendid.on('disconnect', function() {
            backendid = null; 
            console.log(new Date().toString() + "the backend disconnected.");
            for (sock in io.sockets.sockets) {
                io.sockets.sockets[sock].disconnect();
            };
        });
    });

    if (backendid !== null) {
        doSockets(); 
    }
    else {
        var timeout = setTimeout(function(){
            if (backendid === null) {
                socket.disconnect();
            }
        }, 100);
    }


    function doSockets() {

        socket.emit('ok');

        socket.uid = "u" + Math.round(Math.random() * (100000000 - 1) + 1);
        
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

                    if (backendid !== null) backendid.emit('uj', {
                        'total': io.engine.clientsCount,
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

        socket.on('sui', function(data) {
            data.id = socket.uid;
            //console.log(data);
            
            if (backendid !== null) backendid.emit('ui', data);
            // add the client's username to the global list
            //console.log(socket.uid + ' is on site ' + data.hosts);
            for (creative in data.creatives) {
                //console.log('          with data ' + creative);
            }
        });

        socket.on('uv', function(data) {
            data.id = socket.uid;
            if (backendid !== null) backendid.emit('ubv', data);
        });

        socket.on('disconnect', function() {

            if (backendid !== null) backendid.emit('ul', {
                susers: io.engine.clientsCount,
                suid: socket.uid
            });

            //console.log(new Date().toString() + " the user disconnected, id #" + socket.uid);
        });
    }

});




http.listen(3000, function() {
    console.log('listening on *:3000');
});