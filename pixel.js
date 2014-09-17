// Only do anything if jQuery isn't defined

realtime = (function($) {
    console.log("Starting realtime script");

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
            rt_creatives[unit] = {
                id: unit
            };
            var foundtag = false;
            creative = $('#' + unit).find('iframe').contents().find('object');

            if (!creative.length) creative = $('#' + unit).find('iframe').contents().find('img');
            if (!creative.length) creative = $('#' + unit).find('iframe').contents().find('iframe');
            if (creative.length) {
                var foundtag = true;
                rt_creatives[unit].tag = creative[0].outerHTML;
                isVisible(unit);
                var foundbid = false;
                for (arr in googletag.slot_manager_instance.b[unit].d) {
                    for (number in pm_bids.bidid) {
                        if (googletag.slot_manager_instance.b[unit].d[arr][0] == pm_bids.bidid[number]) {
                            rt_creatives[unit].pm_bid = pm_bids.bid[number];
                            foundbid = true;
                        }

                    }
                }
                if (!foundbid) rt_creatives[unit].pm_bid = "This slot is not enabled.";
            }
            if (!foundtag) {
                rt_creatives[unit].tag = "Could not find a tag.";
                rt_creatives[unit].pm_bid = "This slot is not enabled."
            }

        }

    }

    function isVisible(unit) {

        rt_creatives[unit].visible = 0;
        $(window).scroll(function() {

            upperBound = $('#' + unit).offset().top;
            lowerBound = upperBound + $('#' + unit).height();

            leftBound = $('#' + unit).offset().left;
            rightBound = leftBound + $('#' + unit).width();
            vp_upperBound = $(window).scrollTop();
            vp_lowerBound = vp_upperBound + $(window).height();
            vp_leftBound = $(window).scrollLeft();
            distanceFromTopOfViewPort = upperBound - vp_upperBound;
            scrolledPast = (lowerBound - vp_upperBound) / $('#' + unit).height();
            scrolledOnto = (vp_lowerBound - upperBound) / $('#' + unit).height();

            if (vp_upperBound > lowerBound || vp_lowerBound < upperBound) {
                //console.log('//element is not in view');

            } else {

                if (scrolledPast > 1 && scrolledOnto > 1) {
                    rt_creatives[unit].visible = 1;


                } else {
                    rt_creatives[unit].visible = Math.round(Math.min(scrolledPast, scrolledOnto) * 100) / 100;
                    console.log(rt_creatives[unit].id + ' visibility is ' + rt_creatives[unit].visible);

                    socket.emit('update visibility', {
                        'creatives': rt_creatives,
                    });

                }
            }
        });

    }

    //console.log(rt_creatives);



    console.log(rt_creatives);
    socket.emit('sendUserInfo', {
        'hosts': document.location.hostname,
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