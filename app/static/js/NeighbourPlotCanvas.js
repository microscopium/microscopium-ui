var _ = require('lodash');
var d3 = require('d3');
var config = require('../config/plots').neighbourPlot;
var PointsDrawer = require('./PointsDrawer.js');
var SampleManager = require('./SampleManager.js');
var status = require('./enums/sampleStatus.js');
require('d3-tip')(d3); // add d3-tip tooltip plugin

/**
 * NeighbourPlotCanvas: Canvas based version of the scatterplot.
 *
 * @param screenID {string}
 * @param sampleData {array}
 * @constructor
 */
function NeighbourPlotCanvas(screenID, sampleData, element) {
    // find width of container div
    this.screenID = screenID;
    this.fullWidth = $(element).width();
    this.fullHeight = Math.round(this.fullWidth * (9/16));
    this.margin = config.margin;
    this.width = this.fullWidth - this.margin.left - this.margin.right;
    this.height = this.fullHeight - this.margin.top - this.margin.bottom;

    this.view = 'tsne';
    this.NAVIGATING = false;
    this.navigateTimeoutFunction = null;
    this.idleMouseTimeoutFunction = null;

    // create tool-tip
    this.toolTip = this._createToolTip();

    // mount all canvas objects
    this.mainSvg = d3.select('#main-svg')
        .attr('width', this.width - 1)
        .attr('height', this.height)
        .attr('transform', 'translate(' + (this.margin.left + 1) + ',' +
        this.margin.top + ')')
        .style('transform', 'translate(' + (this.margin.left + 1) +
            'px' + ',' + (this.margin.top) + 'px)');

    var pointsCanvas = d3.select('#points-canvas')
        .attr('width', this.width - 1)
        .attr('height', this.height)
        .style('transform', 'translate(' + (this.margin.left + 1) +
            'px' + ',' + (this.margin.top) + 'px)');

    this.axisSvg = d3.select('#axis-svg')
        .attr('width', this.fullWidth)
        .attr('height', this.fullHeight)
        .append('g')
        .attr('transform', 'translate(' + this.margin.left + ',' +
            this.margin.top + ')');

    // create point drawing object
    this.pointsDrawer = new PointsDrawer(pointsCanvas);

    // create sample manager object
    this.sampleManager = new SampleManager(sampleData);

    // create tool-tip
    this.tip = d3.tip()
        .attr('class', 'd3-tip');

    this.mainSvg.call(this.tip);

    var self = this; // shoot me
    this.mainSvg
        .on('click', function() {
            self._onClickHandler(d3.mouse(this));
        })
        .on('mousemove', function() {

            // create array from function arguments
            var args = [].slice.call(arguments);
            // add event context as last argument - want to keep
            // it alive for the setTimeout call
            args.push(this);

            self._mouseMoveHandler(d3.mouse(this), args);
        });

    // get random indices for drawing subset of data during pan/zoom
    this.randomIndex = _.sample(this.sampleManager.dataRange, 200);

    // set scales
    this.updateView(this.view);
}

/**
 * reset: Reset panning and zooming view.
 */
NeighbourPlotCanvas.prototype.reset = function () {
    this.navigateBehaviour
        .translate([0, 0])
        .scale(1);
    this.pointsDrawer.draw(this.sampleManager, null);
};

// TODO: might be easier to manage scales in a global variable?
/**
 * setScale: Set the scale currently used by the plot.
 *
 * Should be called when the view of the scatterplot changes.
 */
NeighbourPlotCanvas.prototype.setScale = function() {
    var xRange = d3.extent(this.sampleManager.data, function(d) {
        return d.dimension_reduce[this.view][0];
    }.bind(this));

    var yRange = d3.extent(this.sampleManager.data, function(d) {
        return d.dimension_reduce[this.view][1];
    }.bind(this));

    var xMargin = (xRange[1] - xRange[0]) * config.axisMargin;
    var yMargin = (yRange[1] - yRange[0]) * config.axisMargin;

    this.xScale = d3.scale.linear()
        .range([0, this.width])
        .domain([xRange[0] - xMargin, xRange[1] + xMargin]);

    this.yScale = d3.scale.linear()
        .range([this.height, 0])
        .domain([yRange[0] - yMargin, yRange[1] + yMargin]);
};

