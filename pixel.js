(function() {

    var scriptid = document.getElementById('rtpix').src;

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(scriptid);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    var adid = getParameterByName('adid');
    if (typeof adid !== 'undefined') console.log(adid);

    var socket = io('http://' + document.getElementById('rtpix').src.split('/')[2], {
        'multiplex': false,
        'path': '/socket.io'
    });

    socket.emit('sendUserInfo', {
        'hosts': document.location.hostname.split('.')[0],
        'referrers': document.referrer == "" ? "Unknown" : document.referrer
    });
})();