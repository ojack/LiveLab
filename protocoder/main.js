/*
*    OSC networking example for LiveLab
*   (c) Pablo Clemente (paclema), Jun-2016
*   //-- GPL license*
*/

ui.screenMode("immersive");
ui.backgroundColor(155, 155, 255);

//Add a seekbar
var slider = ui.addSlider(0, 150, 500, 100, 100, 50).onChange(function(val) {
    console.log(val);
});

//Add a label with text
//ui.addText("I love ice cream", 0, 300, 500, 100);

//Add an ip address and port for the OSC connection
var ip, port;
ui.addInput("Ip address", 0, 0, 200, 100).onChange(function(val){
    val = ip;
    console.log("Ip address: " + val);
});
//Add an edit text
ui.addInput("port",200, 0, 100, 100).onChange(function(val){
    val = port;
    console.log("Port address: " + val);
});
/*
ui.addButton("Connect", 0, 0, 300, 200).onClick(function() {
    client = network.connectOSC(ip, port);
});


ui.addButton("Send", 300, 0, 500, 200).onClick(function() {
    var o = new Array();
    o.push(1);
    client.send("/layer2/clip4/connect", o);
});

ui.addButton("ALCACHOFA", 0, 300, 500, 200).onClick(function() {
    var o = new Array();
    o.push(1);
    client.send("/layer2/clip7/connect", o);
});
*/
//Add a seekbar
var slider = ui.addSlider(0, 500, 500, 100, 0, 1).onChange(function(val) {
    console.log(val);
    var o = new Array();
    o.push(val);
    console.log(val);
    client.send("/activeclip/video/opacity/values", o);
});
