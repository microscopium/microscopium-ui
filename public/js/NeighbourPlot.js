var d3 = require('d3');
var _ = require('lodash');
require('d3-tip')(d3); // add d3-tip plugin to d3 namespace

/**
 * moveToFront: Move elements to front of SVG stack.
 *
 * Unlike CSS, SVG elements have no notion of a z-index. Elements are
 * rendered with respect to their order of appearance in the DOM.
 * In order move elements to the top, we need to remove them
 * from the DOM, then add them again as the first child of their parent.
 * This function extends the d3 selection object to do just that.
 *
 * This is an example of where prototypical inheritance is awesome!
 *
 * @this {d3.selection}
 */
d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};

/**
 * NeighbourPlot: Object to draw scatterplot of dimension reduced data.
 *
 * Clicking on scatterplot points will trigger updates of the neighbour
 * image gallery and corresponding sample lineplot.
 *
 * The width and height of the plot is calculated based on the size of the
 * plot's containing DIV. The width is taken from the DIV, and the height
 * calculated from that width such that the plot will have a 16:9 aspect ratio.
 *
 * @constructor
 * @param {array} sampleData - The sample data for the screen. Each element
 *     in the array is an instance of a Sample document.
 * @param {string} element - The ID of the target div for this plot.
 * update when scatterplot points are clicked.
 */
function NeighbourPlot(sampleData, element) {
    this.sampleData = sampleData;
    this.element = element;

    this.fullWidth = $(this.element).width();
    this.fullHeight = Math.round(this.fullWidth * (9/16));

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
 * drawScatterplot: Draw the scatterplot.
 *
 * Draw the SVG canvas, axis, scatterplot points and tooltips.
 *
 * @this {NeighbourPlot}
 */
NeighbourPlot.prototype.drawScatterplot = function(reductionType) {
    var self = this;
    var $body = $('body');

    console.log(reductionType);

    this.reduction_type = reductionType || 'tnse';

    // remove all SVG elements currently in container
    this.destroy();

    // find scale for dataset
    this.setScale();

    // setup canvas
    this.svg = d3.select(this.element).append('svg')
        .attr('width', this.fullWidth)
        .attr('height', this.fullHeight)
        .append('g')
        .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')

    // define tooltip function and append to SVG
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<p><strong>ID: </strong>" + d._id + "</span></p>" +
                "<p><strong>Gene: </strong>" + d.gene_name + "</span></p>";
        });

    this.svg.call(tip);

    // draw plot axis
    this.drawAxis();

    // draw plot labels
    this.drawPlotLabels('PC1', 'PC2');

    // draw scatterplot points
    this.svg.selectAll('circle')
        .data(this.sampleData)
        .enter()
        .append('circle')
        .attr('cx', function(d) {
            return self.xScale(d.dimension_reduce[self.reduction_type][0]);
        })
        .attr('cy', function(d) {
            return self.yScale(d.dimension_reduce[self.reduction_type][1]);
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
        .on('click', function(d) {
            var selection = d3.select(this);
            if(!selection.classed('activept')) {
                $body.trigger('updatePoint', d._id);
            }
        });
};

/**
 * drawAxis
 *
 * @param xMin
 * @param xMax
 * @param yMin
 * @param yMax
 */
NeighbourPlot.prototype.setScale = function() {
    var self = this;
    var xMin = d3.min(this.sampleData, function(d) { return d.dimension_reduce[self.reduction_type][0]; });
    var yMin = d3.min(this.sampleData, function(d) { return d.dimension_reduce[self.reduction_type][1]; });
    var xMax = d3.max(this.sampleData, function(d) { return d.dimension_reduce[self.reduction_type][0]; });
    var yMax = d3.max(this.sampleData, function(d) { return d.dimension_reduce[self.reduction_type][1]; });

    this.xScale = d3.scale.linear()
        .domain([xMin-1, xMax+1])
        .range([0, this.width]);

    this.yScale = d3.scale.linear()
        .domain([yMin-1, yMax+1])
        .range([this.height, 0]);
};


NeighbourPlot.prototype.drawAxis = function() {
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

NeighbourPlot.prototype.drawPlotLabels = function(xAxisLabel, yAxisLabel) {
    this.svg.append('text')
        .attr('transform', 'translate(' + (this.width/2) + ' ,' +
            (this.height + this.margin.bottom) + ')')
        .style('text-anchor', 'middle')
        .text(xAxisLabel);

    this.svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - this.margin.left)
        .attr('x', 0 - this.height/2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text(yAxisLabel);
};

NeighbourPlot.redrawScatterPlot = function() {

};

/**
 * updatePoint: Update scatterplot point on click.
 *
 * This method is attached to all scatterplot points, and updates
 * the styling of the points and triggers updates in the associated samples
 * lineplot and neighbour image gallery.
 *
 * @this {NeighbourPlot}
 * @param {string} sampleId - The unique _id of the sample that was clicked.
 */
NeighbourPlot.prototype.updatePoint = function(sampleId) {
    var self = this;
    var selectedPoint = self.svg.select('#' + sampleId);
    var neighbours = [];

    $.ajax({
        url: '/api/samples/?id=' + sampleId + '&select=neighbours',
        success: function(data) {
            neighbours = data[0].neighbours;
            self.svg.selectAll('.activept')
                .classed('activept', false)
                .classed('neighbourpt', false)
                .transition()
                .duration(self.transitionDuration)
                .attr('r', self.inactivePointRadius);

            self.svg.selectAll('.neighbourpt')
                .classed('neighbourpt', false)
                .attr('r', self.inactivePointRadius)
                .transition()
                .duration(self.transitionDuration);

            for(var j = 1 ; j < neighbours.length; j++) {
                var neighbourTags = _.map(neighbours, function(d) {
                    return '#' + d;
                });
                self.svg.selectAll(neighbourTags)
                    .classed('neighbourpt', true)
                    .transition()
                    .duration(self.transitionDuration)
                    .attr('r', self.inactivePointRadius);
            }

            // set class and attr of new active point and
            // remove click event listener
            selectedPoint
                .classed('activept', true)
                .moveToFront()
                .transition()
                .duration(self.transitionDuration)
                .attr('r', self.activePointRadius);
        }
    });
};

/**
 * updatePlot: Re-render plot data points given a new set of data.
 *
 * Update the class of scatterplot points, and bring unfiltered points
 * to the top of the SVG stack.
 *
 * @this {NeighbourPlot}
 * @param {array} newData - The new dataset to display.
 */
NeighbourPlot.prototype.updatePlot = function(newData) {
    var self = this;

    if(newData.length === this.sampleData.length) {
        // if no points have been filtered out, class everything as unfiltered
        self.svg.selectAll('circle')
            .classed('filtered', false);
    }
    else {
        // cast sample ids as id #tags so they can be used as selectors
        var tags = _.map(_.pluck(newData, '_id'), function(d) {
            return '#' + d;
        });

        // all points are filtered..
        self.svg.selectAll('circle')
            .classed('filtered', true);

        // until proven otherwise..
        self.svg.selectAll(tags)
            .classed('filtered', false)
            .moveToFront();
    }
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
