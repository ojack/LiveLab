'use strict'

const html = require('choo/html')
const xtend = require('xtend')
const assert = require('assert')

module.exports = Modal

// reusable input element
function Modal (opts) {
  assert.equal(typeof opts, 'object', 'Modal: opts should be type object')

  if (opts.show=== true) {

    // to do: utf-8 special character is not working, ideally would be &times; for close button
    return html`

        <div class="fixed vh-100 dt w-100 bg-black top-0 left-0" style="background-color: rgba(0, 0, 0, 0.5)">
          <div class="dib w-70 h-70 bg-dark-gray" style="position:absolute;left:50%;top:50%;transform:translate(-50%, -50%)">
            <div class="bg-gray pv2 ph3">
              <span class="fr f4 fw4 pointer" onclick=${opts.close}> x </span>
              <h3 class="f4 fw2 pa0 ma0"> ${opts.header} </h3>
            </div>
            ${opts.contents}
          </div>
        </div>

    `
  } else {
    return null;
  }
}
