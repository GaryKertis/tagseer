var mapOptions={center:new google.maps.LatLng(0,0),zoom:2},map=new google.maps.Map(document.getElementById("map-canvas"),mapOptions),styles=[{featureType:"landscape",stylers:[{saturation:-100},{visibility:"simplified"}]}];map.setOptions({styles:styles}),$(function(){var e=io(document.location.host,{multiplex:!1,path:"/socket.io"}),t=(new Object,new Object,new Object);e.emit("backend_connected"),e.on("update info",function(e){$("#"+e.id).length||($("#users").append("<div id="+e.id+' class="user"></div>'),$("#"+e.id).append($("<div>").text(e.hosts)),$("#"+e.id).append($("<div>").text(e.referrers)))}),e.on("update backend visible",function(e){for(var i in e.creatives)if(creative=e.creatives[i],"undefined"!=typeof t[e.id]&&"number"==typeof creative.visible){if(creative.visible>0){var o=t[e.id].get("icon");o.fillColor="green",o.strokeColor="green",o.fillOpacity=creative.visible,t[e.id].set("icon",o)}if(creative.visible<=0){var o=t[e.id].get("icon");o.strokeColor="red",o.fillColor="red",o.fillOpacity=.05,t[e.id].set("icon",o)}}}),e.on("userJoined",function(e){function i(e){var t=30,i=window.setInterval(function(){t--;var o=e.get("icon");o.strokeWeight=t,e.set("icon",o),1>=t&&clearInterval(i)},15)}$("#TotalUsers").text(e.total-1);var o={icon:{path:google.maps.SymbolPath.CIRCLE,fillOpacity:.05,fillColor:"#ff0000",strokeOpacity:1,strokeColor:"#ff0000",strokeWeight:30,scale:5},map:map,position:new google.maps.LatLng(e.latitude,e.longitude)};t[e.id]=new google.maps.Marker(o),"undefined"!=typeof t[e.id]&&i(t[e.id])}),e.on("user left",function(e){function i(e){var t=e.get("icon"),i=30,o=window.setInterval(function(){i--,t.strokeWeight=i,t.strokeColor="#000000",e.set("icon",t),0>=i&&(clearInterval(o),e.setMap(null))},20)}$("#TotalUsers").text(e.susers-1),$("#"+e.suid).remove(),"undefined"!=typeof t[e.suid]&&i(t[e.suid])})});