NeighbourPlotCanvas.prototype.updateFilter = function(filterOutIndex) {
    // if no filtering is to be applied, passed the addStatusToIndex function
    // an empty array so it'll remove the FILTERED_OUT status from every sample
    if(!filterOutIndex) {
        filterOutIndex = [];
    }

    this.sampleManager.addStatusToIndex(filterOutIndex, status.FILTERED_OUT);

    // redraw
    this.pointsDrawer.draw(this.sampleManager, null);
};

/**
 * updatePoint: Update the currently active point.
 *
 * @param sampleId {string} - The ID of the currently selected sample.
 */
NeighbourPlotCanvas.prototype.updatePoint = function(sampleId) {
    var selectedIndex = this.sampleManager.getIndexFromID(sampleId);
    var neighbourIndex;

    $.ajax({
        type: 'GET',
        url: '/api/' + this.screenID + '/samples/' + sampleId + '/neighbours',
        dataType: 'json',
        success: function (data) {
            // get neighbour IDs from database
            var neighbourIDs = data[0].neighbours;
            neighbourIndex = this.sampleManager.getIndexFromID(neighbourIDs);

            // update sample manager
            this.sampleManager.addStatusToIndex(selectedIndex, status.ACTIVE);
            this.sampleManager.addStatusToIndex(neighbourIndex, status.NEIGHBOUR);

            // redraw
            this.pointsDrawer.draw(this.sampleManager, null);
        }.bind(this)
    });
};

/**
 * updateView: Update the current scatterplot view.
 *
 * Choose the dimensionality reduction method used to display points
 * in 2D space i.e.e PCA or TSNE.
 *
 * @param view {string} - The scatterplot view. Should be one of 'pca' or
 *     'tsne'.
 */
NeighbourPlotCanvas.prototype.updateView = function(view) {
    // set the state of the plot -- either looking at PCA or TSNE!
    this.view = view;

    // update the scales and the axis accordingly
    this.setScale();
    this._setAxis();

    // update the points drawer with the new scale
    this.pointsDrawer.setScale(this.xScale, this.yScale);
    this.pointsDrawer.setView(view);

    // update the sample manager with the new sca;e
    this.sampleManager.setScale(this.xScale, this.yScale);
    this.sampleManager.setView(view);

    // update behaviours
    this.navigateBehaviour = this._createNavigateBehaviour();

    // attach navigation behaviour to the main canvas object
    this.mainSvg.call(this.navigateBehaviour);

    // redraw the new point
    this.pointsDrawer.draw(this.sampleManager, null);
};

/**
 * createNavigateBehaviour: Define the behaviour used for plot navigation.
 *
 * Creates and returns a d3.behaviour.zoom() object. Behaviour during
 * the zoom/navigate event is defined by the onNavigate function, and
 * onNavigateEnd for when the event ends.
 *
 * @returns {*}
 * @private
 */
NeighbourPlotCanvas.prototype._createNavigateBehaviour = function() {
    return d3.behavior.zoom()
        .x(this.xScale)
        .y(this.yScale)
        .scaleExtent([1, 10])
        .on('zoom', this._onNavigate.bind(this))
        .on('zoomend', this._onNavigateEnd.bind(this));
};

/**
 * CREATE!!!!
 *
 * @returns {*}
 * @private
 */
NeighbourPlotCanvas.prototype._createToolTip = function() {
    return d3.tip()
        .attr('class', 'd3-tip')
        .html(function() {
            return "Congratulations. You just played yourself.";
        })
};

/**
 * mouseMoveHandler
 *
 * @param mouse
 * @private
 */
