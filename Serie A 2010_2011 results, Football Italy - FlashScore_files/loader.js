"use strict";
var cjs;
(function (cjs) {
    var Api;
    (function (Api) {
        var LoaderImpl = (function () {
            function LoaderImpl() {
                this._callbacks = [];
                this._loaded = false;
            }
            LoaderImpl.prototype.call = function () {
                var callback = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    callback[_i] = arguments[_i];
                }
                if (this._loaded) {
                    this._call.apply(this, callback);
                }
                else {
                    this._callbacks.push(callback);
                }
            };
            LoaderImpl.prototype.fullfill = function (handler) {
                this._handler = handler;
                var callback;
                while (callback = this._callbacks.shift()) {
                    this._call.apply(this, callback);
                }
                this._loaded = true;
            };
            LoaderImpl.prototype._call = function () {
                var callback = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    callback[_i] = arguments[_i];
                }
                this._handler.apply(this, callback);
            };
            return LoaderImpl;
        }());
        var LoaderHandlerImpl = (function () {
            function LoaderHandlerImpl() {
                this._loaders = {};
            }
            LoaderHandlerImpl.prototype.get = function (name) {
                if (!(name in this._loaders)) {
                    this._loaders[name] = new LoaderImpl;
                }
                return this._loaders[name];
            };
            return LoaderHandlerImpl;
        }());
        Api.LoaderHandlerImpl = LoaderHandlerImpl;
        Api.loader = new LoaderHandlerImpl();
    })(Api = cjs.Api || (cjs.Api = {}));
})(cjs || (cjs = {}));
if (typeof window === 'undefined' || (window && window.process && window.process.env.JEST_WORKER_ID)) {
    module.exports = cjs.Api;
}
