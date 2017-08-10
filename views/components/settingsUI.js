'use strict'

const html = require('choo/html')
const xtend = require('xtend')
const radioSelect = require("./radioSelect.js")
module.exports = settingsUI

// generate ui based on JSON object
function settingsUI (opts) {
  var uiArray = []
  for(var key in opts.settings){
    if(opts.settings[key] && opts.settings[key].type){
      var obj = opts.settings[key]
      if(obj.type==="boolean"){
        uiArray.push(createBooleanElement(key, obj, opts.onChange))
      }
    }
  }
  return html`<div>
    ${uiArray}
    </div>`
}

function handleSettingChange(callback, e){
  console.log("e", e)
  console.log("cb", callback)
  console.log("this", this)
  var update = {}
  var val = e.target.value
  //convert from string to bool if type = boolean
  if(this.type==="boolean"){
    val = (val === "true")
  }
  update[e.target.name] = {
    value: val
  }
  callback(update)
}

//to do: abstract into its own class that inherits from radio element
function createBooleanElement(label, obj, callback){
  return radioSelect({
    label: label,
    options:  [
          { name: label,
            checked: obj.value,
            value: "true" },
          { name: label,
            checked: !obj.value,
            value: "false" }
        ],
        onChange: handleSettingChange.bind(obj, callback)
  })
}
