function getScript(e,t){var i=document.createElement("script");i.src=e;var n=document.getElementsByTagName("head")[0],o=!1;i.onload=i.onreadystatechange=function(){o||this.readyState&&"loaded"!=this.readyState&&"complete"!=this.readyState||(o=!0,t(),i.onload=i.onreadystatechange=null,n.removeChild(i))},n.appendChild(i)}realtime=function(e){function t(e){e=e.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");var t=new RegExp("[\\?&]"+e+"=([^&#]*)"),i=t.exec(r);return null==i?"":decodeURIComponent(i[1].replace(/\+/g," "))}function i(t){o[t]={id:t},creative=self!=top?e("#"+t,window.parent.document):e("#"+t),creative.length}var n=io("http://"+document.getElementById("rtpix").src.split("/")[2],{multiplex:!0,path:"/socket.io"}),o=new Object,a={bidid:[],bid:[]},r=document.getElementById("rtpix").src;n.on("ok",function(){site=self!=top?document.referrer:document.location.hostname,n.emit("sui",{site:site}),n.emit("uv",{creatives:o})});var d=t("adid");if(""==d){if("undefined"!=typeof googletag){if("undefined"!=typeof progKeyValueMap)for(slot in progKeyValueMap)this_slot=progKeyValueMap[slot].split(progKeyValueMap[slot].indexOf(";")>0?";":"="),"bidstatus"==this_slot[0]?(a.bidid.push(this_slot[5]),a.bid.push(this_slot[3])):(a.bidid.push(this_slot[3]),a.bid.push(this_slot[1]));for(unit in googletag.slot_manager_instance.b){i(unit);for(arr in googletag.slot_manager_instance.b[unit].d)for(number in a.bidid)googletag.slot_manager_instance.b[unit].d[arr][0]==a.bidid[number]&&(o[unit].pm_bid=a.bid[number])}}}else{ads=d.split(",");for(var s=0;s<ads.length;s++)i(ads[s])}},"undefined"==typeof jQuery?("function"==typeof $&&(thisPageUsingOtherJSLibrary=!0),getScript("http://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js",function(){"undefined"==typeof jQuery||("undefined"!=typeof thisPageUsingOtherJSLibrary?realtime(jQuery):($.noConflict(),realtime(jQuery)))})):realtime(jQuery);