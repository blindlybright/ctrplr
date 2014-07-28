;!function(document, window, $, undef){
'use strict';
function splitByFilename(str) {
	var arr = str.split("/"),
		filename = arr.pop(),
		ext,
		gets = filename.split("?"),
		getObj = {},
		_get,
		i;

	filename = gets[0];
	gets = gets.length > 1 ? gets[1] : undef;
	if (gets !== undef) {
		gets = gets.split("&");
		for (i in gets) {
			_get = gets[i].split("=");
			getObj[_get[0]] = _get[1];
		}
	}
	ext = filename.split(".");//[1] || "";
	if (ext.length <= 1) {
		ext = "";
	} else {
		ext = ext[ext.length - 1];
	}
	return {
		path:arr.join("/")+"/",
		filename:filename,
		ext:ext,
		gets:getObj
	};
}

/* KeyPresser {{{ */
	var KeyPresser = function(combs) {
		this.keyMap = {ENTER:13, SHIFT:16, CTRL:17, ALT:18, ESC:27, LEFT:37, UP:38, RIGHT:39, DOWN:40};
		this.keysPressed = [];
		this.combsListenTo = combs || [];
		this.init.call(this, arguments);
	}
	KeyPresser.prototype = {
		init: function() {
			this.bind();
		},
		bind: function() {
			var t = this;
			$(window).bind("keydown", function(e){
				//console.log(e.keyCode);
				t.pushKey(e.keyCode);
				t.checkForCombinationsPressed(e);
			}).bind("keyup", function(e){
				t.popKey(e.keyCode);
			}).bind("blur", function(){
				t.emptyKeys();
			});
		},
		pushKey: function(a) {
			if (!this.isKeyPressed(a)) {
				this.keysPressed.push(a);
			}
			//console.log(this.keysPressed);
		},
		popKey: function(a) {
			var arr = this.keysPressed,
				i, arrFine = [];
			for(i = 0; i < arr.length; i++) {
				if (a !== arr[i]) {
					arrFine.push(arr[i]);
				}
			}
			this.keysPressed = arrFine;
			//console.log(this.keysPressed);
		},
		isKeyPressed: function(ch) {
			var src = this.keysPressed,
				l = src.length,
				i;
			for(i = 0; i < l; i++) {
				if (src[i] == ch) {
					return true;
				}
			}
			return false;
		},
		emptyKeys: function() {
			this.keysPressed = [];
		},
		registerCombination: function(string, callback) {
			var comb = {
					string: this.stringToKeysArray(string),
					exec: callback
				};
			this.combsListenTo.push(comb);
		},
		stringToKeysArray: function(str) {
			var keysMap = this.keyMap,
				arr = str.toUpperCase().split("+"),
				i,
				arrNums = [];

			for(i = 0; i < arr.length; i++) {
				if (keysMap[arr[i]]!== undef) {
					arrNums.push(keysMap[arr[i]]);
				} else {
					arrNums.push(arr[i].charCodeAt(0));
				}
			}
			return arrNums;
		},
		checkForCombinationPressed: function(arr) {
			var i,
				isPressed = true;
			for(i = 0; i < arr.length; i++) {
				if (!this.isKeyPressed(arr[i])) {
					isPressed = false;
				}
			}
			//console.log("arr", arr, isPressed);
			return isPressed;
		},
		checkForCombinationsPressed: function(e) {
			var combs = this.combsListenTo,
				i;
			for(i = 0; i < combs.length; i++) {
				if (this.checkForCombinationPressed(combs[i].string)) {
					if (e !== undefined) {
						e.preventDefault();
						e.stopPropagation();
					}
					combs[i].exec();
				}
			}
		}
	}
/* }}} KeyPresser */

/* Widget {{{ */
	var Widget = function() {
		this.init.apply(this, arguments);
	}
	Widget.prototype = {
		init: function(widgetData) {
			this.widgetData = widgetData || {};
			this.widgetData.controls = widgetData.controls || {};
			this.widgetData.name = widgetData.name || "noname";
			this.path;

			this.getPath(widgetData.name);
			this.getStylesByPartOfPath();

			this.buildWidget().bindWidget().startWidget();
		},
		getPath: function(strmatch){
			if (strmatch === undefined) return this.path;
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

			this.path = splitted['path'];
			return this.path;
		},
		getStylesByPartOfPath: function() {
			$("head").append("<link href='" + this.path + "default.css' rel='stylesheet' type='text/css' />");
		},
		buildWidget: function() {
			var data = this.widgetData,
				controls = data.controls || {},
				key, value,
				$panel = $("<div class='toolbar-panel'></div>"),
				html = ["<span class='toolbar-panel__header'>Toolbar</span>"];

			html.push("<span class='toolbar-panel__content'>");
			for (key in controls) {
				if (key === 'length' || !controls.hasOwnProperty(key)) continue;
				value = controls[key];
				html.push("<a href='#" + key + "' class='toolbar-control toolbar-control--" + key + "' title='" + value.titleAlt + "' data-action='" + key + "'>" + value.title + "</a>");
			}
			html.push("</span>");

			$(html.join("")).appendTo($panel);
			$panel.data({
				widgetData:data
			});
			this.$panel = $panel;
			return this;
		},
		bindWidget: function() {
			var $t = this.$panel,
				key, value,
				data = this.widgetData,
				controls = data.controls;

			this.keyPresser = new KeyPresser();

			//console.log(controls);
			for(key in controls) {
				if (key === 'length' || !controls.hasOwnProperty(key)) continue;
				value = controls[key];
				if (value.hotKey !== undefined) {
					this.keyPresser.registerCombination(value.hotKey, value.jobFn);
					//console.log(value.hotKey);
				}
			}

			$t.bind({
				"init.widget":function(){
					$t.prependTo("body");
					setTimeout(function(){
						$t.addClass("toolbar-panel--initialized");
					}, 100);
				},
				"mouseenter.widget mouseleave.widget": function(e){
					var $t = $(this);
					$t[e.type == "mouseenter" ? "addClass" : "removeClass"]("toolbar-panel--hovered");
				},
				"click.widget": function(e){
					e.stopPropagation();
					e.preventDefault();

					var $t = $(this),
						$e = $(e.target),
						$a = $e.closest("a"),
						action;

					if ($a.size()) {
						action = $a.data("action") || "noop";
						if (data.controls[action] && data.controls[action].jobFn) {
							data.controls[action].jobFn.call($t);
						}
					}
				}
			});
			return this;
		},
		startWidget: function() {
			this.$panel.trigger("init.widget");
		}
	}
/* }}} Widget */
/* end of common funcs & classes */


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
	function cssReloader() {
		var $links = $("link[rel='stylesheet'], link[rel='stylesheet/less']"),
			rnd = (Math.random()+"").split(".")[1]*1;

		console.groupCollapsed("toolbar: css refreshing");
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
			if ((widgetData.mode != "railsDev" || splitted['filename'] !== "application.css") && splitted['path'].match(new RegExp(widgetData.name, "")) === null) {
				console.log("stylesheet["+i+"]: ", splitted);
				$t.attr("href", splitted['path'] + splitted['filename'] + (_gets !== "" ? ("?" + _gets) : ""));
			}
		});
		if ($links.filter("[rel='stylesheet/less']").size() > 0 && !less) {
			$.getScript("//cdnjs.cloudflare.com/ajax/libs/less.js/1.7.3/less.min.js");
		} else {
			$("[id^=less]").remove();
			less.refresh();
		}

		console.log("finished");
		console.groupEnd();
	}
	function showBackground() {
		//??? will it be ever used...
		//var svgs = window.document.getElementsByTagName("svg");
		//if (svgs.length) {
		//	svgs[0].style.backgroundColor = "#ff0";
		//} else {
			var number = 4,
				bgNumber = $("body").data("bgNumber");
			if (bgNumber === undefined) bgNumber = -1;
			$("body").removeClass("toolbar-background-" + bgNumber);

			bgNumber = (bgNumber+1) % number;
			$("body").data("bgNumber", bgNumber);
			$("body").addClass("toolbar-background-" + bgNumber);
		//}
	}
	var Prism_Extensions = {
		js:'javascript',
		html:'markup',
		svg:'markup',
		xml:'markup',
		py:'python'
	};
	function highlightCode() {
		var path = panelWidget.getPath(),
			$pres = $("body").children("pre"),
			loc = window.location.href,
			parts = splitByFilename(loc),
			ext = parts.ext;

		$pres.each(function(){
			var $t = $(this),
				html = $t.html(),
				lang = Prism_Extensions[ext] ? Prism_Extensions[ext] : ext;
			if ($t.children("code").size() == 0) {
				$t.html("<code class='language-" + lang + "'>" + html + "</code>");
			}
			//console.log("<code class='code-" + map[ext] + "'>" + html + "</code>");
		});

		$("head").append('<link rel="stylesheet" href="//cdn.jsdelivr.net/prism/0.1/prism.css" />');
		//cdn.jsdelivr.net/prism/0.1/plugins/autolinker/index.html
		$.getScript('//cdn.jsdelivr.net/prism/0.1/prism.full.min.js', function(){
			Prism.highlightAll();
		});
		//$("head").append('<script type="javascript" src="' + path + 'prism/prism.js"></script>');
	}
	var widgetData = {
			mode:"railsDev",     // "railsDev" or something else
			name:"toolbar",
			controls:{
				cssReloader:{
					titleAlt:'Reload CSS',
					title:'R',
					jobFn:cssReloader,
					hotKey:"ctrl+alt+r"
				},
				showBackground:{
					titleAlt:'Show me another background',
					title:'B',
					jobFn:showBackground,
					hotKey:"ctrl+alt+b"
				},
				highlightCode:{
					titleAlt:'Highlight code',
					title:'H',
					jobFn:highlightCode,
					hotKey:"ctrl+alt+h"
				},
				doJS:{
					titleAlt:'Do something with window.fnCR function',
					title:'J',
					jobFn:execFnCR,
					hotKey:"ctrl+alt+j"
				}
			}
		},
		panelWidget = new Widget(widgetData);

	/* test for any combination event */
	/*new KeyPresser().registerCombination("left+right", function(){
		console.log("left+right");
	});*/

}(document, window, window.jQuery);
