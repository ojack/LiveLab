// const Video = require('./components/funvideocontainer.js')
const mediaContainer = require('./components_new/mediaContainer.js')
const html = require('choo/html')
const grid = require('./videogrid.js')
//const Iframe = require('./plugins/iframe.js')

const Iframe = require('./plugins/shared-hydra/index.js')

// @todo : use videoWidth rather than settings
// @todo: close popups on close
module.exports = (state, emit) => {
const elements = state.layout.communication.grid.map(({ stream, id }, index) => mediaContainer({ stream, index, id}, state, emit))
  // const elements = state.multiPeer.streams.map((stream, index) => mediaContainer({ stream, index}, state, emit))
console.log('grid', state.layout.communication.grid)
//  state.multiPeer.videos = elements

  // resize video grid based on screen dimensions
  let sideMargin = 0
  let bottomMargin = 0

  if (!state.layout.collapsed) {
    // if on small screen, make margin on bottom rather than side  @todo: use EM rather than pixels
    if (window.innerWidth < 480) {
      bottomMargin = 52 * 2
    } else {
      // get position of last panel in order to calculate grid space
      const panels = document.getElementsByClassName('panel')
      if (panels.length > 0) {
        let panelX = window.innerWidth
        for (const panel of panels) {
          const bounds = panel.getBoundingClientRect()
          // get element in top left corner
          if (bounds.y <= 0) {
            if (bounds.x < panelX) panelX = bounds.x
          }
        }
        sideMargin = Math.max(window.innerWidth - panelX, 52)
      }
    }
  }
  let content = null
  const gridOpts = {
    elements: elements,
    stretchToFit: state.layout.settings.stretchToFit,
    ratio: state.layout.settings.stretchToFit ? '4:3' : '16:9'
  }

  const focusLayout = state.layout.settings.focusLayout
  const outerHeight = window.innerHeight - bottomMargin
  const outerWidth = window.innerWidth - sideMargin
  // if(focusLayout === true && state.layout.communication.focus.length > 0) {
  if(focusLayout === true) {
    const vw = 240 // target video dimensions
    const vh = 200*3/4
    gridOpts.outerWidth = Math.min(vw*elements.length, window.innerWidth - sideMargin)
    gridOpts.outerHeight = vh
  } else {
    gridOpts.outerWidth = outerWidth
    gridOpts.outerHeight = outerHeight
  }

// RENDERING IFRAME
//  ${state.cache(Iframe, 'iframe-component').render(state, emit, { width: outerWidth, height: outerHeight-gridOpts.outerHeight})}
//    ${state.layout.communication.focus.map(({ stream, id }, index) => mediaContainer({ stream, index, id}, state, emit))}

  console.log('rendering', outerWidth, outerHeight)
  content = html`<div class="w-100 h-100">
    <div class="bg-black relative" id="presentation-content" style="
      width:${outerWidth}px;
      height:${outerHeight-gridOpts.outerHeight}px;
      transition: width 0.3s, height 0.3s, top 0.3s, left 0.3s;
    ">
    ${state.cache(Iframe, 'iframe-component').render(state, emit, { width: outerWidth, height: outerHeight-gridOpts.outerHeight})}
    </div>
    ${grid(gridOpts, emit)}
  </div>`

  return html`<div class="w-100 h-100 fixed top-0 left-0" style="color:${state.style.colors.text0}">${content}</div>`
}
