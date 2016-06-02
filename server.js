
/*--------------------------------------------------
//  Bi-Directional OSC messaging Websocket <-> UDP
//  ToDO: switch to using simpler OSC library following example: https://github.com/toddtreece/osc-examples/blob/master/socketio.js
//--------------------------------------------------
*/
var osc = require("osc"),
    WebSocket = require("ws")
    oscMin = require("osc-min");
var https = require('https');
var fs = require('fs');
var portscanner = require('portscanner');
var dgram = require('dgram');
var static = require('node-static');

var ports = {};

var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

var file = new static.Server('./public');

var udp_client = dgram.createSocket('udp4', function(msg, rinfo) {});

var httpsServer = https.createServer(options, function (request, response) {
  request.addListener('end', function () {
        //
        // Serve files!
        //
        file.serve(request, response);
    }).resume();
}).listen(8000);

var wss = new WebSocket.Server({
    //port: 8081
    server: httpsServer
});


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

// test cleanup.js
// loads module and registers app specific cleanup callback...
var cleanup = require('./cleanup').Cleanup(myCleanup);
//var cleanup = require('./cleanup').Cleanup(); // will call noOp




wss.on("connection", function (ws) {
    console.log("A Web Socket connection has been established!");

    ws.on('message', function(data, flags) {
        console.log("received data");
        console.log(JSON.parse(data));
        var message = JSON.parse(data);
        if(message.type=="broadcastStream"){
            if(message.port > 0 && message.port < 65536) {
              //  console.log("checking port " + message.port);

              /*PORT SCANNER IS NOT WORKING TO CORRECTLY IDENTIFY PORTS CREATED USING osc.UDPPort
              temporary fix is that previously open ports are stored in ports{} object*/
                portscanner.checkPortStatus(parseInt(message.port), '127.0.0.1', function(error, status) {
                 // Status is 'open' if currently in use or 'closed' if available
                   if(ports.hasOwnProperty(message.port)){
                        console.log('port in use');
                   } else {
                        if(error) {
                            //TO DO: send error back to user
                            console.log("ERROR: "+error);
                           //reak;
                        } else {
                            if(status=="closed"){
                                ports[message.port] = "open";
                                portscanner.findAPortNotInUse(8000, 9000, '127.0.0.1', function(error, port) {
                                    console.log('AVAILABLE PORT AT: ' + port)
                                    addSocketUDPConnection(port, parseInt(message.port), message.name);
                                    ws.send(JSON.stringify({"type": "new channel", "port": port, "udpPort": message.port}));
                                });
                                //addUDPServer(message.port, ws, message.name);
                            } else {
                                console.log("other status");
                                console.log(status);
                            }
                        }
                    }
                });
            } else {
                console.log("not valid port");
            }
        } else if(message.type=="subscribeStream"){
            //create osc client at specified port
           // console.log("received data ");
          //  console.log(message.payload);
           // console.log(message.payload);
            var msg = oscMin.toBuffer(message.payload);
          //  console.log(msg);
          udp_client.send(msg, 0, msg.length, message.port, "127.0.0.1", function(error){
                if(error) console.log("UDP SEND ERROR", error);
            });

           // udp_client.send(JSON.stringify(message.payl))

        }
  // flags.binary will be set if a binary data is received.
  // flags.masked will be set if the data was masked.
    });
});

//create a new socket<-->UDP connection
function addSocketUDPConnection(socketPort, udpPort, name){
    var socketServer = https.createServer(options).listen(socketPort);
    var socketChannel = new WebSocket.Server({
        server: socketServer
    });

    console.log("adding udp port at "+ udpPort);
    var udpChannel = new osc.UDPPort({
        localAddress: "127.0.0.1",
        localPort: udpPort
    });

    udpChannel.on("ready", function () {
        var ipAddresses = getIPAddresses();
        console.log("Listening for OSC over UDP.");
        ipAddresses.forEach(function (address) {
            console.log(" Host:", address + ", Port:", udpChannel.options.localPort);
             portscanner.checkPortStatus(udpChannel.options.localPort, address, function(error, status) {
                console.log("on ip "+ address + " port is "+ status);
             });
        });
    });

    udpChannel.on("osc", function(packet, info){
        console.log(packet);
    });
    udpChannel.open();

    socketChannel.on("connection", function(ws){
        console.log("new connection from "+ socketPort + " to " + udpPort);
        var socketOscPort = new osc.WebSocketPort({
            socket: ws
        });

         var relay = new osc.Relay(udpChannel, socketOscPort, {
            raw: true
        });
    });
}


// defines app specific callback...
function myCleanup() {
  console.log('App specific cleanup code...');
};

// All of the following code is only needed for test demo

// Prevents the program from closing instantly
process.stdin.resume();

// Emits an uncaught exception when called because module does not exist
function error() {
  console.log('error');
  var x = require('');
};

// Try each of the following one at a time:

// Uncomment the next line to test exiting on an uncaught exception
//setTimeout(error,2000);

// Uncomment the next line to test exiting normally
//setTimeout(function(){process.exit(3)}, 2000);

// Type Ctrl-C to test forced exit
