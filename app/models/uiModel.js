// State information specifically related to the ui
// to do: unify ui information in this model
const MAX_NUM_PEERS = 8 // to do: put this all in one place
var xtend = Object.assign

module.exports = uiModel

function uiModel (state, bus) {
  state.ui = xtend({
  communication: Array.from(Array(MAX_NUM_PEERS)), // to do: this should store information specifically  about the
  inspector: {
    trackId: null,
    pc: null, //peer connection to be inspected
    selectedTab: "track" //which inspector tab is currently open
  }
  }, state.ui)

  bus.on('ui:updateCommunication', function (opts) {

  })
  
  bus.on('ui:updateInspectorTrack', function (opts) {

      state.ui.inspector = xtend(state.ui.inspector, opts)
      console.log("PEER CONNECTION", state.ui.inspector)
      bus.emit('render')
  })



}
