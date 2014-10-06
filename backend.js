 var mapOptions = {
     center: new google.maps.LatLng(39.50, -35),
     zoom: 2,
 };

 var sitelist = [];
 var browserlist = [];

 var chart;
 var browserchart;

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
     piechart = new google.visualization.PieChart(document.getElementById('piechart'));

     sitesChart();
     browserChart();

 }

 function browserChart(browserData) {
     var data;
     if (!browserData || browserData.length < 2) data = google.visualization.arrayToDataTable([
         ['Browser', 'Users'],
         ['Unknown', 0]
     ]);
     else data = google.visualization.arrayToDataTable(browserData)

     var options = {
         title: 'Browsers',
         animation: {
             duration: 500,
             easing: 'out'
         }
     };

     piechart.draw(data, options);
 }

 function sitesChart(siteData) {
     var data;
     if (!siteData || siteData.length < 2) data = google.visualization.arrayToDataTable([
         ['Sites', 'Users'],
         ['Unknown', 0]
     ]);
     else data = google.visualization.arrayToDataTable(siteData)

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
             maxValue: 25
         },
         showValue: true
     };

     var view = new google.visualization.DataView(data);
     view.setColumns([0, 1, {
         calc: "stringify",
         sourceColumn: 1,
         type: "string",
         role: "annotation"
     }]);

     chart.draw(view, options);
 }


 $(function() {

     var socket = io(document.location.host, {
         'multiplex': false,
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

         $('#TotalUsers').text(data.total);

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

         userData[data.id] = {
             site: data.site
         };
         sitelist.push(data.site);

         userData[data.id].browser = data.browser;
         browserlist.push(data.browser);

         chartSites = countSites(sitelist);
         chartdata = formatSites(chartSites);
         sitesChart(chartdata);

         chartBrowser = countSites(browserlist);
         browserData = formatSites(chartBrowser);
         browserChart(browserData);

     });

     socket.on('ul', function(data) {

         if (typeof userData[data.suid] === "undefined") console.log(data.suid + " didn't register.");

         $('#TotalUsers').text(data.susers);

         sitelist.splice(sitelist.indexOf(userData[data.suid].site), 1);

         chartSites = countSites(sitelist);
         chartdata = formatSites(chartSites);
         sitesChart(chartdata);

         browserlist.splice(sitelist.indexOf(userData[data.suid].browser), 1);

         chartBrowser = countSites(browserlist);
         browserData = formatSites(chartBrowser);
         browserChart(browserData);

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