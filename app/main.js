var MediaStreamRecorder = require('msr');
var SimpleWebRTC = require('./libs/simplewebrtc'); 
var LiveLabOsc = require('./LiveLabOsc');
var ChatWindow = require('./ChatWindow');
//var MicGainController = require('mediastream-gain'); // where is this used?
var PeerMediaContainer = require('./PeerMediaContainer');
var util = require("./util.js");
var SessionControl = require('./SessionControl');
var getScreenMedia = require("getscreenmedia");

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
// state variable used to determine if this client has received
window.hasStateInfo = false;
window.localId = "";

// structure of state info object:
// peers: list of peers, each peer has an id and a nick as following:
// {peers: [{id: SDsd8zjcxke23, nick: pablo}, {id: zxczxc9(qeasd, nick: ojack)}]}
window.stateInfo = {peers: []};

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
                console.log('create room cb', arguments);
            
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

    // first we initialize the webrtc client
    webrtc = new SimpleWebRTC({
       // the id/element dom element that will hold our video;
       // it's ok to initialize this to "video_local" as we in all cases
       // have the local window 
       localVideoEl: "video_local",
       localVideo: {
               autoplay: true,
               mirror: false,
               muted: false
           },
       nick: localStorage.getItem("livelab-localNick") || window.localId,
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
    // then we create the divs to contain & display the media streams
    localMedia = new PeerMediaContainer("local", null, webrtc, dashboard);
    
    if(LOCAL_SERVER){
        var osc_config = {
            "socket_port": BASE_SOCKET_PORT,
            "socket_url": BASE_SOCKET_URL
        }; 

        oscChannels = new LiveLabOsc(osc_config.socket_port, webrtc, localMedia.dataDiv, osc_config.socket_url, peers);
    } else {
          oscChannels = new LiveLabOsc(null, webrtc, localMedia.dataDiv, null, peers);
    }

    webrtc.on('readyToCall', function () {
        window.localId = webrtc.connection.connection.id;
        if (room) webrtc.joinRoom(room);
        chatWindow = new ChatWindow(document.body, webrtc);
        localMedia.addVideoControls();
        sessionControl = new SessionControl(localMedia.video, document.body, peers, webrtc);
        if (document.querySelector(".toolbar .toolbar-button") === null) {
            addToolbarButton("Chat", chatWindow);
            addToolbarButton("Session Control", sessionControl);
        }
            localMedia.video.addEventListener("click", function(e){
                console.log("setting video ", e.target);
                sessionControl.setVideo(e.target);
            });
    });

    webrtc.on('localScreenAdded', function (el) {
        console.log(el);
         var newPeer = new PeerMediaContainer("your screen", el, webrtc, dashboard);
        peers["localScreenShare"] = newPeer;
    });

    webrtc.on("localScreenStopped", function (stream) {
        peers["localScreenShare"].destroy();
        delete peers["localScreenShare"];
    });

    webrtc.on('localScreenAdded', function (el) {
        console.log(el);
         var newPeer = new PeerMediaContainer("your screen", el, webrtc, dashboard);
        peers["localScreenShare"] = newPeer;
    });

    webrtc.on("localScreenStopped", function (stream) {
        peers["localScreenShare"].destroy();
        delete peers["localScreenShare"];
    });

    webrtc.on('channelMessage', function (peer, label, data) {
        if (data.type=="chat") {
            var name = document.getElementById("header_" + peer.id).innerHTML;
            chatWindow.appendToChatLog(name, data.payload);
        } else if (data.type=="osc") {
            oscChannels.receivedRemoteStream(data, peer.id, label);
            sessionControl.oscParameter(data.payload);
        } else if (data.type === "sessionInfo"){
            // one of the peers changed the name of their window
            if (label === "nameChange") {
                // update the header of the peer that changed their name
                document.getElementById("header_" + peer.id).innerHTML = util.escapeText(data.payload);
            } else if (label === "shareState" && !window.hasStateInfo) {
                // update the state of this client to reflect the state of the room
                window.stateInfo = JSON.parse(data.payload);
                window.hasStateInfo = true;
                // reflect the changes in the browser
                window.stateInfo.peers.forEach(function(existingPeer) {
                    if (existingPeer.id !== localId && existingPeer.nick) {
                        document.getElementById("header_" + existingPeer.id).innerHTML = util.escapeText(existingPeer.nick);
                    }
                });
            }
        } else if(data.type=="code-lab"){
            sessionControl.remoteCodeChange(data.payload);
        } else if(data.type=="mixer"){
            console.log("MIXER", label, data);
            sessionControl.remoteMixerEvent(label, data.payload);
        }
    });

     webrtc.on('videoAdded', function (video, peer) {
         console.log("VIDEO ADDED");
         /*add new peer to peer object*/
         var newPeer = new PeerMediaContainer(peer.id, video, webrtc, dashboard, peer.nick);
         peers[peer.id] = {peer: peer, peerContainer: newPeer, dataStreams: {}};
         newPeer.video.addEventListener("click", function(e){
             console.log("setting video ", e.target);
             sessionControl.setVideo(e.target);
         });

         if (window.hasStateInfo) {
             // check to see if the new peer resides inside the peers list of
             // the window.stateInfo object. if not: add it
             var peerExists = false;
             window.stateInfo.peers.forEach(function(existingPeer) {
                 if (peer.id === existingPeer.id) {
                     peerExists = true;
                     return;
                 }
             });

             if (!peerExists) {
                 window.stateInfo.peers.push({id: peer.id, nick: peer.nick});
             }
             // send the state information to everyone 
             // TODO: preferably only send it to the connected peer
             setTimeout(function() {
                 webrtc.sendDirectly(peer.id, "shareState", "sessionInfo", JSON.stringify(window.stateInfo));
             }, 2500);
         } else {
             // don't do shit
         }
        // update the newly connected peer with the session info for this
        // channel
        // {collect session info somehow}
     });

    var self = this;
    webrtc.on('videoRemoved', function (video, peer) {
        var index = -1;
        for (var i = 0; i < window.stateInfo.peers.length; i++) {
            var existingPeer = window.stateInfo.peers[i];
            if (peer.id === existingPeer.id) {
                index = i;
                break;
            }
        }
        // remove the peer from the stateInfo object
        window.stateInfo.peers.splice(index, 1);
        var peerObj = peers[peer.id];
        peerObj.peerContainer.destroy();
        delete peers[peer.id];
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
}

function addToolbarButton(name, element){
    var b = document.createElement('input');
    b.className = "toolbar-button";
    b.type = 'button';
    b.value = name;
    toolbar.appendChild(b);
    b.onclick = element.toggle.bind(element);
}
