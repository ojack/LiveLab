const html = require('choo/html')
const Component = require('choo/component')
const browserglue = require('browserglue')
const { button } = require('./formElements.js')

module.exports = class Browserglue extends Component {
  constructor(id, state, emit) {
    super(id)

    // Multipeer channel for keeping browserglue channels in sync between peers
    this.syncChannel = state.multiPeer.addChannel('browserglue-sync', {});
    this.user = state.user;
    this.channels = {};

    const bg = new browserglue.Client()

    console.log('created browserglue', bg)
    bg.on('connect', () => {
      console.log("[connect]")
      this.rerender()
    });
    bg.on('disconnect', () => {
      console.log("[disconnect]")
      this.rerender()
    });
    bg.on('change', channels => console.log("[change]", channels));
    bg.on('add-channel', ({ path }) => {
      console.log("[add-channel]", path);
      const channel = bg.channels[path];
      if (channel) {
        channel.on('message', async blob => {
          // Forward messages to all peers through the sync channel
          this.syncChannel.send('message', { event: 'message', path, data: blob });

          const text = await blob.text();
          console.log(path, text);
        });
      } else {
        console.warn("Channel is not defined?");
      }

      // Notify all peers that a new channel was added
      this.syncChannel.send('message', { event: 'add-channel', path });
    });
    bg.on('remove-channel', ({ path }) => {
      console.log("[remove-channel]", path);
      this.syncChannel.send('message', { event: 'remove-channel', path });
    });
    bg.on('bind-port', ({ path, port }) => console.log("[bind-port]", path, port));
    bg.on('subscribe-port', ({ path, port }) => console.log("[subscribe-port]", path, port));
    bg.on('unsubscribe-port', ({ path, port }) => console.log("[unsubscribe-port]", path, port));
    this.bg = bg

    window.browserglue = this;

    this._handleSyncMessages();
  }

  get isConnected() {
    return this.browserglue && this.browserglue.isConnected;
  }

  update() {
    return false
  }

  async addChannel(path = '/d', port = '54321') {
    if (this.bg.channels[path]) return;
    return await this.bg.addChannel(path, port)
  }

  createElement(state) {
    return html`<div>
      ${this.isConnected ? html`<div>connected to browserglue at ${this.bg.url}
      ${button({
      text: 'add channel',
      onClick: () => this.addChannel(),
      classes: 'bg-dark-pink b fr mv2'
    })}
        </div>`
        : `browserglue not connected`}
    </div>`
  }

  _handleSyncMessages() {
    this.syncChannel.on('message', (message, peer) => {
      // Ignore messages sent by the same peer
      if (peer.id === this.user.uuid) {
        console.log("ignore my message...")
        return;
      }

      // Handle sync messages
      switch (message.event) {
        case 'message': {
          const { path, data } = message;
          const channel = this.channels[path];
          if (channel) channel.publish(data);
          break;
        }
        case 'add-channel': {
          const { path } = message;
          if (!this.bg.channels[path]) {
            this.bg.addChannel(path);
          }
          if (!this.channels[path]) {
            this.channels[path] = { owner: peer };
          }
          break;
        }
        case 'remove-channel': {
          const { path } = message;
          this.bg.removeChannel(path);
          delete this.channels[path];
          break;
        }
        default:
          console.warn('[browserglue] Unhandled sync message:', message);
      }
    });
  }
}