NeighbourPlotCanvas.prototype._mouseMoveHandler = function(mouse, args) {
    if(this.idleMouseTimeoutFunction) {
        clearTimeout(this.idleMouseTimeoutFunction);
    }

    this.tip.hide();

    this.idleMouseTimeoutFunction = setTimeout(function() {
        var index = this.sampleManager.findSampleFromMouse(mouse,
            config.activePointRadius);

        if(index !== -1) {
            var d = this.sampleManager.data[index];
            var x = this.xScale(d.dimension_reduce[this.view][0]);
            var y = this.yScale(d.dimension_reduce[this.view][1]);

            this.tip
                .offset([y + config.toolTipOffset.top, x])
                .html(function() {
                    var treatment = d.treatment || d.gene_name;

                    return '<p>ID: ' + d._id + '</p>' +
                        '<p>Treatment: ' + treatment + '</p>';
                });

            this.tip.show.apply(null, args);
        }

    }.bind(this), 500);
};

/**
 * onClickHandler: Define behaviour when main plot canvas is clicked.
 *
 * @param mouse {Array} - Mouse object, usually generated by d3 from the
 *     d3.mouse(this) method during an event. First co-ordinate represents
 *     the x position of the mouse, second co-ordinate represents the y
 *     co-ordinate.
 * @private
 */
NeighbourPlotCanvas.prototype._onClickHandler = function(mouse) {
    var index = this.sampleManager
        .findSampleFromMouse(mouse, config.inactivePointRadius);

    // only trigger an update if an active point was found
    if(index !== -1) {
        var sampleID = this.sampleManager.data[index];
        sampleID = sampleID._id;
        $('body').trigger('updateSample', sampleID);
    }
};

/**
 * onNavigate: Define behaviour of plot during a zoom/navigation event.
 *
 * @private
 */
NeighbourPlotCanvas.prototype._onNavigate = function() {
    this.NAVIGATING = true;

    // reset the timeout before the plot re-draws
    if(this.navigateTimeoutFunction) {
        clearTimeout(this.navigateTimeoutFunction);
    }

    // update all svg axis
    this.xAxisSvg.call(this.xAxis);
    this.yAxisSvg.call(this.yAxis);

    // draw subset of data while pan/zooming taking place
    this.pointsDrawer.draw(this.sampleManager, this.randomIndex);
};

/**
 * onNavigate: Define behaviour of plot at end of a zoom/navigation event.
 *
 * @private
 */
NeighbourPlotCanvas.prototype._onNavigateEnd = function() {
    if(this.NAVIGATING) {

        // delay the time between zoom/panning taking place and the
        // full plot being re-drawn
        this.navigateTimeoutFunction = setTimeout(function() {
            this.pointsDrawer.draw(this.sampleManager);
        }.bind(this), 350);

        this.NAVIGATING = false;
    }
};

/**
 * setAxis: Create/update the plot axis.
 *
 * Method should be called during plot creation, change of view and
 * during navigation/zoom events.
 *
 * @private
 */
NeighbourPlotCanvas.prototype._setAxis = function() {
    this.xAxis = d3.svg.axis()
        .scale(this.xScale)
        .ticks(config.xAxisTicks)
        .innerTickSize(-this.height)
        .outerTickSize(0)
        .tickPadding(10)
        .orient('bottom');

    this.yAxis = d3.svg.axis()
        .scale(this.yScale)
        .ticks(config.yAxisTicks)
        .innerTickSize(-this.width)
        .outerTickSize(0)
        .orient('left');

    // remove previous axis
    if(this.xAxisSvg) {
        this.xAxisSvg.remove();
    }
    if(this.yAxisSvg) {
        this.yAxisSvg.remove();
    }

    this.xAxisSvg = this.axisSvg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + this.height + ')')
        .call(this.xAxis);

    this.yAxisSvg = this.axisSvg.append('g')
        .attr('class', 'y axis')
        .call(this.yAxis);
};

module.exports = NeighbourPlotCanvas;
