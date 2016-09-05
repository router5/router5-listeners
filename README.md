[![npm version](https://badge.fury.io/js/router5-listeners.svg)](https://badge.fury.io/js/router5-listeners)
[![Build Status](https://travis-ci.org/router5/router5-listeners.svg?branch=master)](https://travis-ci.org/router5/router5-listeners?branch=master)
[![Coverage Status](https://coveralls.io/repos/router5/router5-listeners/badge.svg?branch=master&service=github)](https://coveralls.io/github/router5/router5-listeners?branch=master)

# [DEPRECATED] router5-listeners

## From version 4 and above of router5, this module is no longer needed and code has been moved to [router5](https://github.com/router5/router5) main repo. Refer to http://router5.github.io/docs/migration-4.html for more details.

Listeners plugin for router5@3.0.0.

### How to install

The `dist` folder contains:
- AMD bundled (with minifed version) named `router5ListenersPlugin`
- Browser module-less bundle (with minified version) adding to the globals `router5ListenersPlugin`
- UMD and CommonJs files

Sources are distributed through:
- bower (`bower install router5-listeners`)
- npm (`npm install --save router5-listeners`)

### How to use

```javascript
import { Router5 }     from 'router5';
import listenersPlugin from 'router5-listeners';

const router = new Router5()
    .addNode('home', '/home')
    .usePlugin(listenersPlugin());
```

### API

This plugin adds the following methods to your router instance:

- `addListener(fn)`
- `removeListener(fn)`
- `addNodeListener(nodeName, fn)`
- `removeNodeListener(nodeName, fn)`
- `addRouteListener(routeName, fn)`
- `removeRouteListener(routeName, fn)`


### Contributing

Please read [contributing guidelines](https://github.com/router5/router5/blob/master/CONTRIBUTING.md) on router5 repository.
