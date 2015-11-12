var History = require('./History.js');
var Filter = require('./Filter.js');
var FeatureDistributionHistogram = require('./FeatureDistributionHistogram.js');
var FeatureVectorLineplot = require('./FeatureVectorLineplot.js');
var NeighbourPlot = require('./NeighbourPlot.js');
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
    this.neighbourImages = new NeighbourImages();
    this.featureDistributionHistogram =
        new FeatureDistributionHistogram(screenData, '#histplot');
    this.featureVectorLineplot =
        new FeatureVectorLineplot('#lineplot');
    this.neighbourPlot = new NeighbourPlot(sampleData, '#neighbourplot');
    this.filter = new Filter(sampleData, this.neighbourPlot);
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
        this.neighbourPlot.updatePoint(backId);
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
        this.neighbourPlot.updatePoint(forwardId);
        this.neighbourImages.getImages(forwardId);
    }
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
 */
UIController.prototype.updateSample = function(sampleId) {
    this.history.add(sampleId);

    console.log('UIController updateSample');
    console.log(sampleId);

    // update plots
    this.featureVectorLineplot.drawLineplot(sampleId);
    this.neighbourPlot.updatePoint(sampleId);
    this.neighbourImages.getImages(sampleId);
};

UIController.prototype.updateDimensionReduction = function(dimension) {
    this.neighbourPlot.update(dimension);
};

/**
 * updateFilter: Handle view/plot updates when 'updateFilter' event triggered.
 *
 * @this {UIController}
 */
UIController.prototype.updateFilter = function(filterOutId) {
    if(filterOutId) {
        this.neighbourPlot.applyFilterStyling(filterOutId);
    }
    else {
        this.neighbourPlot.removeFilterStyling();
    }
};

module.exports = UIController;
