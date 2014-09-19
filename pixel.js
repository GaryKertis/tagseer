// Only do anything if jQuery isn't defined

realtime = (function($) {
    //console.log("Starting realtime script");

    var socket = io('http://' + document.getElementById('rtpix').src.split('/')[2], {
        'multiplex': false,
        'path': '/socket.io'
    });

    var rt_creatives = new Object;

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

    function findCreative(unit) {
        rt_creatives[unit] = {
            id: unit
        };
        creative = $('#' + unit).find('iframe').contents().find('object');

        if (!creative.length) creative = $('#' + unit).find('iframe').contents().find('img');
        if (!creative.length) creative = $('#' + unit).find('iframe').contents().find('iframe');
        if (creative.length) {
            rt_creatives[unit].tag = creative[0].outerHTML;
            rt_creatives[unit].timer = setInterval(function() {
                isVisible(unit)
            }, 100);
        }
    }

    var adid = getParameterByName('adid');

    if (adid == "") {
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
                findCreative(unit);


                for (arr in googletag.slot_manager_instance.b[unit].d) {
                    for (number in pm_bids.bidid) {
                        if (googletag.slot_manager_instance.b[unit].d[arr][0] == pm_bids.bidid[number]) {
                            rt_creatives[unit].pm_bid = pm_bids.bid[number];
                        }

                    }
                }
            }

        }

    } else {
        ads = adid.split(',')
        for (var i = 0; i < ads.length; i++) {
            findCreative(ads[i]);
        }
    }

    function isVisible(unit) {
        upperBound = $('#' + unit).offset().top;
        lowerBound = upperBound + $('#' + unit).height();

        leftBound = $('#' + unit).offset().left;
        rightBound = leftBound + $('#' + unit).width();
        vp_upperBound = $(window).scrollTop();
        vp_lowerBound = vp_upperBound + $(window).height();
        vp_leftBound = $(window).scrollLeft();

        //top of unit is below bottom of window
        //--not in view
        //bottom of unit is above top of window
        //--not in view
        //top of unit is above bottom of window and bottom of unit is below bottom of window
        //--calculate percentage difference between upperBound & vp_lowerBound (divide by unit height)
        //bottom of unit is below top of window and top of unit is above top of winow
        //--calculate percentage difference between lowerBound & vp_upperBound (divide by unit height)
        //both top of unit is below top of window and bottom of unit is above bottom of window
        //--100% in view.
        /*
        console.log('Unit name is: ' + unit);
        console.log("upperBound is " + upperBound);
        console.log("lowerBound is " + lowerBound);
        console.log("vp_upperBound is " + vp_upperBound);
        console.log("vp_lowerBound is " + vp_lowerBound);
        console.log("Unit height is " + $('#' + unit).height());*/

        if (upperBound > vp_lowerBound && lowerBound > vp_lowerBound || lowerBound < vp_upperBound && upperBound < vp_upperBound) {
            //0
            inview = 0;
        } else if (upperBound < vp_lowerBound && lowerBound > vp_lowerBound) {
            //--calculate percentage difference between upperBound & vp_lowerBound (divide by unit height)
            inview = (vp_lowerBound - upperBound) / $('#' + unit).height();
        } else if (lowerBound > vp_upperBound && upperBound < vp_upperBound) {
            //--calculate percentage difference between lowerBound & vp_upperBound (divide by unit height)
            inview = (lowerBound - vp_upperBound) / $('#' + unit).height();
        } else if (upperBound > vp_upperBound && lowerBound < vp_lowerBound) {
            //100%
            inview = 1;
        } else {
            //console.log('should never get here');
        }

        rt_creatives[unit].visible = Math.round(inview * 100) / 100;
        //console.log(rt_creatives[unit].id + ' visibility is ' + rt_creatives[unit].visible);

        socket.emit('update visibility', {
            'creatives': rt_creatives,
        });

    }

    //console.log(rt_creatives);
    socket.emit('sendUserInfo', {
        'hosts': document.location.hostname,
        'creatives': rt_creatives,
        'referrers': document.referrer
    });
    socket.emit('update visibility', {
        'creatives': rt_creatives,
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