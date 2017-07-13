var xtend = Object.assign
var shortid = require('shortid')
var MultiPeer = require('./../lib/MultiPeer.js')

// To do: separate ui events (logged in) and connection state/ status log from user model
// status log contains all peer connection related information

module.exports = userModel

function userModel (state, bus) {
  state.user = xtend({
    //uuid: localStorage.getItem('uuid') || shortid.generate(), // persistent local user id. If none is present in local storage, generate new one
    uuid: shortid.generate(), // for dev purposes, always regenerate id
    room: 'test',
    server: 'https://live-lab-v1.glitch.me/',
    loggedIn: false,
    statusMessage: ''
  }, state.user)

  bus.emit('peers:updatePeer', {
    peerId: state.user.uuid,
    nickname: 'olivia'
  })

  bus.on('user:setNickname', function (name) {
    bus.emit('peers:updatePeer', {
      peerId: state.user.uuid,
      nickname: name
    })
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
      var peersInfo = peers.map(function (peer) {
        var peerInfo = {peerId: peer}
        if (peer === state.user.uuid) peerInfo.nickname = state.user.nickname
        return peerInfo
      })
      bus.emit('peers:setAllPeers', peersInfo)
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

    multiPeer.on('close', function (id) {
      bus.emit('peers:removePeer', id)
    })
    multiPeer.on('new peer', function (data) {
      // console.log("NEW REMOTE PEER", data)
      bus.emit('peers:updatePeer', {
        peerId: data.id
      })
    })

    multiPeer.on('data', function (data) {
      console.log("received data", data)
      if (data.data && data.data.type === 'updatePeerData') {
        var peerData = xtend({
          peerId: data.id
        }, data.data.message)
        console.log('peer data', peerData)
        bus.emit('peers:updatePeer', peerData)
      }
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
