var Handlers = require('./Handlers');

module.exports = function(app) {
    app.get('/', Handlers.indexHandler);

    app.get('/api/screens/', Handlers.screenHandler);

    app.get('/api/images/', Handlers.imageHandler);

    app.get('/api/samples/', Handlers.sampleHandler);

    app.get('/api/features/', Handlers.featureHandler);

    // default route
    app.use(function(req, res) {
        res.redirect('/');
    });
};
