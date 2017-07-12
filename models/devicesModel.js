const enumerateDevices = require('enumerate-devices')

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
    default: {
      audioinput: null,
      videoinput: null
    }
  }, state.devices)

// TO DO: put this function somewhere else
  window.onload = function () {
    getDevices()
    bus.emit('peers:updatePeer', {
      peerId: state.user.uuid
    })
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

  function setDefaultAudio (val) {
    if (state.devices.default.audioinput !== val) {
      state.devices.default.audioinput = val
      bus.emit('media:addLocalMedia', {
        constraints: {
          audio: { deviceId: { exact: state.devices.default.audioinput } },
          video: false
        },
        isDefault: true
      })
    }
    bus.emit('render')
  }

  function setDefaultVideo (vid) {
    if (state.devices.default.videoinput !== vid) {
      console.log('SETTING VIDEO', vid)
      state.devices.default.videoinput = vid
      bus.emit('media:addLocalMedia', {
        constraints: {
          audio: false,
          video: { deviceId: { exact: state.devices.default.videoinput } }
        },
        isDefault: true
      })
    }
  }

  function getDevices () {
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
