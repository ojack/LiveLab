var xtend = Object.assign

module.exports = showModel

function showModel (state, bus) {
  state.show = xtend({
    audio: [],
    displays: [
      {
        type: 'window',
        active: 0,
        opacity: 100,
        open: true,
        title: 'Output 1',
        fullscreen: false,
        tracks: [null, null, null, null]
      }, {
        type: 'window',
        active: 0,
        opacity: 100,
        open: true,
        title: 'Output 2',
        fullscreen: false,
        tracks: [null, null, null, null]
      }
    ]
  }, state.show)

  bus.on('show:setVideoTrack', ({displayIndex, trackIndex}) => {
    console.log(state.ui.dragging)
    if (state.ui.dragging !== null && state.ui.dragging.track.kind === 'video') {
      state.show.displays[displayIndex].tracks[trackIndex] = state.ui.dragging
    }
    console.log(state.show.displays)
    bus.emit('ui:dragClear')
  //  state.show.displays[displayIndex].tracks[trackIndex] = trackId
    // bus.emit('render')
  })

  bus.on('show:trackRemoved', (trackId) => {
    console.log("previous state", state.show.displays)
    state.show.displays = state.show.displays.map((display) => {
      let obj = Object.assign({}, display)
      obj.tracks = obj.tracks.map((media) => {
        console.log("checking " + media + trackId)
        if(media && media.trackId) return media.trackId == trackId ? null : media
        return media
      }
      )
      console.log("new tracks: ", obj.tracks)
      return obj
    })
    console.log('new show state', state.show.displays)
  })

  bus.on('show:clearVideoTrack', ({displayIndex, trackIndex}) => {
    state.show.displays[displayIndex].tracks[trackIndex] = null
    bus.emit('render')
  })

  bus.on('show:setActiveVideo', ({displayIndex, trackIndex}) => {
    state.show.displays[displayIndex].active = trackIndex
    bus.emit('render')
  })

  bus.on('show:updateDisplayProperty', ({displayIndex, property, value}) => {
    state.show.displays[displayIndex][property] = value
    bus.emit('render')
  })
}
