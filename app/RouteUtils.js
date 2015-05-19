var RouteUtils = {};

/**
 * parseSelectQuery: Parse query string into a select command for Mongoose.
 *
 * Returns null if no select parameters supplied.
 *
 * @param selectQuery {string[]} - An array of strings for multiple select
 *     parameters, or a string for a single parameter.
 */
RouteUtils.parseSelectQuery = function(selectQuery) {
    if(!selectQuery) return null;
    var parseQuery = typeof selectQuery == 'string' ? [selectQuery] : selectQuery;
    return parseQuery.join(' ');
};

module.exports = RouteUtils;
