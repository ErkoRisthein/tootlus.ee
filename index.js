const app = require('express')();
app.get('/', (req, res) => {
    res.send('Tootlus toodab!');
});
app.listen(80, function(){
  console.log('Express listening on port', this.address().port);
});