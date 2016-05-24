/**
 * Created by gitbong on 1/21/16.
 */
(function () {
	gb.module('gbRouter', ['gbTool'], function () {

		})
		.service('$router', function ($Signal) {
			var sf = this;

			var defaultRouter;
			var tplConfig = {};
			var loadingConfig = {};
			var tplList = [];
			var useVirtualRouter = false;

			this.startSignal = new $Signal();
			this.changeSignal = new $Signal();
			this._gotoData;

			var hashMgr = {
				_hash: '',
				addListener: function (fn) {
					window.addEventListener('hashchange', function () {
						hashMgr._hash = window.location.hash.split('?')[0];
						fn();
					});
				},
				hash: function (v) {
					if (useVirtualRouter) {
						if (v == null) {
							return hashMgr._hash;
						} else {
							if (v != hashMgr._hash) {
								hashMgr._hash = v;
								_onHashChange();
							}
						}
					} else {
						if (v == null) {
							return window.location.hash.split('?')[0];
						} else {
							if (v != hashMgr._hash) {
								hashMgr._hash = v;
								window.location.hash = v;
								_onHashChange();
							}
						}
					}
				}
			};

			function _init() {
				hashMgr.addListener(_onHashChange);
				//window.addEventListener('hashchange', function () {
				//	_onHashChange();
				//});
			}

			//sf.preHash = null;
			//sf.currHash = hashMgr.hash();
			//sf.isStart = false;
			//sf.haveLoading = false;

			//console.log(sf);

			function _onHashChange() {
				sf.preHash = sf.currHash;
				sf.currHash = hashMgr.hash();
				//sf.currHash = window.location.hash;
				if (tplConfig[sf.currHash] == null) {
					hashMgr.hash('#' + defaultRouter);
					//window.location.hash = '#' + defaultRouter;
					sf.currHash = sf.preHash;
				} else {
					if (sf.preHash != sf.currHash) {
						sf.changeSignal.dispatch(sf.preHash, sf.currHash);
					}
				}
			}

			sf.getTplConfig = function (hash) {
				if (tplConfig[hash] != null) {
					return tplConfig[hash].config;
				} else {
					return tplConfig['#' + defaultRouter].config;
				}
			};

			sf.preHash = null;
			sf.isStart = false;
			sf.haveLoading = false;

			sf._start = function () {
				if (sf.isStart) return;

				sf.currHash = hashMgr.hash();

				_init();
				var tplCfg = tplConfig[sf.currHash];
				if (tplCfg == null || tplCfg.config.asIndex == false) {
					sf.currHash = '#' + defaultRouter;
					hashMgr.hash(sf.currHash);
					//window.location.hash = sf.currHash;
				}
				sf.isStart = true;
				sf.startSignal.dispatch();
			};
			sf.getDefaultLibs = function () {
				var libs = tplConfig[sf.currHash].config.libs ? tplConfig[sf.currHash].config.libs : [];
				return libs;
			};
			sf.goto = function (rount_, data_) {
				sf._gotoData = data_;
				hashMgr.hash("#" + rount_);
				//window.location.hash = "#" + rount_;
			};
			sf.when = function (router_, config_) {
				config_.id = router_;
				tplConfig['#' + router_] = {hash: "#" + router_, config: config_, isOpen: 0};
				tplList.push(router_);
				return sf;
			};
			sf.other = function (router) {
				defaultRouter = router;
				return sf;
			};
			sf.loading = function (config_) {
				sf.haveLoading = true;
				config_.id = 'default-loading';
				loadingConfig = {config: config_, isOpen: 0};
				return sf;
			};
			sf.getHash = function () {
				return hashMgr.hash();
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