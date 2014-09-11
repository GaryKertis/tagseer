var socket = io();
socket.emit('scrolled', isScrolledIntoView('#ad'));
socket.emit('sendUserInfo', {
    'hosts': document.location.host.split(':')[0],
    'referrers': document.referrer == "" ? "Unknown" : document.referrer
});