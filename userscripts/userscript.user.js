// ==UserScript==
// @name       CSS Reloader
// @namespace  http://stylesheats.reloader.caterpillar/
// @version    0.1
// @description  stylesheats reloader
// @include    /^https?://ctrplr\.caterpillar.*/
// @include    /^https?://192\.168\..*$/
// @copyright  2014+, You
// ==/UserScript==

!function(window, undefined){
	var script = {
		name:"CSSReloader",
		info:"css reloader",
		urls:["^https?://ctrplr\.caterpillar.*", "^https?://192\.168\..*$"],
		jQuery:'http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js',
		toLoad:'http://ctrplr.caterpillar/userscripts/css-reloader/default.js'
	}, w, i;

	if (typeof unsafeWindow != undefined) {
		w = unsafeWindow
	} else {
		w = window;
	}
	if (w.self != w.top) {
		return;
	}

	console.log(script.name + ": " + script.info);
	function execScript(src, fn) {
		var GM_JQ = document.createElement('script');
		GM_JQ.type = 'text/javascript';
		GM_JQ.onload = fn;
		GM_JQ.src = src;
		document.body.appendChild(GM_JQ);
		document.body.removeChild(GM_JQ);
	}
	var isAppended = false;
	function waitForJQuery() {
		if (typeof w.jQuery === "undefined") {
			if (!isAppended) {
				isAppended = true;
				execScript(script.jQuery, function(){
					waitForJQuery();
				});
			}
		} else {
			doWithJQuery(w.jQuery);
		}
	}
	function doWithJQuery($) {
		$("<script src='" + script.toLoad + "'></script>").appendTo($("body"));
	}

	for(i = 0; i < script.urls.length; i++) {
		if (new RegExp(script.urls[i], "").test(w.location.href)) {
			waitForJQuery();
		}
	}
}(window);
