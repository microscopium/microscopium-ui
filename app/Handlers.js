var Feature = require('./models/feature');
var Image = require('./models/image');
var Sample = require('./models/sample');
var Screen = require('./models/screen');

var RouteUtils = require('./RouteUtils');

var Handlers = {};

Handlers.sendQuery = function(model, findQuery, req, res) {
    var selectQuery = RouteUtils.parseSelectQuery(req.query.select);

    model
        .find(findQuery)
        .select(selectQuery)
        .exec(Handlers.resHandler(res));
};

Handlers.resHandler = function(res) {
    return function(err, data) {
        if (err) res.json(err);
        res.json(data);
    }
};

Handlers.indexHandler = function(req, res) {
    res.sendfile('index.html')
};

Handlers.sampleHandler = function(req, res) {
    if(!req.query.id && !req.query.screen) {
        res.status(400);
        res.send({
            error: 'A id or screen parameter must be supplied with this request.'
        })
    }

    var findQuery = {};
    if(req.query.id) { findQuery._id = req.query.id  }
    if(req.query.screen) { findQuery.screen = req.query.screen }

    Handlers.sendQuery(Sample, findQuery, req, res);
};

Handlers.screenHandler = function(req, res) {
    var findQuery = {};
    if(req.query.id) { findQuery._id = req.query.id }

    Handlers.sendQuery(Screen, findQuery, req, res);
};

Handlers.imageHandler = function(req, res) {
    // if no sample id supplied with this route, reject the request.
    if(!req.query.sample_id) {
        res.status(400);
        res.send({
            error: 'An id parameter must be supplied with this request.'
        });
    }

    var findQuery = {};

    if(req.query.neighbours === 'true') {
        var selectQuery = RouteUtils.parseSelectQuery(req.query.select);
        if(req.query.sample_id) { findQuery._id = req.query.sample_id }
        Sample
            .find(findQuery)
            .select('neighbours -_id')
            .exec(function(err, data) {
                Image
                    .find({
                        sample_id: {$in: data[0].neighbours}
                    })
                    .select(selectQuery)
                    .exec(Handlers.resHandler(res));
            });
    }
    else {
        if(req.query.sample_id) { findQuery.sample_id = req.query.sample_id }
        Handlers.sendQuery(Image, findQuery, req, res);
    }
};

Handlers.featureHandler = function(req, res) {
    if(!req.query.screen || req.query.feature_name) {
        res.status(400);
        res.send({
            error: 'A screen and feature_name parameter must be supplied with' +
            ' this request.'
        });
    }

    var findQuery = {
        'screen': req.query.screen,
        'feature_name': req.query.feature
    };

    Handlers.sendQuery(Feature, findQuery, req, res);
};

module.exports = Handlers;
