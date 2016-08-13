/**
 * Created by gitbong on 1/21/16.
 */
(function () {
	gb.module('gbDom', ['gbTool'], function () {

	}).service('_$dom', function ($Signal, $htmlLoader) {
		var $app = $('[' + 'gb-app' + ']');
		var self = this;
		self.tplAddedSignal = new $Signal;

		self.addLoading = function (loadingTplCfg, libs) {
			libs = libs == null ? [] : libs;
			self.addTpl(loadingTplCfg, true);
		};
		self.addTpl = function (tplCfg, isLoading) {
			var url = tplCfg.tpl;
			$htmlLoader.load(url, function (html) {
				var $domE = $(html);
				var ctrlName = $domE.attr('gb-controller');
				$app.append($domE);
				$domE.hide();
				self.tplAddedSignal.dispatch(ctrlName, $domE, isLoading);
			});
		};
		function _init() {
			document.addEventListener('DOMNodeInserted', function (e) {
				return;
				console.log('#domchange:', e.target.outerHTML);
				var $domE = $(e.target.outerHTML);
				$domE.css('opacity', .3);
				self.tplAddedSignal.dispatch($domE);
			}, false);
			document.addEventListener('DOMNodeRemoved', function (e) {
			}, false);
			document.addEventListener('DOMAttrModified', function () {
			}, false);
		}

		_init();
	});
})();

var arr = [function ($scope) {

}];