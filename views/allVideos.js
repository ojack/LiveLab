'use strict'
const html = require('choo/html')
const VideoEl = require('./components/VideoContainer.js')

const MAX_NUM_PEERS = 20 // can be changed (stub for initializing video containers)

module.exports = allVideos

// initialize peer video holders
var peerVids = []
for (var i = 0; i < MAX_NUM_PEERS; i++) {
  peerVids[i] = new VideoEl()
}

function allVideos (state, emit) {
  // create containers for each
  var communicationContainers = Object.keys(state.media.byId).filter(function(mediaId){
    return (state.media.byId[mediaId].track.kind==="video")
  }).map(function (key, index) {
    var vidEl = peerVids[index]
    if (vidEl) {
      var trackId = key
      return html`
      <div class="dib w-25">

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
