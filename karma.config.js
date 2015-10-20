module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],

        autoWatch: false,
        singleRun: true,

        browsers: ['Firefox'],

        files: [
            'node_modules/router5/dist/browser/router5.js',
            'dist/browser/router5-listeners.js',
            'test/create-router.js',
            'test/main.js'
        ],

        preprocessors: {
          'temp/test/*.js': ['coverage']
        },

        plugins: [
            'karma-jasmine',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-mocha-reporter',
            'karma-coverage',
            'karma-coveralls'
        ],

        reporters: ['mocha', 'coverage', 'coveralls'],

        coverageReporter: {
            dir: 'coverage',
            reporters: [
                {type: 'lcov'}
            ],
        }
    });
};
