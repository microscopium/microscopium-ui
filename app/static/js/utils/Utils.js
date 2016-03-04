'use strict';
// various utility functions
var _ = require('lodash');

var Utils = {};

/**
 * regexFilter: Return regex function for use in filter.
 *
 * The function returned returns true if the query pattern is contained
 * in the element given to it. Case insensitive.
 *
 * @param {string} pattern - The query pattern.
 * @returns {Function} - The query function.
 */
Utils.regexFilter = function(pattern) {
    return function(element) {
        return element.match(new RegExp(pattern, 'i'));
    };
};

/**
 * uniqueData: Return all unique data values.
 *
 * Given an array of objects, find all unique values for a specified key.
 * Uses lodash chained lodash methods.
 *
 * @param {array} data - An array of objects.
 * @param {string} field - The key to find the unique values of.
 * @returns {array} - An array of unique values.
 */
Utils.uniqueData = function(data, field) {
    return _.uniq(_.pluck(_.flatten(data), field)).sort();
};

/**
 * findByValues: Filter an array of objects on multiple values of a property.
 *
 * @param {array} collection - An array of objects.
 * @param {string} property - The object property to filter on.
 * @param {array} values - An array of values to filter the data.
 * @param {boolean} invert - If true, return objects not satisfying the
 *     query values.
 */
Utils.findByValues = function(collection, property, values, invert) {
    if(invert === true) {
        return _.filter(collection, function(item) {
            return !_.contains(values, item[property]);
        });
    }
    else {
        return _.filter(collection, function(item) {
            return _.contains(values, item[property]);
        });
    }
};

/**
 * sortedPush: Insert an item into an array while preserving the ordering.
 *
 * @param {array} array - A sorted array of primitives.
 * @param {string, number} value - A value to insert into the array.
 */
Utils.sortedPush = function(array, value) {
    array.splice(_.sortedIndex(array, value), 0, value);
};

/**
 * makeSelector: Add '#' before input string. Makes item selectable in jQuery.
 *
 * Returns input element if it already begins with #.
 *
 * @param {string} element
 */
Utils.makeSelector = function(element) {
    return element.charAt(0) === '#' ? element : '#' + element;
};

/**
 * euclideanDistance: Find the Euclidean distance between two points.
 *
 * @param x1 {number} - X co-ordinate of first point.
 * @param y1 {number} - Y co-ordinate of first point.
 * @param x2 {number} - X co-ordinate of second point.
 * @param y2 {number} - Y co-ordinate of second point.
 * @returns {number} - The Euclidean distance.
 */
Utils.euclideanDistance = function(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
};

/**
 * linspace: Return a linearly spaced array.
 *
 * Like the Numpy/MATLABs linspace method, this generates an array
 * of n evenly spaced values in the range [start, end]. The start
 * and end values are always included in the output.
 *
 * @param start {number} - The first value.
 * @param end {number} - The last value.
 * @param n {number} - The length of the linearly spaced array.
 * @returns out {Array} - The linearly spaced array.
 */
Utils.linspace = function(start, end, n) {
    var out = new Array(n);
    var delta = (end - start) / (n - 1);

    for(var i = 0; i < n; i++) {
        out[i] = start + (i * delta);
    }

    return out;
};

/**
 * percentile: Return the n-th percentile of a sorted array.
 *
 * Given a sorted array of numbers, find the n-th percentile. This function
 * finds the linear interpolation by closest ranks method.
 *
 * @param data {Array} - The query Array. This is assumed to be sorted.
 * @param percentile {number} - Number in the range [0.0, 1.0]. The percentile
 *     to find.
 * @returns {number} - The percentile value.
 */
Utils.percentile = function(data, percentile) {
    var index = percentile * (data.length - 1);
    var r = index % 1;
    var lower = data[Math.floor(index)];
    var upper = data[Math.ceil(index)];
    return r * lower + (1 - r) * upper;
};

/**
 * getPercentile: Get the percentiles of an array.
 *
 * Given an array of numbers, find the given percentiles. E.g
 * getPercentiles(queryArray, [0.25, 0.5, 0.75]) will find the 25th,
 * median and 75th percentile values.
 *
 * @param data - {Array} - The query Array. Does not need to be sorted.
 * @param percentiles {Array} - An array of percentile values to find.
 * @returns {Array} - The array of percentile values.
 */
Utils.getPercentiles = function(data, percentiles) {
    var sorted = data.sort(function(a, b) { return a - b; });
    return percentiles.map(function(d) {
        return Utils.percentile(sorted, d);
    });
};

/**
 * translateString: Create a translate param string for CSS/SVG manipulation.
 *
 * In many D3/jQuery functions it's necessary to create a string of the format
 * 'translate(x, y)'. This is usually fed to a function that manipulates the
 * SVG attribute or DOM element style. It gets a little messy creating this
 * string every time with string concatenation, so this function creates the
 * string from parameters.
 *
 * @param left {Number} - The left/x translation.
 * @param top {Number} - The right/y translation.
 * @param px {bool} - Whether or not to add the 'px' suffix to the
 *     left and right params. This is needed for CSS translations as the
 *     unit of translation must be  given explicitly. This should always be
 *     false for SVG manipulation as SVG only works in px.
 */
Utils.translateString = function(left, top, px) {
    var out = [];
    out.push('translate(');
    out.push(left);
    out.push(px ? 'px' : '');
    out.push(', ');
    out.push(top);
    out.push(px ? 'px' : '');
    out.push(')');
    return out.join('');
};

module.exports = Utils;
