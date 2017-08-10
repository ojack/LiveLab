'use strict'

const html = require('choo/html')
const login = require('./login.js')
const communication = require('./communication.js')
const mediaList = require('./mediaList.js')
const AddBroadcast = require('./addBroadcast.js')

module.exports = mainView
//  <!--${AddBroadcast(state, emit)}-->
function mainView (state, emit) {
  if (!state.user.loggedIn) {
    return html`
    <div>
    ${login(state, emit)}
    ${AddBroadcast(state, emit)}
    </div>
    `
  } else {

    return html`
    <div>
      ${communication(state, emit)}
      ${mediaList(state, emit)}

    </div>

    `
  }
}
