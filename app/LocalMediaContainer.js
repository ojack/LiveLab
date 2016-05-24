

function LocalMediaContainer(dashboard){
    this.createAccordion("me");
    dashboard.appendChild(this.mediaContainer);
    this.videoDiv.parentElement.className = "accordion-section open";
  
}

/*LocalMediaContainer.prototype.initOsc = function (webrtc, osc_config, peers) {
    var streamDiv = document.createElement('div');
    streamDiv.className = "stream-holder";
    this.dataDiv.appendChild(streamDiv);
    this.dataChannels = new LiveLabOsc(osc_config.socket_port, webrtc, streamDiv, osc_config.socket_url, peers);
}*/

LocalMediaContainer.prototype.createAccordion = function(name){
    this.mediaContainer = document.createElement('div');
    this.mediaContainer.className = "mediaContainer";
    var peerHeader = document.createElement('h4');
    peerHeader.innerHTML = name;
    this.mediaContainer.appendChild(peerHeader);
    this.videoDiv = addAccordionItem("video", this.mediaContainer);
    this.soundDiv = addAccordionItem("sound", this.mediaContainer);
    this.dataDiv = addAccordionItem("data", this.mediaContainer);
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

module.exports = LocalMediaContainer;
