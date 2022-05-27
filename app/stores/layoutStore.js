const videogrid = require('../views/videogrid.js')

const debounce = require('./../lib/utils.js').debounce

module.exports = (state, emitter) => {
  state.layout = {
    panels: {
      chat: false,
      audio: false,
      users: false,
      addMedia: false,
      settings: false
    },
    switchers: {
      a: false,
      b: false,
      c: false,
      d: false
    }, // whether switcher panels are open
    settings: {
      stretchToFit: true,
      switchers: {
        a: null,
        b: null,
        c: null,
        d: null
      }, // stream values of each switcher
      numberOfSwitchers: 0, // number of switchers to display in ui
      columnLayout: false,
      focusLayout: true,
      showCommunicationInfo: true
    },
    // object for storing elements that should appear in communication window
    communication: {
      focusedIndex: null,
      focus: [],
      grid: []
    },
    collapsed: false, // when a message is received, force chat to open until the user closes it
    forceChatOpen: false
  }

  state.style = {
    colors: {
      text0: '#eee',
      text1: '#ccc', // nearly white
      text2: '#999', // gray
      accent0: '#D5008F', // yellow
      accent1: '#00F',
      background0: '#333', // drak gray
      background1: '#555'
    }
  }

  state.multiPeer.on('update', () => {
    updateGrid()
    emitter.emit('render')
  })
  function updateGrid() {
    const elements = state.multiPeer.streams
    .map((stream) => ({ type: 'media', stream: stream, id: stream.stream.id}))
    
    if(state.layout.settings.focusLayout === true) {
      let focus = [], grid = []
      elements.forEach((gridElement) => {
        if (gridElement.id === state.layout.communication.focusedIndex) {
          focus.push(gridElement)
        } else {
          grid.push(gridElement)
        }
      })
      state.layout.communication.grid = grid
      state.layout.communication.focus = focus
    } else {
      state.layout.communication.grid = elements
      state.layout.communication.focus = []
    }
  
  }

  // @todo only call this as necessary
  // emitter.on('render', () => {
  //   updateGrid()
  // })

  emitter.on('layout:setFocusElement', (gridElementId) => {
    console.log(gridElementId)
    state.layout.communication.focusedIndex = state.layout.communication.focusedIndex === gridElementId ? null : gridElementId
    updateGrid()
    emitter.emit('render')
  })

  emitter.on('layout:collapseMenu', () => {
    state.layout.collapsed = true
    emitter.emit('render')
  })

  emitter.on('layout:openMenu', () => {
    state.layout.collapsed = false
    if (state.layout.forceChatOpen === true) {
      state.layout.panels.chat = true
      state.layout.forceChatOpen = false
    }
    emitter.emit('render')
  })

  emitter.on('layout:openChat', () => {
    if (state.layout.collapsed === true) {
      state.layout.forceChatOpen = true
    } else {
      state.layout.panels.chat = true
    }
    emitter.emit('render')
  })

  emitter.on('layout:toggleMenuItem', (item, type) => {
    state.layout[type][item] = !state.layout[type][item]
    // if user closes chat, no longer force to open
    if (item === 'chat') state.layout.forceChatOpen = false
    emitter.emit('render')
  })

  emitter.on('layout:setSettings', (item, value) => {
    state.layout.settings[item] = value
    if (item === 'focusLayout') updateGrid()
    emitter.emit('render')
  })

  emitter.on('layout:setSwitcher', (item, value) => {
    if (
      state.layout.settings.switchers[item] !== null &&
      state.layout.settings.switchers[item].stream.id === value.stream.id
    ) {
      state.layout.settings.switchers[item] = null
    } else {
      state.layout.settings.switchers[item] = value
    }
    emitter.emit('render')
  })

  window.addEventListener(
    'resize',
    debounce(
      () => {
        updateGrid()
        emitter.emit('render')
      },
      50
    )
  )
}