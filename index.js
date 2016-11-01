const config = require('./config');

const express = require('express');
const app = express();

app.use('/', express.static(__dirname + '/public/'));
app.use('/data', require('./routes/data'));

app.listen(config.port || 1337, function () {
  console.log('Express listening on port', this.address().port);
});
