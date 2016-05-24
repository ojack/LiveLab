
var SimpleWebRTC = require('./libs/simplewebrtc');
var LiveLabOsc = require('./LiveLabOsc');
//var MicGainController = require('mediastream-gain'); // where is this used?
var PeerMediaContainer = require('./PeerMediaContainer');
var SessionControl = require('./SessionControl');

var BASE_SOCKET_URL = "wss://localhost";
var BASE_SOCKET_PORT = 8000;
var USE_OSC = true;
 
 var webrtc, chatlog, oscChannels, room, localMedia, dashboard, sessionControl;

/*Global object containing data about all connected peers*/
var peers = {};

window.onload = start;
// had to change start function to control device enumeration
function start() {
     room = location.search && location.search.split('?')[1];
    
     if(room) {
        initWebRTC();
        setRoom(room);
     } else {
        document.getElementById("createRoom").onsubmit = function(){
            var val = document.getElementById("sessionInput").value.toLowerCase().replace(/\s/g, '-').replace(/[^A-Za-z0-9_\-]/g, ''); 
            initWebRTC();

            webrtc.createRoom(val, function (err, name) {
                console.log(' create room cb', arguments);
            
                var newUrl = location.pathname + '?' + name;
                if (!err) {
                    history.replaceState({foo: 'bar'}, null, newUrl);
                    setRoom(name);
                } else {
                    console.log(err);
                }
            });
            return false;   
        }
     }
}

function initWebRTC(){
    dashboard = document.createElement('div');
    dashboard.setAttribute("id", "dashboard");
    document.body.appendChild(dashboard);

   // localMedia = new LocalMediaContainer(dashboard);
  localMedia = new PeerMediaContainer("local", null, webrtc, dashboard);
     webrtc = new SimpleWebRTC({
        // the id/element dom element that will hold "our" video
        localVideoEl: localMedia.videoDiv,
        localVideo: {
                autoplay: true,
                mirror: false,
                muted: false
            },
        // the id/element dom element that will hold remote videos
        remoteVideosEl: '',
        // immediately ask for camera access
        autoRequestMedia: true,
        debug: false,
        detectSpeakingEvents: true,
        autoAdjustMic: false,
        adjustPeerVolume: false,
        peerVolumeWhenSpeaking: 1.0,
        media: {
          audio: {
            optional: [
            {googAutoGainControl: false}, 
            {googAutoGainControl2: false}, 
            {googEchoCancellation: false},
            {googEchoCancellation2: false},
            {googNoiseSuppression: false},
            {googNoiseSuppression2: false},
            {googHighpassFilter: false},
            {googTypingNoiseDetection: false},
            {googAudioMirroring: false}
            ]
          },
          video: {
            optional: [
            ]
          }
        }
     });
    
    if(USE_OSC){
        var osc_config = {
            "socket_port": BASE_SOCKET_PORT,
            "socket_url": BASE_SOCKET_URL
        }; 

        oscChannels = new LiveLabOsc(osc_config.socket_port, webrtc, localMedia.dataDiv, osc_config.socket_url, peers);
        //localMedia.initOsc(webrtc, osc_config, peers);
    }

    webrtc.on('readyToCall', function () {
        // you can name it anything
        if (room) webrtc.joinRoom(room);
        localMedia.addVideoControls();
        sessionControl = new SessionControl(localMedia.video, document.body);
        localMedia.video.addEventListener("click", function(e){
            console.log("setting video ", e.target);
            sessionControl.setVideo(e.target);
        });
    });

    webrtc.on('channelMessage', function (peer, label, data) {
       /* if (data.type == 'volume') {
            showVolume(document.getElementById('volume_' + peer.id), data.volume);
        } else*/ if(data.type=="chat"){
            chatlog.innerHTML += "</br>"+peer.id + ": " + data.payload; 
            console.log(data);
        }  else if(data.type=="osc"){
                oscChannels.receivedRemoteStream(data, peer.id, label);
               
        }
    });

     webrtc.on('videoAdded', function (video, peer) {
        console.log('video added', peer);
          /*add new peer to peer object*/
       console.log(peer);
        var newPeer = new PeerMediaContainer(peer.id, video, webrtc, dashboard);
        peers[peer.id] = {peer: peer, peerContainer: newPeer, dataStreams: {}};
        newPeer.video.addEventListener("click", function(e){
            console.log("setting video ", e.target);
            sessionControl.setVideo(e.target);
        });
     });


    webrtc.on('videoRemoved', function (video, peer) {
        console.log('video removed ', peer);
        console.log(peers);
        var peerObj = peers[peer.id];
        peerObj.peerContainer.destroy();
        delete peers[peer.id];
        console.log(peers);
    });
}

function setRoom(name) {
    document.body.removeChild(document.getElementById("createRoom"));
    document.getElementById("title").innerHTML = name;
  //  $('h1').text(name);
   // $('#subTitle').text(name + " || link: "+ location.href);
   // $('body').addClass('active');
}
