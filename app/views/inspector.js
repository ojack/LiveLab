'use strict'
const html = require('choo/html')
const RTCInspector = require('./components/RTCInspector.js')
const VideoEl = require('./components/VideoContainer.js')

module.exports = inspectorComponent

//const inspector = RTCInspector()
// <!--${inspector.render({
//   htmlProps: {
//
//   },
//   pc: state.ui.inspector.pc,
//   trackId: state.ui.inspector.trackId
// })}-->
const previewVid = VideoEl()

function inspectorComponent (state, emit) {

  return  html`<div class="h5 overflow-scroll pa2">
    ${state.media.byId[state.ui.inspector.trackId].track.kind==='video' ? previewVid.render({
      htmlProps: {
        class: 'h4 w4'
      },
      track: (state.ui.inspector.trackId in state.media.byId)  ? state.media.byId[state.ui.inspector.trackId].track : null,
      id: (state.ui.inspector.trackId in state.media.byId) ?  state.media.byId[state.ui.inspector.trackId].track.id : null
    }) : null }

  </div>`
}
