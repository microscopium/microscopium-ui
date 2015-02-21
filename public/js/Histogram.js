var d3 = require('d3');
var _ = require('lodash');
_.mixin(require('lodash-deep'));

function Histogram(sampleData, featureNames) {
    this.sampleData = sampleData;
    this.featureNames = featureNames;
    this.feature = 0;

    this.fullWidth = 500;
    this.fullHeight = 400;

    this.margin = {top: 20, right: 30, bottom: 20, left: 45};
    this.width = 500 - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;

    this.drawHistogram(0);
}

Histogram.prototype.drawHistogram = function(feature) {

    var self = this;
    self.destroy();

    var featureDist = _.deepPluck(self.sampleData,
        ['feature_vector_std', feature]);

    // define xScale and xAxis
    var xScale = d3.scale.linear()
        .domain([d3.min(featureDist), d3.max(featureDist)])
        .range([0, this.width]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom');

    var data = d3.layout.histogram()
        .bins(xScale.ticks(10))
    (featureDist);

    // define y Scale and y axis
    var yScale = d3.scale.linear()
        .domain([0, d3.max(data, function(d) { return d.y; })])
        .range([this.height, 0]);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left');

    // add SVG canvas
    var svg = d3.select('#histbox').append('svg')
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

Histogram.prototype.destroy = function() {
    d3.select('#histbox > svg').remove();
};

module.exports = Histogram;