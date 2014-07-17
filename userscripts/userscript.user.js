// ==UserScript==
// @name       CSS Reloader
// @namespace  http://stylesheats.reloader.caterpillar/
// @version    0.1
// @description  stylesheats reloader
// @include    /^https?://.*$/
// @include    /^https?://ctrplr\.caterpillar.*/
// @include    /^https?://192\.168\..*$/
// @copyright  2014+, caterpillar
// ==/UserScript==

(function(window, undefined){
	var opts = {
		name:"executing",
		info:"CSS Reloader",
		// urls must be a set of regexps, duplicating @include notations in ==Userscript== section above
		urls:["^https?://.*$", "^https?://ctrplr\.caterpillar.*", "^https?://192\.168\..*$"],
		jQueryUrl:'http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js',
		scriptToLoad:'http://ctrplr.caterpillar/userscripts/css-reloader/default.js'
		// scriptToLoad:'https://raw.githubusercontent.com/blindlybright/github.io/master/userscripts/css-reloader/default.js'
	}, w, i, isAppended = false;

	if (window.unsafeWindow !== undefined) {
		w = window.unsafeWindow;
	} else {
		w = window;
	}
	if (w.self != w.top) {
		return;
	}

	//console.log(opts.name + ": " + opts.info);
	function doWithJQuery($) {
		$("<script src='" + opts.scriptToLoad + "'></script>").appendTo($("body"));
	}
	function execScript(src, fn) {
		var GM_JQ = document.createElement('script');
		GM_JQ.type = 'text/javascript';
		GM_JQ.onload = fn;
		GM_JQ.src = src;
		document.body.appendChild(GM_JQ);
		document.body.removeChild(GM_JQ);
	}
	function waitForJQuery() {
		if (w.jQuery === undefined) {
			if (!isAppended) {
				isAppended = true;
				execScript(opts.jQueryUrl, waitForJQuery);
			}
		} else {
			doWithJQuery(w.jQuery);
		}
	}

	// chrome additional check
	for(i = 0; i < opts.urls.length; i++) {
		if (new RegExp(opts.urls[i], "").test(w.location.href)) {
			waitForJQuery();
		}
	}
})(window);
