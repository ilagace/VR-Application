var express = require('express');

var app = express();

var port = process.env.PORT || 8080;

app.use(express.static('demo'));
app.use('/vr', express.static('demo'));
app.set('views','demo');
app.set('view engine','ejs');

app.get('/vr', function (req, res) {
    res.render('index3');
});

app.listen(port, function (err) {
    console.log('running index3 on port ' + port);
});
