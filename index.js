const express = require('express');
const app = express();

app.use('/', express.static(__dirname + '/public/'));
app.use('/data', require('./routes/data'));

app.listen(80, function () {
  console.log('Express listening on port', this.address().port);
});
