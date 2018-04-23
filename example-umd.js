define(["jquery", "src/index"], function($,Client) {
    console.log("loading console....")
    var options = {
        localVideoEl: $("#localVideo")[0],
        remoteVideoEl: $("#remoteVideo")[0],
        bandWidth: "512"
    }
    window.bjn = new Client(options);
    bjn.init()
})