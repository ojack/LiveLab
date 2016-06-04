require('./libs/dat.gui.js');


function MixerWindow(video, peers){
     var ip = window.location.host + window.location.pathname;
     this.createControls(ip);
      showMixer = window.open("https://" + ip + "/mixer.html", 'Mixer_'+Math.random()*200, 'popup');
      this.peers = peers;
      //force relaod because page keeps strange cache
      showMixer.location.reload();
       showMixer.onload = function(){
            console.log(video);
            console.log(peers);
            /*attach javascript*/

            /*attach local video to video element in mixer*/
             //showMixer.document.getElementById('video0').src = video.src;
            createVideoDiv(video.src, showMixer.document, 0);
             var numVids = 0;
             for (peer in peers){
                console.log(peers[peer].peerContainer.video);
                //if(numVids < 1) {
                    // showMixer.document.getElementById('video2').src = peers[peer].peerContainer.video.src;
                    createVideoDiv(peers[peer].peerContainer.video.src, showMixer.document, numVids+1);

               // }
                numVids++;
             }
             var event = new Event('videoAdded');
             showMixer.document.dispatchEvent(event);
           
             this.showMixer = showMixer;
       }.bind(this);
}

MixerWindow.prototype.mixerEvent = function(type, data){
   var event = new CustomEvent(type, {detail: data.payload});
   this.showMixer.document.dispatchEvent(event);
}

/*MixerWindow.prototype.userEvent = function(type, data){
  //alert(data);
 
   var event = new CustomEvent('osc', {detail: data.payload});
   this.showMixer.document.dispatchEvent(event);
}*/

MixerWindow.prototype.createControls = function(ip){
  var strWindowFeatures = "height=800,width=400,left=0,toolbar=no,menubar=no,top=0";
    var controls = window.open(
      "https://" + ip + "/controls.html", 
      'Mixer Controls', 
      strWindowFeatures);

      controls.onload = function(){
      this.controls = controls;
        for (peer in this.peers){
          createSourceControl(peers[peer], controls.document);
        }
    }.bind(this);
}

function createSourceControl(peer, parent){
  var controlDiv = parent.createElement('div');
  
}
function createVideoDiv(src, parent, index){
    var vid =  parent.createElement('video');
    vid.src = src;
    vid.id = "video"+index;
    vid.autoplay = true;
    vid.muted = true;
    parent.body.appendChild(vid);
}

module.exports = MixerWindow;
