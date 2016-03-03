var d3 = require('d3');
var _ = require('lodash');
var Utils = require('./utils/Utils.js');
var config = require('../config/plots.js').neighbourPlotLegend;

/**
 * PlotLegend: Handle creation/updating of the legend in the Neighbourplot.
 *
 * @param svg
 * @constructor
 */
function PlotLegend(svg) {
    this.svg = svg;
}

/**
 * setColourScale: Draw the legend for the given colour scale.
 *
 * @param scale {Function} - Instance of a d3.scale.linear() where the range
 *     is an array of colours. (i.e a colour scale).
 */
PlotLegend.prototype.setColourScale = function(scale) {
    this.svg.selectAll('*').remove();

    // if no scale is passed to the function, we're happy
    // just to remove the SVG elements and return out of the function
    if(_.isNull(scale) || _.isUndefined(scale)) {
        return;
    }

    // otherwise go on and create the legend..
    this.scale = scale;

    this._addBackground();
    this._addLegendGradient();
    this._setAxis();
};

/**
 * addBackground: Add a solid white background to the plot legend.
 *
 * @private
 */
PlotLegend.prototype._addBackground = function() {
    this.svg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', config.width)
        .attr('height', config.height)
        .attr('fill', 'white')
        .style('stroke', 'black')
        .style('stroke-width', 1);
};

/**
 * addLegendGradient: Add colour gradient for the plot legend.
 *
 * @private
 */
PlotLegend.prototype._addLegendGradient = function() {
    // create linear gradient def going from left to right
    var gradient = this.svg.append('defs')
        .append('linearGradient')
        .attr('id', 'gradient')
        .attr('x1', '0%') // left
        .attr('y1', '100%')
        .attr('x2', '100%') // to right
        .attr('y2', '100%')
        .attr('spreadMethod', 'pad');

    // programatically generate the gradient for the legend
    // this creates an array of [pct, colour] pairs as stop
    // values for legend
    var pct = Utils.linspace(0, 100, this.scale.range().length)
        .map(function(d) {
            return Math.round(d) + '%';
        });
    var colourPct = d3.zip(pct, this.scale.range());

    colourPct.forEach(function(d) {
        gradient.append('stop')
            .attr('offset', d[0])
            .attr('stop-color', d[1])
            .attr('stop-opacity', 1);
    });

    // now append the legend
    this.svg.append('rect')
        .attr('x', config.margin.left)
        .attr('y', config.margin.top)
        .attr('width', config.width - config.margin.left - config.margin.right)
        .attr('height', config.height - config.margin.top - config.margin.bottom)
        .style('fill', 'url(#gradient)');
};

/**
 * setAxis: Add an axis to the plot legend.
 *
 * @private
 */
PlotLegend.prototype._setAxis = function() {
    var colorScaleMin = this.scale.domain()[0];
    var colorScaleMax = this.scale.domain().slice(-1)[0];

    var legendScale = d3.scale.linear()
        .domain([colorScaleMin, colorScaleMax])
        .range([0, config.width - config.margin.left - config.margin.right]);

    var legendAxis = d3.svg.axis()
        .scale(legendScale)
        .orient("bottom")
        .ticks(3);

    this.svg.append("g")
        .attr("class", "legend axis")
        .attr("transform", "translate(" + config.margin.left + ", " +
            (config.height - config.margin.bottom) + ")")
        .call(legendAxis);
};

module.exports = PlotLegend;
