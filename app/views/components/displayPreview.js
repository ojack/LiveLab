'use strict'
const html = require('choo/html')
const VideoEl = require('./videocontainer.js')

const displayVideo = new VideoEl()

module.exports = displayPreview

function displayPreview (display, emit) {
  var track = display.tracks[display.active]
  return html`
    <div class="display row">
      <div class="video-holder">
        <div class="video">
        ${displayVideo.render({
          htmlProps: {
            class: 'h-100 w-100'
          },
          track: track !== null  ? track.track : null,
          id: track !== null ?  track.track.id : null
        })}
        </div>
        <div class="video-title display-title">
          ${display.title}
        </div>
      </div>
      <div class="slider-container">
          <input type="range" orient="vertical" min="1" max="100" value=${display.opacity} class="slider" id="myRange">
      </div>
    </div>
  `
}
