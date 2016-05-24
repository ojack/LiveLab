 /* peers[peer.id] = {peer: peer, video: video, dataStreams: {}};
        var newPeer = new PeerMediaContainer(peers[peer.id], webrtc, dashboard);*/


function PeerMediaContainer(peer, video, webrtc, dashboard){
	this.createAccordion(peer.id);
	dashboard.appendChild(this.mediaContainer);
	this.videoDiv.parentElement.className = "accordion-section open";
	this.videoDiv.appendChild(video);
	this.peer = peer;
	this.video = video;
  /*   var d = document.createElement('div');
    d.className = 'videoContainer';
    d.id = 'container_' + webrtc.getDomId(peerObj.peer);
     d.appendChild(peerObj.video);*/

    video.id = 'video_' + peer.id;
    this.createPeerWindow();
    this.createAudioSelector();
    video.volume = 0.5;
    video.oncanplay = getOuts;
 /*   video.onclick = function () {
        showWindow.document.getElementById('showVideo').src = document.getElementById('video_' + peer.id).src;
    };
    video.volume = 0.5;
    video.oncanplay = getOuts;


    var vol = document.createElement('div');
    vol.id = 'volume_' + peer.id;
    vol.className = 'volume_bar';
    d.appendChild(vol);



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
    d.appendChild(volCntl);*/

  
}

PeerMediaContainer.prototype.createAccordion = function(name){
	this.mediaContainer = document.createElement('div');
	this.mediaContainer.className = "mediaContainer";
	var peerHeader = document.createElement('h4');
	peerHeader.innerHTML = name;
	this.mediaContainer.appendChild(peerHeader);
	this.videoDiv = addAccordionItem("video", this.mediaContainer);
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
   		audioOut.id = 'audioOut_' + this.peer.id;
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
	          	(masterOutputSelector.length + 1);
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

    }.bind(this), successCallback)
    .catch(errorCallback);

    this.audioDiv.appendChild(audioOut);
}


PeerMediaContainer.prototype.createPeerWindow = function(){
	 // peer window section
    var peerWin = document.createElement('div');
    peerWin.className = 'peerWindow';
    peerWin.id = 'peerWin_' + this.peer.id;
    var peerWinButton = document.createElement('input');
    peerWinButton.type = 'button';
    peerWinButton.value = 'window';
    var peerWindow;
    var ip = window.location.host;
    peerWinButton.onclick = function () {
      peerWindow = window.open("https://" + ip + "/show.html", 'Win_' + this.peer.id, 'popup');
       peerWindow.onload = function(){
       		console.log(this.video);
       		 peerWindow.document.getElementById('showVideo').src = this.video.src;
       }.bind(this);
         console.log(peerWindow);
    
   		this.peerWindow = peerWindow;
    }.bind(this);
    peerWin.appendChild(peerWinButton);
    this.videoDiv.appendChild(peerWin);

    var peerFull = document.createElement('div');
    peerFull.className = 'peerFull';
    // peerFull.id = 'peerFull_' + peer.id;
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
    this.videoDiv.appendChild(peerFull);
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
