;!function(document, window, $, undef){
	function splitByFilename(str) {
		var arr = str.split("/"),
			filename = arr.pop(),
			gets = filename.split("?"),
			getObj = {}, _get, i;

		filename = gets[0];
		gets = gets.length > 1 ? gets[1] : undef;
		if (gets !== undef) {
			gets = gets.split("&");
			for (i in gets) {
				_get = gets[i].split("=");
				getObj[_get[0]] = _get[1];
			}
		}
		return {
			path:arr.join("/")+"/",
			filename:filename,
			gets:getObj
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
		console.log("starting refreshing: " + ($links.size()-1) + " stylesheats, rnd = " + rnd); // -1 is about css-reloader/default.css

		$links.each(function(i){
			var $t = $(this),
				href = $t.attr("href"),
				splitted = splitByFilename(href),
				getsObj = splitted['gets'],
				_gets = [],
				i;

			getsObj.rnd = rnd;

			for (i in getsObj) {
				_gets.push(i + (getsObj[i] ? ("=" + getsObj[i]) : ""));
			}
			_gets = _gets.join("&");

			// application.css is about rails projects in development mode
			if ((widgetData.mode != "railsDevelopment" || splitted['filename'] !== "application.css") && splitted['path'].match(new RegExp(widgetData.name, "")) === null) {
				console.log("stylesheet["+i+"]: ", splitted);
				$t.attr("href", splitted['path'] + splitted['filename'] + (_gets !== "" ? ("?" + _gets) : ""));
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
				if (data.controls[action] && data.controls[action].clickFn) {
					data.controls[action].clickFn.call($t);
				}
			}
		});
	}

	var widgetData = {
			mode:"railsDevelopment",     // "railsDevelopment" or something else
			name:"css-reloader",
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

	getStylesByPartOfPath(widgetData.name);

}(document, window, jQuery);
