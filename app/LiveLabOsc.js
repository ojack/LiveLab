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

/*
Subscribe to stream on local port
*/
LiveLabOsc.prototype.forwardToLocalPort = function(portNum, payload){
     this.ws.send(JSON.stringify({
        type: "subscribeStream",
        port: portNum,
        payload: payload
    }));
     // alert("clicked me");
}
/* When new message is received from remote peer, display in interface*/
LiveLabOsc.prototype.receivedRemoteStream = function(data, peer_id, label){
    if(peers[peer_id].streams.hasOwnProperty(label)){
        console.log("add data");

         peers[peer_id].streams[label].div.innerHTML = JSON.stringify(data.payload);
         if(peers[peer_id].streams[label].port){
            console.log("broadcasting to local port");
            this.forwardToLocalPort(peers[peer_id].streams[label].port, data.payload);
        }
    } else {
        var newStream = document.createElement('div');
        var streamLabel = document.createElement('div');
        var newSpan = document.createElement('span');
        newSpan.className = "stream-label";
        newSpan.setAttribute("type", "button");
        newSpan.innerHTML = label + ":  ";
        var streamInput = document.createElement('span');
        streamInput.innerHTML = JSON.stringify(data.payload);
        streamLabel.appendChild(newSpan);
        streamLabel.appendChild(streamInput);
        newStream.appendChild(streamLabel);

        peers[peer_id].div.appendChild(newStream);
        peers[peer_id].streams[label] = {};
        peers[peer_id].streams[label].div = streamInput;
        streamLabel.onclick = function(e){
           
           var inputDiv = document.createElement('div');
            var stream_name = addInputField("forward remote stream " + label + " to local port", inputDiv);

             var sendBtn = document.createElement("BUTTON");
            var t = document.createTextNode("done");       // Create a text node
            sendBtn.appendChild(t);  
            sendBtn.setAttribute("type", "button");
            inputDiv.appendChild(sendBtn);
            newStream.appendChild(inputDiv);
            sendBtn.onclick = function(e){
                console.log("broadcasting to local port "+ stream_name.value);
                peers[peer_id].streams[label].port = parseInt(stream_name.value);
                newSpan.innerHTML = label + " ::  " + stream_name.value + " : ";
                newStream.removeChild(inputDiv);
            }
        }.bind(this);
    }
    //peers[peer_id].div.innerHTML = JSON.stringify(data.payload);

    // $("#osc-remote").text(JSON.stringify(data.payload, undefined, 2));
}; 

module.exports = LiveLabOsc;
