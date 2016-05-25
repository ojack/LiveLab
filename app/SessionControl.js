function SessionControl(localVideo, container){
	this.video = localVideo;
	this.createControlUI(container);
}

SessionControl.prototype.createControlUI = function(container){
	var sessionDiv = document.createElement('div');
	sessionDiv.id = "sessionControl";

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
        showWindow.focus();
        if (showFullCheck.checked == true) {
            if (isFirefox == true) {
                showWindow.document.getElementById('showVideo').mozRequestFullScreen();
            }
            if (isChrome == true) {
                showWindow.document.getElementById('showVideo').webkitRequestFullScreen();
            }
        } else {
            if (isFirefox == true) {
                showWindow.document.getElementById('showVideo').mozCancelFullscreen();
            }
            if (isChrome == true) {
                showWindow.document.getElementById('showVideo').webkitExitFullscreen();
            }
        }
    }

    showFull.appendChild(showFullCheck);
    var fullText = document.createTextNode("Full");
    showFull.appendChild(fullText);
    sessionDiv.appendChild(showFull);
    container.appendChild(sessionDiv);
}

SessionControl.prototype.setVideo = function(video){
    if(this.hasOwnProperty("showVideo")){
	   this.showWindow.document.getElementById('showVideo').src = video.src;
    }
}

module.exports = SessionControl;
