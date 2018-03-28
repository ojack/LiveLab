'use strict'

const html = require('choo/html')
const Modal = require('./components/modal.js')
const input = require('./components/input.js')

module.exports = configureOscForwarding

function configureOscForwarding (oscInfo, emit, showElement) {
  return html`
    ${Modal({
      show: showElement,
      header: 'Configure OSC Forwarding',
      contents: html`<div class="pa3 f6 fw3">
            ${input('port', 'port', {
              value: oscInfo.port,
              onkeyup: (e) => {
                emit('osc:setOscForwardPort', e.target.value)
              }
            })}
            <div class="f6 link dim ph3 pv2 mb2 dib white bg-dark-pink pointer" onclick=${() => (emit('osc:setLocalOscForward', oscInfo))}>Start</div>
        </div>`,
      close: () => (emit('osc:doneConfiguringOsc'))
    })}
    `
}
