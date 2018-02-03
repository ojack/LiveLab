'use strict'

const html = require('choo/html')
const communication = require('./communication.js')
// const allVideos = require('./allVideos.js')
const mediaList = require('./mediaList.js')
const panel = require('./components/panel.js')
const chat = require('./components/chat.js')
const osc = require('./components/osc.js')
const windowManager = require('./windowmanager.js')
const AddBroadcast = require('./addBroadcast.js')


module.exports = workspaceView


//  <!--${AddBroadcast(state, emit)}-->
//  ${login(state, emit)}
// ${allVideos(state, emit)}
//contents: mediaList(state, emit),



function workspaceView (state, emit) {
  var oscEl = ''
  if(state.ui.osc.enabled==true){
    oscEl = panel(
         {
           htmlProps: {
             class: "w-100"
           },
           contents: osc(state, emit),
           closable: false,
           header:   "OSC"
         }
       )
  }
    return html`
    <div class="f6 dt fw2 w-100 h-100 mw-100">
      <div class="fl w-70-ns w-100 pa2">
        ${communication(state, emit)}
      </div>
      <div class="fl w-30-ns w-100 mw6 h-100">
        ${panel(
          {
            htmlProps: {
              class: "w-100"
            },
            contents: mediaList(state, emit),
            closable: false,
            header:   "Shared Media"
          }
        )}
        ${panel(
             {
               htmlProps: {
                 class: "w-100"
               },
               contents: chat(state, emit),
               closable: false,
               header:   "Chat"
             }
           )}
           ${panel(
                {
                  htmlProps: {
                    class: "w-100"
                  },
                  contents: windowManager(state, emit),
                  closable: false,
                  header:   "Output"
                }
              )}
        ${oscEl}
      </div>
      ${AddBroadcast(state.devices, emit, state.devices.addBroadcast.active)}

    </div>
    `
}
