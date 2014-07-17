;!function(document, window, $, undef){
	function splitByFilename(str) {
		var arr = str.split("/"),
			filename = arr.pop(),
			gets = filename.split("?");

		filename = gets[0];
		gets = gets.length > 1 ? gets[1] : "";
		gets = gets.split("&");
		if (gets.length == 1) gets = [];

		return {
			path:arr.join("/")+"/",
			filename:filename,
			gets:gets
		};
	}
	function getStylesByPartOfPath(strmatch) {
		var script = "",
			splitted;
		$("script").each(function(){
			var $t = $(this),
				src = $t.attr("src");
			if (src && src.indexOf(strmatch) > -1) {
				script = src;
			}
		});
		splitted = splitByFilename(script);

		$("head").append("<link href='" + splitted['path'] + "default.css' rel='stylesheet' type='text/css' />");
	}
	function execFnCR() {
		console.log("Do something with window.fnCR function");
		if (window.fnCR !== undef) {
			console.log("executing fnCR...");
			window.fnCR();
			window.fnCR = undef;
			console.log("fnCR was executed");
		} else {
			console.log("no window.fnCR function was found");
		}
	}
	function refreshCSS() {
		var $links = $("link[rel='stylesheet']"),
			rnd = (Math.random()+"").split(".")[1]*1;

		console.groupCollapsed("--- css refreshing ---");
		console.log("starting refreshing: " + $links.size() + " stylesheats, rnd = " + rnd);

		$links.each(function(i){
			var $t = $(this),
				href = $t.attr("href"),
				splitted = splitByFilename(href),
				gets = splitted['gets'];

			gets.push("rnd=" + rnd);
			//console.log(gets);
			gets = gets.join("&");

			if (splitted['filename'] !== "application.css") {
				console.log("stylesheet["+i+"]: ", splitted);
				$t.attr("href", splitted['path'] + splitted['filename'] + (gets !== "" ? ("?" + gets) : ""));
			}
		});
		console.log("finished");
		console.groupEnd();
	}
	function buildWidget(data) {
		var data = data || {},
			controls = data.controls || {},
			i,
			$panel = $("<div class='top-panel'></div>"),
			html = ["<span class='top-panel__header'>ЦУП</span>"];

		html.push("<span class='top-panel__content'>");
		for (var key in controls) {
			if (key === 'length' || !controls.hasOwnProperty(key)) continue;
			var value = controls[key];
			html.push("<a href='#" + key + "' class='" + value.className + "' title='" + value.titleHov + "' data-action='" + key + "'>" + value.title + "</a>");
		}
		html.push("</span>");

		$(html.join("")).appendTo($panel);
		$panel.data({
			widgetData:data
		});

		return $panel;
	}
	function bindWidget() {
		var $t = $(this),
			data = $t.data("widgetData");

		console.log(data);

		$t.bind("widget:init", function(){
			$t.prependTo("body");

		}).bind("mouseenter mouseleave", function(e){
			var $t = $(this);
			$t[e.type == "mouseenter" ? "addClass" : "removeClass"]("top-panel--hovered");

		}).click(function(e){
			e.stopPropagation();
			e.preventDefault();

			var $t = $(this),
				$e = $(e.target),
				$a = $e.closest("a"),
				action;

			if ($a.size()) {
				action = $a.data("action") || "noop";
				//console.log(action, data, data.controls, data.controls[action]);
				if (data.controls[action] && data.controls[action].clickFn) {
					data.controls[action].clickFn.call($t);
				}
			}
		});
	}

	var widgetData = {
			controls:{
				/*blank:{
					className:'blank',
					titleHov:'blank hovering text',
					title:'B',
					clickFn:function(){
						console.log("nodo");
					}
				},*/
				refreshCSS:{
					className:'control css-style css-reloader',
					titleHov:'Reload CSS',
					title:'R',
					clickFn:refreshCSS
				},
				doJS:{
					className:'control js-style js-do',
					titleHov:'Do something with window.fnCR function',
					title:'J',
					clickFn:execFnCR
				}
			}
		},
		$panel = buildWidget(widgetData);

	bindWidget.apply($panel);

	$panel.trigger("widget:init");
	getStylesByPartOfPath("css-reloader");

}(document, window, jQuery);
