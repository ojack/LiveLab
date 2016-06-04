
var SimpleWebRTC = require('./libs/simplewebrtc');
var LiveLabOsc = require('./LiveLabOsc');
var ChatWindow = require('./ChatWindow');
//var MicGainController = require('mediastream-gain'); // where is this used?
var PeerMediaContainer = require('./PeerMediaContainer');
var SessionControl = require('./SessionControl');

//osc broadcast parameters, only available if running on localhost
var BASE_SOCKET_URL = "wss://localhost";
var BASE_SOCKET_PORT = 8000;
var LOCAL_SERVER;


if(window.location.host.indexOf("localhost") >= 0){
    LOCAL_SERVER = true;
} else {
    LOCAL_SERVER = false;
}

 var webrtc, chatWindow, oscChannels, room, localMedia, dashboard, sessionControl, toolbar;

/*Global object containing data about all connected peers*/
var peers = {};

window.onload = start;

function start() {
    /*get room from URL*/
    room = location.search && location.search.split('?')[1];
    toolbar = document.createElement('div');
    toolbar.className = "toolbar";
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
           {googAutoGainControl: true}, 
            {googAutoGainControl2: true}, 
            {googEchoCancellation: true},
            {googEchoCancellation2: true},
            {googNoiseSuppression: true},
            {googNoiseSuppression2: true},
            {googHighpassFilter: true},
            {googTypingNoiseDetection: true},
            {googAudioMirroring: true}
            ]
          },
          video: {
            optional: [
            ]
          }
        }
     });
    
    if(LOCAL_SERVER){
        var osc_config = {
            "socket_port": BASE_SOCKET_PORT,
            "socket_url": BASE_SOCKET_URL
        }; 

        oscChannels = new LiveLabOsc(osc_config.socket_port, webrtc, localMedia.dataDiv, osc_config.socket_url, peers);
        //localMedia.initOsc(webrtc, osc_config, peers);
    } else {
          oscChannels = new LiveLabOsc(null, webrtc, localMedia.dataDiv, null, peers);
    }

    webrtc.on('readyToCall', function () {
        // you can name it anything
        if (room) webrtc.joinRoom(room);
        chatWindow = new ChatWindow(document.body, webrtc);
        localMedia.addVideoControls();
        sessionControl = new SessionControl(localMedia.video, document.body, peers, webrtc);
        addToolbarButton("Chat", chatWindow);
        addToolbarButton("Session Control", sessionControl);
        localMedia.video.addEventListener("click", function(e){
            console.log("setting video ", e.target);
            sessionControl.setVideo(e.target);
        });
    });

    webrtc.on('channelMessage', function (peer, label, data) {
        if(data.type=="chat"){
            chatWindow.appendToChatLog(peer.id, data.payload);
        }  else if(data.type=="osc"){
                oscChannels.receivedRemoteStream(data, peer.id, label);
               
        } else if(data.type=="code-lab"){
            console.log(label, data);
            sessionControl.remoteCodeChange(data.payload);
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
   // document.getElementById("title").innerHTML = name;
   
    var title = document.createElement('div');
    title.innerHTML = name;
    title.id = "title";
    toolbar.appendChild(title);
    document.body.appendChild(toolbar);
   
  //  $('h1').text(name);
   // $('#subTitle').text(name + " || link: "+ location.href);
   // $('body').addClass('active');
}

function addToolbarButton(name, element){
    var b = document.createElement('input');
    b.className = "toolbar-button";
    b.type = 'button';
    b.value = name;
    toolbar.appendChild(b);
    b.onclick = element.toggle.bind(element);
     /*   if(e.target.className.indexOf("active") > 0){
             e.target.className.replace(/\bactive\b/,'');
         } else {
            e.target.className += " active";
         }
       
    }*/
  
  /*  b.onclick = function(){
        console.log("clicked element", element);
        if(element.div.className == "toolbar-element show"){
            element.div.className = "toolbar-element hide";
        } else { 
            element.div.className = "toolbar-element show"
        }
    }*/
}
