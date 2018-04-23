requirejs.config({
    baseUrl: '',
    paths: {
       "webrtc-sdk" : "./external/webrtcSdk",
       jquery: './external/jquery.min',
       underscore: './external/lodash.min'
    }
});

// require(['example'], function() {
//     console.log("(require): example webrtc client app loaded");
// });

require(['example-umd'], function() {
    console.log("(require): example webrtc client app loaded");
});