const { app } = require('electron')
const path = require('path')
const window = require('electron-window')

app.on('ready', () => {
  const mainWindow = window.createWindow({ width: 1000, height: 800 })
  const indexPath = path.join(__dirname, 'index.html')
  mainWindow.showUrl(indexPath, () => {
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools({ mode: 'detach' })
    }
  })
  // open dev tools by default in dev mode
})
