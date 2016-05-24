
var SimpleWebRTC = require('./libs/simplewebrtc');
var LiveLabOsc = require('./LiveLabOsc');
var MicGainController = require('mediastream-gain');


var BASE_SOCKET_URL = "wss://localhost";
var BASE_SOCKET_PORT = 8000;

 var webrtc, chatlog, osc;
// had to change start function to control device enumeration
 function start() {

    if (window.stream) {
        window.stream.getTracks().forEach(function(track) {
            track.stop();
        });
    };

     // grab the room from the URL
    var room = location.search && location.search.split('?')[1];
    chatlog = document.getElementById("chatlog");

     // create our webrtc connection
    webrtc = new SimpleWebRTC({
        // the id/element dom element that will hold "our" video
        localVideoEl: 'localVideo',
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

    //create div element for local osc streams
    var streamDiv = document.createElement('div');
    streamDiv.className = "stream-holder";
    document.getElementById("localContainer").appendChild(streamDiv);
    osc = new LiveLabOsc(BASE_SOCKET_PORT, webrtc, streamDiv, BASE_SOCKET_URL);
    //connect to server via websockets


       
        // when it's ready, join if we got a room from the URL
    webrtc.on('readyToCall', function () {
        // you can name it anything
        if (room) webrtc.joinRoom(room);
    });

     webrtc.on('channelMessage', function (peer, label, data) {
        if (data.type == 'volume') {
            showVolume(document.getElementById('volume_' + peer.id), data.volume);
        } else if(data.type=="chat"){
            chatlog.innerHTML += "</br>"+peer.id + ": " + data.payload; 
            console.log(data);
        }  else if(data.type=="osc"){
                osc.receivedRemoteStream(data, peer.id, label);
               
        }
    });

    webrtc.on('videoAdded', function (video, peer) {
        console.log('video added', peer);
        var remotes = document.getElementById('remotes');
        if (remotes) {
            var d = document.createElement('div');
            d.className = 'videoContainer';
            d.id = 'container_' + webrtc.getDomId(peer);

            var vol = document.createElement('div');
            vol.id = 'volume_' + peer.id;
            vol.className = 'volume_bar';
            d.appendChild(vol);

            d.appendChild(video);
            video.id = 'video_' + peer.id;
            video.onclick = function () {
                showWindow.document.getElementById('showVideo').src = document.getElementById('video_' + peer.id).src;
            };
            video.volume = 0;
            video.oncanplay = function() {getOuts()};

            var streamDiv = document.createElement('div');
            streamDiv.className = "stream-holder";
            osc.addPeer(peer.id, streamDiv);
            d.appendChild(streamDiv);

            // peer window section
            var peerWin = document.createElement('div');
            peerWin.className = 'peerWindow';
            peerWin.id = 'peerWin_' + peer.id;
            var peerWinButton = document.createElement('input');
            peerWinButton.type = 'button';
            peerWinButton.value = 'window';
            var peerWindow;
            peerWinButton.onclick = function () {
              peerWindow = window.open("https://" + ip + "/show.html", 'Win_' + peer.id, 'popup');
              peerWindow.onload = function() {
                    peerWindow.document.getElementById('showVideo').src = document.getElementById('video_' + peer.id).src;
                    }
            };
            peerWin.appendChild(peerWinButton);
            d.appendChild(peerWin);

            // fullscreen window
            var peerFull = document.createElement('div');
            peerFull.className = 'peerFull';
            var peerFullCheck = document.createElement('input');
            peerFullCheck.type = 'checkbox';
            peerFullCheck.onchange = function () {
                peerWindow.focus();
                if (peerFullCheck.checked == true) {
                    if (isFirefox == true) {
                        peerWindow.document.getElementById('showVideo').mozRequestFullScreen();
                    }
                    if (isChrome == true) {
                        peerWindow.document.getElementById('showVideo').webkitRequestFullScreen();
                    }
                } else {
                    if (isFirefox == true) {
                        peerWindow.document.getElementById('showVideo').mozCancelFullscreen();
                    }
                    if (isChrome == true) {
                        peerWindow.document.getElementById('showVideo').webkitExitFullscreen();
                    }
                }
            }
            peerFull.appendChild(peerFullCheck);
            var fullText = document.createTextNode("Full");
            peerFull.appendChild(fullText);
            d.appendChild(peerFull);
            
            // audio output section
            var audioOut = document.createElement('div');
            audioOut.className = 'outputSelector';
            audioOut.id = 'audioOut_' + peer.id;
            var audioOutLabel = document.createElement('label');
            audioOutLabel.innerHTML = 'Select peer audio output: ';
            audioOut.appendChild(audioOutLabel);
            var audioOutSelector = document.createElement('select');
            audioOut.appendChild(audioOutSelector);
            d.appendChild(audioOut);

            // volume control
            var volCntl = document.createElement('div');
            volCntl.className = 'volumeSlide';
            volCntl.id = 'volCntl_' + peer.id;
            var volumeLabel = document.createElement('label');
            volumeLabel.innerHTML = 'Volume';
            volCntl.appendChild(volumeLabel);
            var volController = document.createElement('input');
            volController.type = 'range';
            volController.min = "0.0";
            volController.max = "1.0";
            volController.value = "0.0";
            volController.step = "0.01";
            volController.oninput = function() {
              video.volume = volController.value;
            };
            volCntl.appendChild(volController);
            d.appendChild(volCntl);

            remotes.appendChild(d);        
        };
    });

    webrtc.on('videoRemoved', function (video, peer) {
        console.log('video removed ', peer);
        var remotes = document.getElementById('remotes');
        var el = document.getElementById('container_' + webrtc.getDomId(peer));
        if (remotes && el) {
            remotes.removeChild(el);
        }
    });

    webrtc.on('volumeChange', function (volume, treshold) {
        //console.log('own volume', volume);
        showVolume(document.getElementById('localVolume'), volume);
    });
     
    if (room) {
        setRoom(room);
    } else {
        $('#createRoom').submit(function () {
            var val = $('#sessionInput').val().toLowerCase().replace(/\s/g, '-').replace(/[^A-Za-z0-9_\-]/g, '');
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
        });
    }

       $('#sendChat').submit(function () {
       		 var msg = document.getElementById("chat").value;
    		chatlog.innerHTML += "</br> me: " + msg; 
    		webrtc.sendDirectlyToAll("simplewebrtc", "chat", msg) ;
             return false;
    	});
 }
 
function showVolume(el, volume) {
    if (!el) return;
    if (volume < -45) { // vary between -45 and -20
        el.style.height = '0px';
    } else if (volume > -20) {
        el.style.height = '100%';
    } else {
        el.style.height = '' + Math.floor((volume + 100) * 100 / 25 - 220) + '%';
    }
}

function setRoom(name) {
    $('#createRoom').remove();
    $('h1').text(name);
   // $('#subTitle').text(name + " || link: "+ location.href);
    $('body').addClass('active');
}


// echo cancellation
var echoOff = {
    // the id/element dom element that will hold "our" video
    localVideoEl: 'localVideo',
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
};

var echoOn = {
    localVideoEl: 'localVideo',
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
};

function echoCancel(constraints) {
  webrtc = new SimpleWebRTC(constraints);
}

var sessionControl = document.getElementById('sessionControl');
if (sessionControl) {
    var echoCheck = document.createElement('input');
    echoCheck.type = 'checkbox';
    echoCheck.onchange = function() {
        if (echoCheck.checked == true) {
          echoCancel(echoOn)
        } else {
          echoCancel(echoOff)
        }
    };
    var echoLabel = document.createTextNode("Echo Cancelation");
    sessionControl.appendChild(echoCheck);
    sessionControl.appendChild(echoLabel);
};


// audio out section
document.getElementById('localVideo').oncanplay = function() {getOuts()};
function getOuts(){
    navigator.mediaDevices.enumerateDevices()
    .then(gotDevices, successCallback)
    .catch(errorCallback);
}

function gotDevices(deviceInfos) {
  var masterOutputSelector = document.createElement('select');

  for (var i = 0; i !== deviceInfos.length; ++i) {
    var deviceInfo = deviceInfos[i];
    var option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'audiooutput') {
      console.info('Found audio output device: ', deviceInfo.label);
      option.text = deviceInfo.label || 'speaker ' +
          (masterOutputSelector.length + 1);
      masterOutputSelector.appendChild(option);
    } else {
      console.log('Found non audio output device: ', deviceInfo.label);
    }
  }

  // Clone the master outputSelector and replace outputSelector placeholders.
  var allOutputSelectors = document.querySelectorAll('select');
  for (var selector = 0; selector < allOutputSelectors.length; selector++) {
    var newOutputSelector = masterOutputSelector.cloneNode(true);
    newOutputSelector.addEventListener('change', changeAudioDestination);
    allOutputSelectors[selector].parentNode.replaceChild(newOutputSelector,
        allOutputSelectors[selector]);
  }
}

// Attach audio output device to the provided media element using the deviceId.
function attachSinkId(element, sinkId, outputSelector) {

  if (typeof element.sinkId !== 'undefined') {
    element.setSinkId(sinkId)
    .then(function() {
      console.log('Success, audio output device attached: ' + sinkId + ' to ' +
          'element with ' + element.id + ' as source.');
    })
    .catch(function(error) {
      var errorMessage = error;
      if (error.name === 'SecurityError') {
        errorMessage = 'You need to use HTTPS for selecting audio output ' +
            'device: ' + error;
      }
      console.error(errorMessage);
      // Jump back to first output device in the list as it's the default.
      outputSelector.selectedIndex = 0;
    });
  } else {
    console.warn('Browser does not support output device selection.');
  }
}

function changeAudioDestination(event) {
  var deviceId = event.target.value;
  var outputSelector = event.target;
  var element = event.path[2].childNodes[1];
  attachSinkId(element, deviceId, outputSelector);
}        

function errorCallback(error) {
  console.log('Error: ', error);
}

function successCallback(stream) {
  window.stream = stream; // make stream available to console
}

start();
