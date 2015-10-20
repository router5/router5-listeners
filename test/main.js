var base = window.location.pathname;
var router;
var hashPrefix = '!';
var plugin = router5ListenersPlugin();

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
});
