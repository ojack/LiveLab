//--------------------------------------------------
//  Bi-Directional OSC messaging Websocket <-> UDP
// example from: 
//--------------------------------------------------
var osc = require("osc"),
    WebSocket = require("ws");
var https = require('https');
var fs = require('fs');
var static = require('node-static');

var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

var file = new static.Server('./public');

var httpsServer = https.createServer(options, function (request, response) {
  request.addListener('end', function () {
        //
        // Serve files!
        //
        file.serve(request, response);
    }).resume();
}).listen(8000);

var getIPAddresses = function () {
    var os = require("os"),
    interfaces = os.networkInterfaces(),
    ipAddresses = [];

    for (var deviceName in interfaces){
        var addresses = interfaces[deviceName];

        for (var i = 0; i < addresses.length; i++) {
            var addressInfo = addresses[i];

            if (addressInfo.family === "IPv4" && !addressInfo.internal) {
                ipAddresses.push(addressInfo.address);
            }
        }
    }

    return ipAddresses;
};

/*var udp = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 7400,
    remoteAddress: "127.0.0.1",
    remotePort: 7500
});

udp.on("ready", function () {
    var ipAddresses = getIPAddresses();
    console.log("Listening for OSC over UDP.");
    ipAddresses.forEach(function (address) {
        console.log(" Host:", address + ", Port:", udp.options.localPort);
    });
    console.log("Broadcasting OSC over UDP to", udp.options.remoteAddress + ", Port:", udp.options.remotePort);
});

udp.open();*/

var wss = new WebSocket.Server({
    //port: 8081
    server: httpsServer
});

wss.on("connection", function (ws) {
    console.log("A Web Socket connection has been established!");

   /* var socketPort = new osc.WebSocketPort({
        socket: socket
    });

    var relay = new osc.Relay(udp, socketPort, {
        raw: true
    });*/
    ws.on('message', function(data, flags) {
        console.log("received data");
        console.log(JSON.parse(data));
        var message = JSON.parse(data);
        if(message.type=="broadcastStream"){
            console.log("add local stream");
            addUDPServer(data.port, function(data, error){

            });
        }
  // flags.binary will be set if a binary data is received. 
  // flags.masked will be set if the data was masked. 
    });
});

function addUDPServer(port, wsS){
    var udp = new osc.UDPPort({
        localAddress: "0.0.0.0",
        localPort: port
       // remoteAddress: "127.0.0.1",
       // remotePort: 7500
    });


    udp.on("raw", function(data, info){
        console.log("received raw on port "+ port);
        console.log(data);
    });

    udp.on("ready", function () {
        var ipAddresses = getIPAddresses();
        console.log("Listening for OSC over UDP.");
        ipAddresses.forEach(function (address) {
            console.log(" Host:", address + ", Port:", udp.options.localPort);
        });
    
       // console.log("Broadcasting OSC over UDP to", udp.options.remoteAddress + ", Port:", udp.options.remotePort);
    });


    udp.on("error", function(error){
        console.log(error);
    });
    udp.open();
}
