var html = require('choo/html')
var Component = require('choo/component')
const { button } = require('./../formElements.js')

module.exports = class Iframe extends Component {
  constructor (id, state, emit) {
    super(id)
    this.user = state.user
    this.emit = emit
   // this.url = 'https://hydra.ojack.xyz'
    this.url = `https://www.tldraw.com/r/livelab-${state.user.room}`
    this.channel = state.multiPeer.addChannel('iframe', {})
    this.channel.on('requestURL', (message, peer) => {
      console.log('URLL requested')
      this.channel.send('updateURL', this.url)
    })
    this.channel.on('updateURL', (message, peer) => {
      //this.addMessage(message, peer)
      this.inputValue = message
      this.setURL(message)
      console.log('received message', message, peer)
    })
    state.multiPeer.once('connect', () => {
      console.log('CONNECTEDconnected')
      this.channel.send('requestURL', '')
    })
    this.inputValue = this.url
  }

  load () {
    console.log('REQUESTINGGGGGGGGG requesting URL!!')
    //setTimeout(() => { this.channel.send('requestURL', '') }, 2000)

  }

  update () {
    return false
    //return true
  }

  // addMessage (message, user) {
  //   this.messages.push({ message: message, user: user, time: Date.now() })
  //   this.emit('layout:openChat')
  //   this.rerender()
  //   // for some reason this only works with getElementById??
  //   setTimeout(
  //     () => {
  //       const t = document.getElementById('scroll-container')
  //       t.scrollTop = t.scrollHeight
  //     },
  //     200
  //   )
  // }
  setURL(url = '') {
    this.url = url
    this.rerender()
  }

  updateURL () {
   this.channel.send('updateURL', this.inputValue)
    // this.channel.send('requestURL', this.inputValue)

    this.setURL(this.inputValue)
   // this.addMessage(this.inputValue, this.user)
    //this.inputValue = ''
    this.rerender()
  }

  createElement (state, emit, { width = window.innerWidth, height = window.innerHeight }) {
    // var scrollEl = html`<div id="testScroll" style="bottom:0px">
    //   ${this.messages.map(obj => {
    //     const msg = html`<span class="pa1"></span>`
    //     msg.innerHTML = anchorme({
    //       input: obj.message,
    //       options: {
    //         truncate: 100,
    //         attributes: { target: '_blank', class: 'white dim' }
    //       }
    //     })
    //     return html`
    //       <div class='mv2'>
    //         <span class="pr1 pt1 b">${obj.user.nickname}:</span>
    //         ${msg}
    //       </div>
    //     `
    //   })}
    // </div>`
    // var container = html`<div  id="scroll-container" class="overflow-y-auto" style="max-height:250px">
    //   ${scrollEl}
    // </div>`

    return html`  <div class="w-100 h-100 flex flex-column" style="">
          <div class="flex h2">
            <input type="text" placeholder="send a message" value=${this.inputValue} class="f7 pa1 w-100 white" style="background:none;border:solid 1px ${state.style.colors.text1}" onkeyup=${e => {
              if (e.keyCode === 13) {
                this.updateURL()
              } else {
                this.inputValue = e.target.value
                this.rerender()
              }
            }} />
            ${button({
              text: '',
              onClick: this.updateURL.bind(this),
              classes: 'bg-dark-pink b fr pa0 f7'
            })}</div>
            <iframe allow="camera;microphone" src=${this.url} class="flex-auto"></iframe>

        </div>
        `
  }
}
