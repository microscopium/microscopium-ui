var _ = require('lodash');
var History = require('./History.js');
var Filter = require('./Filter.js');
var FeatureDistributionHistogram = require('./FeatureDistributionHistogram.js');
var FeatureVectorLineplot = require('./FeatureVectorLineplot.js');
var NeighbourPlotCanvas = require('./NeighbourPlotCanvas.js');
var NeighbourImages = require('./NeighbourImages.js');

/**
 * UIController: Manages event handling for the UI.
 *
 * @constructor
 */
function UIController(screenData, sampleData) {
    this.history = new History();

    this._mountPlots(screenData, sampleData);
}

/**
 * mountPlots: Load plot objects into controller.
 *
 * @param screenData - Screen document for the selected screen.
 * @param sampleData - Sample document for the selected screen.
 * @private
 */
UIController.prototype._mountPlots = function(screenData, sampleData) {
    this.neighbourImages = new NeighbourImages(screenData._id);
    this.featureDistributionHistogram =
        new FeatureDistributionHistogram(screenData, '#histplot');
    this.featureVectorLineplot =
        new FeatureVectorLineplot(screenData._id, '#lineplot');
    this.neighbourPlotCanvas =
        new NeighbourPlotCanvas(screenData._id, sampleData, '#neighbourplot');
    this.filter = new Filter(sampleData, this.neighbourPlotCanvas);
};

/**
 * back: Handle view/plot updates when 'back' action taken.
 *
 * @this {UIController}
 */
UIController.prototype.back = function() {
    var backId = this.history.back();
    if(backId) {
        this.featureVectorLineplot.drawLineplot(backId);
        this.neighbourPlotCanvas.updatePoint(backId);
        this.neighbourImages.getImages(backId);
    }
};

/**
 * forward: Handle view/plot updates when 'forward' action taken.
 *
 * @this {UIController}
 */
UIController.prototype.forward = function() {
    var forwardId = this.history.forward();
    if(forwardId) {
        this.featureVectorLineplot.drawLineplot(forwardId);
        this.neighbourPlotCanvas.updatePoint(forwardId);
        this.neighbourImages.getImages(forwardId);
    }
};

/**
 * reset: Reset scatterplot to default position.
 */
UIController.prototype.reset = function() {
    this.neighbourPlotCanvas.reset();
};

/**
 * updateSample: Handle view/plot updates when 'updateFeature' event triggered.
 *
 * @this {UIController}
 */
UIController.prototype.updateFeature = function(activeFeature) {
    this.featureDistributionHistogram.drawHistogram(activeFeature - 1);
};

/**
 * updatePoint: Handle view/plot updates when 'updateSample' event triggered.
 *
 * @this {UIController}
 * @param sampleId {string} - The sample_id of the new sample to display.
 */
UIController.prototype.updateSample = function(sampleId) {
    this.history.add(sampleId);

    this.featureVectorLineplot.drawLineplot(sampleId);
    this.neighbourPlotCanvas.updatePoint(sampleId);
    this.neighbourImages.getImages(sampleId);
};

/**
 * updateOverlay: Handle view/plot updates when 'updateOverlay' event triggered.
 *
 * @param overlay {string} - The new overlay to use to colour the points on the plot.
 *     Will default to "None" and remove any overlay if this argument isn't passed.
 */
UIController.prototype.updateOverlay = function(overlay) {
    if(_.isNull(overlay) || _.isUndefined(overlay)) {
        overlay = "None";
    }
    this.neighbourPlotCanvas.updateOverlay(overlay);
};

/**
 * updateView: Handle view/plot updates when 'updateView' event triggered.

 * @this {UIController}
 * @param dimension {string} - The dimensionality reduction method to use when
 *     displaying the plot points.
 */
UIController.prototype.updateView = function(dimension) {
    this.neighbourPlotCanvas.updateView(dimension);
};

/**
 * updateFilter: Handle view/plot updates when 'updateFilter' event triggered.
 *
 * @this {UIController}
 */
UIController.prototype.updateFilter = function(filterOutId) {
    this.neighbourPlotCanvas.updateFilter(filterOutId);
};

module.exports = UIController;
