var config = require('../config/plots').featureDistributionHistogram;
var d3 = require('d3');

/**
 * FeatureDistributionHistogram: Draw a histogram of the feature distribution.
 *
 * The width and height of the plot is calculated based on the size of the
 * plot's containing DIV. The width is taken from the DIV, and the height
 * calculated from that width such that the plot will have a 16:9 aspect ratio.
 *
 * @constructor
 * @param {Object} screen - The Screen document for the selected screen.
 * @param {string} element - The ID of the target div for this plot.
 */
function FeatureDistributionHistogram(screen, element) {
    this.screen = screen;
    this.feature = 0;
    this.element = element;

    this.xAxisTicks = config.xAxisTicks;
    this.yAxisTicks = config.yAxisTicks;
    this.margin = config.margin;

    var aspectWidth = config.aspectRatio.width;
    var aspectHeight = config.aspectRatio.height;
    this.fullWidth = $(this.element).width();
    this.fullHeight = Math.round(this.fullWidth * aspectHeight / aspectWidth);

    this.width = this.fullWidth - this.margin.left - this.margin.right;
    this.height = this.fullHeight - this.margin.top - this.margin.bottom;

    this.drawHistogram(0);
}

/**
 * drawHistogram: Draw the histogram.
 *
 * Send an AJAX request to get the distribution of the currently selected
 * feature and call methods to draw the lineplot.
 *
 * @this {FeatureDistributionHistogram}
 * @param {number} feature - The index of the feature currently selected
 *     on the line plot.
 */
FeatureDistributionHistogram.prototype.drawHistogram = function(feature) {
    var featureQuery = {
        select: 'feature_dist_std'
    };

    var feature_ = this.screen.screen_features[feature];

    $.ajax({
        type: 'GET',
        url: '/api/' + this.screen._id + '/features/' + feature_ + '?' +
            $.param(featureQuery, true),
        dataType: 'json',
        success: function(data) {
            this.featureDist = data[0].feature_dist_std,
            this.feature = feature;
            d3.select(this.element + ' > svg').remove();
            this._addBackground();
            this._setScaleAndBin();
            this._drawAxis();
            this._drawBars();
            this._drawTitle(this.screen.screen_features[feature]);
        }.bind(this)
    });
};

/**
 * addBackground: Add SVG container to hold plot elements.
 *
 * @private
 */
FeatureDistributionHistogram.prototype._addBackground = function() {
    this.svg = d3.select(this.element).append('svg')
        .attr('width', this.fullWidth)
        .attr('height', this.fullHeight)
        .append('g')
        .attr('transform', 'translate(' + this.margin.left +
        ',' + this.margin.top + ')');
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
FeatureDistributionHistogram.prototype._drawAxis = function() {
    var xAxis = d3.svg.axis()
        .scale(this.xScale)
        .ticks(this.xAxisTicks)
        .orient('bottom');

    var yAxis = d3.svg.axis()
        .scale(this.yScale)
        .ticks(this.yAxisTicks)
        .orient('left');

    this.svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + this.height + ')')
        .call(xAxis);

    this.svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);
};

/**
 * drawBars: Draw the bars in the histogram.
 *
 * @private
 */
FeatureDistributionHistogram.prototype._drawBars = function() {
    // add transformation to bars
    var bar = this.svg.selectAll('.bar')
        .data(this.binData)
        .enter().append('g')
        .attr('class', 'bar')
        .attr('transform', function(d) {
            return 'translate(' + this.xScale(d.x) +
                ',' + this.yScale(d.y) + ')';
        }.bind(this));

    // append bars
    bar.append('rect')
        .attr('x', 1)
        .attr('width', function(d) {
            return this.xScale(d.dx + d.x) - this.xScale(d.x) - 1;
        }.bind(this))
        .attr('height', function(d) {
            return this.height - this.yScale(d.y);
        }.bind(this));
};

/**
 * drawTitle: Add a title to the lineplot.
 *
 * @param {string} titleText - The text to draw in the title.
 * @private
 */
FeatureDistributionHistogram.prototype._drawTitle = function(titleText) {
    this.svg.append('text')
        .attr('x', this.width / 2)
        .attr('y', -this.margin.top / 4)
        .style('text-anchor', 'middle')
        .text(titleText);
};

/**
 * setScaleAndBin: Set scale and bin data for the selected feature.
 *
 * The scale that maps data to the plot is set in this function,
 * and the data is binned for the histogram.
 *
 * @private
 */
FeatureDistributionHistogram.prototype._setScaleAndBin = function() {
    var xMinMax = d3.extent(this.featureDist);

    this.xScale = d3.scale.linear()
        .domain(xMinMax)
        .range([0, this.width]);

    var dataBinner = d3.layout.histogram()
        .bins(this.xScale.ticks(this.xAxisTicks));
    this.binData = dataBinner(this.featureDist);

    this.yScale = d3.scale.linear()
        .domain([0, d3.max(this.binData, function(d) { return d.y; })])
        .range([this.height, 0]);
};

module.exports = FeatureDistributionHistogram;
