var base = window.location.pathname;
var router;
var hashPrefix = '!';
var plugin = router5ListenersPlugin();

var listeners = {
    global: function (newState, oldState) {
        return;
    },
    node: function nodeListener(newState, oldState) {
        // Do nothing
    }
};

function getExpectedPath(useHash, path) {
    return useHash ? '#' + hashPrefix + path : path;
}

function getPath(useHash) {
    if (useHash) return window.location.hash + window.location.search;
    return window.location.pathname.replace(new RegExp('^' + base), '') + window.location.search;
}

describe('listenersPlugin', function () {
    var useHash = false;

    beforeAll(function () {
        router = createRouter(base, useHash, hashPrefix);
        router.usePlugin(plugin);
    });

    afterAll(function () {
        router.stop();
    });

    it('should be registered', function () {
        expect(Object.keys(router.registeredPlugins)).toContain('LISTENERS');
    });

   it('should call root node listener on first transition', function (done) {
        router.stop();
        router.setOption('defaultRoute', 'home');
        window.history.replaceState({}, '', base);
        spyOn(listeners, 'global').and.callThrough();
        router.addNodeListener('', listeners.global);

        router.start(function (err, state) {
            expect(state).toEqual({name: 'home', path: '/home', params: {}});
            expect(listeners.global).toHaveBeenCalled();
            done();
        });
    });

    it('should invoke listeners on navigation', function (done) {
        router.navigate('home', {}, {}, function () {
            var previousState = router.lastKnownState;
            spyOn(listeners, 'global').and.callThrough();
            router.addListener(listeners.global);

            router.navigate('orders.pending', {}, {}, function () {
                expect(listeners.global).toHaveBeenCalledWith(router.lastKnownState, previousState);
                router.removeListener(listeners.global);
                done();
            });
        });
    });

    it('should be able to remove listeners', function (done) {
        spyOn(listeners, 'global').and.callThrough();

        router.navigate('orders.view', {id: 123}, {replace: true}, function () {
            expect(listeners.global).not.toHaveBeenCalled();
            done();
        });
    });

    it('should not invoke listeners if trying to navigate to the current route', function (done) {
        spyOn(listeners, 'global').and.callThrough();
        router.addListener(listeners.global);

        router.navigate('orders.view', {id: 123}, {}, function () {
            expect(listeners.global).not.toHaveBeenCalled();
            done();
        });
    });

    it('should invoke node listeners', function (done) {
        router.navigate('users.list', {}, {}, function () {
            spyOn(listeners, 'node').and.callThrough();
            router.addNodeListener('users', listeners.node);
            router.navigate('users.view', {id: 1}, {}, function () {
                expect(listeners.node).toHaveBeenCalled();
                router.navigate('users.view', {id: 1}, {}, function() {
                    router.navigate('users.view', {id: 2}, {}, function(err, state) {
                        expect(listeners.node.calls.count()).toBe(2);
                        router.removeNodeListener('users', listeners.node);
                        done();
                    })
                });
            });
        });
    });

    it('should invoke node listeners on root', function (done) {
        router.navigate('orders', {}, {}, function () {
            spyOn(listeners, 'node').and.returnValue(true);
            router.addNodeListener('', listeners.node);
            router.navigate('users', {}, {}, function () {
                expect(listeners.node).toHaveBeenCalled();
                router.removeNodeListener('', listeners.node);
                done();
            });
        });
    });

    it('should invoke route listeners', function (done) {
        router.navigate('users.list', {}, {}, function () {
            spyOn(listeners, 'node').and.callThrough();
            router.addRouteListener('users', listeners.node);
            router.navigate('users', {}, {}, function () {
                expect(listeners.node).toHaveBeenCalled();
                router.removeRouteListener('users', listeners.node);
                done();
            });
        });
    });

    it('should automatically remove node listeners if autoCleanUp', function (done) {
        router.navigate('orders.completed', {}, {}, function (err, state) {
            router.addNodeListener('orders', listeners.node);
            router.navigate('users', {}, {}, function (err, state) {
                setTimeout(function () {
                    expect(plugin.listeners['^orders']).toEqual([]);
                    done();
                });
            });
        })
    });

    it('should warn if trying to register a listener on an unknown route', function () {
        spyOn(console, 'warn');
        router.addRouteListener('fake.route', function () {});
        expect(console.warn).toHaveBeenCalled;
        plugin.flush();
    });
});
