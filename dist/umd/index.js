(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['exports', 'module', 'router5.transition-path'], factory);
    } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
        factory(exports, module, require('router5.transition-path'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, mod, global.transitionPath);
        global.index = mod.exports;
    }
})(this, function (exports, module, _router5TransitionPath) {
    'use strict';

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    var _transitionPath2 = _interopRequireDefault(_router5TransitionPath);

    var pluginName = 'LISTENERS';

    function listenersPlugin() {
        var listeners = {};
        var router = undefined;

        var removeListener = function removeListener(name, cb) {
            if (cb) {
                if (listeners[name]) listeners[name] = listeners[name].filter(function (callback) {
                    return callback !== cb;
                });
            } else {
                listeners[name] = [];
            }
            return router;
        };

        function init(target) {
            router = target;

            var addListener = function addListener(name, cb, replace) {
                var normalizedName = name.replace(/^(\*|\^|=)/, '');

                if (normalizedName && !/^\$/.test(name)) {
                    var segments = router.rootNode.getSegmentsByName(normalizedName);
                    if (!segments) console.warn('No route found for ' + normalizedName + ', listener might never be called!');
                }

                if (!listeners[name]) listeners[name] = [];
                listeners[name] = (replace ? [] : listeners[name]).concat(cb);

                return router;
            };

            router.addListener = function (cb) {
                return addListener('*', cb);
            };
            router.removeListener = function (cb) {
                return removeListener('*', cb);
            };

            router.addNodeListener = function (name, cb) {
                return addListener('^' + name, cb, true);
            };
            router.removeNodeListener = function (name, cb) {
                return removeListener('^' + name, cb);
            };

            router.addRouteListener = function (name, cb) {
                return addListener('=' + name, cb);
            };
            router.removeRouteListener = function (name, cb) {
                return removeListener('=' + name, cb);
            };
        }

        function invokeListeners(name, toState, fromState) {
            (listeners[name] || []).forEach(function (cb) {
                return cb(toState, fromState);
            });
        }

        function onTransitionSuccess(toState, fromState, opts) {
            var _transitionPath = (0, _transitionPath2['default'])(toState, fromState);

            var intersection = _transitionPath.intersection;
            var toDeactivate = _transitionPath.toDeactivate;

            var intersectionNode = opts.reload ? '' : intersection;
            var name = toState.name;

            if (router.options.autoCleanUp) {
                toDeactivate.forEach(function (name) {
                    return removeListener('^' + name);
                });
            }

            invokeListeners('^' + intersection, toState, fromState);
            invokeListeners('=' + name, toState, fromState);
            invokeListeners('*', toState, fromState);
        }

        function flush() {
            listeners = {};
        }

        return { name: pluginName, init: init, onTransitionSuccess: onTransitionSuccess, flush: flush, listeners: listeners };
    }

    module.exports = listenersPlugin;
});