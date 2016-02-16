var _ = require('lodash');
var d3 = require('d3');

var config = require('../config/plots').neighbourPlot;

// browserify can't load modules dynamically due to the way it statically
// analyses paths when creating the output bundle. in other words, no variables
// or concatenated strings can be used in required paths.
// this switch is inelegant and should be replaced with something nicer
// maybe this could be configured server-side maybe when matplotlib 1.5 is
// released and these colour scales become available??
// TODO replace this whole godfawful switch
var colourMap;
switch(config.colourScale) {
    case 'inferno':
        colourMap = require('scale-color-perceptual/hex/inferno');
        break;
    case 'magma':
        colourMap = require('scale-color-perceptual/hex/magma');
        break;
    case 'plasma':
        colourMap = require('scale-color-perceptual/hex/plasma');
        break;
    case 'viridis':
        colourMap = require('scale-color-perceptual/hex/viridis');
        break;
    default:
        colourMap = require('scale-color-perceptual/hex/viridis');
        break;
}

var Utils = require('./utils/Utils.js');
var legendConfig = require('../config/plots').neighbourPlotLegend;
var PlotLegend = require('./PlotLegend.js');
var PointsDrawer = require('./PointsDrawer.js');
var SampleManager = require('./SampleManager.js');
var status = require('./enums/sampleStatus.js');
require('d3-tip')(d3); // add d3-tip tooltip plugin

/**
 * NeighbourPlotCanvas: Canvas based version of the scatterplot.
 *
 * @param {string} screenID - The _id of the screen currently being displayed.
 * @param {array} sampleData - The sample data for the screen. Each element
 *     in the array is an instance of a Sample document.
 * @param {string} element - The ID of the target div for this plot.
 *     All plot elements will be created as children of this div.
 * @constructor
 */
