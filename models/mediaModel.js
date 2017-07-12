// MEDIA::
// For now: each peer only broadcasts one stream, each stream has an unlimited number of tracks corresponding to each audio and video device + specific constraint settings.
// (i.e. the same device could broadcast multiple tracks at different framerates/bandwidths/ etc.)
// Any change in settings creates a new stream and renegotiates with peers.
// Each user creates a unique id for a specific device / constraint configuration, and this id is broadcast to other users along with the track id that it referes to.
// Peer ids and device ids are persistent between sessions.
//
// "default" refers to the audio and video tracks used for communication
// TO DO: generated track id (UNIQUE TO ENTIRE SESSION, persistent across sessions)
//
// MONITORING:
// there is no straightforward way to get actual specifications for each track (other than getusermedia constraints, which can drastically vary from actual settings)
// eventually makes sense to monitor information

'use strict'

var xtend = Object.assign
const getUserMedia = require('getusermedia')

module.exports = mediaModel

function mediaModel (state, bus) {
  state.media = xtend({
    byId: {},
    default: {
      audio: null,
      video: null
    }
  }, state.media)

  bus.on('media:addTracksFromStream', function (options) {
    var tracks = options.stream.getTracks()
    tracks.forEach(function (track) {
      bus.emit('media:addTrack', {
        track: track,
        trackId: track.id,
        peerId: options.peerId, // should be user peerId ?
        constraints: options.constraints,
        isDefault: options.isDefault,
        kind: track.kind
      })
      if (options.isDefault) state.media.default[track.kind] = track.id
    })
    bus.emit('render')
  })

  bus.on('media:removeTraxk', function (trackId) {
    delete state.media.byId(trackId)
  })
  
  bus.on('media:addLocalMedia', function (options) {
    var existingTrack = getTrackFromConstraints(state.user.uuid, options.constraints)

    // check whether a track with the given constrainst currently exists, if not, get user media
    if (existingTrack !== null) {
      // TO DO: user warning
      if (options.isDefault) state.media.default[existingTrack.kind] = existingTrack.trackId
      bus.emit('render')
      console.log('track already exists!', existingTrack)
    } else {
      getUserMedia(options.constraints, function (err, stream) {
        if (err) {
          // TO DO: do something about error
        } else {
          // console.log("got stream", stream)
          bus.emit('media:addTracksFromStream', {
            stream: stream,
            peerId: state.user.uuid,
            constraints: options.constraints,
            isDefault: options.isDefault
          })
        }
        bus.emit('render')
      })
    }
  })

  bus.on('media:addTrack', function (opts) {
    state.media.byId[opts.track.id] = xtend({}, opts)

    bus.emit('peers:addTrackToPeer', {
      trackId: opts.track.id,
      peerId: opts.peerId,
      isDefault: opts.isDefault,
      kind: opts.kind
    })

    bus.emit('render')
  })

  // Hacky way to avoid duplicating getusermedia calls:
  // compare requested media constraints to constraints of existing tracks, if there is none, return null..
  // else return existing mediaStreamTrack
  function getTrackFromConstraints (peerId, constraints) {
    var existingTrack = null
    if (state.peers.byId[peerId] && state.peers.byId[peerId].tracks.length > 0) {
      var tracks = state.peers.byId[peerId].tracks
      console.log(' comparing : ', tracks, constraints)
      tracks.forEach(function (trackId) {
        var track = state.media.byId[trackId]
      //  console.log("1:", JSON.stringify(constraints))
      //  console.log("2:", JSON.stringify(track.constraints))
        if (JSON.stringify(constraints) === JSON.stringify(track.constraints)) {
          existingTrack = track
        }
      })
    }
    return existingTrack
  }

  // returns a new object containing only the keys in the array 'keys', only if undefined
    function filterKeys (object, keys) {
      var newObject = {}
      keys.forEach(function (key) {
        if (object[key]) newObject[key] = xtend({}, object[key])
      })
      return newObject
    }
}
