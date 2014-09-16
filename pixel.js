// Only do anything if jQuery isn't defined

realtime = (function($) {
    console.log("Starting realtime script");

    var rt_creatives = {
        "tag": [],
        "pm_bid": []
    };
    var pm_bids = {
        "bidid": [],
        "bid": []
    };


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

        if (typeof progKeyValueMap !== 'undefined') {
            for (slot in progKeyValueMap) {

                progKeyValueMap[slot].indexOf(';') > 0 ? this_slot = progKeyValueMap[slot].split(";") : this_slot = progKeyValueMap[slot].split("=");
                if (this_slot[0] == "bidstatus") {
                    pm_bids.bidid.push(this_slot[5]);
                    pm_bids.bid.push(this_slot[3]);
                } else {
                    pm_bids.bidid.push(this_slot[3]);
                    pm_bids.bid.push(this_slot[1]);
                }
            }
        }

        for (unit in googletag.slot_manager_instance.b) {
            creative = $('#' + unit).find('iframe').contents().find('object')[0];
            if (typeof creative === "undefined") creative = $('#' + unit).find('iframe').contents().find('img')[0];
            if (typeof creative === "undefined") creative = $('#' + unit).find('iframe').contents().find('iframe')[0];
            if (typeof creative !== "undefined") {
                rt_creatives.tag.push(creative.outerHTML);
                var found = false;
                for (arr in googletag.slot_manager_instance.b[unit].d) {
                    for (number in pm_bids.bidid) {
                        if (googletag.slot_manager_instance.b[unit].d[arr][0] == pm_bids.bidid[number]) {
                            rt_creatives.pm_bid.push(pm_bids.bid[number]);
                            found = true;
                        }

                    }
                }
                if (!found) rt_creatives.pm_bid.push("This slot is not enabled.");
            }

        }

        //console.log(rt_creatives);


    }

    var socket = io('http://' + document.getElementById('rtpix').src.split('/')[2], {
        'multiplex': false,
        'path': '/socket.io'
    });

    socket.emit('sendUserInfo', {
        'hosts': document.location.hostname.split('.')[0],
        'creatives': rt_creatives,
        'referrers': document.referrer
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


            if (typeof thisPageUsingOtherJSLibrary !== "undefined") {

                realtime(jQuery);


            } else {

                // Use .noConflict(), then run your jQuery Code
                $.noConflict();
                realtime(jQuery);


            }

        }

    });

} else { // jQuery was already loaded

    realtime(jQuery);

};