var _ = require('lodash');
var byteFlag = require('./utils/Byteflag.js');
var status = require('./enums/sampleStatus.js');
var config = require('../config/plots').neighbourPlot;

/**
 * PointsDrawer: Draw points using the HTML5 canvas.
 *
 * @param canvas {HTMLCanvasElement}
 * @constructor
 */
function PointsDrawer(canvas) {
    this.width = canvas.node().width;
    this.height = canvas.node().height;
    this.context = canvas.node().getContext('2d');
}

/**
 * draw: Clear the current canvas context and draw the desired points.
 *
 * After clearing the canvas context, this function checks the current
 * status of each sample (active, selected, etc.), and updates the context
 * so each point is styled accordingly.
 *
 * @param data {SampleManager} - A SampleManager object wrapping the data.
 * @param indices {Array} - The indices of the samples to be drawn.
 */
PointsDrawer.prototype.draw = function(data, indices) {
    this.context.clearRect(0, 0, this.width, this.height);
    var i, ii, point, drawIndex, active;
    var neighbours = [];
    var notFilteredOut = [];
    var filteredOut = [];

    if(indices) {
        // if a set of indices has been supplied, set the drawIndex
        // variable to reference the supplied indices
        drawIndex = indices;
    }
    else {
        // otherwise reference it to the cached array of indices
        drawIndex = data.dataRange;
    }

    // iterate through points
    // active points and neighbours are added
    // to a queue to be drawn last -- this is done to ensure
    // they're drawn last, and to reduce the number of calls made to the
    // canvas context to change the style of the currently selected point
    for(i = 0; i < drawIndex.length; i++) {
        ii = drawIndex[i];
        point = data.data[ii];

        if(byteFlag.check(point.status, status.ACTIVE)) {
            active = ii;
        }
        else if(byteFlag.check(point.status, status.NEIGHBOUR)) {
            neighbours.push(ii);
        }
        else if(!byteFlag.check(point.status, status.FILTERED_OUT)) {
            notFilteredOut.push(ii);
        }
        else {
            filteredOut.push(ii);
        }
    }

    // draw points in desired order - filtered out points, not filtered out points,
    // neighbours of the selected point and finally the active point
    if(filteredOut) {
        this.context.fillStyle = 'steelblue';
        this.context.strokeStyle = 'white';
        this.context.strokeWidth = 1;
        this.context.globalAlpha = 0.1;
        this._drawPoints(data, filteredOut, config.inactivePointRadius);
    }

    if(notFilteredOut) {
        this.context.fillStyle = 'steelblue';
        this.context.strokeStyle = 'white';
        this.context.globalAlpha = 1;
        this._drawPoints(data, notFilteredOut, config.inactivePointRadius);
    }

    if(neighbours) {
        this.context.fillStyle = 'yellow';
        this._drawPoints(data, neighbours, config.inactivePointRadius);
    }

    if(active) {
        this.context.fillStyle = 'red';
        this._drawPoint(data.data[active], config.activePointRadius);
    }
};

/**
 * setView: Update the current scatterplot view.
 *
 * Choose the dimensionality reduction method used to display points
 * in 2D space i.e.e PCA or TSNE.
 *
 * @param view {string} - The scatterplot view. Should be one of 'pca' or
 *     'tsne'.
 */
PointsDrawer.prototype.setView = function(view) {
    this.view = view;
};

/**
 * setScale: Set the scale currently used by the Scatterplot.
 *
 * This function should be called when the Scatterplot changes
 * the scale currently used to render points.
 *
 * @param xScale {function} - The scale to use for the x axis. Should
 *     be an instance of a d3 scale.
 * @param yScale {function} - The scale to use for the y axis. Should
 *     be an instance of a d3 scale.
 */
PointsDrawer.prototype.setScale = function(xScale, yScale) {
    this.xScale = xScale;
    this.yScale = yScale;
};

/**
 * drawPoint: Draw a point using the current scale and canvas context.
 *
 * @param point {object} - The point to draw.
 * @param r {number} - The radius of the point to draw.
 * @private
 */
PointsDrawer.prototype._drawPoint = function(point, r) {
    var cx = this.xScale(point.dimension_reduce[this.view][0]);
    var cy = this.yScale(point.dimension_reduce[this.view][1]);

    this.context.beginPath();
    this.context.arc(cx, cy, r, 0, 2 * Math.PI);
    this.context.closePath();
    this.context.stroke();
    this.context.fill();
};

/**
 * drawPoints: Draw the points.
 *
 * @param data {SampleManager} - A SampleManager object wrapping the data.
 * @param indices {Array} - The indices of the samples to be drawn.
 * @param r {Number} - The radius of the points to be drawn.
 * @private
 */
PointsDrawer.prototype._drawPoints = function(data, indices, r) {
    var i, ii, point;

    for(i = 0; i < indices.length; i++) {
        ii = indices[i];
        point = data.data[ii];
        this._drawPoint(point, r);
    }
};

module.exports = PointsDrawer;
