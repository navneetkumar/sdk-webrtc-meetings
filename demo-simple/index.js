console.log("BJN SDK Version = ", BJNClient.version)
const meetingId = "600060006"
const passcode = "6000"
const name = "Blue"

const options = {
    localVideoEl: $("#localVideo")[0],
    remoteVideoEl: $("#remoteVideo")[0],
}

window.bjnClient = new BJNClient(options);
bjnClient.init()

$("#joinMeeting").click(function () {
    var meetingParams = {
        numericMeetingId: meetingId,
        attendeePasscode: passcode,
        displayName: name
    };
    bjnClient.joinMeeting(meetingParams);
});

$("#leaveMeeting").click(function () {
    bjnClient.leaveMeeting();
});