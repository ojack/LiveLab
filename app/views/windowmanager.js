'use strict'
const html = require('choo/html')
const Window = require('./components/showwindow.js')

module.exports = windowManagerView

var show = new Window()
function windowManagerView (state, emit) {
  return html`
    <div class="pa3 dib" style="width:100%">
      ${show.render(state.ui.windows, ()=>{
        console.log("window closing")
        emit('ui:toggleWindow', false)
      })}
      <div class="f6 fr ma2 link ph3 pv2 mb2 white bg-dark-pink pointer dib dim" onclick=${() => (emit('ui:toggleWindow'))}>${state.ui.windows.open?'Close Window':'+ Open Window'}</div>
    </div>
    `
}
