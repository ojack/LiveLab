// TO DO: add events for adding and removing peers, forwarded from mixer window

console.log("opened page");
var seriously, sources, canvas, blend, effects;
var previousState = {};

document.addEventListener('sourcesAdded', function(e){
   console.log("init vid");
    canvas = document.createElement('canvas');
    canvas.id = "mixerCanvas";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = "absolute";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    document.body.appendChild(canvas);
    initSeriously(e.detail);
   
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
    blend.mode = e.detail;

   // blend.update();
});

document.addEventListener('updateState', function(e){
    //alert("MIXER EVENT");
    console.log(e.detail);
    updateEffectsFromState(e.detail);
   // blend.mode = e.detail;

   // blend.update();
});

function initSeriously(initialState){
    seriously = new Seriously();
     target = seriously.target('#mixerCanvas');
   initEffectsFromState(initialState);
}

function initEffectsFromState(state){
 
   console.log("init seriously");
      
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
        var obj = {src: source, reformat: reformat};
        sources.push(obj);
      }
    //  var blend;
    console.log(sources);
      for(var i = 0; i < state.effects.length; i++){
        effect = seriously.effect(state.effects[i].type);
        for(prop in state.effects[i]){
            if(prop == "bottom" || prop == "top"){
             //  effect[bottom] = sources[0].reformat;
             
             var hey = state.effects[i][prop];
             console.log(hey);
             console.log(sources[hey]);
           //  console.log(effect[hey]);
              //  console.log(sources[st
              //  console.log(sources[state.effects[i]][prop].reformat);
              effect[prop] = sources[hey].reformat;

            } else {
                effect[prop] = state.effects[i][prop];
            }
        }
        console.log(effect);
        effects.push(effect);
      
      }
      
  
    // now do the same for the target canvas
   

    // connect any node as the source of the target. we only have one.
    if(effects.length > 0){
        console.log("adding source", blend);
        target.source = effects[0];
       //target.source = effects[state.effects.length-1];
    } else {
        target.source = sources[0];
    }
seriously.go();
}
function initEffectsFromState(state){
 
    sources = [];
    effects = [];
   console.log("init seriously");
      
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
        var obj = {src: source, reformat: reformat};
        sources.push(obj);
      }
    //  var blend;
    console.log(sources);
      for(var i = 0; i < state.effects.length; i++){
        effect = seriously.effect(state.effects[i].type);
        for(prop in state.effects[i]){
            if(prop == "bottom" || prop == "top"){
             //  effect[bottom] = sources[0].reformat;
             
             var hey = state.effects[i][prop];
             console.log(hey);
             console.log(sources[hey]);
           //  console.log(effect[hey]);
              //  console.log(sources[st
              //  console.log(sources[state.effects[i]][prop].reformat);
              effect[prop] = sources[hey].reformat;

            } else {
                effect[prop] = state.effects[i][prop];
            }
        }
        console.log(effect);
        effects.push(effect);
      
      }
      
  
    // now do the same for the target canvas
   

    // connect any node as the source of the target. we only have one.
    if(effects.length > 0){
        console.log("adding source", blend);
        target.source = effects[0];
       //target.source = effects[state.effects.length-1];
    } else {
        target.source = sources[0];
    }
seriously.go();
}