var express = require('express'),
app = express(); 
app.use('/', express.static(__dirname + '/'));
app.listen(80, function(){
  console.log('Express listening on port', this.address().port);
});