define(function (require) {
    var defaultRTCParams 	= require("defaultRTCParams");
    var RTCClient           =  require("webrtcclientsdk");

    var BJN = {};
    BJN.RTCClient = RTCClient;
    BJN.defaultRTCParams = defaultRTCParams;
    return BJN;

})