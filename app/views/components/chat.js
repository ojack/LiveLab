'use strict'
const html = require('choo/html')
const input = require('./input.js')

module.exports = chatView

function chatView (state, emit) {

  var scrollEl = html`<div onload=${(e) => console.log('loaded CHILD!', e)} class="h4 overflow-y-scroll">
    ${state.ui.chat.messages.map((obj)=>{
      return html`
        <tr>
          <th class="pa1">${obj.nickname}:</th>
          <td class="pa1">${obj.message}</td>
        </tr>
      `
    })}
  </div>`

//  scrollEl.scrollTop = scrollEl.scrollHeight
  //console.log('SROLL EL', scrollEl, scrollEl.scrollTop, scrollEl.scrollHeight)
  return html`
    <div onload=${(e) => console.log('loaded!', e)} class="pa2 dib w-100">
      ${scrollEl}
      ${input('', 'message', {
        value: state.ui.chat.current,
        onkeyup: (e) => {
          if(e.keyCode=== 13){
            emit('ui:sendChatMessage')
          } else {
            emit('ui:updateChat', e.target.value)
          }
        }
      })}
      <div class="f6 fr ma2 link ph3 pv2 mb2 white bg-dark-pink pointer" onclick=${() => (emit('ui:sendChatMessage'))}>Send</div>
    </div>
    `
}
