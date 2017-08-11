// Module for handling connections to multiple peers

var io = require('socket.io-client')
var SimplePeer = require('simple-peer')
var extend = Object.assign
var events = require('events').EventEmitter
var inherits = require('inherits')

var MultiPeer = function (options) {
// connect to websocket signalling server. To DO: error validation
  this.signaller = io(options.server)
  this._userData = options.userData || null
  this.stream = options.stream || null
 // this.stream = options.stream || null
  this._peerOptions = options.peerOptions || {}
  this._room = options.room
  this.peers = {}

  // Handle events from signalling server
  this.signaller.on('ready', this._connectToPeers.bind(this))
//  this.signaller.on('peers', )
  this.signaller.on('signal', this._handleSignal.bind(this))

  // emit 'join' event to signalling server
  this.signaller.emit('join', this._room, this._userData)
}
// inherits from events module in order to trigger events
inherits(MultiPeer, events)

// send data to all connected peers via data channels
MultiPeer.prototype.sendToAll = function (data) {
  Object.keys(this.peers).forEach(function (id) {
    this.peers[id].send(data)
  }, this)
}

MultiPeer.prototype.reinitAll = function(){
  Object.keys(this.peers).forEach(function (id) {
    this.peers[id].destroy(function(e){
      console.log("closed!", e)
      var newOptions = {initiator: true}
      if (this.stream != null) {
        newOptions.stream = this.stream
      } else {
        console.log('stream is null')
      }
      var options = extend(newOptions, this._peerOptions)

      this.peers[id] = new SimplePeer(options)
      this._attachPeerEvents(this.peers[id], id)

    }.bind(this))
  }.bind(this))
//  this._connectToPeers.bind(this)
}
// userData contains all information about the local user:
// -uuid
// -nickname
// -track information
// whenever it is updated, new data is sent to all connected peers
MultiPeer.prototype.updatePeerData = function (data) {
  this._userData = data
  this.sendToAll(JSON.stringify({ type: 'updatePeerData', message: this._userData }))
}
// Once the new peer receives a list of connected peers from the server,
// creates new simple peer object for each connected peer.
MultiPeer.prototype._connectToPeers = function (id, peers) {
  this.emit('peers', peers)

  peers.forEach(function (id) {
    var newOptions = {initiator: true}
    if (this.stream != null) {
      newOptions.stream = this.stream
    } else {
      console.log('stream is null')
    }
    var options = extend(newOptions, this._peerOptions)

    this.peers[id] = new SimplePeer(options)
    this._attachPeerEvents(this.peers[id], id)
  }.bind(this))
}

// receive signal from signalling server, forward to simple-peer
MultiPeer.prototype._handleSignal = function (data) {
  // if there is currently no peer object for a peer id, that peer is initiating a new connection.
  if (!this.peers[data.id]) {
    this.emit('new peer', data)
    var options = extend({stream: this.stream}, this._peerOptions)
    this.peers[data.id] = new SimplePeer(options)
    this._attachPeerEvents(this.peers[data.id], data.id)
  }
  this.peers[data.id].signal(data.signal)
}

// handle events for each connected peer
MultiPeer.prototype._attachPeerEvents = function (p, _id) {
  p.on('signal', function (id, signal) {
    console.log('signal')
    //  console.log("peer signal sending over sockets", id, signal)
    this.signaller.emit('signal', {id: id, signal: signal})
  }.bind(this, _id))

  p.on('stream', function (id, stream) {
    console.log('E: stream', id, stream)
    //  console.log("received a stream", stream)
    this.emit('stream', id, stream)
  }.bind(this, _id))

  p.on('connect', function (id) {
    console.log("connected to ", id)
    this.emit('connect', id)

   this.peers[id].send(JSON.stringify({ type: 'updatePeerData', message: this._userData }))

    //when connected, emit user information to other peers

    //this.sendToAll(JSON.stringify({ type: 'updatePeerData', message: this._userData }))

  }.bind(this, _id))

  p.on('data', function (id, data) {
    console.log('data', id)
    this.emit('data', {id: id, data: JSON.parse(data)})
  }.bind(this, _id))

  p.on('close', function (id) {
    console.log('CLOSED')
    delete (this.peers[id])
    this.emit('close', id)
  }.bind(this, _id))
}

module.exports = MultiPeer
