function SessionControl(localVideo, container){
	this.video = localVideo;
	this.createControlUI(container);
}

SessionControl.prototype.createControlUI = function(container){
	var sessionDiv = document.createElement('div');
	sessionDiv.id = "sessionControl";
     sessionDiv.className = "toolbar-element hide";
    // peer window section
   /* var showWin = document.createElement('div');
    showWin.className = 'showWindow';*/
    var showWinButton = document.createElement('input');
    showWinButton.type = 'button';
    showWinButton.value = 'window';
    var showWindow;
    var ip = window.location.host;
    showWinButton.onclick = function () {
      showWindow = window.open("https://" + ip + "/show.html", 'Show', 'popup');
       showWindow.onload = function(){
       		//console.log(this.video);
       		 showWindow.document.getElementById('showVideo').src = this.video.src;
       }.bind(this);
        // console.log(showWindow);
    
   		this.showWindow = showWindow;
    }.bind(this);
    sessionDiv.appendChild(showWinButton);
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
}

SessionControl.prototype.setVideo = function(video){
    if(this.hasOwnProperty("showVideo")){
	   this.showWindow.document.getElementById('showVideo').src = video.src;
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
