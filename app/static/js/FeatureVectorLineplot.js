'use strict';

var config = require('../config/plots').featureVectorlinePlot;
var d3 = require('d3');
var key = require('./enums/keyboard.js');

/**
 * FeatureVectorLineplot: Object to draw lineplot of feature distribution.
 *
 * A lineplot is drawn to represent the distribution of the features for
 * a particular sample. The features are mapped to the x-axis such that the
 * first feature in the array is mapped to x=1, the second feature mapped to
 * x=2, etc.
 *
 * The width and height of the plot is calculated based on the size of the
 * plot's containing DIV. The width is taken from the DIV, and the height
 * calculated from that width such that the plot will have a 16:9 aspect ratio.
 *
 * Clicking on the lineplot triggers an update in a Histogram object showing
 * the distribution of the corresponding feature. The data is fetched from
 * MongoDB by means of an AJAX request.
 *
 * @constructor
 * @param {string} element - The ID of the target div for this plot.
 */
function FeatureVectorLineplot(screenID, element) {
    this.screenID = screenID;
    this.element = element;
    // this variable refers to the position of the vertical 'active feature'
    // line on the plot, *not* the index of the feature in the feature vector.
    this.activeFeature = 1;

    this.xAxisTicks = config.xAxisTicks;
    this.yAxisTicks = config.yAxisTicks;
    this.margin = config.margin;
    this.axisMargin = config.axisMargin;

    var aspectWidth = config.aspectRatio.width;
    var aspectHeight = config.aspectRatio.height;
    this.fullWidth = $(this.element).width();
    this.fullHeight = Math.round(this.fullWidth * aspectHeight / aspectWidth);

    this.width = this.fullWidth - this.margin.left - this.margin.right;
    this.height = this.fullHeight - this.margin.top - this.margin.bottom;
}

/**
 * drawLineplot: Draw the lineplot.
 *
 * Make an ajax request to get the data for the currently selected
 * sample and draw the lineplot.
 *
 * @this {FeatureVectorLineplot}
 * @param {string} sampleId - The sample ID to display in the lineplot.
 */
FeatureVectorLineplot.prototype.drawLineplot = function(sampleId) {
    var query = {
        select: 'feature_vector_std'
    };
    $.ajax({
        type: 'GET',
        url: '/api/' + this.screenID + '/samples/' + sampleId + '?' +
            $.param(query, true),
        dataType: 'json',
        success: function(data) {
            this.featureVector = data[0].feature_vector_std;
            d3.select(this.element + ' > svg').remove(); // clear canvas
            this._addBackground();
            this._setScale();
            this._drawAxis();
            this._drawLine();
            this._drawTitle(data[0]._id);
            this._addEventListeners();
            this._updateSelectedFeatureLine(this.activeFeature);
        }.bind(this)
    });
};

/**
 * addBackground: Add SVG container to hold plot elements.
 *
 * An SVG container is added to draw all the plot elements.
 * The SVG container alone cannot catch click events, so a
 * solid white 'background' is added to the container to
 * catch these click events.
 *
 * This method should be called first.
 *
 * @private
 */
FeatureVectorLineplot.prototype._addBackground = function() {
    // append canvas
    this.svg = d3.select(this.element).append('svg')
        .attr('width', this.fullWidth)
        .attr('height', this.fullHeight)
        .append('g')
        .attr('transform', 'translate(' + this.margin.left + ',' +
            this.margin.top + ')');

    // append background svg
    this.svg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', this.fullWidth)
        .attr('height', this.fullHeight)
        .style('fill', 'white');
};

/**
 * addEventListeners: Add event listener behaviour to plot.
 *
 * @private
 */
FeatureVectorLineplot.prototype._addEventListeners = function() {
    var self = this;

    // catch any keydown events -- this is added to
    // body of the DOM so events are caught even if
    // focus is on another DOM element.
    d3.select('body').on('keydown', function() {
        d3.event.stopPropagation();
        self._onKeydownUpdate(d3.event.keyCode);
    });

    // catch all click events on the container svg
    this.svg.on('click', function() {
        d3.event.stopPropagation();
        self._onClickUpdate(d3.mouse(this));
    });
};

/**
 * drawAxis: Draw the X and Y axis on the plot.
 *
 * The scale should be set before this method is called.
 *
 * See: _setScale
 *
 * @private
 */
FeatureVectorLineplot.prototype._drawAxis = function() {
    var xAxis = d3.svg.axis()
        .scale(this.xScale)
        .orient('bottom')
        .ticks(this.xAxisTicks);

    var yAxis = d3.svg.axis()
        .scale(this.yScale)
        .orient('left')
        .ticks(this.yAxisTicks);

    this.svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + this.height + ')')
        .call(xAxis);

    this.svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);
};

