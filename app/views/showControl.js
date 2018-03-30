'use strict'
const html = require('choo/html')
const displayPreview = require('./components/displayPreview.js')
const trackSelector = require('./components/trackSelector.js')

module.exports = showControlView

function showControlView (state, emit) {
  return html`
  <div class="flex-container">
    <div class="header">
      <div class="col-sticky">
        <div class="header-text"> Displays </div>
      </div>
      <div class="col-scrollable">
        <div class="header-text">
          Video streams (Drag from shared media to add to workspace)
        </div>
      </div>
    </div>
    <div class="content-scrollable">
      <div class="col-sticky">
        ${state.show.displays.map((el, index) => displayPreview(el, index, emit))}
      </div>
      <div class="col-scrollable">
         ${state.show.displays.map((el, index) => trackSelector(el, index, state, emit))}
      </div>
    </div>
  </div>
  `
}
