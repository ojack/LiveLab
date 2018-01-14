var fs = require('fs');
var express = require('express')
var app = express();
var browserify = require('browserify-middleware')

var https = require('https')

var privateKey  = fs.readFileSync(__dirname + '/certs/key.pem', 'utf8');
var certificate = fs.readFileSync(__dirname +'/certs/certificate.pem', 'utf8');

var credentials = {key: privateKey, cert: certificate}

var httpsServer = https.createServer(credentials, app)

browserify.settings({
  transform: ['sheetify']
})
app.get('/bundle.js', browserify(__dirname + '/app/app.js'));

httpsServer.listen(8000, function(){
  console.log("server available at https://localhost:8000")

});

app.use(express.static(__dirname +'/public'));
