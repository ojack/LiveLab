'use strict'
const html = require('choo/html')

module.exports = mediaListView

function mediaListView (state, emit) {
  return html`

    <div class="pa3 dib">
        <table cellspacing="0" cellpadding="0" class="collapse overflow-scroll">
          <thead>
            <tr>
              <th>PEER</th>
              <th>NAME</th>
              <th>ID</th>
              <th>KIND</th>
            </tr>
          </thead>
          <tbody>
          ${state.media.all.map((id) => {
            var media = state.media.byId[id]
            var className = id == state.ui.inspector.trackId ? "bg-gray pointer" : "dim pointer"
            console.log(id, state.ui.inspector.trackId)
            return html`
              <tr class=${className} style="height:20px" onclick=${()=>{emit('user:setInspectMedia', id)}}>
                <td class="pa1" style="height:20px">${state.peers.byId[media.peerId].nickname}</td>
                <td class="pa1" style="height:20px">${media.track.kind}</td>
                <td class="pa1" style="height:20px">${media.name}</td>
                <td class="pa1" style="height:20px">${media.track.id}</td>
              </tr>
            `
          })}
          </tbody>
      </table>
        <div class="f6 fr ma2 link ph3 pv2 mb2 white bg-dark-pink pointer" onclick=${() => (emit('devices:toggleAddBroadcast', true))}>+ Add Broadcast</div>
    </div>
    `
}
