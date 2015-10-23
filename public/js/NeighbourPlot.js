var config = require('../config/plots').neighbourPlot;
var d3 = require('d3');
var _ = require('lodash');
var Utils = require('./Utils.js');
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
 *     update when scatterplot points are clicked.
 */
function NeighbourPlot(sampleData, element) {
    this.sampleData = sampleData;
    this.element = Utils.makeSelector(element);
    this.reductionType = 'tsne';

    this.pointTransitionDuration = config.pointTransitionDuration;
    this.inactivePointRadius = config.inactivePointRadius;
    this.activePointRadius = config.activePointRadius;
    this.xAxisTicks = config.xAxisTicks;
    this.yAxisTicks = config.yAxisTicks;
    this.axisTransitionDuration = config.axisTransitionDuration;
    this.axisMargin = 0.02;
    this.margin = config.margin;

    var aspectWidth = config.aspectRatio.width;
    var aspectHeight = config.aspectRatio.height;
    this.fullWidth = $(this.element).width();
    this.fullHeight = Math.round(this.fullWidth * (aspectHeight/aspectWidth));

    this.width = this.fullWidth - this.margin.left - this.margin.right;
    this.height = this.fullHeight - this.margin.top - this.margin.bottom;

    this.draw();
}

/**
 * applyFilterStyling: Update styling of points according to filter status.
 *
 * Update the class of scatterplot points, and bring unfiltered points
 * to the top of the SVG stack.
 *
 * @this {NeighbourPlot}
 * @param {array} newData - The new dataset to display.
 */
NeighbourPlot.prototype.applyFilterStyling = function(newData) {
    if(newData.length === this.sampleData.length) {
        // if no points have been filtered out, class everything as unfiltered
        this.svg.selectAll('circle')
            .classed('filtered', false);
    }
    else {
        // cast sample ids as id #tags so they can be used as selectors
        var tags = _.map(_.pluck(newData, '_id'), Utils.makeSelector);

        // all points are filtered..
        this.svg.selectAll('circle')
            .classed('filtered', true);

        // until proven otherwise..
        this.svg.selectAll(tags)
            .classed('filtered', false)
            .moveToFront();
    }
};

/**
 * draw: Draw the lineplot.
 *
 * @this {NeighbourPlot}
 */
NeighbourPlot.prototype.draw = function() {
    d3.select(this.element + ' > svg').remove(); // clear canvas
    this._addBackground();
    this._setScale();
    this._drawAxis();
    this._defineToolTip();
    this._drawPoints();
    this._drawAxisLabels();
};

/**
 * update: Change the dimensionality reduction used to display plot points.
 *
 * @this {NeighbourPlot}
 * @param {string} reductionType - The dimensionality reduction method
 *     to be used to display the sample points. Should be one of 'pca'
 *     or 'tsne'
 */
NeighbourPlot.prototype.update = function(reductionType) {
    this.reductionType = reductionType;
    this._setScale();
    this._updateAxis();
    this._updatePoints();
};

/**
 * updatePoint: Update scatterplot point.
 *
 * When this method is called, an ajax request is sent to get the IDs of the
 * neighbouring points from the database. Once this request is complete the plot
 * stylings are updated accordingly.
 *
 * @this {NeighbourPlot}
 * @param {string} sampleId - The unique _id of the sample that was clicked.
 */
NeighbourPlot.prototype.updatePoint = function(sampleId) {
    var selectedPoint = this.svg.select(Utils.makeSelector(sampleId));

    $.ajax({
        url: '/api/samples/?id=' + sampleId + '&select=neighbours',
        success: function(data) {
            // create an array of DOM selectors from the list of neighbours
            var neighbourTags = _.map(data[0].neighbours, Utils.makeSelector);

            this.svg.selectAll('.activept')
                .classed('activept', false)
                .classed('neighbourpt', false)
                .transition()
                .duration(this.pointTransitionDuration)
                .attr('r', this.inactivePointRadius);

            this.svg.selectAll('.neighbourpt')
                .classed('neighbourpt', false)
                .attr('r', this.inactivePointRadius)
                .transition()
                .duration(this.pointTransitionDuration);

            this.svg.selectAll(neighbourTags)
                .classed('neighbourpt', true)
                .transition()
                .duration(this.pointTransitionDuration)
                .attr('r', this.inactivePointRadius);

            // set class and attr of new active point and
            // remove click event listener
            selectedPoint
                .classed('activept', true)
                .moveToFront()
                .transition()
                .duration(this.pointTransitionDuration)
                .attr('r', this.activePointRadius);
        }.bind(this)
    });
};

/**
 * addBackground: Add SVG container to hold plot elements.
 *
 * @private
 */
NeighbourPlot.prototype._addBackground = function() {
    this.svg = d3.select(this.element).append('svg')
        .attr('width', this.fullWidth)
        .attr('height', this.fullHeight)
        .append('g')
        .attr('transform', 'translate(' + this.margin.left + ',' +
            this.margin.top + ')');
};

/**
 * defineToolTip: Add d3-tip plugin logic to plot.
 *
 * The tooltip function is attached to the plot points when they are
 * first drawn, so this function should be called before the plot points
 * are drawn.
 *
 * @private
 */
