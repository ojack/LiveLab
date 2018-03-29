'use strict'
const html = require('choo/html')

module.exports = displayPreview

function displayPreview (display, emit) {
  return html`
    <div class="display row">
      <div class="video-holder">
        <div class="video"></div>
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
