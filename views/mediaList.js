'use strict'
const html = require('choo/html')

module.exports = mediaListView

function mediaListView (state, emit) {
  return html`

    <div >
        <h3 class="f6 lh-copy"> AVAILABLE MEDIA: </h3>
        <table>
          <tr>
            <th>ID</th>
            <th>PEER</th>
            <th>KIND</th>
          </tr>
          ${state.media.all.map((id) => {
            var media = state.media.byId[id]
            return html`
              <tr>
                <td>${media.trackId}</td>
                <td>${state.peers.byId[media.peerId].nickname}</td>
                <td>${media.kind}</td>
              </tr>
            `
          })}
      </table>
        <div class="f6 link dim ph3 pv2 mb2 dib white bg-dark-pink pointer" onclick=${() => (emit('user:modalAddBroadcast', true))}>+ Add Broadcast</div>
    </div>
    `
}
