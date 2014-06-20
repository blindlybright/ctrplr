;!function(document, window, $, undef){
	function removeFilename(str) {
		var arr = str.split("/");
		arr.pop();
		return arr.join("/");
	}
	function execFnCR() {
		if (window.fnCR !== undef) {
			console.log("executing fnCR...");
			window.fnCR();
			window.fnCR = undef;
			console.log("fnCR was executed");
		} else {
			console.log("no fnCR was found");
		}
	}
	function refreshCSS() {
		var $links = $("link"),
			rnd = (Math.random()+"").split(".")[1]*1;
		console.log("refreshing: " + $("link").size() + " stylesheats, rnd = " + rnd);

		$links.each(function(i){
			var $t = $(this),
				href = $t.attr("href"),
				href_woa = href.split("?")[0];

			$t.attr("href", href_woa + "?rnd=" + rnd);
		});
	}
	var script = $("script").last().attr("src"),
		dir = removeFilename(script) + "/";

	$("body").prepend("<link href='" + dir + "default.css' rel='stylesheet' type='text/css' />");

	$("<a href='' class='css-reloader'>R</a>").click(function(e){
		e.stopPropagation();
		e.preventDefault();

		refreshCSS();
		execFnCR();
	}).prependTo("body");
	//$a.trigger("click");

}(document, window, jQuery);
