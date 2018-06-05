console.log("BJN SDK Version = ", BJNClient.version)
const options = {
    localVideoEl: $("#localVideo")[0],
    remoteVideoEl: $("#remoteVideo")[0],
}
window.bjnClient = new BJNClient(options);

bjnClient.on(bjnClient.events.media.callStateChanged, function(data) {
    console.log("============> call state changed  = ", data)
})

bjnClient.on(bjnClient.events.media.remoteStreamUpdated, function(data) {
    console.log("============> remote stream updated  = ", data)
}) 

$("#joinMeeting").click(function () {
    var meetingParams = {
        numericMeetingId: "600060006",
        displayName: "Blue"
    };
    bjnClient.joinMeeting(meetingParams);
});

$("#leaveMeeting").click(function () {
    bjnClient.leaveMeeting();
});

bjnClient.init()