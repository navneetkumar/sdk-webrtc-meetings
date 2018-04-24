define(["jquery", "src/index"], function($,BJNClient) {
    console.log("loading console....")
    var options = {
        localVideoEl: $("#localVideo")[0],
        remoteVideoEl: $("#remoteVideo")[0],
        bandWidth: "512"
    }
    console.log("BJN Client Version = ", BJNClient.version)
    var bjnClient = new BJNClient(options);
    bjnClient.init()
})