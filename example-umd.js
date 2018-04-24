define(["jquery", "src/index"], function($,BJNClient) {
    console.log("loading console....")

    $("#joinMeeting, #leaveMeeting").click(function(){
		$(this).addClass("hidden");
		$(this).siblings().removeClass("hidden");
	});
	$("#toggleVideoMute, #toggleAudioMute").click(function(){
		$(this).toggleClass("muted");
    });
	
	var onMediaEvent = function(type, data) {
		console.error("[Event]:  Recieved Media Event  = ", type, data)
	}
    
    initializeSDK = function() {
        var options = {
            localVideoEl: $("#localVideo")[0],
            remoteVideoEl: $("#remoteVideo")[0],
			bandWidth: "512",
			onMediaEvent: onMediaEvent
        }

        console.log("BJN Client Version = ", BJNClient.version)
        window.bjnClient = new BJNClient(options);
        bjnClient.init()
    }
    
    maptoUI = function() {
		console.log("(example.js) maptoUI()");
		// Device and Connection UI Handlers
		$("#audioIn").change( function() {
			var who = $("#audioIn").prop('selectedIndex');
			console.log("UI: audio input changed: " + who);
			bjnClient.changeAudioInput(who);
		});

		$("#audioOut").change( function() {
			var who = $("#audioOut").prop('selectedIndex');
			console.log("UI: audio output changed: " + who );
			bjnClient.changeAudioOutput(who);
		});

		$("#videoIn").change( function() {
			var who = $("#videoIn").prop('selectedIndex');
			console.log("UI: video input changed: " + who );
			bjnClient.changeVideoInput(who);
		});

		$("#videoBw").change( function() {
			var bw = $("#videoBw").prop('value');
			console.log("UI: Video BW is changed " + bw);
			bjnClient.setVideoBandwidth(bw);
		});


		// Mute UI handlers
		$("#toggleAudioMute").click(function() {
			var muted = bjnClient.toggleAudioMute();
			var updatedText = muted ? "Unmute Audio" : "Mute Audio";
			$("#toggleAudioMute").html(updatedText);
			console.log(muted ? "Audio is Muted now" : "Audio is Unmuted now");	
		});

		$("#toggleVideoMute").click(function() {
			var muted = bjnClient.toggleVideoMute();
            if(muted)
                setMuteButton
				setMuteButton(muted);
		});


		// Meeting UI handlers
		$("#joinMeeting").click(function() {
			var meetingParams = {
				numericMeetingId   : $('#id').val(),
				attendeePasscode    : $('#passCode').val(),
				displayName : $('#yourName').val()
			};
			bjnClient.joinMeeting(meetingParams);
		});

		$("#leaveMeeting").click(function() {
			bjnClient.leaveMeeting();
		});
    }
    
    function unmuteVideo() {
		setMuteButton(false);
	};

	function setMuteButton(muted){
		var updatedText = muted ? "Show Video" : "Mute Video";
		$("#toggleVideoMute").html(updatedText);	
	};
	
    console.log("Startng Initialization of BJN");
    
    initializeSDK()

	maptoUI();

})