/**
 * drawLine: Draw the line for the lineplot.
 *
 * @private
 */
FeatureVectorLineplot.prototype._drawLine = function() {
    // features are mapped to the range [1, ..., n + 1] so the first
    // feature in the lineplot isn't being drawn in the 0-th position
    // on the lineplot. this causes the line to be drawn over the y axis,
    // and makes the selected feature line difficult to see when
    // the first feature is selected.
    var linePoints = d3.zip(d3.range(1, this.featureVector.length + 1),
        this.featureVector);

    var line = d3.svg.line()
        .x(function(d) { return this.xScale(d[0]); }.bind(this))
        .y(function(d) { return this.yScale(d[1]); }.bind(this));

    this.svg.append('path')
        .datum(linePoints)
        .attr('class', 'line')
        .attr('d', line);
};

/**
 * drawTitle: Add a title to the lineplot.
 *
 * @param {string} titleText - The text to draw in the title.
 * @private
 */
FeatureVectorLineplot.prototype._drawTitle = function(titleText) {
    this.svg.append('text')
        .attr('x', this.width / 2)
        .attr('y', -this.margin.top / 4)
        .style('text-anchor', 'middle')
        .text(titleText);
};

/**
 * handleFeatureChange: Handle updates when active feature changes.
 *
 * Re-draw the line showing which feature is currently active and
 * broadcase the 'updateLineplot' event to the UI.
 *
 * @private
 */
FeatureVectorLineplot.prototype._handleFeatureChange = function() {
    this._updateSelectedFeatureLine();
    $('body').trigger('updateFeature', this.activeFeature);
};

/**
 * onClickUpdate: Update active feature on click.
 *
 * Check that the region clicked is valid and update the active feature
 * line and feature distribution histogram.
 *
 * @this {FeatureVectorLineplot}
 * @param {d3Mouse} d3Mouse - Mouse object generated by d3 when a onclick
 *     event is triggered.
 * @private
 */
FeatureVectorLineplot.prototype._onClickUpdate = function (d3Mouse) {
    var xCoord = d3Mouse[0];
    var clickedFeature = Math.round(this.xScale.invert(xCoord));

    if(clickedFeature <= this.featureVector.length && clickedFeature > 1) {
        this.activeFeature = clickedFeature;
        this._handleFeatureChange();
    }
};

/**
 * onKeydownUpdate: Update active feature line on keypress.
 *
 * On pressing the left or right arrow key, the active feature
 * is updated. This function checks that the change is valid
 * and handles the update.
 *
 * @this {FeatureVectorLineplot}
 * @param {number} keyCode - The Javascript character code for the
 *     pressed key.
 * @private
 */
FeatureVectorLineplot.prototype._onKeydownUpdate = function(keyCode) {
    // only let the line move right if it's not already at the
    // rightmost feature
    if(keyCode === key.RIGHT_ARROW &&
        this.activeFeature < this.featureVector.length) {
        this.activeFeature++;
        this._handleFeatureChange();
    }
    // only let the line move left if it's not already at the
    // left-most feature
    else if(keyCode === key.LEFT_ARROW && this.activeFeature > 1) {
        this.activeFeature--;
        this._handleFeatureChange();
    }
};

/**
 * setScale: Set scale for current feature vector.
 *
 * Sets the scale that maps the data to the plot.
 *
 * @private
 */
FeatureVectorLineplot.prototype._setScale = function() {
    // get min/max x/y values -- needed for scaling axis/data
    var yMin = d3.min(this.featureVector);
    var yMax = d3.max(this.featureVector);

    // create margin for y axis -- stops the line from
    // drawing at the very top or bottom of the plot
    var yMargin = (yMax - yMin) * this.axisMargin;

    this.xScale = d3.scale.linear()
        .domain([0, this.featureVector.length])
        .range([0, this.width]);

    this.yScale = d3.scale.linear()
        .domain([yMin - yMargin, yMax + yMargin])
        .range([this.height, 0]);
};

/**
 * updateSelectedFeatureLine: Redraw the line showing the selected feature.
 *
 * @this {FeatureVectorLineplot}
 * @private
 */
FeatureVectorLineplot.prototype._updateSelectedFeatureLine = function() {
    var xCoord = this.xScale(this.activeFeature);
    this.svg.selectAll('.selectedFeatureLine').remove();
    this.svg.append('line')
        .classed('selectedFeatureLine', true)
        .attr('x1', xCoord)
        .attr('y1', 0)
        .attr('x2', xCoord)
        .attr('y2', this.height);
};

module.exports = FeatureVectorLineplot;
