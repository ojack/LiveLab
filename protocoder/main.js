/*
*    OSC networking example for LiveLab
*   (c) Pablo Clemente (paclema), Jun-2016
*   //-- GPL license*
*/

ui.screenMode("immersive");
ui.backgroundColor(72, 164, 170);

//Add an ip address and port for the OSC connection
var ip = "192.168.1.204", port = "9999";
ui.addInput("Ip address", 0, 0, 220, 100).onChange(function(val){
    ip = val;
    console.log("Ip address: " + val);
});
ui.addText(":", 215, 30, 500, 100);
ui.addInput("port",220, 0, 100, 100).onChange(function(val){
    port = val;
    console.log("Port address: " + val);
});

ui.addButton("Connect", 330, 0, 200, 100).onClick(function() {
    client = network.connectOSC(ip, port);
    console.log("Ip address: " + ip + "port address: " + port);
});

//Add a toggle button
ui.addToggle("Send", 520, 0, 200, 100, true).onChange(function(val) {
    var o = new Array();
    if (val) o.push(1)
    else o.push(0);
    client.send("/test", o);
});

//Seekbars:
// /stretch, /blur, /turn/x, /turn/y, /turn/z, /knock, /wiggle/x, /wiggle/y.
var text = ui.addText("Seekbars:", ui.screenWidth/2 - 100, 150, 500, 100);
text.textSize(20);

var osc_addresses = new Array("/stretch","/blur","/turn/x","/turn/y","/turn/z","/knock","/wiggle/x","/wiggle/y");

for(var i=0;i<osc_addresses.length;i++){
    (function(index){
        var text = ui.addText(osc_addresses[index],10, 200 + 70*i, 500, 100);
        text.textSize(26);
        ui.addSlider(200, 200 + 70*i, ui.screenWidth-210, ui.screenHeight, 0, 1).onChange(function(val) {
        var o = new Array();
        o.push(val);
        console.log(index);
        console.log(osc_addresses[index]);
        client.send(osc_addresses[index], o);
        });
    })(i);
}
