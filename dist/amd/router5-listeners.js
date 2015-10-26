/**
 * @license
 * @version 1.0.0-rc1
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Thomas Roch
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
define('router5ListenersPlugin', [], function () {
"use strict";

    function transitionPath(toState, fromState) {
        function nameToIDs(name) {
            return name.split('.').reduce(function (ids, name) {
                return ids.concat(ids.length ? ids[ids.length - 1] + '.' + name : name);
            }, []);
        }
    
        var i = undefined;
        var fromStateIds = fromState ? nameToIDs(fromState.name) : [];
        var toStateIds = nameToIDs(toState.name);
        var maxI = Math.min(fromStateIds.length, toStateIds.length);
    
        if (fromState && fromState.name === toState.name) {
            i = Math.max(maxI - 1, 0);
        } else {
            for (i = 0; i < maxI; i += 1) {
                if (fromStateIds[i] !== toStateIds[i]) break;
            }
        }
    
        var toDeactivate = fromStateIds.slice(i).reverse();
        var toActivate = toStateIds.slice(i);
        var intersection = fromState && i > 0 ? fromStateIds[i - 1] : '';
    
        return {
            intersection: intersection,
            toDeactivate: toDeactivate,
            toActivate: toActivate
        };
    }
    
    
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
            var _transitionPath = transitionPath(toState, fromState);
    
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

    return listenersPlugin;
});
