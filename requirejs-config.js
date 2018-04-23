requirejs.config({
    baseUrl: '',
    paths: {
       "webrtc-sdk" : "./external/webrtcSdk",
       jquery: './external/jquery.min',
       underscore: './external/lodash.min'
    }
});

require(['example'], function() {
    console.log("(require): example webrtc client app loaded");
});

// require(['consumer.require'], function() {
//     console.log("(require): consumer webrtc client app loaded");
// });
