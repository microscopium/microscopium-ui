/**
 * History: Keep track of user's sample history.
 *
 * This object emulates the typical back/forward behaviour in browsers.
 *
 * @constructor
 */
function History() {
    this.sampleHistory = [];
    this.iterator = 0;
    this.length = this.sampleHistory.length;
    this.lastSample = null;
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
    if(sampleId !== this.lastSample) {
        this.sampleHistory = this.sampleHistory.slice(0, this.iterator+1);
        this.sampleHistory.push(sampleId);
        this.iterator = this.sampleHistory.length - 1;
        this.length = this.sampleHistory.length;
        this.lastSample = sampleId;
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
    if(this.iterator > 0) {
        this.iterator--;
        return this.sampleHistory[this.iterator];
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
    if(this.iterator < this.sampleHistory.length - 1) {
        this.iterator++;
        return this.sampleHistory[this.iterator];
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
    this.iterator = 0;
    this.lastSample = null;
    this.length = this.sampleHistory.length;
};

module.exports = History;

