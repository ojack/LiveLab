var express = require('express');

var app = express();

app.set('port', process.env.PORT || 2013);
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
		res.render('index');
});

var server = require('http').createServer(app);
server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

