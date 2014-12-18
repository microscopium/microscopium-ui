var Screen = require('./models/screen');

module.exports = function(app) {

    // index route
    app.get('/', function(req, res) {
        res.sendfile('index.html');
    });

    // get all data from mongo
    app.get('/api/screens', function(req, res) {
        Screen.find(function(err, data) {
            if (err) res.send(err);
            res.json(data);
        });
    });

    // default route
    app.use(function(req, res) {
        res.redirect('/');
    });

};
