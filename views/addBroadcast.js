'use strict'

const html = require('choo/html')
const Modal = require('./components/modal.js')
const Dropdown = require('./components/dropdown.js')
const VideoEl = require('./components/VideoContainer.js')

module.exports = addBroadcast

const deviceDropdown = Dropdown()
const previewVid = VideoEl()

function addBroadcast (state, emit) {
  var bState = state.devices.addBroadcast
  var deviceOptions
  var defaultLabel = ''
  if(bState.kind==="audio") {
    defaultLabel = bState.deviceId === null ? '' : state.devices.audioinput.byId[bState.deviceId].label
    deviceOptions = state.devices.audioinput.all.map((id) => (
      {
        value: id,
        label: state.devices.audioinput.byId[id].label
      }
    ))
  } else {
    defaultLabel = bState.deviceId === null ? '' : state.devices.videoinput.byId[bState.deviceId].label
    deviceOptions = state.devices.videoinput.all.map((id) => (
      {
        value: id,
        label: state.devices.videoinput.byId[id].label
      }
    ))
  }
  return html`

    ${Modal({
    //  show: state.user.modalAddBroadcast,
      show: true,
      header: "Add Broadcast",
      contents: html`<div>
            <input type="radio" name="kind" checked=${bState.kind==="audio"? "true": "false"} onclick=${setBroadcastKind} value="audio"> audio
            <input type="radio" name="kind" checked=${bState.kind==="audio"? "false": "true"} onclick=${setBroadcastKind} value="video"> video
            ${deviceDropdown.render({
              value: 'Device:  ' + defaultLabel,
              options: deviceOptions,
              onchange: (value) => {
                emit('devices:setBroadcastDevice', value)
              }
            })}
        </div>`,
      close: () => (emit('user:modalAddBroadcast', false))
    })}

    `
    function setBroadcastKind(e){
      emit('devices:setBroadcastKind', e.target.value)
    }
}


// ${deviceDropdown.render({
//   value: 'Device:  ' + (defaultAudio === null ? '' : audioinput.byId[defaultAudio].label),
//   options: audioinput.all.map((id) => (
//     {
//       value: id,
//       label: audioinput.byId[id].label
//     }
//   )),
//   onchange: (value) => {
//     emit('devices:setDefaultAudio', value)
//   }
// })}
