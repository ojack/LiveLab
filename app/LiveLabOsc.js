var streams = {};

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

}

//open new socket connection to receive  UDP stream
LiveLabOsc.prototype.createChannel = function (socketPort, udpPort) {
    console.log(" create a channel");

   // console´
    streams[udpPort].div.innerHTML = streams[udpPort].name + " listening on port " + udpPort;
    var url = this.base_url + ":" + socketPort;
       console.log(url);
    var oscChannel = new osc.WebSocketPort({
        url: url
    });

    oscChannel.on("message", function(oscMessage){
        console.log(oscMessage);
        streams[udpPort].div.innerHTML = streams[udpPort].name + "-" + udpPort + ": "+ JSON.stringify(oscMessage);
        webrtc.sendDirectlyToAll("osc", "osc", oscMessage) ; //name of data channel, type, information
    });
    oscChannel.open();
}

LiveLabOsc.prototype.initBroadcastUI = function () {
    var div = document.createElement("div");
    var btn = document.createElement("BUTTON");
    var t = document.createTextNode("+ add OSC stream");       // Create a text node
    btn.appendChild(t);                                // Append the text to <button>
    div.appendChild(btn);
    this.container.appendChild(div);
    //handle add OSC stream
    btn.onclick = function(){
      //  console.log("button clicked");
        btn.style.display = "none";
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
            this.addBroadcastStream(stream_name.value, port.value);
            div.innerHTML = "Creating OSC server at port "+ parseInt(port.value);
            streams[port.value] = {name: stream_name.value, div: div};
            this.initBroadcastUI();
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
 /*  this.port.send({
    address: "/newStream",
    args: [name, port]
});*/

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

module.exports = LiveLabOsc;
