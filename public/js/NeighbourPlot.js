var d3 = require('d3');
var _ = require('lodash');
require('d3-tip')(d3); // add d3-tip plugin to d3 namespace

/**
 * Move to back: Move elements to bottom of parent node.
 *
 * SVG elements have no notion of a z-index, elements are
 * rendered with respect to their order of appearance in the DOM.
 * In order move elements to the bottom, we need to remove them
 * from the DOM, then add them again to the parent. This function
 * extends the d3 selection object to do just that.
 *
 * @this {d3.selection}
 */
d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};

/**
 * NeighbourPlot: Object to draw scatterplot of dimension reduced data.
 *
 * Clicking on scatterplot points will trigger updates of the neighbour
 * image gallery and corresponding sample lineplot.
 *
 * @constructor
 * @param {array} sampleData - The sample data for the screen. Each element
 *     in the array is an instance of a Sample document.
 * @param {string} element - The ID of the target div for this plot.
 * @param {LinePlot} lineplot - LinePlot that will update when scatterplot
 *     points are clicked.
 * @param {NeighbourImages} neighbourImages - NeighbourImages object that will
 * update when scatterplot points are clicked.
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
    this.filteredOpacity = 0.5;

    this.margin = {top: 10, right: 40, bottom: 30, left: 40};
    this.width = this.fullWidth - this.margin.left - this.margin.right;
    this.height = this.fullHeight - this.margin.top - this.margin.bottom;

    this.drawScatterplot();
}

/**
 * drawScatterplot: Draw the scatterplot.
 *
 * Draw the SVG canvas, axis, scatterplot points and tooltips.
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
    self.xScale = d3.scale.linear()
        .domain([xMin-1, xMax+1])
        .range([0, self.width]);
    var xAxis = d3.svg.axis()
        .scale(self.xScale)
        .ticks(self.xAxisTicks)
        .orient('bottom');

    self.yScale = d3.scale.linear()
        .domain([yMin-1, yMax+1])
        .range([self.height, 0]);
    var yAxis = d3.svg.axis()
        .scale(self.yScale)
        .ticks(self.yAxisTicks)
        .orient('left');

    // tooltip function
    self.tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<p><strong>ID: </strong>" + d._id + "</span></p>" +
                "<p><strong>Gene: </strong>" + d.gene_name + "</span></p>";
        });

    // setup canvas
    self.svg = d3.select(this.element).append('svg')
        .attr('width', self.fullWidth)
        .attr('height', self.fullHeight)
        .append('g')
        .attr('transform', 'translate(' + self.margin.left + ',' + self.margin.top + ')')
        .call(self.tip);

    // add filter transfer function
    // when this transformation is applied to an element, or group of elements,
    // the opacity will increase when elements with the same filter overlap.
    self.svg.append('defs')
        .append('filter')
        .attr('id', 'constantOpacity')
        .append('feComponentTransfer')
        .append('feFuncA')
        .attr('type', 'table')
        .attr('tableValues', '0 ' + this.filteredOpacity + ' ' + this.filteredOpacity);

    // append axis
    self.svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + self.height + ')')
        .call(xAxis);

    self.svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    // append axis labels
    self.svg.append('text')
        .attr('transform', 'translate(' + (self.width / 2) + ' ,' + (self.height + self.margin.bottom) + ')')
        .style('text-anchor', 'middle')
        .text('PC1');

    self.svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - self.margin.left)
        .attr('x', 0 - self.height/2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('PC2');

    // draw plot
    self.svg.selectAll('circle')
        .data(this.sampleData)
        .enter()
        .append('circle')
        .attr('cx', function(d) {
            return self.xScale(d.pca[0]);
        })
        .attr('cy', function(d) {
            return self.yScale(d.pca[1]);
        })
        .attr('r', 5)
        .classed('scatterpt', true)
        .classed('activept', false)
        .classed('neighbourpt', false)
        .attr('id', function(d) {
            return d._id;
        })
        .on('mouseover', self.tip.show)
        .on('mouseout', self.tip.hide)
        .on('click', function(d) {
            var selection = d3.select(this);
            if(!selection.classed('activept')) {
                self.updatePoint(selection, d);
            }
        });

    // default select first point
    var first = d3.select('.scatterpt');
    self.updatePoint(first, this.sampleData[0])
};

/**
 * updatePoint: Update scatterplot point on click.
 *
 * This method is attached to all scatterplot points, and updates
 * the styling of the points and triggers updates in the associated samples
 * lineplot and neighbour image gallery.
 *
 * @this {NeighbourPlot}
 * @param {d3-selection} selection - The d3 selection object from the
 *     clicked scatterplot point.
 * @param {object} d - The datum attached to the clicked scatterplot point.
 */
NeighbourPlot.prototype.updatePoint = function(selection, d) {
    var self = this;

    self.neighbourImages.getImages(d._id);
    self.lineplot.drawLineplot(d._id);

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
 * updatePlot: Re-render plot data points given a new set of data.
 *
 * Uses D3 enter-update-select pattern to update the plot datapoints.
 *
 * @this {NeighbourPlot}
 * @param {array} newData - The new dataset to display.
 */
NeighbourPlot.prototype.updatePlot = function(newData) {
    var self = this;
    var ids = _.pluck(newData, '_id');

    self.svg.selectAll('circle')
        .attr('opacity', 1)
        .style('stroke-width', 1)
        .attr('filter', null)
        .filter(function (d) {
            return !_.contains(ids, d._id)
        })
            .attr('opacity', self.filteredOpacity)
            .style('stroke-width', 0)
            .attr('filter', 'url(#constantOpacity)')
            .moveToBack()
};

/**
 * destroy: Remove all child SVG elements of the plot objects containing div.
 *
 * @this {NeighbourPlot}
 */
NeighbourPlot.prototype.destroy = function() {
    d3.select(this.element + ' > svg').remove();
};

module.exports = NeighbourPlot;
