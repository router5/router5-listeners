import createRouter from './create-router';
import chai, { expect } from 'chai';
import { spy, stub } from 'sinon';
import sinonChai from 'sinon-chai';
import router5ListenersPlugin from '../modules';

chai.use(sinonChai);

let router;
const hashPrefix = '!';
const plugin = router5ListenersPlugin();

function getExpectedPath(useHash, path) {
    return useHash ? '#' + hashPrefix + path : path;
}

describe('listenersPlugin', function () {
    const useHash = false;

    before(function () {
        router = createRouter();
        router.usePlugin(plugin);
    });

    after(function () {
        router.stop();
    });

    it('should be registered', function () {
        expect(Object.keys(router.registeredPlugins)).to.contain('LISTENERS');
    });

   it('should call root node listener on first transition', function (done) {
        router.stop();
        router.setOption('defaultRoute', 'home');
        const nodeListener = spy();
        router.addNodeListener('', nodeListener);

        router.start(function (err, state) {
            expect(state).to.eql({_meta: {home: {}}, name: 'home', path: '/home', params: {}});
            expect(nodeListener).to.have.been.called;
            done();
        });
    });

    it('should invoke listeners on navigation', function (done) {
        router.navigate('home', {}, {}, function () {
            const previousState = router.lastKnownState;
            const listener = spy();
            router.addListener(listener);

            router.navigate('orders.pending', {}, {}, function () {
                expect(listener).to.have.been.calledWith(router.lastKnownState, previousState);
                router.removeListener(listener);
                done();
            });
        });
    });

    it('should not invoke listeners if trying to navigate to the current route', function (done) {
        router.navigate('orders.view', {id: 123}, {}, function () {
            const listener = spy();
            router.addListener(listener);

            router.navigate('orders.view', {id: 123}, {}, function () {
                expect(listener).not.to.have.been.called;
                done();
            });
        });
    });

    it('should invoke node listeners', function (done) {
        router.navigate('users.list', {}, {}, function () {
            const nodeListener = spy();
            router.addNodeListener('users', nodeListener);
            router.navigate('users.view', {id: 1}, {}, function () {
                expect(nodeListener).to.have.been.called;
                router.navigate('users.view', {id: 1}, {}, function() {
                    router.navigate('users.view', {id: 2}, {}, function(err, state) {
                        expect(nodeListener).to.have.been.calledTwice;
                        router.removeNodeListener('users', nodeListener);
                        done();
                    })
                });
            });
        });
    });

    it('should invoke node listeners on root', function (done) {
        router.navigate('orders', {}, {}, function () {
            const nodeListener = spy();
            router.addNodeListener('', nodeListener);
            router.navigate('users', {}, {}, function () {
                expect(nodeListener).to.have.been.called;
                router.removeNodeListener('', nodeListener);
                done();
            });
        });
    });

    it('should invoke route listeners', function (done) {
        router.navigate('users.list', {}, {}, function () {
            const nodeListener = spy();
            router.addRouteListener('users', nodeListener);
            router.navigate('users', {}, {}, function () {
                expect(nodeListener).to.have.been.called;
                router.removeRouteListener('users', nodeListener);
                done();
            });
        });
    });

    it('should automatically remove node listeners if autoCleanUp', function (done) {
        router.navigate('orders.completed', {}, {}, function (err, state) {
            router.addNodeListener('orders', () => {});
            router.navigate('users', {}, {}, function (err, state) {
                setTimeout(function () {
                    expect(router.registeredPlugins['LISTENERS'].listeners['^orders']).to.eql([]);
                    done();
                });
            });
        })
    });

    it('should warn if trying to register a listener on an unknown route', function () {
        stub(console, 'warn');
        router.addRouteListener('fake.route', function () {});
        expect(console.warn).to.have.been.called;
        router.registeredPlugins['LISTENERS'].flush();
    });
});
