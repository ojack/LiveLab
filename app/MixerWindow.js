var NUM_INPUTS = 2;


function MixerWindow(video, peers){
     var ip = window.location.host + window.location.pathname;
    
      showMixer = window.open("https://" + ip + "mixer.html", 'Mixer_'+Math.random()*200, 'popup');
     
      this.video = video;
      this.sourceOptions = [];
      this.sourceOptions[0] = {text: "local", src: video.src}
      
      this.mediaDivs = [];
      for (var i = 0; i < NUM_INPUTS; i++){
          this.mediaDivs[i] = {};
      }
      for (peer in peers){
          this.sourceOptions.push({text: peers[peer].peer.id, src: peers[peer].peerContainer.video.src});
      }

       this.createControls(ip, peers);
      console.log(this.sourceOptions);
       this.peers = peers;
      //force relaod because page keeps strange cache
      showMixer.location.reload();
       showMixer.onload = function(){
            for(var i = 0; i < NUM_INPUTS; i++){
              var videoDiv = createVideoDiv(showMixer.document, i, video);
              this.mediaDivs[i].outputDiv = videoDiv;
            }

           // console.log(video);
           // console.log(peers);
            /*attach javascript*/

            /*attach local video to video element in mixer*/
             //showMixer.document.getElementById('video0').src = video.src;
            //createVideoDiv(video.src, showMixer.document, 0);

             var numVids = 0;
          /*   for (peer in peers){
                console.log(peers[peer].peerContainer.video);
                //if(numVids < 1) {
                    // showMixer.document.getElementById('video2').src = peers[peer].peerContainer.video.src;
                    createVideoDiv(peers[peer].peerContainer.video.src, showMixer.document, numVids+1);

               // }
                numVids++;
             }*/
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

MixerWindow.prototype.createControls = function(ip, peers){
  var strWindowFeatures = "height=800,width=400,left=0,toolbar=no,menubar=no,top=0";
    var controls = window.open(
      "https://" + ip + "control.html", 
      'Mixer Controls', 
      strWindowFeatures);

      controls.onload = function(){
      this.controls = controls;
    
        for (var i = 0; i < NUM_INPUTS; i++){
          this.createSourceControl(controls.document, i);
        }
          
          
        
    }.bind(this);
}

MixerWindow.prototype.createSourceControl = function(parent, index){
//  var controlDiv = parent.createElement('div');
 
  var controlDiv = addAccordionItem("layer "+index, parent.body);
  var drop = createDropdown("source: ", controlDiv, index, this.sourceOptions, function(e, i){
    console.log(e.target.value);
    console.log(this.sourceOptions[e.target.value]);
   this.mediaDivs[i].outputDiv.src = this.sourceOptions[e.target.value].src;

  }.bind(this));
  this.mediaDivs[index].controlDiv = drop;
 // controlDiv.innerHTML = JSON.stringify(peer.peer);
  //parent.body.appendChild(controlDiv);
}

// function createVideoDiv(src, parent, index){
//     var vid =  parent.createElement('video');
//     vid.src = src;
//     vid.id = "video"+index;
//     vid.autoplay = true;
//     vid.muted = true;
//     parent.body.appendChild(vid);
// }

function createVideoDiv(parent, index, video){
    var vid =  parent.createElement('video');
    vid.src = video.src;
    vid.id = "video"+index;
    vid.autoplay = true;
    vid.muted = true;
    parent.body.appendChild(vid);
    return vid;
}

function createDropdown(name, parent, index, options, callback){
    var dropDiv = document.createElement('div');
      var dropLabel = document.createElement('label');
      dropLabel.innerHTML = name;
      dropDiv.appendChild(dropLabel);
      var dropSelector = document.createElement('select');
      dropDiv.appendChild(dropSelector);
      for(var i = 0; i < options.length; i++){
         var option = document.createElement('option');
          option.value = i;
          option.text = options[i].text;
          dropSelector.appendChild(option);
      }
     parent.appendChild(dropDiv);
    dropSelector.addEventListener('change', function(e){
      callback(e, index);
    });
    return dropSelector;
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

module.exports = MixerWindow;
