'use strict';

/**
 * History: Keep track of user's sample history.
 *
 * This object emulates the typical back/forward behaviour in browsers.
 *
 * @constructor
 */
function History() {
    this.sampleHistory = [];
    this.current = -1;
    this.lastSample = null;
    this.length = 0;
}

/**
 * add: Adds an item to the history.
 *
 * Any elements after the current iterator are removed.
 *
 * @this {History}
 * @param {string} sampleId - The sampleID to add to the history.
 */
History.prototype.add = function(sampleId) {
    // only add a new item to the history if it was not just added
    if(this.lastSample !== sampleId) {
        // add new entry to array if no more space in current history
        if(this.current === this.sampleHistory.length-1) {
            this.current++;
            this.sampleHistory.push(sampleId);
        }
        // otherwise overwrite old history if room in array
        else {
            this.current++;
            this.sampleHistory[this.current] = sampleId;
        }
        this.lastSample = sampleId;
        this.length = this.current+1;
    }
};

/**
 * back: Go back one item in the history.
 *
 * Returns null if there is no items to return.
 *
 * @this {History}
 * @returns {string|null} The previous item in the list of samples.
 */
History.prototype.back = function() {
    if(this.current > 0 && this.length > 0) {
        this.current--;
        return this.sampleHistory[this.current];
    }
    else {
        return null;
    }
};

/**
 * forward: Go forward one item in the history.
 *
 * Returns null if there are no items to return.
 *
 * @returns {string|null}
 */
History.prototype.forward = function() {
    if(this.current > -1 && this.current < this.length-1) {
        this.current++;
        return this.sampleHistory[this.current];
    }
    else {
        return null;
    }
};

/**
 * reset: Reset all items in the history.
 *
 * @this {History}
 */
History.prototype.reset = function() {
    this.sampleHistory = [];
    this.current = -1;
    this.length = 0;
};

module.exports = History;

