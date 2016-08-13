/**
 * Created by gitbong on 1/21/16.
 */
(function (n_, fn_) {
	if (typeof define === 'function' && define.amd) {
	} else {
		window[n_] = window[n_] || {};
		window[n_].module = fn_();
	}
})('gb', function () {
	var app = {
		$view: -1,
		name: -1
	};
	var moduleMap = {};
	var ctrl2CtrlMap = {};
	var _root;

	window.m = moduleMap;

	//entry
	function _initApp() {
		app.$view = $('[gb-app]').eq(0);
		app.name = app.$view.attr('gb-app');
		app.module = moduleMap[app.name].ins;
		if (app.name == null)return;

		moduleMap[app.name].ins.service('_$ctor', function () {
			this.name = '_$ctor';
		});
		moduleMap[app.name].deps.push('gbRouter');
		moduleMap[app.name].deps.push('gbTool');
		moduleMap[app.name].deps.push('gbScope');

		_root = _regModule('_root', [app.name, 'gbRouter', 'gbDom', 'gbScope'], function (_$ctor, $router, _$dom, _$scopeMgr) {
			/**
			 * _$dom
			 */
			var preTplScope;
			var currTplScope;
			_$dom.tplAddedSignal.add(function (ctrlName, $view, isLoading) {
				_$scopeMgr.createScope(ctrlName, $view, isLoading);
				currTplScope = _$scopeMgr._getScope(ctrlName);
				setTimeout(function () {
					if (preTplScope != null) {
						preTplScope.onRemove({
							// preHash: $router.preHash,
							// currHash: $router.currHash,
							data: $router._gotoData
						});
						currTplScope._ctor();
					} else {
						currTplScope._ctor();
					}
				}, 50);
				if (moduleMap[app.name].cMap[ctrlName] == null)
					throw ('Do not have controller named "' + ctrlName + '"');
				moduleMap[app.name].cMap[ctrlName].scopeName = '$scope_' + ctrlName;
				moduleMap[app.name].ins.cMap[ctrlName].scopeName = '$scope_' + ctrlName;
				if (isLoading) {
					var loadingDeps = moduleMap[app.name].cMap[ctrlName].deps;
					for (var i in loadingDeps) {
						if (loadingDeps[i] == '$scope_' + ctrlName) {
							moduleMap[app.name].cMap[ctrlName].deps[i] = '_$scopeLoading';
							moduleMap[app.name].ins.cMap[ctrlName].deps[i] = '_$scopeLoading';
							moduleMap[app.name].cMap[ctrlName].scopeName = '_$scopeLoading';
							moduleMap[app.name].ins.cMap[ctrlName].scopeName = '_$scopeLoading';
						}
					}
					_root.controller('_loadingHandler', function (_$scopeLoading) {
						_$scopeLoading.closeSignal.add(function () {
							_$dom.addTpl($router.getTplConfig($router.getHash()));
						});
					}, true);
				} else {
					ctrl2CtrlMap[$router.getHash()] = ctrlName;
				}
				app.module._createC(ctrlName);
			});
			/**
			 * $router
			 */
			$router.changeSignal.add(function (preHash, currHash) {
				if (preHash == '' || preHash == null) {
					if ($router.haveLoading && $router.getDefaultLibs().length > 0) {
						_$dom.addLoading($router.getLoadingConfig(), $router.getTplConfig($router.getHash()));
					} else {
						_$dom.addTpl($router.getTplConfig($router.getHash()));
					}
				} else {
					preTplScope = _$scopeMgr._getScope(ctrl2CtrlMap[preHash]);
					_$dom.addTpl($router.getTplConfig($router.getHash()));
				}

			});
			$router._start();
		});
		_runModule('_root');
	}

	function _regModule(mName, deps, fn) {
		var mIns = new ModuleClass(mName);
		moduleMap[mName] = {name: mName, deps: deps, fn: fn, ins: mIns, hasRun: false, cMap: {}, sMap: {}};
		return mIns;
	}

	function _runModule(mName) {
		var mCfg = moduleMap[mName];
		var mIns = mCfg.ins;
		mIns._run(mCfg.fn);
	}

	/**
	 * module class
	 * @constructor
	 */
	function ModuleClass(mName) {
		var sf = this;
		sf.cMap = {};
		sf.sMap = {};
		sf.runMap = [];

		sf.name = mName;
		sf.controller = function (name, fn, autoRun) {
			sf.cMap[name] = {name: name, fn: fn, deps: _getDepends(fn, name), ins: null, type: "C"};
			moduleMap[sf.name].cMap[name] = sf.cMap[name];
			if (autoRun)sf._createC(name);
			return sf;
		};
		sf.service = function (name, fn) {
			sf.sMap[name] = {name: name, fn: fn, deps: _getDepends(fn, name), ins: null, type: "S"};
			moduleMap[sf.name].sMap[name] = sf.sMap[name];
			return sf;
		};
		sf.factory = function (name, fn) {
			sf.sMap[name] = {name: name, fn: fn, deps: _getDepends(fn, name), ins: null, type: "F"};
			moduleMap[sf.name].sMap[name] = sf.sMap[name];
			return sf;
		};
		sf.run = function (fn) {
			sf.runMap.push(fn);
			return sf;
		};
		sf.getService = function (name) {
			if (moduleMap[sf.name].hasRun == false)_runModule(sf.name);
			var s = sf._createS(name);
			return s;
		};
		sf._run = function (ctorFn) {
			if (moduleMap[sf.name].hasRun)return;
			if (ctorFn != null)sf.runMap.unshift(ctorFn);
			for (var i in sf.runMap) {
				sf.controller('_run_' + sf.name + '_' + i, sf.runMap[i]);
			}
			for (var j in sf.runMap) {
				sf._createC('_run_' + sf.name + '_' + j);
			}
			moduleMap[sf.name].hasRun = true;
		};
		sf._createC = function (name) {
			var cCfg = sf.cMap[name];
			if (cCfg == null)return;
			cCfg.ins = this._newServiceIns(cCfg);
		};
		sf._createS = function (name) {
			var sCfg = sf.sMap[name];
			if (sCfg == null) {
				var deps = moduleMap[sf.name].deps;
				for (var i in deps) {
					var mName = deps[i];
					if (moduleMap[mName] != null) {
						for (var j in moduleMap[mName].sMap) {
							if (name == j) {
								var s = moduleMap[mName].ins.getService(name);
								return s;
							}
						}
					} else {
						return null;
					}
				}
				return null;
			} else {
				if (sCfg.type == "S") {
					if (sCfg.ins == null) {
						sCfg.ins = this._newServiceIns(sCfg);
						if (sCfg.ins._ctor != null) {
							sCfg.ins._ctor();
						}
						return sCfg.ins;
					} else {
						return sCfg.ins;
					}
				} else if (sCfg.type == "F") {
					if (sCfg.hasRun == true) {
						return sCfg.return;
					} else {
						sCfg.return = sCfg.fn();
						sCfg.hasRun = true;
						return sCfg.return;
					}
				}
			}
		};
		sf._newServiceIns = function (cfg) {
			var name = cfg.name;
			var deps = cfg.deps;
			var fn = cfg.fn;

			var fnStr = "";
			for (var i in deps) {
				if (deps[i] == name) {
					fnStr += "null,"
				} else {
					fnStr += "this._createS('" + deps[i] + "'),";
				}
			}
			fnStr = fnStr.substring(0, fnStr.length - 1);
			var ins = eval("new " + "fn" + "(" + fnStr + ")");
			return ins;
		};
	}

	function _getDepends(fn_, ctrlName) {
		var deps = fn_.toString().match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1].replace(/ /g, '').split(',');
		if (deps.length == 1 && deps[0] == "")
			deps = [];
		for (var i in deps) {
			if (deps[i] == '$scope')
				deps[i] = "$scope_" + ctrlName;
		}
		return deps;
	}

	$(_initApp);
	return _regModule;
});