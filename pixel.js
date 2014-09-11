var socket = io.connect('http://garykertis.com/realtime');
socket.emit('sendUserInfo', {
    'hosts': document.location.host,
    'referrers': document.referrer == "" ? "Unknown" : document.referrer
});