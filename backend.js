 var mapOptions = {
    center: new google.maps.LatLng(39.50, -35),
    zoom: 2,
};

var sitelist = [];

var chart;

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

google.load("visualization", "1", {
    packages: ["corechart"]
});
google.setOnLoadCallback(drawChart);

function drawChart() {

    chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
    sitesChart();

}

function sitesChart(siteData) {

    if (!siteData || siteData.length < 2) data = google.visualization.arrayToDataTable([
        ['Sites', 'Users'],
        ['Unknown', 0]
    ]); else data = data = google.visualization.arrayToDataTable(siteData)

    var options = {
        title: 'Sites by User',
        hAxis: {
            title: 'Site',
            titleTextStyle: {
                color: 'black'
            }
        },
        animation: {
            duration: 500,
            easing: 'out',
        },
        vAxis: {
            minValue: 0,
            maxValue: 50
        }
    };

    chart.draw(data, options);
}


$(function() {
   
    var socket = io(document.location.host, {
        'multiplex': true,
        'path': '/socket.io'
    });

    var circles = new Object;
    var userData = new Object;

    socket.emit('bc');

    function countSites(arr) {
            var a = [],
                b = [],
                prev;

            arr.sort();
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] !== prev) {
                    a.push(arr[i]);
                    b.push(1);
                } else {
                    b[b.length - 1]++;
                }
                prev = arr[i];
            }

            return [a, b];
        }

    function formatSites(arr) {
        output = [
            ['Site', 'Users']
        ];

        for (var i = 0; i < arr[0].length; i++) {
            output.push([arr[0][i], arr[1][i]]);
        }
        return output;
    }



    socket.on('ui', function(info) {

        if (!$('#' + info.id).length) {
            userData[info.id] = info.site;
            sitelist.push(info.site);
        } else {
             userData[info.id] = 'unknown';
            sitelist.push('unknown');
        }

        chartSites = countSites(sitelist);
        chartdata = formatSites(chartSites);
        sitesChart(chartdata);

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

        $('#TotalUsers').text(sitelist.length);


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

        sitelist.splice(sitelist.indexOf(userData[data.id]),1);
        $('#TotalUsers').text(sitelist.length);

        chartSites = countSites(sitelist);
        chartdata = formatSites(chartSites);
        sitesChart(chartdata);

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