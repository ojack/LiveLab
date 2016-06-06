 /* peers[peer.id] = {peer: peer, video: video, dataStreams: {}};
        var newPeer = new PeerMediaContainer(peers[peer.id], webrtc, dashboard);*/

// This class creates & encapsulates everything to do with media streaming from
// a peer. It creates the divs necessary to display the media as well as
// additional elements like volume controls 
// Instantiated upon joining a WebRTC room, or a new peer connecting
function PeerMediaContainer(id, video, webrtc, dashboard){
	this.id = id;
    this.webrtc = webrtc;
	this.createAccordion(id);
	this.dashboard = dashboard;
	dashboard.appendChild(this.mediaContainer);
	this.videoDiv.parentElement.className = "accordion-section open";
	if (id!="local") {
		this.videoDiv.appendChild(video);
		this.video = video;
	    video.id = 'video_' + id;
	    video.volume = 0.0;
	    this.createPeerWindow();
	 }
	 
    this.createAudioSelector();
	this.createVolumeControl();
}

PeerMediaContainer.prototype.createAccordion = function(name){
	this.mediaContainer = document.createElement('div');
	this.mediaContainer.className = "mediaContainer";
    // if local, we want to be able to edit the name of our window
    if (this.id === "local") {
        var peerHeader = document.createElement('input');
        var savedNick = localStorage.getItem("livelab-localNick");
        if (savedNick !== null) {
            peerHeader.value = savedNick;
        } else {
            peerHeader.value = "local";
        }
    } else {
        var peerHeader = document.createElement('div');
    }
    var self = this;

    peerHeader.addEventListener("keydown", function(event) {
        if (self.id === "local") {
            // pregunta: if enter key was pressed
            // should we send each keystroke individually, or just send the
            // entire string after enter has been pressed?
            if (event.which === 13) {
                localStorage.setItem("livelab-localNick", peerHeader.value);
                for (var i = 0; i < window.stateInfo.peers.length; i++) {
                    var existingPeer = window.stateInfo.peers[i];
                    if (existingPeer.id === window.localId) {
                        existingPeer.nick = peerHeader.value;
                        break;
                    }
                }
                self.webrtc.sendDirectlyToAll("nameChange", "sessionInfo", peerHeader.value);
                this.blur();
            }
        }
    });

    peerHeader.className = "peer-header";
    peerHeader.id = "header_" + this.id;
	peerHeader.innerHTML = name;
	this.mediaContainer.appendChild(peerHeader);
	this.videoDiv = addAccordionItem("video", this.mediaContainer);
    this.videoDiv.id = "video_" + this.id;
	this.audioDiv = addAccordionItem("audio", this.mediaContainer);
	this.dataDiv = addAccordionItem("data", this.mediaContainer);
}

PeerMediaContainer.prototype.createAudioSelector = function(){
    //show available audio output devices
     navigator.mediaDevices.enumerateDevices()
    .then(function(deviceInfos){
    	//var masterOutputSelector = document.createElement('select');
    	var audioOut = document.createElement('div');
    	audioOut.className = 'outputSelector';
   		audioOut.id = 'audioOut_' + this.id;
    	var audioOutLabel = document.createElement('label');
	    audioOutLabel.innerHTML = 'Select peer audio output: ';
	    audioOut.appendChild(audioOutLabel);
	    var audioOutSelector = document.createElement('select');
	    this.audioDiv.appendChild(audioOut);
	    audioOut.appendChild(audioOutSelector);
  		for (var i = 0; i !== deviceInfos.length; ++i) {
    		var deviceInfo = deviceInfos[i];
    		var option = document.createElement('option');
   			option.value = deviceInfo.deviceId;
   			if (deviceInfo.kind === 'audiooutput') {
	      		console.info('Found audio output device: ', deviceInfo);
	      		option.text = deviceInfo.label || 'speaker ' +
	          	(audioOutSelector.length + 1);
	          	//option.value = deviceInfo.label;
	      		//masterOutputSelector.appendChild(option);
	      		audioOutSelector.appendChild(option);
    		} else {
      			console.log('Found non audio output device: ', deviceInfo.label);
    		}
  		}
  		audioOutSelector.addEventListener('change', function(e){
  			console.log(e.target.value);
  			console.log(this.video);
  			attachSinkId(this.video, e.target.value, audioOutSelector);
  		}.bind(this));
  		this.audioDiv.appendChild(audioOut);

    }.bind(this), successCallback)
    .catch(errorCallback);

    
}

PeerMediaContainer.prototype.createVolumeControl = function() {
	 // volume control
    var volCntl = document.createElement('div');
    volCntl.className = 'volumeSlide';
    volCntl.id = 'volCntl_' + this.id;
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
      this.video.volume = volController.value;
    }.bind(this);
    volCntl.appendChild(volController);
    this.audioDiv.appendChild(volCntl);

}
/* for local stream only; create video controls once video has been added */
PeerMediaContainer.prototype.addVideoControls = function(){
	if (!('video' in this)){
		this.video = this.videoDiv.getElementsByTagName('video')[0];
		console.log(this.video);
		this.video.volume = 0.0;
		this.createPeerWindow();
	}
};

PeerMediaContainer.prototype.destroy = function(){
	this.dashboard.removeChild(this.mediaContainer);
};

PeerMediaContainer.prototype.createPeerWindow = function(){
	 // peer window section
    var peerWin = document.createElement('div');
    peerWin.className = 'peerWindow';
    peerWin.id = 'peerWin_' + this.id;
    var peerWinButton = document.createElement('input');
    peerWinButton.type = 'button';
    peerWinButton.value = 'window';
    var peerWindow;
    var ip =window.location.host + window.location.pathname;
    peerWinButton.onclick = function () {
      peerWindow = window.open("https://" + ip + "/show.html", 'Win_' + this.id, 'popup');
       peerWindow.onload = function(){
       		console.log(this.video);
       		 peerWindow.document.getElementById('showVideo').src = this.video.src;
       }.bind(this);
         console.log(peerWindow);
    
   		this.peerWindow = peerWindow;
    }.bind(this);
    peerWin.appendChild(peerWinButton);
    this.videoDiv.appendChild(peerWin);

   
    var peerFullCheck = document.createElement('input');
    peerFullCheck.type = 'checkbox';
    var isFirefox = typeof InstallTrigger !== 'undefined';
     var isChrome = !!window.chrome && !!window.chrome.webstore;
    peerFullCheck.onchange = function () {
      if(this.hasOwnProperty('peerWindow')){
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
    }.bind(this);

    peerWin.appendChild(peerFullCheck);
    var fullText = document.createTextNode("Full");
    peerWin.appendChild(fullText);
    
}

function addAccordionItem(name, container){
	var newSection = document.createElement('div');
	newSection.className = "accordion-section closed";
	var divHeader = document.createElement('div');
	divHeader.innerHTML = name;
	divHeader.className = "accordion-header";
	divHeader.onclick = function(e){
		console.log(e.target.parentElement);
		if(e.target.parentElement.className=="accordion-section open"){
			e.target.parentElement.className = "accordion-section closed";
		} else {
			e.target.parentElement.className = "accordion-section open";
		}
	}
	newSection.appendChild(divHeader);
	container.appendChild(newSection);
	var contentDiv = document.createElement("div");
	contentDiv.className = "accordion-content "+ name;
	newSection.appendChild(contentDiv);
	return contentDiv;
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

    

function errorCallback(error) {
  console.log('Error: ', error);
}

function successCallback(stream) {
  window.stream = stream; // make stream available to console
}

module.exports = PeerMediaContainer;
