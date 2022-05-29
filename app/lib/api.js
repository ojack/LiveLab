// WIP public API for livelab, enabling livecoding of elements, etc. 
var EventEmitter = require('events').EventEmitter

module.exports = class LiveLabApi extends EventEmitter {
    constructor(state) {
        super()
        this.state = state

        this.state.multiPeer.on('update', () => {
            console.log('multipeer updated', this.state)
        })

        this.videos = {}
    }

    // video should be set within LiveLab
    _setVideo(id, video) {
        const prevValue = this.videos[id]
        this.videos[id] = video
        if(prevValue !== video) {
            console.log('UPDATING', this.videos, video.videoWidth)
            // video.videoWidth = 100
            // video.videoHeight = 100
           // setInterval(() => 
            this.emit('update', this.videos)
            //, 1000)
        }
    }

    get(id = '') {
        // const matches = []
        // this.state.multiPeer.streams.forEach((stream) => {
        //     if(stream.peer && stream.peer.nickname.indexOf(id) > -1) {
        //         matches.push(stream.videoEl)
        //     }
        // })
        // console.log('found matching videos', matches)
        if(this.videos.hasOwnProperty(id)) {
           // console.log('found matching videos', id)
            return this.videos[id]
        } else {
            // // create blank video when none found
            // const v = document.createElement('video')
            // v.width = 200
            // v.height = 200
            // document.body.appendChild(v)
            // return v
            return null
        }
    }
}