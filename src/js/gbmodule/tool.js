/**
 * Created by gitbong on 1/21/16.
 */
(function () {
	var _gbTool = gb.module('gbTool', []);
	_gbTool.service('$libsLoader', function () {
		var imgMap = {};
		var img = new Image();
		this.load = function (arr_, progressFn_, completeFn_) {
			var libs = typeof arr_ == 'string' ? [arr_] : arr_;
			_loadImgs(libs, progressFn_, completeFn_);
		};
		function _loadImgs(arr_, progressFn_, completeFn_) {
			var imgNum = arr_.length;
			var i = 0;
			var progress = 0;
			if (imgNum == 0) {
				if (progressFn_)
					progressFn_(1);
				if (completeFn_)
					completeFn_();
				return;
			}
			var timer = setInterval(function () {
				progress += ( Math.abs(i / imgNum * 100) - progress) * .3;
				progress = Math.floor(progress);
				if (progressFn_) {
					progressFn_(progress);
				}
				if (progress >= 92) {
					progress = 100;
					if (progressFn_)
						progressFn_(progress);
					if (completeFn_)
						completeFn_(progress);
					clearInterval(timer);
				}
			}, 1000 / 50);
			if (imgNum > 0) {
				setSrc();
			}
			function setSrc() {
				var url = arr_[i];
				// console.log(imgMap);
				if (imgMap[url] != 1) {
					// console.log(url)
					if (url.indexOf('.css') == -1) {
						img.onload = function () {
							i++;
							imgMap[url] = 1;
							if (i == arr_.length) {
							} else {
								setSrc();
							}
						};
						img.src = url;
					} else {
						$.ajax({
							url: url, success: function (data) {
								i++;
								imgMap[url] = 1;
								if (i == arr_.length) {
								} else {
									setSrc();
								}
								if (window.__gbTplData__ != null) {
									$('<style>' + data + '</style>').appendTo('head');
								} else {
									$('<link rel="stylesheet" href="' + url + '"/>').appendTo('head');
								}
							}
						});
					}
				} else {
					i++;
					if (i < imgNum)
						setSrc();
				}
			}
		}

		this.loadCSS = function () {

		};
	});
	_gbTool.factory('$Signal', function () {
		function Signal() {
			var map = [];
			this.add = function (fn, scope) {
				map.push({fn: fn, scope: scope, addOnce: false, isDestroyed: false});
			};
			this.addOnce = function (fn, scope) {
				map.push({fn: fn, scope: scope, addOnce: true, isDestroyed: false});
			};
			this.dispatch = function () {
				for (var i in map) {
					var fn = map[i].fn;
					var scope = map[i].scope;
					var addOnce = map[i].addOnce;
					var isDestroyed = map[i].isDestroyed;
					if (!isDestroyed)
						fn.apply(scope, arguments);
					if (addOnce)
						map[i].isDestroyed = true;
				}
			}
		}

		return Signal;
	});
	_gbTool.service('$htmlLoader', function () {
		var self = this;
		var htmlMap = {};

		function _getFileName(url) {
			var arr = url.split('/');
			return arr[arr.length - 1];
		}

		self.load = function (url_, fn_) {
			if (window.__gbTplData__ != null) {
				for (var i in window.__gbTplData__) {
					if (_getFileName(i) == _getFileName(url_)) {
						//if (i.indexOf(url_) != -1) {
						htmlMap[_getFileName(url_)] = window.__gbTplData__[i];
						if (fn_)fn_(window.__gbTplData__[i]);
						break;
					}
				}
			} else {
				if (htmlMap[_getFileName(url_)] == null) {
					$.ajax({
						url: url_,
						dataType: 'html',
						type: 'GET',
						success: function (html_) {
							htmlMap[_getFileName(url_)] = html_;
							if (fn_)fn_(html_);
						}
					});
				} else {
					if (fn_)fn_(self.getHtml(url_));
				}
			}
		};
		self.getHtml = function (url_) {
			return htmlMap[_getFileName(url_)];
		};
	});
})();