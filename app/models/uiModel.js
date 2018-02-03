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
  osc: {
    enabled: typeof nw === "object" ? true : false,
    addBroadcast: {
      visible: false,
      port: 5271,
      name: ''
    }
  },
  windows: {
    track: null,
    open: false,
    fullscreen: false
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

  bus.on('ui:toggleFullscreen', function(){
    state.ui.windows.fullscreen =! state.ui.windows.fullscreen
    bus.emit('render')
  })

  bus.on('ui:updateWindowTrack', function(trackId){
    state.ui.windows.track = state.media.byId[trackId].track
    bus.emit('render')
  })

  bus.on('ui:toggleWindow', function(bool){
    //if passed a variable, use variable. Otherwise, toggle current value
    if(bool !== undefined){
      console.log("choosing window ", bool)
      state.ui.windows.open = bool
    } else {
      if(state.ui.windows.open){
        state.ui.windows.open = false
      } else {
        state.ui.windows.open = true
      }
    }
    if(state.ui.windows.open){
      if(state.ui.windows.track===null) {
        console.log("setting track")
        //set to default
        //console.log("user default", state.peers, state.user.uuid)
        var trackId = state.peers.byId[state.user.uuid].defaultTracks.video
        state.ui.windows.track = state.media.byId[trackId].track
      }
    }
    bus.emit('render')
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

  //Events related to UI
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

    //Events related to OSC
    bus.on('ui:addOSC', function(){
      state.ui.osc.addBroadcast.visible = true
      bus.emit('render')
    })

    bus.on('ui:setOSCBroadcastPort', function(val){
      state.ui.osc.addBroadcast.port = val
      bus.emit('render')
    })

    bus.on('ui:setOSCBroadcastName', function(val){
      state.ui.osc.addBroadcast.name = val
      bus.emit('render')
    })

    bus.on('ui:listenOnLocalPort', function(){
      bus.emit('user:newOSCBroadcast', {
        port: state.ui.osc.addBroadcast.port,
        name: state.ui.osc.addBroadcast.name
      })

      //to do: add error checking for if port is in use
      state.ui.osc.addBroadcast.port = null
      state.ui.osc.addBroadcast.name = null
      state.ui.osc.addBroadcast.visible = false
      bus.emit('render')
    })
 }
