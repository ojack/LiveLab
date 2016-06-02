// TO DO: add events for adding and removing peers, forwarded from mixer window

console.log("opened page");
var seriously, source1, source2, canvas, blend;


document.addEventListener('videoAdded', function(){
   console.log("init vid");
    canvas = document.createElement('canvas');
    canvas.id = "mixerCanvas";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = "absolute";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    document.body.appendChild(canvas);
    initSeriously();
   
});

document.addEventListener('osc', function(e){
    //alert("MIXER EVENT");
    console.log(e);
    blend.mode = 'multiply';

   // blend.update();
});

function initSeriously(){
   console.log("init seriously");
      seriously = new Seriously();
    // Create a source object by passing a CSS query string.
 //  source1 = seriously.source('#test');
   source1 = seriously.source('#video0');
   reformat0 = seriously.transform('reformat');
    reformat1 = seriously.transform('reformat');

    reformat0.source = '#video0';
    reformat0.mode = 'cover';
    reformat0.width = canvas.width;
    reformat0.height = canvas.height;

    reformat1.source = '#video1';
    reformat1.mode = 'cover';
    reformat1.width = canvas.width;
    reformat1.height = canvas.height;

    blend = seriously.effect('blend');
    blend.bottom = reformat0;
    blend.top = reformat1;
    blend.mode = 'lighten';
    // now do the same for the target canvas
    target = seriously.target('#mixerCanvas');

    // connect any node as the source of the target. we only have one.
target.source = blend;

seriously.go();
}