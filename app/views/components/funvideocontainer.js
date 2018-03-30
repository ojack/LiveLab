'use strict'

const html = require('choo/html')
const xtend = require('xtend')
const component = require('fun-component')
const spawn = require('fun-component/spawn')

const VideoContainer = component(function element (ctx, props) {
  console.log('rendering', ctx, props)
  var defaultHtmlProps = {
    autoplay: 'autoplay',
    muted: 'muted'
  }
  ctx.prev = Object.assign({}, props)
  var _htmlProps = xtend(defaultHtmlProps, props.htmlProps)
  //const reload = (id) => (console.log('reloading?', ctx))


  var el = html`<video ${_htmlProps}></video>`
  ctx.el = el
  // if (props.id && props.track) addTrackToElement(props.track, el)
  // el.play().then(() => {
  //   console.log('returning', el.srcObject)
  //   reload(props.id)
  // }).catch((error) => {
  //   console.log('MEDIA ERROR', error)
  //   // return el
  // })
  // console.log('PRE', el.srcObject)
  return el
})

VideoContainer.on('update', function (ctx, props) {
//  console.log('updattt context', ctx)
  // console.log('!updating ', props, prev)
  // console.log('updating ', props[0].id, prev[0].id)
  if (props[0].id) {
    if (props[0].id !== ctx.prev.id) {
      if (props[0].id !== null) {
        console.log('adding ', props[0].id, ctx.prev.id, ctx)
        addTrackToElement(props[0].track, ctx.el)
      } else {
        console.log('removing ', props[0].id, ctx.prev.id)
        ctx.el.srcObject = null
      }
    }
  } else {
    ctx.el.srcObject = null
  }
  ctx.prev = Object.assign({}, props[0])
  // return false
   return false
})

//VideoContainer.use(restate({id: ''}))
VideoContainer.use(spawn((props) => props.index))


function addTrackToElement (track, element) {
  console.log('adding ', track, element)
  var tracks = []
  tracks.push(track)
  var stream = new MediaStream(tracks) // stream must be initialized with array of tracks, even though documentation says otherwise
  element.srcObject = stream
}

module.exports = VideoContainer
