var config = require('../config/plots').linePlot;
var d3 = require('d3');
var _ = require('lodash');

var LEFTARROW = 37;
var RIGHTARROW = 39;

/**
 * Lineplot: Object to draw lineplot of sample feature distribution.
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
function Lineplot(screen, element) {
    // this variable refers to the position of the vertical 'active feature'
    // line on the plot, *not* the index of the feature in the feature vector.
    this.activeFeature = 1;
    this.element = element;
    this.screen = screen;

    this.xAxisTicks = config.xAxisTicks;
    this.yAxisTicks = config.yAxisTicks;
    this.margin = config.margin;
    this.axisMargin = config.axisMargin;

    var aspectWidth = config.aspectRatio.width;
    var aspectHeight = config.aspectRatio.height;
    this.fullWidth = $(this.element).width();
    this.fullHeight = Math.round(this.fullWidth * (aspectHeight/aspectWidth));

    this.width = this.fullWidth - this.margin.left - this.margin.right;
    this.height = this.fullHeight - this.margin.top - this.margin.bottom;
}

/**
 * onClickUpdate: Get feature vector for sample and update lineplot.
 *
 * Once the data has been fetched from the database, it is sent to
 * the drawLineplot method to update the plot.
 *
 * @this {Lineplot}
 * @param {string} sampleId - The _id of the sample to get from
 *     the database.
 */
Lineplot.prototype.getSampleData = function(sampleId) {
    var self = this;
    var query = {
        id: sampleId,
        select: 'feature_vector_std'
    };
    $.ajax({
        type: 'GET',
        url: '/api/samples/?' + $.param(query),
        success: function(data) {
            self.drawLineplot(data[0]);
        }
    });
};

/**
 * drawLineplot: Draw the lineplot.
 *
 * @this {Lineplot}
 * @param {object} sampleData - An object containing two properties:
 *     * _id: A string, the id of the sample to be drawn.
 *     * feature_vector_std - An array, the standardised feature vector
 *       of the sample.
 */
Lineplot.prototype.drawLineplot = function(sampleData) {
    var self = this;
    this.featureVector = sampleData.feature_vector_std;

    self.destroy();

    // get min/max x/y values -- needed for scaling axis/data
    var yMin = d3.min(this.featureVector);
    var yMax = d3.max(this.featureVector);

    // var create (x, y) pairs for plot
    var linePoints = _.zip(_.range(1, this.featureVector.length+1),
        this.featureVector);

    // define x-scale and x-axis
    self.xScale = d3.scale.linear()
        .domain([0, this.featureVector.length])
        .range([0, self.width]);

    var xAxis = d3.svg.axis()
        .scale(self.xScale)
        .orient('bottom')
        .ticks(self.xAxisTicks);

    // create margin
    var yMargin = (yMax-yMin)*this.axisMargin;

    self.yScale = d3.scale.linear()
        .domain([yMin-yMargin, yMax+yMargin])
        .range([self.height, 0]);

    var yAxis = d3.svg.axis()
        .scale(self.yScale)
        .orient('left')
        .ticks(self.yAxisTicks);

    var line = d3.svg.line()
        .x(function(d) { return self.xScale(d[0]); })
        .y(function(d) { return self.yScale(d[1]); });

    // append canvas
    self.svg = d3.select(this.element).append('svg')
        .attr('width', self.fullWidth)
        .attr('height', self.fullHeight)
        .append('g')
        .attr('transform', 'translate(' + self.margin.left + ',' + self.margin.top + ')')
        .on('click', function () {
            d3.event.stopPropagation();
            self.onClickUpdate(d3.mouse(this));
        });

    // append background svg
    self.svg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', this.fullWidth)
        .attr('height', this.fullHeight)
        .style('fill', 'white')
        .on('click', function () {
            d3.event.stopPropagation();
            self.onClickUpdate(d3.mouse(this));
        });

    // append listener to svg element
    d3.select('body').on('keydown', function() {
        self.keypressUpdate(d3.event.keyCode);
    });

    // add x-axis
    self.svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + self.height + ')')
        .call(xAxis);

    // add y-axis
    self.svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    // add line graphic
    self.svg.append('path')
        .datum(linePoints)
        .attr('class', 'line')
        .attr('d', line);

    // add title
    self.svg.append('text')
        .attr('x', self.width/2)
        .attr('y', -5)
        .style('text-anchor', 'middle')
        .text(sampleData._id);

    // set active line
    self.updateActiveLine(this.activeFeature);
};

/**
 * updateActiveLine: Redraw the line overlaying selected feature in the sample.
 *
 * Re-draw the active feature line and updates the histogram for the
 * corresponding feature.
 *
 * @this {Lineplot}
 * @param {number} feature - The position on the x-axis where the active
 *    feature line should be drawn.
 */
Lineplot.prototype.updateActiveLine = function(feature) {
    var self = this;
    var xCoord = self.xScale(feature);
    self.svg.selectAll('.selectedLine').remove();
    self.svg.append('line')
        .attr('x1', xCoord)
        .attr('y1', 0)
        .attr('x2', xCoord)
        .attr('y2', self.height)
        .attr('stroke', 'red')
        .attr('stroke-width', 0.75)
        .attr('stroke-dasharray', '5, 5')
        .classed('selectedLine', true);
};

/**
 * onClickUpdate: Update active feature on click.
 *
 * Check that the region clicked is valid and update the active feature
 * line and feature distribution histogram.
 *
 * @this {Lineplot}
 * @param {d3Mouse} d3Mouse - Mouse object generated by d3 when a onclick
 *     event is triggered.
 */
Lineplot.prototype.onClickUpdate = function (d3Mouse) {
    var self = this;
    var xCoord = d3Mouse[0];
    var clickedFeature = Math.round(self.xScale.invert(xCoord));

    if(clickedFeature <= self.featureVector.length && clickedFeature > 1) {
        self.activeFeature = clickedFeature;
        $('body').trigger('updateLineplot', self.activeFeature);
    }
};

/**
 * keypressUpdate: Update active feature line on keypress.
 *
 * On pressing the left or right arrow key, the active feature
 * line and feature histogram is updated.
 *
 * @this {Lineplot}
 * @param {number} keyCode - The Javascript character code for the
 *     pressed key.
 *     See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
 */
Lineplot.prototype.keypressUpdate = function(keyCode) {
    var self = this;

    if(self.activeFeature) {
        if(keyCode === RIGHTARROW &&
            // only let the line move right if it's not already at the
            // rightmost feature
            self.activeFeature < this.featureVector.length) {
            self.activeFeature++;
            $('body').trigger('updateLineplot', self.activeFeature);
        }
        else if(keyCode === LEFTARROW && self.activeFeature > 1) {
            // only let the line move left if it's not already at the
            // left-most feature
            self.activeFeature--;
            $('body').trigger('updateLineplot', self.activeFeature);
        }
    }
};

/**
 * destroy: Remove all child SVG elements of the plot objects containing div.
 *
 * @this {Lineplot}
 */
Lineplot.prototype.destroy = function() {
    d3.select(this.element + ' > svg').remove();
};

module.exports = Lineplot;
