'use strict'

const html = require('choo/html')
const Modal = require('./components/modal.js')
const Dropdown = require('./components/dropdown-nano.js')
const VideoEl = require('./components/VideoContainer.js')
const settings = require('./../models/availableConstraints.json')

module.exports = addBroadcast

const deviceDropdown = Dropdown()
const previewVid = VideoEl()

function addBroadcast (devices, emit) {
  var bState = devices.addBroadcast
  var constraintOptions

  var defaultLabel = ''
  if(bState[bState.kind].deviceId !== null){
    var selectedDevice = bState[bState.kind].deviceId
    defaultLabel += devices[bState.kind+'input'].byId[selectedDevice].label
  }

  if(bState.kind==="audio") {
    constraintOptions = html`
    <div id="audio-constraints" >
      ${deviceDropdown.render({
        value: 'Device:  ' + defaultLabel,
        options: devices.audioinput.all.map((id) => (
          {
            value: id,
            label: devices.audioinput.byId[id].label
          }
        )),
        onchange: (value) => {
          emit('devices:updateBroadcastConstraints', {deviceId: value})
        }
      })}
      ${radioEl(
        {
          label: "echo cancellation:",
          options:  [
            { name: "echoCancellation",
              checked: bState.audio.echoCancellation,
              value: "true" },
            { name: "echoCancellation",
                checked: !bState.audio.echoCancellation,
                value: "false" }
          ],
          onChange: updateBroadcastConstraints
        }
      )}
      </div>

    `
  } else {
    constraintOptions = html`
    <div id="video-constraints">
      ${deviceDropdown.render({
        value: 'Device:  ' + defaultLabel,
        options: devices.videoinput.all.map((id) => (
          {
            value: id,
            label: devices.videoinput.byId[id].label
          }
        )),
        onchange: (value) => {
          emit('devices:updateBroadcastConstraints', {deviceId: value})
        }
      })}
    </div`
  }
  return html`

    ${Modal({
      show: state.user.modalAddBroadcast,
      header: "Add Broadcast",
      contents: html`<div id="add broadcast" class="pa3 f6 fw3">
            ${radioEl(
              {
                label: "kind:",
                options:  [
                  { name: "kind",
                    checked: bState.kind==="audio"? "true": "false",
                    value: "audio" },
                  { name: "kind",
                      checked: bState.kind==="audio"? "false": "true",
                      value: "video" }
                ],
                onChange: setBroadcastKind
              }
            )}

            ${constraintOptions}
        </div>`,
      close: () => (emit('user:modalAddBroadcast', false))
    })}
    `

    function setBroadcastKind(e){
      emit('devices:setBroadcastKind', e.target.value)
    }

    function updateBroadcastConstraints(e){
      var updateObj = {}
      var val = e.target.value
      console.log(val)
      //convert string to bool
      if(e.target.name==="echoCancellation"){
        val = (val === "true")
      }
      updateObj[e.target.name] = val
      emit('devices:updateBroadcastConstraints', updateObj)
    }

    function radioEl(opts){
      return html`<div  class="mv3">
        <span> ${opts.label} </span>
        ${opts.options.map((opt)=>(
          html`<span ><input class="ml3 mr2" type="radio" checked=${opt.checked} onclick=${opts.onChange} value=${opt.value} name=${opt.name}></input> ${opt.value}</span>`
        ))}
      </div>`
    }

    function slider(opts){

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
