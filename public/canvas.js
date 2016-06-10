// variable to simulate particpants
var randomNumberOfParticipants = Math.floor(Math.random() * 8) + 1;

document.addEventListener('DOMContentLoaded', function(){
    console.log(randomNumberOfParticipants);

    createVideo("http://clips.vorwaerts-gmbh.de/big_buck_bunny", "video-stream");
    for (var i = 0; i < randomNumberOfParticipants; i++) { 
        createVideo("http://clips.vorwaerts-gmbh.de/big_buck_bunny", "stream-" + i);
    }

    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    var cw = Math.floor(canvas.clientWidth / 1);
    var ch = Math.floor(canvas.clientHeight / 1);
    canvas.width = cw;
    canvas.height = ch;

    draw(context, cw, ch);
}, false);

// function canvas2canvas(smallCanvas, c, w, h, canvasNumber) {
//     c.drawImage(smallCanvas, w * canvasNumber / randomNumberOfParticipants, 0, w/randomNumberOfParticipants, h);
//     setTimeout(canvas2canvas, 20, smallCanvas, c, w, h, canvasNumber);
// }

function createVideo(vidSrc, vidId) {
        var video = document.createElement("video");
        video.id = vidId;
        video.style = "display: none";
        video.autoplay = true;
        video.loop = true;
        video.muted = true;

        // add the video sources
        var source1 = document.createElement("source");
        source1.src = vidSrc + ".mp4";
        source1.type = "video/mp4";
        video.appendChild(source1)

        var source2 = document.createElement("source");
        source2.src = vidSrc + ".webm";
        source2.type = "video/webm";
        video.appendChild(source2)
        document.getElementById("streams").appendChild(video);
}

function draw(c, w, h) {
    // draw the smaller streams, sharing the top half of the screen
    for (var i = 0; i < randomNumberOfParticipants; i++) { 
        var v = document.getElementById("stream-" + i );
        c.drawImage(v, w * i / randomNumberOfParticipants, 0, w/randomNumberOfParticipants, h/2);
    }
    // draw the large video stream
    // in the bottom half of the screen
    // NOTE: currently has a visual bug, with a border separating the two
    // portions of the canvas - dunno what is the cause
    v = document.getElementById("video-stream");
    c.drawImage(v, 0, h/2, w, h/2);
    setTimeout(draw, 20, c, w, h);
}
