const expose = require('choo-expose')
const log = require('choo-log')
const choo = require('choo')

const app = choo()

// if in dev mode, show logging in console and expose global app object
// if (process.env.NODE_ENV === 'development') {
app.use(log())
app.use(expose())
// }

app.use(require('./models/userModel.js'))
app.use(require('./models/devicesModel.js'))
app.use(require('./models/mediaModel.js'))
app.use(require('./models/peersModel.js'))

app.route('/', require('./views/main.js'))

app.mount('body div')
