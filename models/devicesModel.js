const enumerateDevices = require('enumerate-devices')
const constraintsJSON = require('./availableConstraints.json')
const getUserMedia = require('getusermedia')
const xtend = Object.assign

module.exports = devicesModel

function devicesModel (state, bus) {
// object representing the user's input and output devices
  state.devices = xtend({
    videoinput: {
      byId: {},
      all: []
    },
    audiooutput: {
      byId: {},
      all: []
    },
    audioinput: {
      byId: {},
      all: []
    },
    videooutput: {
      byId: {},
      all: []
    },
    addBroadcast: {
      active: true,
      kind: "audio",
      errorMessage: "",
      audio: {
        deviceId: null
      },
      video: {
        deviceId: null
      },
      previewTrack: null
    },
    default: {
      inputDevices: {
        audio: null,
        video: null
      },
      previewTracks: {
        audio: null,
        video: null
      }
    }
  }, state.devices)

// TO DO: put this function somewhere else
  window.onload = function () {
    getDevices()
    loadConstraints()
    console.log("DEVICE STATE", state.devices)
    bus.emit('peers:updatePeer', {
      peerId: state.user.uuid
    })
  }

  bus.on('devices:updateBroadcastDevice', function(obj){
    xtend(state.devices.addBroadcast[state.devices.addBroadcast.kind], obj)
    bus.emit('render')
  })

  //accepts an object containing the properties to update and their new values. e.g.
  // { echoCancellation : { value: true}}
  bus.on('devices:updateBroadcastConstraints', function(obj){
    Object.keys(obj).forEach(key =>
      {
          xtend(state.devices.addBroadcast[state.devices.addBroadcast.kind][key], obj[key])
      }
    )
    bus.emit('render')
  })

  bus.on('devices:toggleAddBroadcast', function(val){
    state.devices.addBroadcast.active = val
    state.devices.addBroadcast.errorMessage = ""
    //if closing window, stop active preview stream
    if(val===false){
      if(state.devices.addBroadcast.previewTrack !== null) {
        state.devices.addBroadcast.previewTrack.stop()
        state.devices.addBroadcast.previewTrack = null
      }
    }
    bus.emit('render')
  })

  bus.on('devices:setBroadcastKind', function(val){
    state.devices.addBroadcast.kind = val
    if(state.devices.addBroadcast.previewTrack!==null){
      state.devices.addBroadcast.previewTrack.stop()
      state.devices.addBroadcast.previewTrack = null
    }
    //set broadcast to default on c

    bus.emit('render')
  })

//add available constraint options to devices model
  function loadConstraints(){
    xtend(state.devices.addBroadcast.audio, constraintsJSON.audio)
    xtend(state.devices.addBroadcast.video, constraintsJSON.video)
  }

  bus.on('devices:updateBroadcastPreview', function () {
      var bConstraints = {}
      var userConstraints = {}
      var bState = state.devices.addBroadcast
      if(bState[bState.kind].deviceId===null) {
        state.devices.addBroadcast.errorMessage = "Error: device not specified"
        bus.emit('render')
      } else {
        state.devices.addBroadcast.errorMessage = ""
        userConstraints.deviceId = { exact : bState[bState.kind].deviceId }
        for(var key in bState[bState.kind]){
          //if the user has specified a value for a particular constraint, pass it along to getusermedia.
          //for right now, only specifies "ideal" value, device does the best it can to meet constraints.
          // see https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API/Constraints#Applying_constraints
          if(bState[bState.kind][key] && bState[bState.kind][key].value){
            userConstraints[key] = {
              ideal: bState[bState.kind][key].value
            }
          }
        }
        bConstraints[bState.kind] = userConstraints
        if(bState.kind==="audio"){
          bConstraints.video = false
        } else {
          bConstraints.audio = false
        }
        getLocalMedia(bConstraints, function(err, stream){
          if(err) {
            state.devices.addBroadcast.errorMessage = err
          } else {
            var tracks = stream.getTracks()
            tracks.forEach(function (track) {
               if(state.devices.addBroadcast.previewTrack!==null){
                 state.devices.addBroadcast.previewTrack.stop()
               }
               state.devices.addBroadcast.previewTrack = track
            })

          }
          bus.emit('render')
        })
      }
  })



  bus.on('devices:setDefaultAudio', function (val) {
    setDefaultAudio(val)

  })

  bus.on('devices:setDefaultVideo', function (val) {
    setDefaultVideo(val)
  })
// bus.on('devices:getDevices', function () {
// TO DO: use electron remote available displays to enumerate video output devices
// })
//display window for adding broadcast
  bus.on('devices:modalAddBroadcast', function (modalState) {
    state.devices.addBroadcast.active = modalState
    bus.emit('render')
  })

  function setDefaultAudio (val) {
    if (state.devices.default.inputDevices.audio !== val) {
      state.devices.default.inputDevices.audio = val
      getLocalMedia ({

          audio: { deviceId: { exact: state.devices.default.inputDevices.audio } },
          video: false
        }, function(err, stream){
        if(err===null){
          var tracks = stream.getTracks()
          tracks.forEach(function (track) {
            if(state.devices.default.previewTracks.audio!=null){
              state.devices.default.previewTracks.audio.stop()
            }
             state.devices.default.previewTracks.audio = track
          })
        }
      })
    }
    bus.emit('render')
  }

  function setDefaultVideo (vid) {
    if (state.devices.default.inputDevices.video !== vid) {
      console.log('SETTING VIDEO', vid)
      state.devices.default.inputDevices.video = vid
      getLocalMedia (
       {
          audio: false,
          video: { deviceId: { exact: state.devices.default.inputDevices.video } }
      }, function(err, stream){
        if(err===null){
          var tracks = stream.getTracks()
          tracks.forEach(function (track) {
            if(state.devices.default.previewTracks.video!==null) state.devices.default.previewTracks.video.stop()
             state.devices.default.previewTracks.video = track
          })
        }
      })
    }
  }

function getLocalMedia(constraints, callback) {
    getUserMedia(constraints, function (err, stream) {
        if (err) {
          callback(err, null)
          // TO DO: do something about error
        } else {
          callback(null, stream)
        }
        bus.emit('render')
      })
  }



  function getDevices () {
    var supportedConstraints = navigator.mediaDevices.getSupportedConstraints()
    console.log("CONSTRIANTSS", supportedConstraints)

    enumerateDevices().then((devices) => {
      const kinds = ['audioinput', 'videoinput', 'audiooutput']

      kinds.forEach((kind) => {
        const filtered = devices.filter((elem) => elem.kind === kind)

        state.devices[kind].all = filtered.map((elem) => {
          state.devices[kind].byId[elem.deviceId] = xtend({}, elem)
          return elem.deviceId
        })
      })

  // Set default audio and video devices
      if (state.devices.audioinput.all.length > 0) setDefaultAudio(state.devices.audioinput.all[0])
      if (state.devices.videoinput.all.length > 0) setDefaultVideo(state.devices.videoinput.all[0])

      console.log('DEVICES', state.devices)
      bus.emit('render')
    }).catch(console.log.bind(console)) // TO DO:: display error to user
  }
}
