'use strict'

const html = require('choo/html')
const xtend = require('xtend')
var Nano = require('nanocomponent')

module.exports = VideoContainer

// Video container component that accepts a mediaStreamTrack as well as display parameters
function VideoContainer () {
  if (!(this instanceof VideoContainer)) return new VideoContainer()
  Nano.call(this)
}

VideoContainer.prototype = Object.create(Nano.prototype)

VideoContainer.prototype._render = function () {
  if (!this.element) {
    var defaultHtmlProps = {
      autoplay: 'autoplay',
      muted: 'muted'
    }
    var _htmlProps = xtend(defaultHtmlProps, this.props.htmlProps)
    this.element = html`<video ${_htmlProps}></video>`
  }

  if (this.props.track && this.props.track != null) {
    var tracks = []
    tracks.push(this.props.track.track)
    this._stream = new MediaStream(tracks) // stream must be initialized with tracks, even though documentation says otherwise
    this.element.srcObject = this._stream
  }

  return this.element
}

// call "render" if track property has changed
VideoContainer.prototype._update = function (props) {
  return this.props.track !== props.track
}
