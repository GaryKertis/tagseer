var mapOptions = {
        center: new google.maps.LatLng(0, 0),
        zoom: 2,
    };

    var map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);

    var styles = [{
        featureType: "landscape",
        stylers: [{
            saturation: -100
        }, {
            visibility: "simplified"
        }]
    }];

    map.setOptions({
        styles: styles
    });

    $(function() {
       var socket = io(document.location.host, {
        'multiplex': false,
        'path': '/socket.io'
    });


        var papers = new Object;
        var viewers = new Object;
        var circles = new Object;

        
        socket.emit('bc');

        socket.on('ui', function(info) {

            if (!$('#'+ info.id).length) {

            $('#' + info.id).append($('<div>').text(info.site));
            $('#site').append($('<li id="' + info.id + '">').text(info.site).addClass("list-group-item"));

            //console.log(info.id + " user is at " + info.hosts + " site.");

            }            

        });

        socket.on('ubv', function(info) {
            for (var n in info.creatives) {
                creative = info.creatives[n];
                if (typeof circles[info.id] !== "undefined") {
                    if (typeof creative.visible === "number") {

                        if (creative.visible > 0) {
                            //console.log(creative.visible);
                            var icon = circles[info.id].get('icon')
                            icon.fillColor = "green";
                            icon.strokeColor = "green"
                            icon.fillOpacity = creative.visible;
                            circles[info.id].set('icon', icon);
                        }

                        if (creative.visible <= 0) {
                            var icon = circles[info.id].get('icon')
                            icon.strokeColor = "red";
                            icon.fillColor = "red";
                            icon.fillOpacity = .05;
                            circles[info.id].set('icon', icon);
                        }
                    }
                }

                /*
        $('#'+info.id + ' #'+creative.id).text("Visible: " + creative.visible);
        */
            }
        });

        socket.on('uj', function(data) {
            //console.log('A user joined with id #' + data.id + " at " + data.latitude + "," + data.longitude);

            $('#TotalUsers').text(data.total - 1);


            var populationOptions = {
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillOpacity: 0.05,
                    fillColor: '#ff0000',
                    strokeOpacity: 1.0,
                    strokeColor: '#ff0000',
                    strokeWeight: 30,
                    scale: 5 //pixels
                },
                map: map,
                position: new google.maps.LatLng(data.latitude, data.longitude),
            };
            // Add the circle for this city to the map.
            circles[data.id] = new google.maps.Marker(populationOptions);

            if (typeof circles[data.id] !== "undefined") initialAnimation(circles[data.id]);

            function initialAnimation(marker) {
                var count = 30;
                var timer = window.setInterval(function() {
                    count--;
                    var icon = marker.get('icon');
                    icon.strokeWeight = count;
                    marker.set('icon', icon);
                    if (count <= 1) {
                        clearInterval(timer);
                        //console.log('clear timer');
                    }
                    //console.log(count--);
                }, 15);

            }

        });

        socket.on('ul', function(data) {
            $('#TotalUsers').text(data.susers - 1);
            $('#' + data.suid).remove();
            if (typeof circles[data.suid] !== "undefined") finalAnimation(circles[data.suid]);
            //console.log('A user disconnected with id #' + data.suid);

            function finalAnimation(marker) {
                var icon = marker.get('icon');
                var count = 30;
                var timer = window.setInterval(function() {
                    count--;
                    icon.strokeWeight = count;
                    icon.strokeColor = "#000000";
                    marker.set('icon', icon);
                    if (count <= 0) {
                        clearInterval(timer);
                        marker.setMap(null);
                    }
                }, 20);
            }

        });
    });