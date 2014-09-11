var socket = io.connect('http://garykertis.com/realtime');
socket.emit('sendUserInfo', {
    'hosts': document.location.host.split(':')[0],
    'referrers': document.referrer == "" ? "Unknown" : document.referrer
});