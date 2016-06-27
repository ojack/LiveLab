var MixerWindow = require('./MixerWindow');
var CodeLab = require('./CodeLab');

function SessionControl(localVideo, container, peers, webrtc){
	this.video = localVideo;
    this.peers = peers;
    this.webrtc = webrtc;
    this.createControlUI(container);
}
SessionControl.prototype.oscParameter = function(data){
    console.log(this.mixerWindow);
    if(this.mixerWindow){
         console.log("mixer");
        //this.mixerWindow.userEvent("osc", data);
        this.mixerWindow.mixerEvent("osc", data);
    }
}

SessionControl.prototype.createControlUI = function(container){
	var sessionDiv = document.createElement('div');
	sessionDiv.id = "sessionControl";
    sessionDiv.className = "toolbar-element hide";

     var showWinButton = createButton("window", function () {
          showWindow = window.open("https://" + ip + "/show.html", 'Show', 'popup');
          showWindow.onload = function () {
              showWindow.document.getElementById('showVideo').src = this.video.src;
          }.bind(this);
          this.showWindow = showWindow;
    });
    sessionDiv.appendChild(showWinButton);

    var showWindow;
    var ip = window.location.host + window.location.pathname;

    var showFull = document.createElement('div');
    showFull.className = 'showFull';
     var showFullCheck = document.createElement('input');
    showFullCheck.type = 'checkbox';
    var isFirefox = typeof InstallTrigger !== 'undefined';
     var isChrome = !!window.chrome && !!window.chrome.webstore;
    showFullCheck.onchange = function () {
        this.showWindow.focus();
        if (showFullCheck.checked == true) {
            if (isFirefox == true) {
                this.showWindow.document.getElementById('showVideo').mozRequestFullScreen();
            }
            if (isChrome == true) {
                this.showWindow.document.getElementById('showVideo').webkitRequestFullScreen();
            }
        } else {
            if (isFirefox == true) {
                this.showWindow.document.getElementById('showVideo').mozCancelFullscreen();
            }
            if (isChrome == true) {
                this.showWindow.document.getElementById('showVideo').webkitExitFullscreen();
            }
        }
    }.bind(this);

    showFull.appendChild(showFullCheck);
    var fullText = document.createTextNode("Full");
    showFull.appendChild(fullText);
    sessionDiv.appendChild(showFull);
    container.appendChild(sessionDiv);
    this.div = sessionDiv;

    var showMixerButton = createButton("mixer", function () {
        console.log(this.webrtc);
        this.mixerWindow = new MixerWindow(this.video, this.peers, this.webrtc);
    }.bind(this));
    sessionDiv.appendChild(showMixerButton);
   
    var showCodeLabButton = createButton("Code Lab", function () {
        this.CodeLabWindow = new CodeLab(this.peers, this.webrtc);
    });
    sessionDiv.appendChild(showCodeLabButton);
    showCodeLabButton.className = "toolbar-padding";

    var buttonStatus = false;
    var self = this;
    var shareScreenButton = createButton("share screen", function () {
        console.log(shareScreenButton.value);
        if (shareScreenButton.value === "share screen") {
            shareScreenButton.value = "stop sharing";
            self.webrtc.shareScreen(function(err) {
                if (err) {
                    console.log("local screen sharing failed");
                } else {
                    console.log("nice");
                }
            });
        } else {
            shareScreenButton.value = "share screen";
            self.webrtc.stopScreenShare();
        }
    });
    shareScreenButton.className = "toolbar-padding";
    sessionDiv.appendChild(shareScreenButton);
}

function createButton(title, cb) {
    var button = document.createElement('input');
    button.type = 'button';
    button.value = title;

    button.onclick = cb.bind(this);
    return button;
}

SessionControl.prototype.setVideo = function(video){
    console.log("show window");
    if(this.hasOwnProperty("showWindow")){
        this.showWindow.document.getElementById('showVideo').src = video.src;
    }
}

SessionControl.prototype.remoteCodeChange = function(code){
    if(this.CodeLabWindow){
        this.CodeLabWindow.remoteCodeChange(code);
    }
}

SessionControl.prototype.remoteMixerEvent = function(type, data){
    console.log("SESSION MIX");
    if(this.mixerWindow){
        this.mixerWindow.remoteMixerEvent(type, data);
    }
}

SessionControl.prototype.toggle = function(){
    if(this.div.className == "toolbar-element show"){
        this.div.className = "toolbar-element hide";
    }else {
        this.div.className = "toolbar-element show";
    }
}

module.exports = SessionControl;
