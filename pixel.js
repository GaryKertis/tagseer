// Only do anything if jQuery isn't defined

realtime = (function($) {
    //console.log("Starting realtime script");
    site = "Unknown";
    self != top ? site = document.referrer.split('/')[2] : site = document.location.hostname;

    var socket = io('http://' + document.getElementById('rtpix').src.split('/')[2], {
        'multiplex': false,
        'path': '/socket.io'
    });

    socket.emit('sui', {
        'site': site
    });

    var rt_creatives = new Object;

    var pm_bids = {
        "bidid": [],
        "bid": []
    };

    var scriptid = document.getElementById('rtpix').src;
    //console.log(scriptid + " is script id.");

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(scriptid);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    function findCreative(unit) {
        //console.log(unit + " is unit name.");
        rt_creatives[unit] = {
            id: unit
        };

        self != top ? creative = $('#' + unit, window.parent.document) : creative = $('#' + unit);

        //if (!creative.length) creative = $('#' + unit).find('iframe').contents().find('object');
        //if (!creative.length) creative = $('#' + unit).find('iframe').contents().find('img');
        //if (!creative.length) creative = $('#' + unit).find('iframe').contents().find('iframe');
        //console.log(creative);
        if (creative.length) {
            isVisible(unit);
            //rt_creatives[unit].tag = creative[0].outerHTML;
            var timer = setInterval(function() {
                isVisible(unit)
            }, 100);
        }
    }

    socket.emit('uv', {
        'creatives': rt_creatives,
    });

    var adid = getParameterByName('adid');
    //console.log(adid + " is ad id.");
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
        var context;
        self != top ? context = window.parent.document : context = "";

        var creative = $('#' + unit, context);
        //console.log(creative + ' is creative');
        upperBound = creative.offset().top;
        lowerBound = upperBound + creative.height();

        leftBound = creative.offset().left;
        rightBound = leftBound + creative.width();
        vp_upperBound = $(context).scrollTop();
        vp_lowerBound = vp_upperBound + $(context).height();
        vp_leftBound = $(context).scrollLeft();

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

        /*console.log('Unit name is: ' + unit);
        console.log("upperBound is " + upperBound);
        console.log("lowerBound is " + lowerBound);
        console.log("vp_upperBound is " + vp_upperBound);
        console.log("vp_lowerBound is " + vp_lowerBound);
        console.log("Unit height is " + $('#' + unit).height());*/

        if (upperBound > vp_lowerBound && lowerBound > vp_lowerBound || lowerBound < vp_upperBound && upperBound < vp_upperBound) {
            //0
            inview = 0;
        } else if (upperBound <= vp_lowerBound && lowerBound >= vp_lowerBound) {
            //--calculate percentage difference between upperBound & vp_lowerBound (divide by unit height)
            inview = (vp_lowerBound - upperBound) / creative.height();
        } else if (lowerBound >= vp_upperBound && upperBound <= vp_upperBound) {
            //--calculate percentage difference between lowerBound & vp_upperBound (divide by unit height)
            inview = (lowerBound - vp_upperBound) / creative.height();
        } else if (upperBound > vp_upperBound && lowerBound < vp_lowerBound) {
            //100%
            inview = 1;
        } else {
            //console.log('should never get here');
        }

        rt_creatives[unit].visible = Math.round(inview * 100) / 100;
        //console.log(rt_creatives[unit].id + ' visibility is ' + rt_creatives[unit].visible);

        socket.emit('uv', {
            'creatives': rt_creatives,
        });

    //console.log('site is' + document.location.hostname);
    }
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