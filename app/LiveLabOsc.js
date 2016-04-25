

function LiveLabOsc(port_loc, webrtc, container) {
     //connect to server via websockets
    this.ws = new WebSocket(port_loc);
    /*var port = new osc.WebSocketPort({
        url: port_loc
    });*/

  /*  port.on("message", function (oscMessage) {
        $("#osc").text(JSON.stringify(oscMessage, undefined, 2));
         webrtc.sendDirectlyToAll("osc", "osc", oscMessage) ; //name of data channel, type, information
               // console.log("message", oscMessage);
    });

    port.open();

    this.port = port;*/
    this.container = container;
    this.initBroadcastUI();

}

LiveLabOsc.prototype.addNewPort = function (port) {

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
