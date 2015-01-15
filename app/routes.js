var Screen = require('./models/screen');
var Sample = require('./models/sample');
var Image = require('./models/image');

module.exports = function(app) {

    // index route
    app.get('/', function(req, res) {
        res.sendfile('index.html');
    });

    // get all screen documents
    app.get('/api/screens', function(req, res) {
        Screen
          .find({})
          .exec(function(err, data) {
            if (err) res.send(err);
            res.json(data);
          });
    });

    // get all samples
    app.get('/api/samples/:screen', function(req, res) {
        Sample
        .find({ 'screen': req.params.screen })
        .exec(function(err, json) {
            if (err) res.send(err);
            res.json(json);
        });
    });

    // get image thumbnails
    app.get('/api/images/', function(req, res) {
      Image
        .find({
          'sample_id': { $in: req.query.sample_ids }
        })
        .select('image_thumb')
        .exec(function(err, data){
          if (err) res.send(err);
          res.json(data)
        });
    });

    // default route
    app.use(function(req, res) {
        res.redirect('/');
    });

};
