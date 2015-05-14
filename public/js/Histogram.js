var d3 = require('d3');

/**
 * Histogram: Object to draw a histogram of the features across a dataset.
 *
 * The width and height of the plot is calculated based on the size of the
 * plot's containing DIV. The width is taken from the DIV, and the height
 * calculated from that width such that the plot will have a 16:9 aspect ratio.
 *
 * @constructor
 * @param {string} screen - The name of the screen the features being plotted
 *     belong to.
 * @param {string} element - The ID of the target div for this plot.
 * @param {array} featureNames - An array of the features used in this screen.
 */
function Histogram(screen, featureNames, element) {
    this.screen = screen;
    this.featureNames = featureNames;
    this.feature = 0;
    this.element = element;

    this.fullWidth = $(this.element).width();
    this.fullHeight = Math.round(this.fullWidth * (9/16));

    this.xAxisTicks = 8;
    this.yAxisTicks = 5;

    this.margin = {top: 20, right: 30, bottom: 30, left: 50};
    this.width = this.fullWidth - this.margin.left - this.margin.right;
    this.height = this.fullHeight - this.margin.top - this.margin.bottom;

    this.getFeatureDistribution(0);
}

/**
 * getFeatureDistribution: Query feature distrubtion from DB.
 *
 * Send an AJAX query to the DB to get a vector of the feature distribution.
 * Once this comes back from the database, the Histogram is redrawn.
 *
 * @param {Number} feature - The index of the feature to get from the database
 */
Histogram.prototype.getFeatureDistribution = function(feature) {
    var self = this;
    var featureQuery = {
        screen: this.screen,
        feature: self.featureNames[feature],
        select: 'feature_dist_std'
    };
    $.ajax({
        type: 'GET',
        url: '/api/features/?' + $.param(featureQuery),
        success: function(data) {
            self.drawHistogram(data[0].feature_dist_std, feature)
        }
    });
};

/**
 * drawHistogram: Draw the histogram.
 *
 * Draw the SVG canvas, axis and bars for the histogram. Histogram bins
 * are calculated using d3's histogram layout function.
 *
 * @this {Histogram}
 * @params {Array} featureDist - A vector of numeric values. These represent
 *     the distribution of a feature across the whole database.
 * @param {number} feature - The index of the feature currently selected
 *     on the line plot.
 */
Histogram.prototype.drawHistogram = function(featureDist, feature) {
    var self = this;

    self.destroy();

    // define xScale and xAxis
    var xScale = d3.scale.linear()
        .domain([d3.min(featureDist), d3.max(featureDist)])
        .range([0, this.width]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .ticks(this.xAxisTicks)
        .orient('bottom');

    var dataBinner = d3.layout.histogram()
        .bins(xScale.ticks(this.xAxisTicks));
    var data = dataBinner(featureDist);

    // define y Scale and y axis
    var yScale = d3.scale.linear()
        .domain([0, d3.max(data, function(d) { return d.y; })])
        .range([this.height, 0]);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .ticks(this.yAxisTicks)
        .orient('left');

    // add SVG canvas
    var svg = d3.select(self.element).append('svg')
        .attr('width', self.fullWidth)
        .attr('height', self.fullHeight)
        .append('g')
        .attr('transform', 'translate(' + self.margin.left + ',' + self.margin.top + ')');

    // add transformation to bars
    var bar = svg.selectAll('.bar')
        .data(data)
        .enter().append('g')
        .attr('class', 'bar')
        .attr('transform', function(d) { return 'translate(' + xScale(d.x) + ',' + yScale(d.y) + ')'; });

    // append bars
    bar.append('rect')
        .attr('x', 1)
        .attr('width', function(d) {
            return xScale(d.dx + d.x ) - xScale(d.x) - 1;
        })
        .attr('height', function(d) { return self.height - yScale(d.y); });

    // append x axis
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + self.height + ')')
        .call(xAxis);

    // append y axis
    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    // add title
    svg.append('text')
        .attr('x', 20)
        .attr('y', -5)
        .style('text-anchor', 'left')
        .text(this.featureNames[feature]);
};

/**
 * destroy: Remove all child SVG elements of the plot objects containing div.
 *
 * @this {Histogram}
 */
Histogram.prototype.destroy = function() {
    d3.select(this.element + ' > svg').remove();
};

module.exports = Histogram;
