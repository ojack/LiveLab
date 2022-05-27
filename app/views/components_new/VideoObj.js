const Component = require('choo/component')
const html = require('choo/html')

const css = (style, el) => {
  Object.entries(style).forEach(([key, value]) => {
    el.style[key] = value
  })
}

module.exports = class VideoObj extends Component {
  constructor(opts) {
   
    super(opts)
    console.log('creating', opts)
   this.nick = opts
  }

  update(srcObject = "", style = {}, nick = null, state) {
  //  console.log('video src2', srcObject, this.element.srcObject)
    if(srcObject !== this.element.srcObject) {
  //    console.log('setting src object', srcObject, this._el)
      this.element.srcObject = srcObject
      this.element.oncanplay = () => {
        this.element.muted = true
        this.element.play()
      }
    }

    // this.element.setAttribute('id', nick)
    // hacky, expose video element to api for use in livecoding
    // if(id !== null) {
    //   if(state) state.api.videos[id] = this.element
    //   this.element.setAttribute('id', nick)
    // }
    // window.stream = srcObject
    //css(style, this.element)
    css(Object.assign({}, { 
      'width': '100%',
      'height': '100%', 
      position: 'relative', left: '0px', top: '0px'
    }, style), this.element)

    console.log('vide el', nick, state, srcObject, style)
     if(nick !== null) {
       console.log('setting values', this.element)
      if(state) state.api.videos[nick] = this.element
      this.element.setAttribute('livelab-nick', nick)
     this.nick = nick
     this.state = state
    }
    return false
  }

  load(){
    this.element.oncanplay = () => {
      this.element.muted = true
      this.element.play()
    }

  }

  createElement(srcObject = "", style = {}, nick = null, state) {
    console.log('creating vide el', nick, state, srcObject, style)

    //this.srcObject = srcObject
    let el = html`<video autoplay=true loop=true controls=false muted=true class="w-100 h-100"></video>`
    if(srcObject !== "")  el.srcObject = srcObject
    if(nick !== null) {
      console.log('setting values', this.element)
     if(state) state.api.videos[nick] = el
     this.nick = nick
      this.state = state
     el.setAttribute('livelab-nick', nick)
   }
    css(Object.assign({}, { 
      'width': '100%',
      'height': '100%', 
      position: 'relative', left: '0px', top: '0px'
    }, style), el)
    return el
  }
}
