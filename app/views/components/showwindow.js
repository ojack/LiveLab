'use strict'

const html = require('choo/html')
const xtend = require('xtend')
const Nano = require('nanocomponent')

module.exports = ShowWindow

// Video container component that accepts a mediaStreamTrack as well as display parameters
function ShowWindow () {
  if (!(this instanceof ShowWindow)) return new ShowWindow()
  this.props = {
    fullscreen: false,
    track: null,
    open: false,

  }
  this.video=  null,
  this.win = null
  Nano.call(this)
}

ShowWindow.prototype = Object.create(Nano.prototype)

ShowWindow.prototype.createElement = function (props, onClose) {
    this.onClose = onClose
    console.log("creating el", props, this.props.open, this)
    if(props.open===true){
      this.initWindow()
    }

    this.props.open = props.open
    this.props.track = props.track
    // var defaultHtmlProps = {
    //   autoplay: 'autoplay',
    //   muted: 'muted'
    // }
    // var _htmlProps = xtend(defaultHtmlProps, this.props.htmlProps)
    //
    // var el = html`<video ${_htmlProps}></video>`
    // if(this.props.id && this.props.track) addTrackToElement(this.props.track, el)
    return html`<div></div>`

}
//to do: check whether popup blocked
ShowWindow.prototype.initWindow = function(){
  console.log("initing window")
  var windowSettings = "popup=yes,menubar=no,location=no,resizable=no,scrollbars=no,status=no,toolbar=no,location=no,chrome=yes";
  this.win = window.open(null, "show", windowSettings)

  this.win.onbeforeunload = this.onClose
  this.video = this.win.document.createElement('video')
  this.video.autoplay = true


  this.win.document.body.appendChild(this.video)
}

function addTrackToElement(track, element){
  console.log("TRACK", track)
  var tracks = []
  tracks.push(track)
  var stream = new MediaStream(tracks) // stream must be initialized with array of tracks, even though documentation says otherwise
  element.srcObject = stream
}

// update stream if track id has changed
ShowWindow.prototype.update = function (props) {
  console.log("update win", props, this.props)
  this.props.track = props.track
  if(props.open===true){
    if(this.props.open !== true){
      this.initWindow()
      if(props.track) addTrackToElement(props.track, this.video)
    }
    if(props.track.id!==this.props.track.id) addTrackToElement(props.track, this.video)
  } else {
    if(!this.win.closed) this.win.close()
  }
  this.props.open = props.open
  this.props.track = props.track
  //
  //
  // if (props.track && props.track != null) {
  //
  // //  if(props.needsUpdate === true || props.id !== this.props.id) {
  //   if(props.track !== this.props.track) {
  //     console.log("rendering", props.track)
  //     this.props.track = props.track
  //     this.props.id = props.id
  //     addTrackToElement(this.props.track, this.element)
  //   }
  // }

  return false
}
