[![npm version](https://badge.fury.io/js/router5-listeners.svg)](https://badge.fury.io/js/router5-listeners)
[![Build Status](https://travis-ci.org/router5/router5-listeners.svg?branch=master)](https://travis-ci.org/router5/router5-listeners?branch=master)
[![Coverage Status](https://coveralls.io/repos/router5/router5-listeners/badge.svg?branch=master&service=github)](https://coveralls.io/github/router5/router5-listeners?branch=master)

# router5-listeners

Listeners plugin for router5@1.0.0 (not published yet, follow progress [here](https://github.com/router5/router5/pull/30))

### How to install

The `dist` folder contains:
- AMD bundled (with minifed version) named `router5ListenersPlugin`
- Browser module-less bundle (with minified version) adding to the globals `router5ListenersPlugin`
- UMD and CommonJs files

Sources are distributed through:
- bower (`bower install router5-listeners`)
- npm (`bower install --save router5-listeners`)

### How to use

```javascript
import { Router5 }     from 'router5'
import listenersPlugin from 'router5-listeners';

const router = new Router5()
    .addNode('home', '/home')
    .usePlugin(listenersPluglin());
```

### API

This plugin adds the following methods to your router instance:

- `addListener(fn)`
- `removeListener(fn)`
- `addNodeListener(nodeName, fn)`
- `removeNodeListener(nodeName, fn)`
- `addRouteListener(routeName, fn)`
- `removeRouteListener(routeName, fn)`
