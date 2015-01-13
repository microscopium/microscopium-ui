var Screen = require('./models/screen');
var Sample = require('./models/sample');

module.exports = function(app) {

    // index route
    app.get('/', function(req, res) {
        res.sendfile('index.html');
    });

    // get all screen documents
    app.get('/api/screens', function(req, res) {
        Screen
          .find()
          .exec(function(err, data) {
            if (err) res.send(err);
            res.json(data);
          });
    });

    // get all keys for samples in screen
    app.get('/api/sample/:key/:screen', function(req, res) {
        Sample
          .find({ screen: req.params.screen })
          .select(req.params.key)
          .exec(function(err, feature_vectors) {
              if (err) res.send(err);
              res.json(feature_vectors);
          });
    });

    // default route
    app.use(function(req, res) {
        res.redirect('/');
    });

};
