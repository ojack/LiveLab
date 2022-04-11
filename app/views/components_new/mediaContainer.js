// holder for a media stream containing audio, video, or both
// also contains controls for editing that stream

const Video = require('./VideoObj.js')
const html = require('choo/html')
const { openWindow } = require('./../../lib/utils.js')


module.exports = ({stream, index}, state, emit) => {
     //   let state.layout.settings.stretchToFit = state.layout.menu.state.layout.settings.stretchToFit
     let info = ''
     let endStream = ''
     let activeSwitchers = []
     if (state.layout.settings.showCommunicationInfo === true) {
       let videoSettings = ''
       let audioSettings = ''
       let windowOpen = ''
       let mute = ''
       let videoMute = ''
       let switcherControls = ''
       if (stream.settings && stream.settings.video) {
         videoSettings = `${stream.settings.video.width}x${stream.settings.video.height} ${stream.settings.video.frameRate}fps`
         videoMute = html`<i
            class="mh1 fas ${stream.isVideoMuted
           ? 'fa-video-slash dark-pink'
           : 'fa-video'} ${stream.isLocal ? 'pointer' : ''}" title=${stream.isLocal ? 'mute your video' : ''} onclick=${stream.isLocal ? () => {
             const tracks = stream.stream.getVideoTracks()
             tracks.forEach(track => {
               track.enabled = stream.isVideoMuted
             })
             state.multiPeer.updateLocalStreamInfo(stream.stream.id, {
               isVideoMuted: !stream.isVideoMuted
             })
           } : ''}>
          </i>`
         switcherControls = ['a', 'b', 'c', 'd']
           .splice(0, state.layout.settings.numberOfSwitchers)
           .map(switcher => {
             let isActive = false
             if (
               state.layout.settings.switchers[switcher] !== null &&
                 state.layout.settings.switchers[switcher].stream.id ===
                   stream.stream.id
             ) {
               activeSwitchers.push(switcher)
               isActive = true
             }
             return html`<i
                onclick=${() => emit('layout:setSwitcher', switcher, stream)}
                class="dim pointer ma2 b ttu"
                style=${isActive
               ? `color:${state.style.colors.accent0}`
               : ''} title="send video to switcher a">${switcher}
              </i>`
           })
         windowOpen = html`
          <span class="mh2"> | </span>
          <i
            onclick=${() => {
             const title = `${stream.peer.nickname}${stream.name !== ''
             ? ` - ${stream.name}`:``}`
             if(stream.stream && stream.settings.video) {
               openWindow({ stream: stream.stream, id: stream.stream.id, title: title, width: stream.settings.video.width, height: stream.settings.video.height })
             }
            }
           
         }
            class="fas fa-external-link-alt dim pointer ma2" title="open video into it's own window">
          </i>
          ${switcherControls}
          `
       }
       if (stream.settings && stream.settings.audio) {
         audioSettings = `${Math.round(
           stream.settings.audio.sampleRate / 1000
         )} khz`
         mute = html`<i
            class="mh1 fas ${stream.isAudioMuted
           ? 'fa-microphone-slash dark-pink'
           : 'fa-microphone'} ${stream.isLocal ? 'pointer' : ''}" title=${stream.isLocal ? 'mute your audio' : ''} onclick=${stream.isLocal ? () => {
             const tracks = stream.stream.getAudioTracks()
             tracks.forEach(track => {
               track.enabled = stream.isAudioMuted
             })
             state.multiPeer.updateLocalStreamInfo(stream.stream.id, {
               isAudioMuted: !stream.isAudioMuted
             })
           } : ''}>
          </i>`
       }
       endStream = stream.isLocal ? html` <div class="absolute top-0 right-0"><i
          onclick=${() => emit('user:endStream', stream)}
          class="fas fa-times dim pointer f3 pa3" title="end stream" style="text-shadow: 2px 2px 3px rgba(0, 0, 0, 1);">
        </i></div>` : ''
 
       info = html`  <div class="f4 absolute pa2 ph2 ma2 bottom-0 video-info" style="text-shadow: 2px 2px 3px rgba(0, 0, 0, 1);/*mix-blend-mode:difference*/">
           <span class="b mh2">${stream.peer.nickname}${stream.name !== ''
         ? ` - ${stream.name}`
         : ''}</span> ${videoMute} ${mute} ${windowOpen}
          </div>`
     }
 
     // let switcherOverlay = html`<container class="absolute w-100 h-100 top-0 left-0" style="font-size:60vmin;line-height:100vh">A</container>`
     const switcherOverlay = html`
     <container class="absolute h-100 w-100 top-0 left-0 flex" style="pointer-events:none">
       <svg viewBox="0 0 ${10 *
       activeSwitchers.length} 10" class= "h-60 w-60 ttu" style="fill:rgba(255, 255, 255, 0.5);margin:auto;overflow:visible;height:50%">
         <text x="0" y="10">${activeSwitchers}</text>
       </svg>
     </container>`
 
     return html`<div class='w-100 h-100 video-container relative' style=${state.layout.settings.stretchToFit
       ? ''
       : 'border:1px solid #555;'}>
       ${state
       .cache(Video, `video-${index}`)
       .render(stream.stream, {
         objectFit: state.layout.settings.stretchToFit ? 'cover' : 'contain'
       }, "livelab-video")}
       ${info}
       ${endStream}
       ${switcherOverlay}
      </div>`
}