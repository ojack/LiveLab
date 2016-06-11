// TO DO: add events for adding and removing peers, forwarded from mixer window

console.log("mixer.js: opened page");
var seriously, sources, canvas, blend, effects, streams, resize;
var isFullScreen = false;
var previousState = {};
var RESIZE_WIDTH = 800;
var RESIZE_HEIGHT = 600;

document.addEventListener('sourcesAdded', function(e){
    console.log("init vid");
    canvas = document.createElement('canvas');
    canvas.id = "mixerCanvas";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = "fixed";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    document.body.appendChild(canvas);
    initSeriously(e.detail);
    window.onkeyup = function(e) {
       var key = e.keyCode ? e.keyCode : e.which;
       /*key f triggers full screen*/
       if (key == 70) {
           toggleFullscreen();
       }
    }
});

document.addEventListener('osc', function(e){
    //alert("MIXER EVENT");
    console.log(e);
    blend.mode = 'multiply';

   // blend.update();
});

document.addEventListener('blend', function(e){
    //alert("MIXER EVENT");
    console.log(e.detail);
    if("mode" in e.detail){
      effects[e.detail.effect].mode = e.detail.mode;
    }
    if("opacity" in e.detail){
       effects[e.detail.effect].opacity = e.detail.opacity;
    }
   // blend.update();
});

document.addEventListener('contrast', function(e){
  console.log(e.detail);
  if("contrast" in e.detail){
    sources[e.detail.source].contrast.contrast = e.detail.contrast;
  }
   if("brightness" in e.detail){
    sources[e.detail.source].contrast.brightness = e.detail.brightness;
  }

});

document.addEventListener('source', function(e){
    console.log(e.detail);
    console.log(streams);
    sources[e.detail.source].div.src = streams[e.detail.stream].src;
});

document.addEventListener('updateState', function(e){
    console.log(e.detail);
    updateEffectsFromState(e.detail);
});

function initSeriously(initialState){
    seriously = new Seriously();
    target = seriously.target('#mixerCanvas');
    initEffectsFromState(initialState);
}

function initEffectsFromState(state){
    console.log("init seriously");
    sources = [];
    effects = [];
    streams = state.streams;
    console.log(state);
    for(var i = 0; i < state.sources.length; i++){
        var source = seriously.source("#"+state.sources[i].outputDiv.id);
        if(state.sources[i].outputDiv.src != state.sources[i].src){
            state.sources[i].outputDiv.src = state.sources[i].src;
        }
        var reformat = seriously.transform('reformat');
        reformat.mode = 'cover';
        reformat.width = canvas.width;
        reformat.height = canvas.height;
        reformat.source = source;
        var contrast = seriously.effect('brightness-contrast');
        if(i == 1 || i == 2){
            contrast.contrast = 3.0;
            contrast.brightness = 3.0;
        } else {
            contrast.contrast = 1.0;
            contrast.brightness = 1.0;
        }
        contrast.source = reformat;
        var obj = {src: source, contrast: contrast, reformat: reformat, div: state.sources[i].outputDiv};
        sources.push(obj);
    }
    //  var blend;
    console.log(sources);
    console.log(state.effects);
    for(var i = 0; i < state.effects.length; i++){
        effect = seriously.effect(state.effects[i].type);
        for(prop in state.effects[i]){
            if(prop == "bottom" || prop == "top"){
                //  effect[bottom] = sources[0].reformat;

                var hey = state.effects[i][prop];
                console.log(hey);

                if(hey=="blend"){
                    effect[prop] = effects[0];
                } else {
                    effect[prop] = sources[hey].contrast;
                }


            } else {
                effect[prop] = state.effects[i][prop];
            }
        }
        console.log(effect);
        effects.push(effect);
    }
    // connect any node as the source of the target. we only have one.
    if(effects.length > 0){
        console.log("adding source", blend);
        target.source = effects[effects.length-1];
        //target.source = effects[state.effects.length-1];
    } else {
        target.source = sources[0];
    }
    // target.source = resize;
    seriously.go();
}

function updateEffectsFromState(state){
 
}

function toggleFullscreen(){
    var isFirefox = typeof InstallTrigger !== 'undefined';
    var isChrome = !!window.chrome && !!window.chrome.webstore;
    canvas.focus();
    if (!isFullScreen) {
        if (isFirefox == true) {
            canvas.mozRequestFullScreen();
        }
        if (isChrome == true) {
            canvas.webkitRequestFullScreen();
        }
        isFullScreen = true;
    } else {
        if (isFirefox == true) {
            canvas.mozCancelFullscreen();
        }
        if (isChrome == true) {
            canvas.webkitExitFullscreen();
        }
        isFullScreen = false;
    }   
}
