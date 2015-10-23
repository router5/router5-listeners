const pluginName = 'LISTENERS';

function transitionIntersection(toState, fromState) {
    const nameToIDs = name => {
        return name.split('.').reduce((ids, name) => {
            return ids.concat(ids.length ? ids[ids.length - 1] + '.' + name : name);
        }, []);
    };

    let i;
    const fromStateIds = fromState ? nameToIDs(fromState.name) : [];
    const toStateIds = nameToIDs(toState.name);
    const maxI = Math.min(fromStateIds.length, toStateIds.length);

    if (fromState && fromState.name === toState.name) i = Math.max(maxI - 1, 0);
    else {
        for (i = 0; i < maxI; i += 1) {
            if (fromStateIds[i] !== toStateIds[i]) break;
        }
    }

    const toDeactivate = fromStateIds.slice(i).reverse();
    const intersection = fromState && i > 0 ? fromStateIds[i - 1] : '';
    return {toDeactivate, intersection};
}

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
        const {intersection, toDeactivate} = transitionIntersection(toState, fromState);
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
