ioscript = document.createElement('script');
ioscript.src = "http://localhost:3000/socket.io/socket.io.js";
document.body.appendChild(ioscript);
rtscript = document.createElement('script');
rtscript.id = 'rtpix';
rtscript.src = "http://localhost:3000/pixel.js";
document.body.appendChild(rtscript);

ioscript = document.createElement('script');
ioscript.src = "http://tagseer.com/socket.io/socket.io.js";
document.body.appendChild(ioscript);
rtscript = document.createElement('script');
rtscript.id = 'rtpix';
rtscript.src = "http://tagseer.com/pixel";
document.body.appendChild(rtscript);