NeighbourPlot.prototype._defineToolTip = function() {
    this.tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            var treatment = d.treatment || d.gene_name;

            return '<p>ID: ' + d._id + '</p>' +
                '<p>Gene: ' + treatment + '</p>';
        });
    this.svg.call(this.tip);
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
NeighbourPlot.prototype._drawAxis = function() {
    var xAxis = d3.svg.axis()
        .scale(this.xScale)
        .ticks(this.xAxisTicks)
        .orient('bottom');

    var yAxis = d3.svg.axis()
        .scale(this.yScale)
        .ticks(this.yAxisTicks)
        .orient('left');

    this.xAxisSvg = this.svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + this.height + ')')
        .call(xAxis);

    this.yAxisSvg = this.svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);
};

/**
 * drawPlotLabels: Add labels to plot axis.
 *
 * @param {string} xAxisLabel - The label for the xAxis.
 * @param {string} yAxisLabel - The label for the yAxis.
 * @private
 */
NeighbourPlot.prototype._drawAxisLabels = function(xAxisLabel, yAxisLabel) {
    if(xAxisLabel) {
        xAxisLabel = 'Component 1';
    }

    if(yAxisLabel) {
        yAxisLabel = 'Component 2';
    }

    this.xAxisSvgLabelSvg = this.svg.append('text')
        .attr('transform', 'translate(' + this.width / 2 + ' ,' +
        (this.height + this.margin.bottom - 10) + ')')
        .style('text-anchor', 'middle')
        .text(xAxisLabel);

    this.yAxisSvgLabelSvg = this.svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -this.margin.left)
        .attr('x', -this.height/2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text(yAxisLabel);
};

/**
 * drawPoints: Draw the plot points.
 *
 * A background should be drawn and a scale should be set before this method
 * is called.
 *
 * @private
 */
NeighbourPlot.prototype._drawPoints = function() {
    this.plotPointsSvg = this.svg.selectAll('circle')
        .data(this.sampleData)
        .enter()
        .append('circle')
        .attr('cx', function(d) {
            return this.xScale(d.dimension_reduce[this.reductionType][0]);
        }.bind(this))
        .attr('cy', function(d) {
            return this.yScale(d.dimension_reduce[this.reductionType][1]);
        }.bind(this))
        .attr('r', this.inactivePointRadius)
        .classed('scatterpt', true)
        .classed('activept', false)
        .classed('neighbourpt', false)
        .attr('id', function(d) {
            return d._id;
        })
        .on('mouseover', this.tip.show)
        .on('mouseout', this.tip.hide)
        .on('click', function(d) {
            var selection = d3.select(this);
            if(!selection.classed('activept')) {
                $('body').trigger('updatePoint', d._id);
            }
        });
};

/**
 * setScale: Set the scale of the plot.
 *
 * Set the plot scale. Must be called before axis or plot points can be drawn.
 *
 * @this {NeighbourPlot}
 * @private
 */
NeighbourPlot.prototype._setScale = function() {
    // get minimum and maximum values for the x and y axis
    var xMinMax = d3.extent(this.sampleData, function(d) {
        return d.dimension_reduce[this.reductionType][0];
    }.bind(this));
    var yMinMax = d3.extent(this.sampleData, function(d) {
        return d.dimension_reduce[this.reductionType][1];
    }.bind(this));

    var xMargin = (xMinMax[1] - xMinMax[0]) * this.axisMargin;
    var yMargin = (yMinMax[1] - yMinMax[0]) * this.axisMargin;

    this.xScale = d3.scale.linear()
        .range([0, this.width])
        .domain([xMinMax[0] - xMargin, xMinMax[1] + xMargin]);

    this.yScale = d3.scale.linear()
        .range([this.height, 0])
        .domain([yMinMax[0] - yMargin, yMinMax[1] + yMargin]);
};

/**
 * updateAxis: Update the plot axis.
 *
 * Called when the dimensionality reduction used in the plot changes.
 *
 * @private
 */
NeighbourPlot.prototype._updateAxis = function() {
    var xAxis = d3.svg.axis()
        .scale(this.xScale)
        .ticks(this.xAxisTicks)
        .orient('bottom');

    var yAxis = d3.svg.axis()
        .scale(this.yScale)
        .ticks(this.yAxisTicks)
        .orient('left');

    this.xAxisSvg
        .transition()
        .duration(this.axisTransitionDuration)
        .ease('sin-in-out')
        .call(xAxis);

    this.yAxisSvg
        .transition()
        .duration(this.axisTransitionDuration)
        .ease('sin-in-out')
        .call(yAxis);
};

/**
 * updatePoints: Update the position of the plot points.
 *
 * Called when the dimensionality reduction used in the plot changes.
 *
 * @private
 */
NeighbourPlot.prototype._updatePoints = function() {
    this.plotPointsSvg
        .data(this.sampleData)
        .transition()
        .duration(this.axisTransitionDuration)
        .attr('cx', function(d) {
            return this.xScale(d.dimension_reduce[this.reductionType][0]);
        }.bind(this))
        .attr('cy', function(d) {
            return this.yScale(d.dimension_reduce[this.reductionType][1]);
        }.bind(this));
};

module.exports = NeighbourPlot;
