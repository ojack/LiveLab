// the PEERS data store contains information about each connected peer (including the local user (definied by state.user.uuid))
// Each peer has/will have:
// 1. a nickname
// 2. a set of mediaStreamTrackIds (including metadata about the track)
// 3. certain tracks (defaultTracks) designated for communication
//
// The PEER data store ideally should be identical for all users in a session, with each connected peer updating its own information and broadcasting to other users as necessary

var xtend = Object.assign

module.exports = peersModel

function peersModel (state, bus) {
  state.peers = xtend({
    byId: {

    },
    all: []
  }, state.peers)

  bus.on('peers:setAllPeers', function (peers) {
    peers.forEach(function (peer) {
      bus.emit('peers:updatePeer', {peerId: peer})
    })
  })

// update information about a specific peer, creates a new one if none exists
  bus.on('peers:updatePeer', function (peer) {
    state.peers.byId[peer.peerId] = xtend({
      peerId: peer.peerId,
      tracks: [],
      nickname: null,
      defaultTracks: {
        audio: null,
        video: null
      }
    }, state.peers.byId[peer.peerId]
  )
    if (state.peers.all.indexOf(peer.peerId) < 0) {
      state.peers.all.push(peer.peerId)
    }
    bus.emit('render')
  })

  bus.on('peers:addTrackToPeer', function (opts) {
  //  console.log('Track TO PEER', state.peers, opts)
    state.peers.byId[opts.peerId].tracks.push(opts.trackId)
    // if track is default communication track, add to peer defaultTracks
    if (opts.isDefault) {
      state.peers.byId[opts.peerId].defaultTracks[opts.kind] = opts.trackId
    }
    bus.emit('render')
  })
}
