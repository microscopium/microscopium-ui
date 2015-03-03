var d3 = require('d3');
require('d3-tip')(d3);

/**
 * Draws PCA scatterplot of the data Clicking on scatterplot points will
 * trigger updates of the neighbour image gallery and corresponding sample
 * lineplot.
 *
 *
 * @constructor
 * @param {array} sampleData - The sample data for the screen. Each element
 * in the array is an instance of a Sample document.
 * @param {string} element - The ID of the target div for this plot.
 * @param {LinePlot} lineplot - LinePlot that will update when scatterplot
 * points are clicked.
 */
function NeighbourPlot(sampleData, element, lineplot, neighbourImages) {
    this.sampleData = sampleData;
    this.lineplot = lineplot;
    this.neighbourImages = neighbourImages;

    this.element = element;
    this.fullWidth = 700;
    this.fullHeight = 500;
    this.transitionDuration = 125;
    this.inactivePointRadius = 5;
    this.activePointRadius = 7;
    this.xAxisTicks = 10;
    this.yAxisTicks = 10;

    this.margin = {top: 10, right: 40, bottom: 30, left: 40};
    this.width = this.fullWidth - this.margin.left - this.margin.right;
    this.height = this.fullHeight - this.margin.top - this.margin.bottom;

    this.drawScatterplot();
}

/**
 * This function draws the PCA plot.
 *
 * @this {NeighbourPlot}
 */
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
        .ticks(self.xAxisTicks)
        .orient('bottom');

    var yScale = d3.scale.linear()
        .domain([yMin-1, yMax+1])
        .range([self.height, 0]);
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .ticks(self.yAxisTicks)
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
    var svg = d3.select(this.element).append('svg')
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
    self.updatePoint(firstPoint, firstPoint.data()[0],  0);
};

/**
 * This function is attached to all PCA scatterplot points, and updates
 * the styling of the points and triggers updates in the associated samples
 * lineplot and neighbour image gallery.
 *
 * @this {NeighbourPlot}
 */
NeighbourPlot.prototype.updatePoint = function(selection, d, i) {
    var self = this;

    // update neighbour images
    self.neighbourImages.getImages(d._id);
    self.lineplot.drawLineplot(i);

    d3.selectAll('.activept')
        .classed('activept', false)
        .classed('neighbourpt', false)
        .transition()
        .duration(self.transitionDuration)
        .attr('r', self.inactivePointRadius);

    d3.selectAll('.neighbourpt')
        .classed('neighbourpt', false)
        .attr('r', self.inactivePointRadius)
        .transition()
        .duration(self.transitionDuration);

    // add neighbour class to all neighbours
    var neighbours = d.neighbours;
    for(var j = 1 ; j < neighbours.length; j++) {
        d3.select('[id=' + neighbours[j] + ']')
            .classed('neighbourpt', true)
            .transition()
            .duration(self.transitionDuration)
            .attr('r', self.inactivePointRadius);
    }

    // set class and attr of new active point
    selection
        .classed('activept', true)
        .transition()
        .duration(self.transitionDuration)
        .attr('r', self.activePointRadius);
};

/**
 * Removes all child SVG elements of the plots containing div.
 *
 * @this {NeighbourPlot}
 */
NeighbourPlot.prototype.destroy = function() {
    d3.select(this.element + ' > svg').remove();
};

module.exports = NeighbourPlot;
