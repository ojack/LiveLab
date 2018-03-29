'use strict'
const html = require('choo/html')

module.exports = trackSelector

function trackSelector (selectorInfo, selectorIndex, state, emit) {
  return html`
    <div class="row">
      ${selectorInfo.tracks.map((media, index) =>
        html`
          <div class="video-holder selectable"
          onclick=${() => (emit('show:setActiveVideo', {
            displayIndex: selectorIndex,
            trackIndex: index
          }))}

          draggable = "true"

          ondragstart=${() => (emit('show:clearVideoTrack', {displayIndex: selectorIndex, trackIndex: index}))}

          ondragover=${(ev) => (ev.preventDefault())}

          ondrop=${(ev) => (emit('show:setVideoTrack', {displayIndex: selectorIndex, trackIndex: index}))}
          >
            <div class="video"></div>
            <div class="video-title ${selectorInfo.active === index ? 'selected' : ''}">
              ${media === null ? '' : state.peers.byId[media.peerId].nickname + '-' + media.name + '-' + media.track.kind}
            </div>
          </div>
        `
      )}
    </div>
  `
}
