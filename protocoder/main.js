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
});


ui.addButton("Send", 520, 0, 200, 100).onClick(function() {
    var o = new Array();
    o.push(1);
    client.send("/test", o);
});

//Seekbars:
// /stretch, /blur, /turn/x, /turn/y, /turn/z, /knock, /wiggle/x, /wiggle/y.
var text = ui.addText("Seekbars:", ui.screenWidth/2 - 100, 150, 500, 100);
text.textSize(20);

var osc_addresses = ["/stretch","/blur","turn/x","/turn/y","/turn/z","/knock","/wiggle/x","/wiggle/y"];

for(var i=0;i<8;i++){
    var slider = ui.addSlider(0, 200 + 50*i,ui.screenWidth, 400, 0, 1).onChange(function(val) {
        console.log(val);
        var o = new Array();
        o.push(val);
        console.log(val);
        client.send(osc_addresses[i], o);
    });
}
