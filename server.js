// modules
var express = require('express');
var compression = require('compression');
var app = express();
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

// read port from environment, otherwise default to 8080
var port = process.env.PORT || 8080;

// setup db
var db = require('./config/db');
mongoose.connect(db.url, {
    user: db.mongoUser,
    pass: db.mongoPassword
});

// setup app
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(compression());
app.use(express.static(__dirname + '/public'));

// routes
require('./app/routes')(app);

//startup
app.listen(port);
console.log('Server started on port ' + port  + '..');
