var Feature = require('./models/feature');
var Screen = require('./models/screen');
var Sample = require('./models/sample');
var Image = require('./models/image');

var _ = require('lodash');
_.mixin(require('lodash-deep'));

var resHandler = function(res, sort) {
    if(sort === true) {
        return function(err, data) {
            if(err) res.json(err);
            res.json(data.sort());
        }
    }
    else {
        return function(err, data) {
            if(err) res.json(err);
            res.json(data);
        }
    }
};

module.exports = function(app) {

    // index route
    app.get('/', function(req, res) {
        res.sendfile('index.html');
    });

    // get fields of all screens
    app.get('/api/screens/:field/', function(req, res) {
        Screen
            .find({})
            .select(req.params.field)
            .exec(resHandler(res));
    });

    // get specific screen document
    app.get('/api/screen/:id', function(req, res) {
        Screen
            .find({'_id': req.params.id})
            .exec(resHandler(res));
    });

    // get specific field from screen document
    app.get('/api/screen/:id/:field', function(req, res) {
        Screen
            .find({'_id': req.params.id})
            .select(req.params.field)
            .exec(resHandler(res));
    });

    // get all samples belonging to screen
    app.get('/api/samples/:screen', function(req, res) {
        Sample
        .find({ 'screen': req.params.screen })
        .select('_id row column plate gene_name ' +
                'pca_vector neighbours')
        .exec(resHandler(res));
    });

    // get value from sample document
    app.get('/api/sample/:id/:field', function(req, res) {
      Sample
        .find({ '_id': req.params.id })
        .select(req.params.field)
        .exec(resHandler(res))
    });

    // get specific field from screen document
    // parameter slice - only get specific element of array
    app.get('/api/samples/:screen/:field', function(req, res) {
        Sample
            .find({'screen': req.params.screen})
            .select(req.params.field)
            .exec(function(err, data) {
                if(req.query.pluck) {
                    if(err) {
                        res.send(err);
                    }
                    var pluck = _.deepPluck(data,
                        [req.params.field, req.query.pluck]);
                    res.send(pluck);
                }
                else {
                    res.send(data);
                }
            });
    });

    //get large image
    app.get('/api/image/:id', function(req, res) {
        Image
            .find({ 'sample_id': req.params.id })
        .select('sample_id image_large')
        .exec(resHandler(res));
    });

    // get thumbnails for all neighbour images
    app.get('/api/images/:id', function(req, res) {
        Sample
            .find({ '_id': req.params.id })
            .select('neighbours')
            .exec(function(err, data) {
                Image
                    .find({
                        'sample_id': { $in: data[0].neighbours }
                    })
                    .select('sample_id image_thumb')
                    .exec(resHandler(res));
            })
    });

    // get feature distribution
    app.get('/api/feature/:screen/:feature/', function(req, res) {
        Feature
            .find({
                'screen': req.params.screen,
                'feature_name': req.params.feature
            })
            .select('feature_dist_std')
            .exec(resHandler(res))
    });

    // default route
    app.use(function(req, res) {
        res.redirect('/');
    });

};
