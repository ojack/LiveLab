'use strict'
const html = require('choo/html')
const input = require('./input.js')

module.exports = oscView

function oscView (state, emit) {
  var localOsc = state.user.osc.local

  var localOscEl = html`<div>
    ${Object.keys(localOsc).map((port)=>{
      console.log("poo", port, localOsc[port])
      var oscArgs = localOsc[port].message==null? '' : JSON.stringify(localOsc[port].message)
      return html`<p><span class="b"> ${localOsc[port].name}</span>::: ${port} :: <span class="f7"> ${oscArgs} </span> </p>`
    })}
    </div>`
  console.log("OSC", localOsc, localOscEl)
  var addBroadcast = ''

  if(state.ui.osc.addBroadcast.visible===true){
    addBroadcast = html`
      <div>
      ${input('Name', 'name for broadcast', {
        value: state.ui.osc.addBroadcast.name,
        onkeyup: (e) => {
          emit('ui:setOSCBroadcastName', e.target.value)
        }
      })}
      ${input('Local Port', 'Listen for osc messages on this port', {
        value: state.ui.osc.addBroadcast.port,
        onkeyup: (e) => {
          emit('ui:setOSCBroadcastPort', e.target.value)
        }
      })}
      <div class="f6 fr ma2 link ph3 pv2 mb2 white bg-dark-pink pointer dib dim" onclick=${() => (emit('ui:listenOnLocalPort'))}>Start Listening</div>
      </div>
    `
  } else {
    addBroadcast = html`<div class="f6 fr ma2 link ph3 pv2 mb2 white bg-dark-pink pointer dib dim" onclick=${() => (emit('ui:addOSC', true))}>+ Add OSC Broadcast</div>`
  }
  return html`<div pa2>
    ${localOscEl}
    ${addBroadcast}

  </div>`



}
