function getScript(e,t){var i=document.createElement("script");i.src=e;var n=document.getElementsByTagName("head")[0],a=!1;i.onload=i.onreadystatechange=function(){a||this.readyState&&"loaded"!=this.readyState&&"complete"!=this.readyState||(a=!0,t(),i.onload=i.onreadystatechange=null,n.removeChild(i))},n.appendChild(i)}realtime=function(e){function t(e){e=e.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");var t=new RegExp("[\\?&]"+e+"=([^&#]*)"),i=t.exec(r);return null==i?"":decodeURIComponent(i[1].replace(/\+/g," "))}function i(t){a[t]={id:t},creative=self!=top?e("#"+t,window.parent.document):e("#"+t),creative.length}var n=io("http://"+document.getElementById("rtpix").src.split("/")[2],{multiplex:!1,path:"/socket.io"}),a=new Object,o={bidid:[],bid:[]},r=document.getElementById("rtpix").src;site="Unknown",site=self!=top?document.referrer.split("/")[2]:document.location.hostname,n.emit("sui",{site:site}),n.emit("uv",{creatives:a});var s=t("adid");if(""==s){if("undefined"!=typeof googletag){if("undefined"!=typeof progKeyValueMap)for(slot in progKeyValueMap)this_slot=progKeyValueMap[slot].split(progKeyValueMap[slot].indexOf(";")>0?";":"="),"bidstatus"==this_slot[0]?(o.bidid.push(this_slot[5]),o.bid.push(this_slot[3])):(o.bidid.push(this_slot[3]),o.bid.push(this_slot[1]));for(unit in googletag.slot_manager_instance.b){i(unit);for(arr in googletag.slot_manager_instance.b[unit].d)for(number in o.bidid)googletag.slot_manager_instance.b[unit].d[arr][0]==o.bidid[number]&&(a[unit].pm_bid=o.bid[number])}}}else{ads=s.split(",");for(var d=0;d<ads.length;d++)i(ads[d])}},"undefined"==typeof jQuery?("function"==typeof $&&(thisPageUsingOtherJSLibrary=!0),getScript("http://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js",function(){"undefined"==typeof jQuery||("undefined"!=typeof thisPageUsingOtherJSLibrary?realtime(jQuery):($.noConflict(),realtime(jQuery)))})):realtime(jQuery);