function NeighbourPlotCanvas(screenID, sampleData, element) {
    // find width of container div
    this.screenID = screenID;
    this.element = element;
    this.fullWidth = $(element).width();
    this.fullHeight = Math.round(this.fullWidth * (9/16));

    // manually set height of container div
    // this needs to be done as we're using absolute positioning
    // (see createCanvasSVGSelectors). this will prevent the height
    // of the container div from inheriting from its children
    $(element).height(this.fullHeight);

    this.margin = config.margin;
    this.width = this.fullWidth - this.margin.left - this.margin.right;
    this.height = this.fullHeight - this.margin.top - this.margin.bottom;

    this.overlay = 'None';
    this.view = 'tsne';
    this.NAVIGATING = false;
    this.navigateTimeoutFunction = null;
    this.idleMouseTimeoutFunction = null;

    this._createCanvasSVGSelectors();

    // create point drawing object
    this.pointsDrawer = new PointsDrawer(this.pointsCanvas);

    // create sample manager object
    this.sampleManager = new SampleManager(sampleData);

    // create tool-tip and attach it to the main svg
    this.tooltip = d3.tip().attr('class', 'd3-tip');
    this.mainSvg.call(this.tooltip);

    // create plot legend
    this.plotLegend = new PlotLegend(this.legendSvg);

    // attach click and mousemove behaviours to the main svg element
    var self = this;
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
    this.randomIndex = _.sample(this.sampleManager.allIndices, 200);

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
    this.pointsDrawer.redraw(this.sampleManager, null);
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

NeighbourPlotCanvas.prototype.updateOverlay = function(overlay) {
    var colourScale;
    var scaleMin = config.colourScaleExtent[0];
    var scaleMax = config.colourScaleExtent[1];

    // no scale selected
    if(overlay === "None") {
        colourScale = null;
    }
    else {
        colourScale = d3.scale.linear()
            .domain(Utils.linspace(scaleMin, scaleMax, colourMap.length))
            .range(colourMap)
            .clamp(true);
    }

    // new new colourscale to pointsdrawer
    this.pointsDrawer.setColourScale(colourScale);
    this.plotLegend.setColourScale(colourScale);

    this.pointsDrawer.overlay = overlay;
    this.pointsDrawer.redraw(this.sampleManager, null);
};

/**
 * updateFilter: Update the filtering styled applied by the filter.
 *
 * Called when the 'updateFilter' event fires.
 *
 * @param {array} filterOutIndex - Array of sample indices corresponding to
 *     which samples are being filtered out.
 */
NeighbourPlotCanvas.prototype.updateFilter = function(filterOutIndex) {
    // if no filtering is to be applied, passed the addStatusToIndex function
    // an empty array so it'll remove the FILTERED_OUT status from every sample
    if(_.isNull(filterOutIndex) || _.isUndefined(filterOutIndex)) {
        filterOutIndex = [];
    }

    this.sampleManager.setStatusToIndex(filterOutIndex, status.FILTERED_OUT);

    // redraw
    this.pointsDrawer.redraw(this.sampleManager, null);
};

/**
 * updatePoint: Update the currently active point.
 *
 * @param {string} sampleId - The ID of the currently selected sample.
 */
NeighbourPlotCanvas.prototype.updatePoint = function(sampleId) {
    var selectedIndex = this.sampleManager.getIndexFromID(sampleId);
    var neighbourIndices;

    $.ajax({
        type: 'GET',
        url: '/api/' + this.screenID + '/samples/' + sampleId + '/neighbours',
        dataType: 'json',
        success: function (data) {
            // get neighbour IDs from database
            var neighbourIDs = data[0].neighbours;
            neighbourIndices = this.sampleManager.getIndexFromID(neighbourIDs);

            // update sample manager
            this.sampleManager.setStatusToIndex(selectedIndex,
                status.ACTIVE);
            this.sampleManager.setStatusToIndex(neighbourIndices,
                status.NEIGHBOUR);

            // redraw
            this.pointsDrawer.redraw(this.sampleManager, null);
        }.bind(this)
    });
};

/**
 * updateView: Update the current scatterplot view.
 *
 * Choose the dimensionality reduction method used to display points
 * in 2D space e.g. PCA or TSNE.
 *
 * @param {string} view - The scatterplot view. Should be one of 'pca' or
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

    // update the sample manager with the new scale
    this.sampleManager.setScale(this.xScale, this.yScale);
    this.sampleManager.setView(view);

    // update behaviours
    this.navigateBehaviour = this._createNavigateBehaviour();

    // attach navigation behaviour to the main canvas object
    this.mainSvg.call(this.navigateBehaviour);

    // redraw the new point
    this.pointsDrawer.redraw(this.sampleManager, null);
};

/**
 * createCanvasSVGSelectors: Create SVG and Canvas elements used in plot drawing.
 *
 * Required SVG and canvas elements needed to draw the plot are all created
 * in this function. These elements are added as children to the DOM node
 * specific in the 'element' property.
 *
 * @private
 */
NeighbourPlotCanvas.prototype._createCanvasSVGSelectors = function() {
    var parentDiv = d3.select(this.element);

    // note all elements below must be positioned absolutely so
    // they'll be rendered on top of eachother

    // create svg element and set height and translation for the SVG used
    // to draw the plot axis. these are drawn using SVG because it's much
    // better at drawing crisp lines and text, and d3's svg axis module
    // handles all the the heavy lifting for drawing and updating the axis
    //
    // this is drawn to the full height and width of the scatterplot
    this.axisSvg = parentDiv.append('svg')
        .attr('width', this.fullWidth)
        .attr('height', this.fullHeight)
        .style('z-index', 1)
        .style('position', 'absolute')
        .append('g')
        .attr('transform', 'translate(' + this.margin.left + ',' +
            this.margin.top + ')');

    // create canvas element and set height and translation of the canvas
    // used to draw the plot points -- the height and width is set to
    // the full height and width minus the margins, and is translated so it
    // sits 'above' the plot axis. the canvas is shifted up one pixel
    // to prevent any artefacts from the canvas and axis avg overlapping
    this.pointsCanvas = parentDiv.append('canvas')
        .attr('width', this.width - 1)
        .attr('height', this.height - 1)
        .style('transform', 'translate(' + (this.margin.left + 1) +
            'px' + ',' + (this.margin.top + 1) + 'px)')
        .style('z-index', 2)
        .style('position', 'absolute');

    // create an svg element that sits on top of the points canvas we
    // just defined above
    // this SVG catches events and is used to draw the tooltip element
    this.mainSvg = parentDiv.append('svg')
        .attr('width', this.width - 1)
        .attr('height', this.height - 1)
        .style('transform', 'translate(' + (this.margin.left + 1) +
            'px' + ',' + (this.margin.top + 1) + 'px)')
        // an svg transform should be applied to the SVG element too
        // as we've shifted its position using CSS.
        // note we don't specify pixels -- it's not a CSS transformation
        .attr('transform', 'translate(' + (this.margin.left + 1) + ',' +
            (this.margin.top + 1) + ')')
        // this element should have the greatest z-index so it catches
        // mouse events
        .style('z-index', 3)
        .style('position', 'absolute');

    // SVG for drawing legend
    this.legendSvg = parentDiv.append('svg')
        .attr('width', legendConfig.width)
        .attr('height', legendConfig.height)
        .style('transform', 'translate(' + (this.margin.left + 1 + this.width
            - legendConfig.width - 5) + 'px' + ',' + (this.margin.top + 5) + 'px)')
        .style('z-index', 4)
        .style('position', 'absolute');
};

/**
 * createNavigateBehaviour: Define the behaviour used for plot navigation.
 *
 * Creates and returns a d3.behaviour.zoom() object. Behaviour during
 * the zoom/navigate event is defined by the onNavigate function, and
 * onNavigateEnd for when the event ends.
 * see: https://github.com/mbostock/d3/wiki/Zoom-Behavior
 *
 * @returns {function} - An instance of a d3.behaviour.zoom() function.
 * @private
 */
NeighbourPlotCanvas.prototype._createNavigateBehaviour = function() {
    return d3.behavior.zoom()
        .x(this.xScale)
        .y(this.yScale)
        .scaleExtent(config.zoomExtent)
        .on('zoom', this._onNavigate.bind(this))
        .on('zoomend', this._onNavigateEnd.bind(this));
};

/**
 * mouseMoveHandler: Handles event for when the mouse moves over the plot.
 *
 * When the mouse has been idle for the time specified in
 * config.tooltip.timeout, a query is made to find the closest point to the
 * mouse cursor. If the cursor is over a point, a tooltip appears over the
 * point.
 *
 * The timeout resets every time the mouse is moved.
 *
 * @param mouse
 * @private
 */
NeighbourPlotCanvas.prototype._mouseMoveHandler = function(mouse, args) {
    if(this.idleMouseTimeoutFunction) {
        clearTimeout(this.idleMouseTimeoutFunction);
    }

    this.tooltip.hide();

    // timeout function will be called when mouse has been idle
    // for the time specified in config.tooltip.timeout.
    this.idleMouseTimeoutFunction = setTimeout(function() {
        var index = this.sampleManager.findSampleFromMouse(mouse,
            config.activePointRadius);

        if(index !== -1) {
            // get position of point in plot space to display the tooltip
            // above
            var d = this.sampleManager.data[index];
            var x = this.xScale(d.dimension_reduce[this.view][0]);
            var y = this.yScale(d.dimension_reduce[this.view][1]);

            // create text for tooltip
            var treatment = d.treatment || d.gene_name;
            var tooltipText = '<p>ID: ' + d._id + '</p>' +
                '<p>Treatment: ' + treatment + '</p>';

            this.tooltip
                .offset([y + config.tooltip.offset.top, x])
                .html(tooltipText);

            this.tooltip.show.apply(null, args);
        }

    }.bind(this), config.tooltip.timeout);
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

    // update svg for x and y axis
    this.xAxisSvg.call(this.xAxis);
    this.yAxisSvg.call(this.yAxis);

    // draw subset of data while pan/zooming taking place
    this.pointsDrawer.redraw(this.sampleManager, this.randomIndex);
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
            this.pointsDrawer.redraw(this.sampleManager);
        }.bind(this), config.navigateTimeout);

        this.NAVIGATING = false;
    }
};

/**
 * setAxis: Create/update the plot axis.
 *
 * Method should be called during plot creation and changes of view.
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

    // create the axes SVG elements if they don't exist yet
    if(!this.xAxisSvg) {
        this.xAxisSvg = this.axisSvg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + this.height + ')')
    }
    if(!this.yAxisSvg) {
        this.yAxisSvg = this.axisSvg.append('g')
            .attr('class', 'y axis')
    }

    // apply the axes
    this.xAxisSvg.call(this.xAxis);
    this.yAxisSvg.call(this.yAxis);
};

module.exports = NeighbourPlotCanvas;
