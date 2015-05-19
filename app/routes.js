var Handlers = require('./Handlers');

module.exports = function(app) {
    /**
     * GET /
     *
     * The default route, returns the main index.html file.
     */
    app.get('/', Handlers.indexHandler);

    /**
     * GET /api/screens
     *
     * Query the screens collection. Data is returned in JSON format.
     *
     * Parameters
     * ----------
     * id: The screen ID.
     * select: Fields to restrict the query to.
     *
     * Example
     * -------
     * /api/screens?id=BBBC017&select=screen_dec&select=feature_names
     *
     * Return the screen document with _id 'BBBC017' and only
     * return the fields screen_desc and feature_names
     */
    app.get('/api/screens/', Handlers.screenHandler);

    /**
     * GET /api/images
     *
     * Query the images collection. A sample_id must be supplied with these queries.
     * Images are returned in binary string format.
     *
     * Parameters
     * ----------
     * sample_id: The sample id of the image to query.
     * select: Fields to restrict the query to.
     * neighbours: "true" if true, neighbouring images will be returned.
     *
     * Example
     * -------
     * GET /api/screens?id=BBBC017-50116000001-A05&neighbours=true&select=image_thumb
     *
     * Return the neighbouring images for sample with id BBBC017-50116000001-A05
     * and restrict the fields to only return thumbnail size images.
     */
    app.get('/api/images/', Handlers.imageHandler);

    /**
     * GET /api/samples
     *
     * Query the samples collection.
     *
     * An id or screen parameter must be supplied.
     *
     * Parameters
     * ----------
     * id: The id of the sample to query.
     * screen: Find samples belonging to this screen.
     * select: Fields to restrict the query to.
     *
     * Example
     * -------
     * /api/samples?screen=BBBC017&select=pca_vector
     *
     * Return PCA co-ordinates for all samples in the BBBC017 screen.
     */
    app.get('/api/samples/', Handlers.sampleHandler);

    /**
     * GET /api/features
     *
     * Query the features collection.
     *
     * A feature name and screen parameter must be supplied with these queries.
     *
     * Parameters
     * ----------
     * screen: The screen to query.
     * feature_name: The feature name to query.
     * select: Fields to restrict the query to.
     *
     * Example
     * -------
     * /api/features?screen=BBBC017&feature_name=mitosis-otsu-threshold-area-percentile95
     *
     * Return the distribution of the mitosis-otsu-threshold-area-percentile95
     * feature for the BBBC017 screen.
     */
    app.get('/api/features/', Handlers.featureHandler);

    // default route
    app.use(function(req, res) {
        res.redirect('/');
    });
};
