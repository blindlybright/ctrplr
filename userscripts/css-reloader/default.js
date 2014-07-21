;!function(document, window, $, undef){
'use strict';
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

/* KeyPresser {{{ */
	var KeyPresser = function(combs) {
		this.keyMap = {ENTER:13, SHIFT:16, CTRL:17, ALT:18, ESC:27, LEFT:37, RIGHT:39, UP:38, DOWN:40};
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
					e.preventDefault();
					e.stopPropagation();
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

			this.getStylesByPartOfPath(widgetData.name);

			this.buildWidget().bindWidget().startWidget();
		},
		getStylesByPartOfPath: function(strmatch) {
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
		},
		buildWidget: function() {
			var data = this.widgetData,
				controls = data.controls || {},
				key, value,
				$panel = $("<div class='top-panel'></div>"),
				html = ["<span class='top-panel__header'>My pane</span>"];

			html.push("<span class='top-panel__content'>");
			for (key in controls) {
				if (key === 'length' || !controls.hasOwnProperty(key)) continue;
				value = controls[key];
				html.push("<a href='#" + key + "' class='" + value.className + "' title='" + value.titleHov + "' data-action='" + key + "'>" + value.title + "</a>");
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

			$t.bind("widget:init", function(){
				$t.prependTo("body");
				setTimeout(function(){
					$t.addClass("top-panel--initialized");
				}, 100);

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
					if (data.controls[action] && data.controls[action].jobFn) {
						data.controls[action].jobFn.call($t);
					}
				}
			});
			return this;
		},
		startWidget: function() {
			this.$panel.trigger("widget:init");
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
			if ((widgetData.mode != "railsDev" || splitted['filename'] !== "application.css") && splitted['path'].match(new RegExp(widgetData.name, "")) === null) {
				console.log("stylesheet["+i+"]: ", splitted);
				$t.attr("href", splitted['path'] + splitted['filename'] + (_gets !== "" ? ("?" + _gets) : ""));
			}
		});
		console.log("finished");
		console.groupEnd();
	}
	var widgetData = {
			mode:"railsDev",     // "railsDev" or something else
			name:"css-reloader",
			controls:{
				refreshCSS:{
					className:'control css-style css-reloader',
					titleHov:'Reload CSS',
					title:'R',
					jobFn:refreshCSS,
					hotKey:"ctrl+alt+r"
				},
				doJS:{
					className:'control js-style js-do',
					titleHov:'Do something with window.fnCR function',
					title:'J',
					jobFn:execFnCR,
					hotKey:"ctrl+alt+j"
				}
			}
		},
		panelWidget = new Widget(widgetData);

	/* test for any combination event */
	/*new KeyPresser().registerCombination("left+right", function(){
		console.log("left + right");
	});*/

}(document, window, jQuery);
