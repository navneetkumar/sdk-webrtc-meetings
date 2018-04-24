var path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bjn-sdk.js',
        library: 'BJNClient',
        libraryTarget: 'umd'
    },
    resolve: {
        alias: {
            "webrtc-sdk" : path.resolve(__dirname, 'external/webrtcSdk')
        },
        modules: [
            'src/**/*.js',
            'node_modules',
            path.resolve('./src')
        ],
    }
};