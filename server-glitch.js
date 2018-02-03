// slightly modified server file for hosting on glitch.com
// (uses http instead of https because glitch does https automatically)

var fs = require('fs');
var express = require('express')
var app = express();
var browserify = require('browserify-middleware')

var http = require('http')

var httpServer = http.createServer(app)

// browserify.settings({
//   transform: ['sheetify']
// })
// app.get('/bundle.js', browserify(__dirname + '/app/app.js'));

httpsServer.listen(8000, function(){
  console.log("server available at https://localhost:8000")

});

app.use(express.static(__dirname +'/public'));
