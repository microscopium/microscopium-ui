var Screen = require('./models/screen');
var Sample = require('./models/sample');
var Image = require('./models/image');

module.exports = function(app) {

    // index route
    app.get('/', function(req, res) {
        res.sendfile('index.html');
    });

    // get all screen ids
    app.get('/api/screen_ids', function(req, res) {
        Screen
            .find({})
            .select('_id')
            .exec(function(err, data) {
                if (err) res.send(err);
                res.json(data);
            });
    });

    // get specific screen document
    app.get('/api/screen/:id', function(req, res) {
        Screen
            .find({'_id': req.params.id})
            .exec(function(err, data) {
                if (err) res.send(err);
                res.json(data);
        });
    });

    // get all samples beloning to screen
    app.get('/api/samples/:screen', function(req, res) {
        Sample
        .find({ 'screen': req.params.screen })
        .exec(function(err, json) {
            if (err) res.send(err);
            res.json(json);
        });
    });

    // get specific sample
    app.get('/api/sample/:id', function(req, res) {
          Sample
            .find({ '_id': req.params.id })
            .exec(function(err, json) {
              if(err) res.send(json);
              res.json(json);
            })
    });

    // get value from sample document
    app.get('/api/sample/:key/:id', function(req, res) {
      Sample
        .find({ '_id': req.params.id })
        .select(req.params.key)
        .exec(function(err, data) {
          if (err) res.send(err);
          res.json(data)
        })
    });

    // get image thumbnails
    app.get('/api/images/', function(req, res) {
      Image
        .find({
          'sample_id': { $in: req.query.sample_ids }
        })
        .select('image_thumb sample_id')
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
