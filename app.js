const expose = require('choo-expose')
const log = require('choo-log')
const choo = require('choo')

const app = choo()

// if in dev mode, show logging in console and expose global app object
// if (process.env.NODE_ENV === 'development') {
app.use(log())
app.use(expose())
// }

console.log(window.location)
app.use(require('./models/devicesModel.js'))
app.use(require('./models/mediaModel.js'))
app.use(require('./models/peersModel.js'))
app.use(require('./models/userModel.js'))
app.use(require('./models/uiModel.js'))

app.route('/index.html', require('./views/main.js'))

app.mount('body div')
