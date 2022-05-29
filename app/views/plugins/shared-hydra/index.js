var html = require('choo/html')
var Component = require('choo/component')
const { button } = require('../../formElements.js')

const repl = require('./repl.js')
const Hydra = require('hydra-synth')
//const flokURL = "https://flok.clic.cf/s/NjUxMWM2MjUtOTFlZi00NzNiLWJhNTUtMzVhNWIwY2U0MmFm?layout=hydra,hydra&noHydra=1&bgOpacity=0"

module.exports = class SharedHydra extends Component {
    constructor(id, state, emit) {
        super(id)
        this.user = state.user
        this.emit = emit
        // this.url = 'https://hydra.ojack.xyz'
        this.url = `https://flok.clic.cf/s/${state.user.room}?layout=hydra,hydra&noHydra=1&bgOpacity=0`

        const canvas = html`<canvas class="w-100 h-100 absolute top-0 left-0" style="image-rendering:pixelated" id="hydra-canvas"></canvas>`
        // canvas.width = width
        // canvas.height = height
        this.canvas = canvas
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight 

        this.hydra = new Hydra({
            detectAudio: false, canvas: canvas
           })

        // oject 
        this.activeSources = {}

        // attach a livelab source to a hydra 
       // window.setSrc = (hydraScource, LiveLabVideoId)
        this.hydra.s.forEach((source) => {
          source.initLiveLab = (id = '') => {
            console.log('%c initing live lab', 'background: #222; color: #bada55', id)
            this.activeSources[id] = source
            const vid = LiveLab.get(id)
            if(vid !== null) {
              source.init({ src: vid })
            }
          }
        })


        osc(4).out()
        this.channel = state.multiPeer.addChannel('shared-hydra', {})
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
          // console.log('CONNECTEDconnected')
          this.channel.send('requestURL', '')
        })

        LiveLab.on('update', () => {
          console.log('%c!!!!!streams updated',  'background: #22c; color: #bada55', LiveLab.videos)
          Object.entries(this.activeSources).forEach(([liveLabId, hydraSource]) => {
            const vid = LiveLab.get(liveLabId)
            if(vid !== null) {
              hydraSource.init({ src: vid })
            }
          })
        })
        this.inputValue = this.url

        let hasSynced = false
        // listen to flok events
        window.addEventListener("message", function (event) {
            //console.log('received message', event)
            if (event.data) {
                console.log(event.data)
                  if(event.data.cmd === "evaluateCode") {
                    //  console.log('evaluate', event.data.args.body)
                   // editor.style.opacity = 1
                //   ///  if(readOnly) setTimeout(() => editor.style.opacity = 1, 2000)
                //     if (event.data.args.editorId == 1) {
                //       agua.run(event.data.args.body)
                //     } else {
                      repl.eval(event.data.args.body)
                   // }

                  } else if (event.data.cmd === "initialSync") {
                    console.log('%c initial sync', 'background: #822; color: #bada55', event.data.args.editors)
                    if(event.data.args.editors[0])
                    if(!hasSynced) {
                      console.log('%c initial sync', 'background: #852; color: #bada55', event.data.args.editors)

                      const editorText = event.data.args.editors
                      // if either editor has text, perform sync
                      if(editorText[0] || editorText[1]) {
                        if(editorText[0]) repl.eval(editorText[0])
                        if(editorText[1]) repl.eval(editorText[1])
                        hasSynced = true
                      }
                    ///  if(editorText[1]) agua.run(editorText[1])
                    }
                   }
            }
        })
    }

    load(el) {
        window.container = el
        // console.log('REQUESTINGGGGGGGGG requesting URL!!')
        //setTimeout(() => { this.channel.send('requestURL', '') }, 2000)

    }

    update() {
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

    createElement(state, emit, { width = window.innerWidth, height = window.innerHeight }) {
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
       /* { <div class="flex h2">
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
            })}</div> *}*/
       

      //  osc().out()
        return html`  <div class="w-100 h-100 flex flex-column" style="">
            ${this.canvas}
            <div class="w-100 h-100 absolute flex flex-column">
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
            <iframe allow="camera;microphone" src=${this.url} class="flex-auto" style="border:0px;"></iframe>
            </div>
        </div>
        `
    }
}
