// ==UserScript==
// @name       toolbar
// @namespace  toolbar.caterpillar
// @version    0.1
// @description  my toolbar
// @include    /^https?://.*$/
// @include    /^https?://another\.host.*/
// @copyright  2014+, caterpillar
// ==/UserScript==

(function(window, undefined){
	var protocol = window.location.protocol,
		opts = {
			name:"mytoolbar",
			info:"My Tool Bar",
			urls:["^https?://.*$", "^https?://another\.host.*"],  // urls must be a set of regexps, duplicating @include notations in ==Userscript== section above
			jQueryUrl:protocol + '//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js',
			scriptToLoad:protocol + '//ctrplr.caterpillar/userscripts/toolbar/default.js',      // local version
			//scriptToLoad:protocol + '//raw.githubusercontent.com/blindlybright/github.io/master/userscripts/css-reloader/default.js'
			keys:{
				yTranslate: "there needs to be yandex translate service key. see more here: http://api.yandex.ru/translate/doc/dg/reference/translate.xml"
			}
		}, w, i, isAppended = false;

	if (window.unsafeWindow !== undefined) {
		w = window.unsafeWindow;
	} else {
		w = window;
	}
	if (w.self != w.top) {
		return;
	}
	w.toolBarOpts = opts;

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
