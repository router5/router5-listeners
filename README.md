[![Build Status](https://travis-ci.org/router5/router5-listeners.svg?branch=master)](https://travis-ci.org/router5/router5-listeners)

# router5-listeners

Listeners plugin for router5@1.0.0 (not published yet, follow progress [here](https://github.com/router5/router5/pull/30))

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
