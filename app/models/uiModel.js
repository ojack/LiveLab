// State information specifically related to the ui
// to do: unify ui information in this model
// const MAX_NUM_PEERS = 8 // to do: put this all in one place
var xtend = Object.assign

module.exports = uiModel

function uiModel (state, bus) {
  state.ui = xtend({
  communication: {},
  inspector: {
    trackId: null,
    pc: null, //peer connection to be inspected
    selectedTab: "track" //which inspector tab is currently open
  },
  chat: {
    messages: [

    ],
    current: ""
  }
  }, state.ui)

  bus.on('ui:addPeer', function (peerId) {
    var vol = 1.0
    if(peerId === state.user.uuid) vol = 0.0
    state.ui.communication[peerId] = {
      volume: vol
    }
  })

  bus.on('ui:toggleCommunicationVolume', function (peerId) {
    state.ui.communication[peerId].volume==0? state.ui.communication[peerId].volume = 1 : state.ui.communication[peerId].volume = 0
    console.log(state.ui.communication)
    bus.emit('render')
  })

  bus.on('ui:removePeer', function (peerId) {
    delete state.ui.communication[peerId]
  })

  bus.on('ui:updateInspectorTrack', function (opts) {

      state.ui.inspector = xtend(state.ui.inspector, opts)
      console.log("PEER CONNECTION", state.ui.inspector)
      bus.emit('render')
  })

  bus.on('ui:sendChatMessage', function(){
     var chatObj = {
       peerId: state.user.uuid,
       message: state.ui.chat.current,
       date: Date.now()
     }
     bus.emit('user:sendChatMessage', chatObj)
     appendNewChat(chatObj)
     state.ui.chat.current = ""
     bus.emit('render')

   })

   bus.on('ui:receivedNewChat', function (chatObj){
     appendNewChat(chatObj)
     bus.emit('render')
   })

   bus.on('ui:updateChat', function(text){
     state.ui.chat.current = text
   })

   function appendNewChat(chatObj){
      console.log("appending chat", chatObj)		     //  console.log(chatObj)
      // state.ui.chat.messages.push(chatObj)
      if(state.peers.byId[chatObj.peerId]){
        console.log(state.ui.chat)
        chatObj.nickname = state.peers.byId[chatObj.peerId].nickname
        state.ui.chat.messages.push(chatObj)
      } else {
        console.log("USER NOT FOUND", chatObj)
      }

    }
 }
