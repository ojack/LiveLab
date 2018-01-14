'use strict'

const html = require('choo/html')
const Modal = require('./components/modal.js')
const Dropdown = require('./components/dropdown.js')
const VideoEl = require('./components/VideoContainer.js')
const radioSelect = require('./components/radioSelect.js')
const settingsUI = require('./components/settingsUI.js')
const input = require('./components/input.js')

module.exports = addBroadcast

const deviceDropdown = Dropdown()
const previewVid = VideoEl()

function addBroadcast (devices, emit, showElement) {
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
              emit('devices:updateBroadcastDevice', {deviceId: value})
            }
          })}
          ${settingsUI({
              onChange: updateBroadcastConstraints,
              settings: bState.audio
            })
          }
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
          emit('devices:updateBroadcastDevice', {deviceId: value})
        }
      })}
      ${settingsUI({
          onChange: updateBroadcastConstraints,
          settings: bState.video
        })
      }
    </div`
  }
  return html`

    ${Modal({
      show: showElement,
      header: "Add Media",
      contents: html`<div id="add broadcast" class="pa3 f6 fw3">
            ${input('name', 'name', {
              value: bState.name,
              onkeyup: (e) => {
                emit('devices:setBroadcastName', e.target.value)
              }
            })}
            ${radioSelect(
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
            <div class="f6 link dim ph3 pv2 mb2 dib white bg-gray pointer" onclick=${() => (emit('devices:updateBroadcastPreview', true))}>Update Preview</div>
            <div class="f6 link dim ph3 pv2 mb2 dib white bg-dark-pink pointer" onclick=${() => (emit('devices:addNewMediaToBroadcast'))}>Start Broadcast</div>
            <p class="red">${bState.errorMessage}</p>
            ${previewVid.render({
              htmlProps: {},
              track: bState.previewTrack,
              id: bState.previewTrack ?  bState.previewTrack.id : null
            })}
        </div>`,
      close: () => (emit('devices:toggleAddBroadcast', false))
    })}
    `

    function setBroadcastKind(e){
      emit('devices:setBroadcastKind', e.target.value)
    }

    function updateBroadcastConstraints(updateObject){
      emit('devices:updateBroadcastConstraints', updateObject)
    }


}
