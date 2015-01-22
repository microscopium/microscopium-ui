var Screen = require('./models/screen');
var Sample = require('./models/sample');
var Image = require('./models/image');

var resHandler = function(res) {
  return function(err, data) {
    if(err) res.json(err);
    res.json(data);
  }
};

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
            .exec(resHandler(res));
    });

    // get specific screen document
    app.get('/api/screen/:id', function(req, res) {
        Screen
            .find({'_id': req.params.id})
            .exec(resHandler(res));
    });

    // get all samples beloning to screen
    app.get('/api/samples/:screen', function(req, res) {
        Sample
        .find({ 'screen': req.params.screen })
        .exec(resHandler(res));
    });

    // get specific sample
    app.get('/api/sample/:id', function(req, res) {
          Sample
            .find({ '_id': req.params.id })
            .exec(resHandler(res))
    });

    // get value from sample document
    app.get('/api/sample/:key/:id', function(req, res) {
      Sample
        .find({ '_id': req.params.id })
        .select(req.params.key)
        .exec(resHandler(res))
    });

    //get fullsize image
    app.get('/api/image/:id', function(req, res) {
        Image
            .find({ 'sample_id': req.params.id })
        .select('sample_id image_full')
        .exec(resHandler(res));
    });

    // get image thumbnails
    app.get('/api/images/', function(req, res) {
      Image
        .find({
          'sample_id': { $in: req.query.sample_ids }
        })
        .select('image_thumb sample_id')
        .exec(resHandler(res));
    });

    // default route
    app.use(function(req, res) {
        res.redirect('/');
    });

};
