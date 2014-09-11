(function() {
    var socket = io('http://garykertis.com/', {
        'multiplex': false,
        'path': '/realtime/socket.io'
    });
    socket.emit('sendUserInfo', {
        'hosts': document.location.hostname.split('.')[0],
        'referrers': document.referrer == "" ? "Unknown" : document.referrer
    });
})();