'use strict'
const html = require('choo/html')

module.exports = mediaListView

function mediaListView (state, emit) {
  return html`

    <div >
        <h3 class="f6 lh-copy"> AVAILABLE MEDIA: </h3>
        <table>
          <tr>
            <th>NAME</th>
            <th>ID</th>
            <th>KIND</th>
            <th>PEER</th>
          </tr>
          ${state.media.all.map((id) => {
            var media = state.media.byId[id]
            return html`
              <tr>
                <td class="pa1">${media.name}</td>
                <td class="pa1">${media.track.id}</td>
                <td class="pa1">${media.track.kind}</td>
                <td class="pa1">${state.peers.byId[media.peerId].nickname}</td>
              </tr>
            `
          })}
      </table>
        <div class="f6 link dim ph3 pv2 mb2 dib white bg-dark-pink pointer" onclick=${() => (emit('devices:toggleAddBroadcast', true))}>+ Add Broadcast</div>
    </div>
    `
}
