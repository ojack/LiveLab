'use strict'
const html = require('choo/html')
const RTCInspector = require('./components/RTCInspector.js')
const Video = require('./components/funvideocontainer.js')

module.exports = inspectorComponent

//const inspector = RTCInspector()
// <!--${inspector.render({
//   htmlProps: {
//
//   },
//   pc: state.ui.inspector.pc,
//   trackId: state.ui.inspector.trackId
// })}-->
//const previewVid = VideoEl()

function inspectorComponent (state, emit) {

  return  html`<div class="overflow-scroll pa0">
    ${state.media.byId[state.ui.inspector.trackId].track.kind==='video' ? Video({
      htmlProps: {
        class: 'h4 w4'
      },
      index: 'inspector',
      track: (state.ui.inspector.trackId in state.media.byId)  ? state.media.byId[state.ui.inspector.trackId].track : null,
      id: (state.ui.inspector.trackId in state.media.byId) ?  state.media.byId[state.ui.inspector.trackId].track.id : null
    }) : null }

  </div>`
}
