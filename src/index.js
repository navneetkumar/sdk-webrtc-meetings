define(function (require) {

    console.log("Starting SDK Interface");

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
                optional: [{
                    DtlsSrtpKeyAgreement: true
                }]
            }
        }
    };

    var RTCManager = require("webrtc-sdk");

    const sdkVersion = {
        major: 1,
        minor: 1,
        build: 0
    };

    class BJNClient {
        constructor(options) {
            this.options = options || {};
            this.defaultRTCParams = defaultRTCParams
            this.mediaStarted = false
            this.mediaConstraints = {
                audio: {},
                video: {}
            };
            this.config = {
                muteParams: {
                    localAudio: false,
                    localVideo: false
                }
            };
            this.setupManager()
        }

        static get version() { return sdkVersion; }

        init() {
            this.manager.getLocalDevices().then((devices) => {
                console.log("Found devices  = ", devices)
                this.localDevices = devices.available;
                this.initialize()

            }).catch((error) => {
                console.log("Local device error " + error);
            })
        }

        setupManager() {
            this.manager = new RTCManager({
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
            this.manager.localVideoStreamChange = this.updateSelfView.bind(this);
            this.manager.localAudioStreamChange = this.updateAudioPath.bind(this);
            this.manager.remoteEndPointStateChange = this.onRemoteConnectionStateChange.bind(this);
            this.manager.localEndPointStateChange = this.onLocalConnectionStateChange.bind(this);
            this.manager.remoteStreamChange = this.onRemoteStreamUpdated.bind(this);
            this.manager.error = this.onRTCError.bind(this);
            this.manager.contentStreamChange = this.onContentShareStateChange.bind(this);
        };

        startLocalStream() {
            console.log("[starting local stream]");
            var streamType = 'local_stream';
            if (this.mediaStarted)
                streamType = 'preview_stream';
            this.manager.getLocalMedia(this.mediaConstraints, streamType).then((stream) => {
                console.log("Found Local mediastreams = ", stream)
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
            }, (err) => {
                console.log("getLocalMedia error:\n" + JSON.stringify(err, null, 2));
            });
        };

        updateSelfView(localStream) {
            console.log("self view update")
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
            var dev = this.localDevices.audioIn[who].id;
            console.log("Audio Input is changed: " + dev);
            this.mediaConstraints.audio.deviceId = dev;
            this.manager.stopLocalStreams();
            this.startLocalStream();
        };

        changeVideoInput(who) {
            var dev = this.localDevices.videoIn[who].id;
            console.log("Video Input is changed: " + dev);
            this.mediaConstraints.video.deviceId = dev;
            this.manager.stopLocalStreams();
            this.startLocalStream();
        };

        changeAudioOutput(who) {
            var dev = this.localDevices.audioOut[who].id;
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
            var audioMuted = this.config.muteParams.localAudio ? true : false;
            this.config.muteParams.localAudio = !audioMuted;
            this.manager.muteStreams(this.config.muteParams);
            return !audioMuted;
        };

        toggleVideoMute(event) {
            var videoMuted = this.config.muteParams.localVideo ? true : false;
            this.config.muteParams.localVideo = !videoMuted;
            this.manager.muteStreams(this.config.muteParams);
            return !videoMuted;
        };

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
            console.info('========Remote stream===========');
            this.remoteStream = stream;
            if (this.remoteStream) {
                console.log('Remote stream updated');
                this.manager.renderStream({
                    stream: this.remoteStream,
                    el: this.options.remoteVideoEl
                });
            }
        };

        onContentShareStateChange(isSharing) {
            if (this.options.evtContentShareStateChange) {
                this.options.evtContentShareStateChange(isSharing);
            }
        };

        onRTCError(error) {
            console.log("Error has occured :: " + error);
            leaveMeeting();
            if (this.options.evtOnError) this.options.evtOnError(error);

        };

        reportSdkVersion() {
            return sdkVersion;
        };
    }

    return BJNClient;
})