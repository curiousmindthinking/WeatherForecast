/**
  Setting up server.
  All the routes ued in the application are maintained here.
  Stats and Measurement routes are used for this application.
*/
var express = require('express'),
    bodyParser = require('body-parser');

var app = express();
var port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


var measurementRoutes = require('./Routes/measurementRoutes');
var statsRoutes = require('./Routes/statsRoutes');

app.use('/api/measurements', measurementRoutes);
app.use('/api/stats', statsRoutes);



app.get('/', function(req, res) {
    res.send('welcome to my api');
});

app.listen(port, function() {
    console.log('Gulp is running');
});