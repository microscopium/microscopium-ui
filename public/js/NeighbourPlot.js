var d3 = require('d3');
require('d3-tip')(d3);

function NeighbourPlot(sampleData, lineplot, neighbourImages) {
    this.destroy();
    this.sampleData = sampleData;
    this.lineplot = lineplot;
    this.neighbourImages = neighbourImages;

    this.fullWidth = 700;
    this.fullHeight = 500;

    this.margin = {top: 10, right: 40, bottom: 30, left: 40};
    this.width = this.fullWidth - this.margin.left - this.margin.right;
    this.height = this.fullHeight - this.margin.top - this.margin.bottom;

    this.drawScatterplot();
    // default first point sampleData[0]._id
}

NeighbourPlot.prototype.drawScatterplot = function() {
    var self = this;

    this.destroy();

    var xMin = d3.min(this.sampleData, function(d) { return d.pca[0]; });
    var yMin = d3.min(this.sampleData, function(d) { return d.pca[1]; });
    var xMax = d3.max(this.sampleData, function(d) { return d.pca[0]; });
    var yMax = d3.max(this.sampleData, function(d) { return d.pca[1]; });

    // setup scales and axis
    var xScale = d3.scale.linear()
        .domain([xMin-1, xMax+1])
        .range([0, self.width]);
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .ticks(10);

    var yScale = d3.scale.linear()
        .domain([yMin-1, yMax+1])
        .range([self.height, 0]);
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .ticks(10)
        .orient('left');

    // tooltip function
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<p><strong>ID: </strong>" + d._id + "</span></p>" +
                "<p><strong>Gene: </strong>" + d.gene_name + "</span></p>";
        });

    // setup canvas
    var svg = d3.select('#neighbourpca').append('svg')
        .attr('width', self.fullWidth)
        .attr('height', self.fullHeight)
        .append('g')
        .attr('transform', 'translate(' + self.margin.left + ',' + self.margin.top + ')')
        .call(tip);

    // add points
    svg.selectAll('circle')
        .data(self.sampleData)
        .enter()
        .append('circle')
        .attr('cx', function(d) {
            return xScale(d.pca[0]);
        })
        .attr('cy', function(d) {
            return yScale(d.pca[1]);
        })
        .attr('r', 5)
        .classed('scatterpt', true)
        .classed('activept', false)
        .classed('neighbourpt', false)
        .attr('id', function(d) {
            return d._id;
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .on('click', function(d, i) {
            var selection = d3.select(this);
            if(!selection.classed('activept')) {
                self.updatePoint(selection, d, i);
            }
        });

    // append axis
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + self.height + ')')
        .call(xAxis);

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    // append axis labels
    svg.append('text')
        .attr('transform', 'translate(' + (self.width / 2) + ' ,' + (self.height + self.margin.bottom) + ')')
        .style('text-anchor', 'middle')
        .text('PC1');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - self.margin.left)
        .attr('x', 0 - self.height/2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('PC2');

    // default select first point
    var firstPoint = d3.select('.scatterpt');
    console.log(firstPoint.data());
    self.updatePoint(firstPoint, firstPoint.data()[0],  0);
};

NeighbourPlot.prototype.updatePlot = function() {

};

NeighbourPlot.prototype.updatePoint = function(selection, d, i) {
    var self = this;

    // update neighbour images
    self.neighbourImages.getImages(d._id);
    self.lineplot.drawLineplot(i);

    d3.selectAll('.activept')
        .classed('activept', false)
        .classed('neighbourpt', false)
        .transition()
        .duration(125)
        .attr('r', 5);

    d3.selectAll('.neighbourpt')
        .classed('neighbourpt', false)
        .attr('r', 5)
        .transition()
        .duration(125);

    // add neighbour class to all neighbours
    var neighbours = d.neighbours;
    for(var i = 1 ; i < neighbours.length; i++) {
        d3.select('[id=' + neighbours[i] + ']')
            .classed('neighbourpt', true)
            .transition()
            .duration(125)
            .attr('r', 5);
    }

    // set class and attr of new active point
    selection
        .classed('activept', true)
        .transition()
        .duration(125)
        .attr('r', 7);
};

NeighbourPlot.prototype.destroy = function() {
    d3.select('#neighbourpca > svg').remove();
};

module.exports = NeighbourPlot;
