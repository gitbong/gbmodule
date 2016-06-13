/**
 * Created by gitbong on 1/21/16.
 */
(function () {
	var _gbScope = gb.module('gbScope', ['gbTool', 'gbRouter'], function () {

	}).service('_$scopeMgr', function ($libsLoader, $router, $Signal) {
		var mgr = this;
		var ctrl2ScopMap = {};
		mgr._loadingCtrlName = '';
		mgr._getScope = function (cName) {
			var scopeName = ctrl2ScopMap[cName];
			return _gbScope._createS(scopeName);
		};
		mgr.createScope = function (cName, $view, isLoading) {
			var scopeName = isLoading ? "_$scopeLoading" : ('$scope_' + cName);
			ctrl2ScopMap[cName] = scopeName;
			_gbScope.service(scopeName, function ($router) {
				var sf = this;
				sf.$view = $view.hide();
				if (isLoading) {
					mgr._loadingCtrlName = cName;
					sf.onLibsProgress = function (p) {
					};
					sf.onLibsComplete = function () {
					};
					sf.loadLibs = function () {
						$libsLoader.load($router.getDefaultLibs(), sf.onLibsProgress, function () {
							sf.onLibsComplete();
						});
					};
					sf.closeLoading = function () {
						sf.closeSignal.dispatch();
						sf.onRemove();
						// setTimeout(function () {
						// }, 100);
					};
					sf.closeSignal = new $Signal;
				}
				sf.onAdd = function () {
					//sf.add();
				};
				sf.onRemove = function () {
					//sf.remove();
				};
				sf.add = function () {
					sf.$view.show();
				};
				sf.remove = function () {
					// console.log(sf.$view.css('opacity',.4))
					sf.$view.remove();
				};
				sf._ctor = function () {
					sf.onAdd({currHash: $router.getHash(), data: $router._gotoData});
				};

				//_ctor();
			})
		};
	});
})();