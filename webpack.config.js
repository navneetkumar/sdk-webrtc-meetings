var path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bjn-sdk.js',
        library: 'BJN',
        libraryTarget: 'umd'
    },
    resolve: {
        modules: [
            'src/**/*.js',
            'node_modules',
            path.resolve('./src')
        ],

    }
};