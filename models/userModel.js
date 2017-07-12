var xtend = Object.assign
var shortid = require('shortid')
var MultiPeer = require('./../lib/MultiPeer.js')

// To do: separate ui events (logged in) and connection state/ status log from user model
// status log contains all peer connection related information

module.exports = userModel

function userModel (state, bus) {
  state.user = xtend({
    nickname: 'olivia',
    uuid: localStorage.getItem('uuid') || shortid.generate(), // persistent local user id. If none is present in local storage, generate new one
    room: 'test',
    server: 'https://live-lab-v1.glitch.me/',
    loggedIn: false,
    statusMessage: ''
  }, state.user)

  bus.on('user:setNickname', function (name) {
    state.user.nickname = name
    bus.emit('render')
  })

  bus.on('user:setServer', function (server) {
    state.user.server = server
    bus.emit('render')
  })

  bus.on('user:setRoom', function (room) {
    state.user.room = room
    bus.emit('render')
  })

  // TO DO: validate form info before submitting
  bus.on('user:join', function () {
    localStorage.setItem('uuid', state.user.uuid)
    var multiPeer = new MultiPeer({
      room: state.user.room,
      server: state.user.server,
      stream: getLocalCommunicationStream(),
      userData: {
        uuid: state.user.uuid,
        nickname: state.user.nickname
      }
    })

    multiPeer.on('peers', function (peers) {
      state.user.loggedIn = true
      state.user.statusMessage += 'Connected to server ' + state.user.server + '\n'
      bus.emit('peers:setAllPeers', peers)
      bus.emit('render')
    })

    multiPeer.on('stream', function (peerId, stream) {
      state.user.statusMessage += 'Received media from peer ' + peerId + '\n'
      bus.emit('media:addTracksFromStream', {
        peerId: peerId,
        stream: stream,
        isDefault: true
      })
    })

    multiPeer.on('connect', function (id) {
      state.user.statusMessage += 'Connected to peer ' + id + '\n'
      bus.emit('render')
    })

    multiPeer.on('new peer', function (data) {
      // console.log("NEW REMOTE PEER", data)
      bus.emit('peers:updatePeer', {
        peerId: data.id
      })
    })

    state.user.statusMessage = 'Contacting server ' + state.user.server + '\n'

    bus.emit('render')
  })

  function getLocalCommunicationStream () {
    var tracks = []
    if (state.media.default.audio !== null) tracks.push(state.media.byId[state.media.default.audio].track)
    if (state.media.default.video !== null) tracks.push(state.media.byId[state.media.default.video].track)
    return new MediaStream(tracks)
  }

// returns a stream that contains all local tracks
  function getCombinedLocalStream () {
    var userTracks = state.peers.byId[state.user.uuid].tracks.map(function (trackId) {
      return state.media.byId[trackId].track
    })
    return new MediaStream(userTracks)
  }
}
