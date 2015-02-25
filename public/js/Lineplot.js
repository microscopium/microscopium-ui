var d3 = require('d3');
var _ = require('lodash');

function Lineplot(sampleData, histogram) {
    this.sampleData = sampleData;
    this.featureLength = sampleData[0].feature_vector_std.length;
    this.activeSample = 0;
    this.activeFeature = 0;
    this.histogram = histogram;

    this.fullWidth = 600;
    this.fullHeight = 400;

    this.margin = {top: 20, right: 30, bottom: 20, left: 45};

    this.width = this.fullWidth - this.margin.left - this.margin.right;
    this.height = this.fullHeight - this.margin.top - this.margin.bottom;

    this.drawLineplot(0);
}

Lineplot.prototype.drawLineplot = function(sample) {

    var self = this;

    self.destroy();

    var featureVector = this.sampleData[sample].feature_vector_std;

    // get min/max x/y values -- needed for scaling axis/data
    var yMin = d3.min(featureVector);
    var yMax = d3.max(featureVector);

    // var create (x, y) pairs for plot
    var linePoints = _.zip(_.range(1, self.featureLength+1), featureVector);

    // define x-scale and x-axis
    self.xScale = d3.scale.linear()
        .domain([0, self.featureLength])
        .range([0, self.width]);

    var xAxis = d3.svg.axis()
        .scale(self.xScale)
        .orient('bottom');

    // define y-scale and y-axis
    self.yScale = d3.scale.linear()
        .domain([yMin-1, yMax+1])
        .range([self.height, 0]);

    var yAxis = d3.svg.axis()
        .scale(self.yScale)
        .ticks(5)
        .orient('left');

    var line = d3.svg.line()
        .x(function(d) { return self.xScale(d[0]); })
        .y(function(d) { return self.yScale(d[1]); });

    // append canvas
    self.svg = d3.select('#linebox').append('svg')
        .attr('width', self.fullWidth)
        .attr('height', self.fullHeight)
        .append('g')
        .attr('transform', 'translate(' + self.margin.left + ',' + self.margin.top + ')')
        .on('click', function() {
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
        .text(this.sampleData[sample]._id);

    // set active line
    self.updateActiveLine(this.activeFeature);

};

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

Lineplot.prototype.onClickUpdate = function (d3Mouse) {
    var self = this;
    var xCoord = d3Mouse[0];
    var clickedFeature = Math.round(self.xScale.invert(xCoord));

    if(clickedFeature <= self.featureLength && clickedFeature > 1) {
        self.activeFeature = clickedFeature;
        self.histogram.drawHistogram(self.activeFeature-1);
        self.updateActiveLine(self.activeFeature);
    }
};

Lineplot.prototype.keypressUpdate = function(keyCode) {
    var self = this;

    if(self.activeFeature) {
        if(keyCode === 39 && self.activeFeature < this.featureLength) {
            this.activeFeature++;
            self.histogram.drawHistogram(self.activeFeature-1);
            self.updateActiveLine(self.activeFeature);
        }
        else if(keyCode === 37 && self.activeFeature > 1) {
            this.activeFeature--;
            self.histogram.drawHistogram(self.activeFeature-1);
            self.updateActiveLine(self.activeFeature);
        }
    }
};

Lineplot.prototype.destroy = function() {
    d3.select('#linebox > svg').remove();
};

module.exports = Lineplot;
