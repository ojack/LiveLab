const html = require('choo/html')
const Component = require('choo/component')
const browserglue = require('browserglue')
const { button } = require('./formElements.js')

module.exports = class Browserglue extends Component {
  constructor (id, state, emit) {
    super(id)
    const bg = new browserglue.Client()
    this.isConnected = false
    console.log('created browserglue', bg)
    bg.on('connect', () => {
      console.log("[connect]")
      this.isConnected = true
      this.rerender()
    });
    bg.on('disconnect', () => {
      console.log("[disconnect]")
      this.isConnected = false
      this.rerender()
    });
    bg.on('change', channels => console.log("[change]", channels));
    bg.on('add-channel', ({ path }) => console.log("[add-channel]", path));
    bg.on('remove-channel', ({ path }) => console.log("[remove-channel]", path));
    bg.on('bind-port', ({ path, port }) => console.log("[bind-port]", path, port));
    bg.on('subscribe-port', ({ path, port }) => console.log("[subscribe-port]", msg));
    bg.on('unsubscribe-port', ({ path, port }) => console.log("[unsubscribe-port]", msg));
    this.bg = bg
  }

  update () {
    return false
  }

  async addChannel({name = 'test', port = '54321'}) {
    const thisChannel = await this.bg.addChannel(name, port)

    thisChannel.on('message', async blob => {
      const text = await blob.text();
      console.log("[/bar]", text);
    });
  }

  createElement (state) {
    return html`<div>
      ${this.isConnected ? html`<div>connected to browserglue at ${this.bg.url}
      ${button({
        text: 'add channel',
        onClick: this.addChannel.bind(this),
        classes: 'bg-dark-pink b fr mv2'
      })}
        </div>`
      : `browserglue not connected`}
    </div>`
  }
}
