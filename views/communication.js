'use strict'
const html = require('choo/html')
const VideoEl = require('./components/VideoContainer.js')

const MAX_NUM_PEERS = 8 // can be changed (stub for initializing video containers)

module.exports = communicationView

// initialize peer video holders
var peerVids = []
for (var i = 0; i < MAX_NUM_PEERS; i++) {
  peerVids[i] = new VideoEl()
}

function communicationView (state, emit) {
  // create containers for each
  var communicationContainers = peerVids.map(function (vidEl, index) {
    var peerIndex = state.peers.all[index]
    if (peerIndex) {
      var trackId = state.peers.byId[peerIndex].defaultTracks.video
      return html`
      <div class="dib w-25">
        <p> ${state.peers.byId[peerIndex].nickname}</p>
        ${vidEl.render({
          htmlProps: {
            class: 'h-50 w-100'
          },
          track: (trackId in state.media.byId)  ? state.media.byId[trackId].track : null,
          id: (trackId in state.media.byId) ?  state.media.byId[trackId].track.id : null
        })}
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
