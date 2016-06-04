function CodeLab(peers, webrtc){
     var ip = window.location.host + window.location.pathname;
      var codeLab = window.open("https://" + ip + "/codelab/index.html", 'Mixer_'+Math.random()*200, 'popup');

      //force relaod because page keeps strange cache
      codeLab.location.reload();
       codeLab.onload = function(){
            
            // showMixer.document.dispatchEvent(event);
       }.bind(this);
       /*listen for local code lab change and broadcast to remote connections */
       document.addEventListener("codeLabChanged", function(e){
        console.log("code event", e);
        webrtc.sendDirectlyToAll("codechange", "code-lab", e.detail) ;
       });
       this.codeLab = codeLab;
}

/*on remote code lab change, update loca version */
CodeLab.prototype.remoteCodeChange = function(code){
  console.log("dispatching code event");
   var event = new CustomEvent("remoteCodeChange", {detail: code});
   this.codeLab.document.dispatchEvent(event);
}


module.exports = CodeLab;
