var Screen = require('./models/screen');
var Sample = require('./models/sample');
var Image = require('./models/image');

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

    // get all screen ids
    app.get('/api/screen_ids', function(req, res) {
        Screen
            .find({})
            .select('_id')
            .exec(resHandler(res));
    });

    // find unique values for given screen and field
    app.get('/api/unique/:screen/:field', function(req, res) {
        Sample
            .find({'screen': req.params.screen})
            .distinct(req.params.field, resHandler(res, true));
    });

    // get specific screen document
    app.get('/api/screen/:id', function(req, res) {
        Screen
            .find({'_id': req.params.id})
            .exec(resHandler(res));
    });

    // get all samples belonging to screen
    app.get('/api/samples/:screen', function(req, res) {
        Sample
        .find({ 'screen': req.params.screen })
        .select('_id row column plate gene_name feature_vector_std ' +
                'pca_vector neighbours')
        .exec(resHandler(res));
    });

    // get specific sample
    app.get('/api/sample/:id', function(req, res) {
          Sample
            .find({ '_id': req.params.id })
            .exec(resHandler(res))
    });

    // get all neighbours
    app.get('/api/sample/neighbours/:id', function(req, res) {
        Sample
            .find({ '_id': req.params.id })
            .select('neighbours')
            .exec(function(err, data) {
                Sample.find({
                    '_id': { $in: data[0].neighbours }
                })
                .exec(function(err, data) {
                    res.send(data);
                });
            })
    });

    // get value from sample document
    app.get('/api/sample/:key/:id', function(req, res) {
      Sample
        .find({ '_id': req.params.id })
        .select(req.params.key)
        .exec(resHandler(res))
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

    // default route
    app.use(function(req, res) {
        res.redirect('/');
    });

};
