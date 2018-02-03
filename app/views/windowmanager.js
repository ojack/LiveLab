'use strict'
const html = require('choo/html')
const Window = require('./components/showwindow.js')
const Dropdown = require('./components/dropdown.js')

module.exports = windowManagerView
const trackDropdown = Dropdown()

var show = new Window()
function windowManagerView (state, emit) {
  var windowControls = ''
  if(!state.ui.windows.open){
    windowControls = html`<div class="f6 fr ma2 link ph3 pv2 mb2 white bg-dark-pink pointer dib dim" onclick=${() => (emit('ui:toggleWindow', true))}>+ Open Window</div>`
  } else {
    windowControls = html`<div>


      ${
        trackDropdown.render({
          value: 'Track:  ' + state.ui.windows.track.id,
          options: state.media.all.filter((trackId)=>{
            //console.log("checking ", trackId, state.media.byId[trackId])
            return state.media.byId[trackId].track.kind==="video"
          }).map((id)=>({
            value: id,
            label: id
          })),
          onchange: (value) => {
            emit('ui:updateWindowTrack', value)
          },
          style: ' bg-mid-gray f7'
        })
      }
      <div class="f6 fr ma2 link ph3 pv2 mb2 white bg-dark-pink pointer dib dim" onclick=${() => (emit('ui:toggleWindow', false))}>Close Window</div>
      Click on window and press any key to make fullscreen
      </div>`
  }
  return html`
    <div class="pa3 dib" style="width:100%">
      ${show.render(state.ui.windows, ()=>{
        console.log("window closing")
        emit('ui:toggleWindow', false)
      })}
    ${windowControls}
    </div>
    `
}
