import transitionPath from 'router5.transition-path';

const pluginName = 'LISTENERS';

function listenersPlugin() {
    let listeners = {};
    let router;

    const removeListener = (name, cb) => {
        if (cb) {
            if (listeners[name]) listeners[name] = listeners[name].filter(callback => callback !== cb);
        } else {
            listeners[name] = [];
        }
        return router;
    };

    function init(target) {
        router = target;

        const addListener = (name, cb, replace) => {
            const normalizedName = name.replace(/^(\*|\^|=)/, '');

            if (normalizedName && !/^\$/.test(name)) {
                const segments = router.rootNode.getSegmentsByName(normalizedName);
                if (!segments) console.warn(`No route found for ${normalizedName}, listener might never be called!`);
            }

            if (!listeners[name]) listeners[name] = [];
            listeners[name] = (replace ? [] : listeners[name]).concat(cb);

            return router;
        };

        router.addListener = (cb) => addListener('*', cb);
        router.removeListener = (cb) => removeListener('*', cb);

        router.addNodeListener    = (name, cb) => addListener('^' + name, cb, true);
        router.removeNodeListener = (name, cb) => removeListener('^' + name, cb);

        router.addRouteListener = (name, cb) => addListener('=' + name, cb);
        router.removeRouteListener = (name, cb) => removeListener('=' + name, cb);
    }

    function invokeListeners(name, toState, fromState) {
        (listeners[name] || []).forEach(cb => cb(toState, fromState));
    }

    function onTransitionSuccess(toState, fromState, opts) {
        const {intersection, toDeactivate} = transitionPath(toState, fromState);
        const intersectionNode = opts.reload ? '' : intersection;
        const { name } = toState;

        if (router.options.autoCleanUp) {
            toDeactivate.forEach(name => removeListener('^' + name));
        }

        invokeListeners('^' + intersection, toState, fromState);
        invokeListeners('=' + name, toState, fromState);
        invokeListeners('*', toState, fromState);
    }

    function flush() {
        listeners = {};
    }

    return { name: pluginName, init, onTransitionSuccess, flush, listeners };
}

export default listenersPlugin;
