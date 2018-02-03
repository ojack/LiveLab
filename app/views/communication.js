'use strict'
const html = require('choo/html')
const VideoEl = require('./components/videocontainer.js')
const AudioEl = require('./components/audiocontainer.js')

const MAX_NUM_PEERS = 8 // can be changed (stub for initializing video containers)

module.exports = communicationView

// initialize peer video holders
var peerVids = []
var peerAudio = []

for (var i = 0; i < MAX_NUM_PEERS; i++) {
  peerVids[i] = new VideoEl()
  peerAudio[i] = new AudioEl()
}

function communicationView (state, emit) {
  // create containers for each
  var communicationContainers = peerVids.map(function (vidEl, index) {
    var peerIndex = state.peers.all[index]

    if (peerIndex) {
      var trackId = state.peers.byId[peerIndex].defaultTracks.video
      var audioId = state.peers.byId[peerIndex].defaultTracks.audio
      return html`
      <div class="fl w-50 pa1">
        ${vidEl.render({
          htmlProps: {
            class: 'h-50 w-100'
          },
          track: (trackId in state.media.byId)  ? state.media.byId[trackId].track : null,
          id: (trackId in state.media.byId) ?  state.media.byId[trackId].track.id : null
        })}
        ${peerAudio[index].render({
          htmlProps: {

          },
          track: (trackId in state.media.byId)  ? state.media.byId[audioId].track : null,
          id: (trackId in state.media.byId) ?  state.media.byId[audioId].track.id : null,
          volume: state.ui.communication[peerIndex].volume
        })}
        <div> <i
                class=${state.ui.communication[peerIndex].volume==0?"fa fa-volume-off ma2 dim pointer":"fa fa-volume-up ma2 dim pointer"}
                aria-hidden="true"
                onclick=${()=>emit('ui:toggleCommunicationVolume', peerIndex)} >
              </i>${state.peers.byId[peerIndex].nickname}</div>
      </div>`
    } else {
      return null
    }
  })

  return html`
    <div>
      ${communicationContainers}
    </div>
    `
}
