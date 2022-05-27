// WIP public API for livelab, enabling livecoding of elements, etc. 


module.exports = class LiveLabApi {
    constructor(state) {
        this.state = state

        this.state.multiPeer.on('update', () => {
            console.log('multipeer updated', this.state)
        })

        this.videos = {}
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
            return this.videos[id]
        } else {
            // create blank video when none found
            const v = document.createElement('video')
            v.width = 200
            v.height = 200
            document.body.appendChild(v)
            return v
        }
    }
}