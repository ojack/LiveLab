const enumerateDevices = require('enumerate-devices')
const constraints = require('./availableConstraints.json')
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
      active: false,
      stream: null,
      kind: "video",
      audio: {
        deviceId: null
      },
      video: {
        deviceId: null
      }
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
    bus.emit('peers:updatePeer', {
      peerId: state.user.uuid
    })
  }

  bus.on('devices:updateBroadcastConstraints', function(obj){
    xtend(state.devices.addBroadcast[state.devices.addBroadcast.kind], obj)
    //setBroadcastDevice(val, state.devices.addBroadcast.kind)

    updateBroadcastPreview()
    bus.emit('render')
  })

  bus.on('devices:setBroadcastKind', function(val){
    state.devices.addBroadcast.kind = val

    //set broadcast to default on c

    bus.emit('render')
  })



  function updateBroadcastPreview() {
      var bState = state.devices.addBroadcast
      var constraints = {}
    //  if(bState.kind == 'audio')
      //getLocalMedia ({
  }

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
        constraints: {
          audio: { deviceId: { exact: state.devices.default.inputDevices.audio } },
          video: false
        },
        isDefault: true
      }, function(err, stream){
        if(err===null){
          var tracks = stream.getTracks()
          tracks.forEach(function (track) {
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
      getLocalMedia ({
        constraints: {
          audio: false,
          video: { deviceId: { exact: state.devices.default.inputDevices.video } }
        },
        isDefault: true
      }, function(err, stream){
        if(err===null){
          var tracks = stream.getTracks()
          tracks.forEach(function (track) {
             state.devices.default.previewTracks.video = track
          })
        }
      })
    }
  }

function getLocalMedia(options, callback) {
    getUserMedia(options.constraints, function (err, stream) {
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
