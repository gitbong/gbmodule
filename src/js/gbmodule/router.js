/**
 * Created by gitbong on 1/21/16.
 */
(function () {
	gb.module('gbRouter', ['gbTool'], function () {

		})
		.service('$router', function ($Signal) {
			var sf = this;

			var defaultPath;
			var loadingConfig = {};
			var useVirtualRouter = false;

			this.changeSignal = new $Signal();
			this._gotoData;

			function _init() {
				gb.router.onHashChange(_onHashChange);
				gb.router.start();
			}

			function _onHashChange() {
				sf.changeSignal.dispatch(gb.router.preHash(), gb.router.currHash());
			}

			sf.getTplConfig = function (hash) {
				return gb.router.getConfig(hash.split('#')[1]);
			};

			sf.isStart = false;
			sf.haveLoading = false;

			sf._start = function () {
				if (sf.isStart) return;
				sf.isStart = true;
				_init();
			};
			sf.getDefaultLibs = function () {
				var path = gb.router.currHash().split('#')[1];
				var libs = gb.router.getConfig(path).libs ? gb.router.getConfig(path).libs : [];
				return libs;
			};
			sf.goto = function (path_, data_) {
				sf._gotoData = data_;
				window.location.hash = ("#" + path_);
				//window.location.hash = "#" + rount_;
			};
			sf.when = function (path_, config_) {
				gb.router.when(path_, config_);
				return sf;
			};
			sf.otherwise = function (path_) {
				defaultPath = path_;
				gb.router.otherwise(path_);
				return sf;
			};
			sf.loading = function (config_) {
				sf.haveLoading = true;
				config_.id = 'default-loading';
				loadingConfig = {config: config_, isOpen: 0};
				return sf;
			};
			sf.getHash = function () {
				return gb.router.currHash();
			};
			sf.useVirtualRouter = function (use_) {
				useVirtualRouter = use_;
				return sf;
			};
			sf.getLoadingConfig = function () {
				return loadingConfig.config;
			};
		});
})();