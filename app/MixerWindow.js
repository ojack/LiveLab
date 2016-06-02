function MixerWindow(video, peers){
     var ip = window.location.host + window.location.pathname;
      showMixer = window.open("https://" + ip + "/mixer.html", 'Mixer_'+Math.random()*200, 'popup');

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

MixerWindow.prototype.addSource = function(videoSrc, label){

}

MixerWindow.prototype.initSeriously = function(){

}

MixerWindow.prototype.userEvent = function(type, data){
  //alert(data);
 
   var event = new CustomEvent('osc', {detail: data.payload});
   this.showMixer.document.dispatchEvent(event);
}

MixerWindow.prototype.setSourceEvent = function(type, data){
  //alert(data);
 
   var event = new CustomEvent('osc', {detail: data.payload});
   this.showMixer.document.dispatchEvent(event);
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
