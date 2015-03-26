// various utility functions
var _ = require('lodash');

var Utils = {};
Utils.regexFilter = regexFilter;
Utils.uniqueData = uniqueData;
Utils.findByValues = findByValues;

/**
 * regexFilter: Return regex function for use in filter.
 *
 * The function returned returns true if the query pattern is contained
 * in the element given to it. Case insensitive.
 *
 * @param {string} pattern - The query pattern.
 * @returns {Function} - The query function.
 */
function regexFilter(pattern) {
    return function(element) {
        return element.match(new RegExp(pattern, 'i'));
    };
}

/**
 * uniqueData: Return all unique data values.
 *
 * Given an array of objects, find all unique values for a specified key.
 * Uses lodash chained lodash methods.
 *
 * @param {array} data - An array of objects.
 * @param {string} key - The key to find the unique values of.
 * @returns {array} - An array of unique values.
 */
function uniqueData(data, field) {
    return _.uniq(_.pluck(_.flatten(data), field)).sort();
}

/**
 * findByValues: Filter an array of objects on multiple values of a property.
 *
 * @param {array} collection - An array of objects.
 * @param {string} property - The object property to filter on.
 * @param {array} values - An array of values to filter the data.
 */
function findByValues(collection, property, values) {
    return _.filter(collection, function(item) {
        return _.contains(values, item[property]);
    });
}

module.exports = Utils;
