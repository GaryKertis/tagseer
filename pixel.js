// Only do anything if jQuery isn't defined

realtime = (function($) {

    var scriptid = document.getElementById('rtpix').src;

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(scriptid);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    var adid = getParameterByName('adid');
    if (typeof adid !== 'undefined') console.log(adid);

    if (typeof googletag !== 'undefined') {

        for (unit in googletag.slot_manager_instance.b) {
            console.log($('#' + unit));


        }

    }

    var socket = io('http://' + document.getElementById('rtpix').src.split('/')[2], {
        'multiplex': false,
        'path': '/socket.io'
    });

    socket.emit('sendUserInfo', {
        'hosts': document.location.hostname.split('.')[0],
        'referrers': document.referrer == "" ? "Unknown" : document.referrer
    });
});

if (typeof jQuery == 'undefined') {
    if (typeof $ == 'function') {
        // warning, global var
        thisPageUsingOtherJSLibrary = true;
    }

    function getScript(url, success) {
        var script = document.createElement('script');
        script.src = url;
        var head = document.getElementsByTagName('head')[0],
            done = false;

        // Attach handlers for all browsers
        script.onload = script.onreadystatechange = function() {
            if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
                done = true;
                // callback function provided as param
                success();
                script.onload = script.onreadystatechange = null;
                head.removeChild(script);
            };
        };
        head.appendChild(script);
    };

    getScript('http://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js', function() {
        if (typeof jQuery == 'undefined') {
            // Super failsafe - still somehow failed...
        } else {
            // jQuery loaded! Make sure to use .noConflict just in case
            realtime(jQuery);


            if (thisPageUsingOtherJSLibrary) {

                realtime(jQuery);


            } else {

                // Use .noConflict(), then run your jQuery Code
                realtime(jQuery);


            }

        }

    });

} else { // jQuery was already loaded

    realtime(jQuery);

};