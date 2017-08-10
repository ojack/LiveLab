'use strict'

const html = require('choo/html')
const xtend = require('xtend')
var Nano = require('nanocomponent')

module.exports = VideoContainer

// Video container component that accepts a mediaStreamTrack as well as display parameters
function VideoContainer () {
  if (!(this instanceof VideoContainer)) return new VideoContainer()
  this.props = {
    htmlProps: {}
  }
  Nano.call(this)
}

VideoContainer.prototype = Object.create(Nano.prototype)

VideoContainer.prototype.createElement = function () {

    var defaultHtmlProps = {
      autoplay: 'autoplay',
      muted: 'muted'
    }
    var _htmlProps = xtend(defaultHtmlProps, this.props.htmlProps)
    return html`<video ${_htmlProps}></video>`



}

// call "render" if track property has changed
VideoContainer.prototype.update = function (props) {
this.props.htmlProps = props.htmlProps

  if (props.track && props.track != null && props.id !== this.props.id) {
    this.props.track = props.track
    this.props.id = props.id
    var tracks = []
    tracks.push(this.props.track)
    this._stream = new MediaStream(tracks) // stream must be initialized with tracks, even though documentation says otherwise
    this.element.srcObject = this._stream
  }

  return false
}
