var streams = {}; //object containing local streams being broadcast, indexed by local UDP port
var peers = {}; //object containing peer streams, indexed by peer-id and label

function LiveLabOsc(port_loc, webrtc, container, base_url){
     //connect to server via websockets
     var url = base_url + ":" + port_loc;
    this.ws = new WebSocket(url);
    this.ws.onmessage =  function(event){
        console.log(event.data);
        var info = JSON.parse(event.data);
        if(info.type == "new channel"){
            this.createChannel(parseInt(info.port), parseInt(info.udpPort));
        }
    }.bind(this);
    this.container = container;
    this.base_url = base_url;
    this.initBroadcastUI();
    this.webrtc = webrtc;
}

//open new socket connection to receive  UDP stream
LiveLabOsc.prototype.createChannel = function (socketPort, udpPort) {
    console.log(" create a channel");

   // console´
    streams[udpPort].div.innerHTML = streams[udpPort].name + " listening on port " + udpPort;
    streams[udpPort].div.className = "list-item";
    var url = this.base_url + ":" + socketPort;
       console.log(url);
    var oscChannel = new osc.WebSocketPort({
        url: url
    });

    oscChannel.on("message", function(oscMessage){
        console.log(oscMessage);
        streams[udpPort].div.innerHTML = JSON.stringify(oscMessage);
        this.webrtc.sendDirectlyToAll( streams[udpPort].name, "osc", oscMessage) ; //name of data channel, type, information
    }.bind(this));
    oscChannel.open();
}

//create UI elements for broadcasting stream
LiveLabOsc.prototype.initBroadcastUI = function () {
    var div = document.createElement("div");
    div.className = "list-item";
    var btn = document.createElement("BUTTON");
    var t = document.createTextNode("+ add OSC stream");       // Create a text node
    btn.appendChild(t);                                // Append the text to <button>
    div.appendChild(btn);
    this.container.appendChild(div);
    //handle add OSC stream
    btn.onclick = function(){
      //  console.log("button clicked");
        btn.style.display = "none";
         div.className = "list-item active";
       var f = document.createElement("form");
        var stream_name = addInputField("stream_name", f);
        var port = addInputField("port", f);
        var sendBtn = document.createElement("BUTTON");
        var t = document.createTextNode("add");       // Create a text node
        sendBtn.appendChild(t);  
        sendBtn.setAttribute("type", "button")
        f.appendChild(sendBtn);
        div.appendChild(f);
        sendBtn.onclick = function(e){

            e.preventDefault();
            div.removeChild(f);
            this.addBroadcastStream(stream_name.value, port.value);
            var newSpan = document.createElement('span');
            newSpan.className = "stream-label";
            newSpan.innerHTML = stream_name.value + " :: "+ port.value + " : ";
            div.appendChild(newSpan);
             var streamInput = document.createElement('span');
            streamInput.innerHTML = "Creating OSC server at port "+ parseInt(port.value);
            div.appendChild(streamInput);
            streams[port.value] = {name: stream_name.value, div: streamInput};
            this.initBroadcastUI();
             div.className = "list-item";
                       // return null;
        }.bind(this);
    }.bind(this);  
};

LiveLabOsc.prototype.addBroadcastStream = function(name, portNum){
   console.log(name);
   console.log(portNum);
   this.ws.send(JSON.stringify({
        type: "broadcastStream",
        name: name,
        port: portNum
    }));
}

function addInputField(label, div){
    var l = document.createElement("label");
    l.setAttribute('for', label);
    l.innerHTML = label+":  ";
    var i = document.createElement("input"); //input element, text
    i.setAttribute('type',"text");
    i.setAttribute('name', label);
     i.setAttribute('id', label);
     div.appendChild(l);
     div.appendChild(i);
     return i;
}

LiveLabOsc.prototype.addPeer = function(peer_id, div){
    peers[peer_id] = {div: div, streams: {}};
}

/* When new message is received from remote peer, display in interface*/
LiveLabOsc.prototype.receivedRemoteStream = function(data, peer_id, label){
    if(peers[peer_id].streams.hasOwnProperty(label)){
        console.log("add data");
         peers[peer_id].streams[label].innerHTML = JSON.stringify(data.payload);
    } else {
        var newStream = document.createElement('div');
        var newSpan = document.createElement('span');
        newSpan.className = "stream-label";
        newSpan.innerHTML = label + ":  ";
        var streamInput = document.createElement('span');
        streamInput.innerHTML = JSON.stringify(data.payload);
        newStream.appendChild(newSpan);
        newStream.appendChild(streamInput);
        peers[peer_id].div.appendChild(newStream);
        peers[peer_id].streams[label] = streamInput;
    }
    //peers[peer_id].div.innerHTML = JSON.stringify(data.payload);

    // $("#osc-remote").text(JSON.stringify(data.payload, undefined, 2));
}; 

module.exports = LiveLabOsc;
