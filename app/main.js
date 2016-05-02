
var SimpleWebRTC = require('./libs/simplewebrtc');
var LiveLabOsc = require('./LiveLabOsc')

var BASE_SOCKET_URL = "wss://localhost";
var BASE_SOCKET_PORT = 8000;

 var webrtc, chatlog, osc;
// had to change start function to control device enumeration
 function start() {

    if (window.stream) {
        window.stream.getTracks().forEach(function(track) {
            track.stop();
        });
    }

     // grab the room from the URL
    var room = location.search && location.search.split('?')[1];
    chatlog = document.getElementById("chatlog");

     // create our webrtc connection
    webrtc = new SimpleWebRTC({
        // the id/element dom element that will hold "our" video
        localVideoEl: 'localVideo',
        // the id/element dom element that will hold remote videos
        remoteVideosEl: '',
        // immediately ask for camera access
        autoRequestMedia: true,
        debug: false,
        detectSpeakingEvents: true,
        autoAdjustMic: false
     })

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
            video.onclick = function () {
                video.style.width = video.videoWidth + 'px';
                video.style.height = video.videoHeight + 'px';
            };

            var streamDiv = document.createElement('div');
            streamDiv.className = "stream-holder";
            osc.addPeer(peer.id, streamDiv);
            d.appendChild(streamDiv);
            
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

            remotes.appendChild(d);
        };
        // to enumerate audio outs for new peer
        gotDevices();
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

// FIX: getOuts sould happen after start() and on.videoAdded
document.getElementById('getOuts').onclick = function() {getOuts()};
function getOuts(){
    navigator.mediaDevices.enumerateDevices()
    .then(gotDevices)
    .catch(errorCallback);
}

// audio out section
function gotDevices(deviceInfos) {
  console.log('window stream' + window.stream);
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

start();