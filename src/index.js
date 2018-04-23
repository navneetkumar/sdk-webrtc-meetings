define(function (require) {
    console.log("loading index..");

    var defaultRTCParams = {
        peerConfig: {
            receiveMedia: {
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            },
            peerConnectionConfig: {
                iceServers: [],
                forceTurn: false
            },
            peerConnectionConstraints: {
                optional: [
                    {DtlsSrtpKeyAgreement: true}
                ]
            }
        }
    };
   
    var Manager = require("webrtc-sdk");
    var config = {
        muteParams: {
            localAudio: false,
            localVideo: false
        }
    };
    
    const sdkVersion = {
        major: 1,
        minor: 1,
        build: 0
    };
    
    var mediaConstraints = {
        audio: {},
        video: {}
    };
       
    class Client {
        constructor(options) {
            this.options = options || {};
            this.defaultRTCParams = defaultRTCParams
            this.mediaStarted = false
            this.setupManager()
        }

        init() {
            this.manager.getLocalDevices().then((devices) => {
                this.localDevices = devices.available;
                this.initialize()

            }).catch((error) =>{
                console.log("Local device error " + error);
            })
        }
 
        setupManager() {
            this.manager = new Manager({
                webrtcParams: defaultRTCParams,
                bjnCloudTimeout: 5000,
                bjnSIPTimeout: 3000,
                bjnWebRTCReconnectTimeout: 90000
            });
        }

        initialize() {   
            this.manager.setBandwidth(this.options.bandWidth);
            this.mediaStarted = false;
            this.startLocalStream();
            
            // get hooks to RTCManager callbacks
            this.manager.localVideoStreamChange = this.updateSelfView;
            this.manager.localAudioStreamChange = this.updateAudioPath;
            this.manager.remoteEndPointStateChange = this.nRemoteConnectionStateChange;
            this.manager.localEndPointStateChange = this.onLocalConnectionStateChange;
            this.manager.remoteStreamChange = this.onRemoteStreamUpdated;
            this.manager.error = this.onRTCError;
            this.manager.contentStreamChange = this.onContentShareStateChange;
        };
    
        startLocalStream() {
            console.log("starting local stream");

            var streamType = 'local_stream';
            if (this.mediaStarted)
                streamType = 'preview_stream';
    
            this.manager.getLocalMedia(mediaConstraints, streamType).then((stream) => {
                for (var i = 0; i < stream.length; i++) {
                    if (stream[i].bjn_label === "local_audio_stream") {
                        this.localAudioStream = stream[i]
                    } else if (stream[i].bjn_label === "local_video_stream") {
                        this.localVideoStream = stream[i];
                    }
                }
    
                this.updateSelfView(this.localVideoStream);
                this.mediaStarted = true;
                if (this.options.evtVideoUnmute)
                    this.options.evtVideoUnmute();
            },(err) => {
                console.log("getLocalMedia error:\n" + JSON.stringify(err, null, 2));
            });
        };
    
        updateSelfView(localStream) {
            if (localStream) {
                this.manager.renderSelfView({
                    stream: localStream,
                    el: this.options.localVideoEl
                });
                if (this.options.evtVideoUnmute)
                    this.options.evtVideoUnmute(false);
            } else
                console.log("updateSelfView no stream!!!");
        };
    
        // Callback when audio stream changes.  update GUI if stream is defined	
        updateAudioPath(localStream) {
            if (localStream) {
                console.log("Audio Path Change");
            }
        };
    
    
        changeAudioInput(who) {
            var dev = BJN.localDevices.audioIn[who].id;
            console.log("Audio Input is changed: " + dev);
            mediaConstraints.audio.deviceId = dev;
            this.manager.stopLocalStreams();
            startLocalStream();
        };
    
        changeVideoInput(who) {
            var dev = BJN.localDevices.videoIn[who].id;
            console.log("Video Input is changed: " + dev);
            mediaConstraints.video.deviceId = dev;
            this.manager.stopLocalStreams();
            startLocalStream();
        };
    
        changeAudioOutput(who) {
            var dev = BJN.localDevices.audioOut[who].id;
            console.log("Audio Output is changed: " + dev);
            this.manager.setSpeaker({
                speakerId: dev,
                mediaElements: [this.options.remoteVideoEl]
            });
        };
    
        setVideoBandwidth(bw) {
            console.log("Video BW is changed: " + bw);
            this.manager.setBandwidth(bw);
        };
    
        toggleAudioMute(event) {
            var audioMuted = config.muteParams.localAudio ? true : false;
            config.muteParams.localAudio = !audioMuted;
            this.manager.muteStreams(config.muteParams);
            return !audioMuted;
        };
    
        toggleVideoMute(event) {
            var videoMuted = config.muteParams.localVideo ? true : false;
            config.muteParams.localVideo = !videoMuted;
            this.manager.muteStreams(config.muteParams);
            return !videoMuted;
        };
    
        setVolume() {}
    
    
    
        joinMeeting(meetingParams) {
            if ((meetingParams.numericMeetingId != "") && (meetingParams.displayName != "")) {
                console.log("*** Joining meeting id: " + meetingParams.numericMeetingId);
                this.manager.startMeeting(meetingParams);
            }
        };
    
        // End the meeting
        leaveMeeting(event) {
            this.manager.endMeeting();
            console.log("Leaving meeting");
            
        };
    
    
        onRemoteConnectionStateChange(state) {
            console.log('Remote Connection state :: ' + state);
            if (this.options.evtRemoteConnectionStateChange) this.options.evtRemoteConnectionStateChange(state);
        };
    
        onLocalConnectionStateChange(state) {
            console.log('Local Connection state :: ' + state);
            if (this.options.evtLocalConnectionStateChange) this.options.evtLocalConnectionStateChange(state);
        };
    
        onRemoteStreamUpdated(stream) {
            BJN.remoteStream = stream;
            if (stream) {
                console.log('Remote stream updated');
                this.manager.renderStream({
                    stream: BJN.remoteStream,
                    el: this.options.remoteVideoEl
                });
            }
        };
    
        onContentShareStateChange(isSharing) {
            if (this.options.evtContentShareStateChange) {
                this.options.evtContentShareStateChange(isSharing);
            }
        };
    
        //Add code to handle error from BJN SDK
        onRTCError(error) {
            console.log("Error has occured :: " + error);
            leaveMeeting();
            if (this.options.evtOnError) this.options.evtOnError(error);
    
        };
    
        reportSdkVersion() {
            return sdkVersion;
        };
    }

    return Client;
})