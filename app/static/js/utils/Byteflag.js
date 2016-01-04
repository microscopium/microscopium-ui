'use strict';

var Byteflag = {};

/**
 * add: Add bit to byteflag.
 *
 * @param flag {number} - Query byteflag.
 * @param newBit {number} - New bit too add.
 * @returns {number} - Updated byteflag.
 */
Byteflag.add = function(flag, newBit) {
    return flag | newBit;
};

/**
 * remove: Remove bit from byteflag.
 *
 * @param flag {number} - Query byteflag.
 * @param removeBit {number} - Bit to remove.
 * @returns {number} - Updated byteflag.
 */
Byteflag.remove = function(flag, removeBit) {
    return flag & ~ removeBit;
};

/**
 * check: Checks if bit in byteflag.
 *
 * @param flag {number} - Query byteflag.
 * @param checkBit {number} - Bit to check.
 * @returns {boolean} - True if checkBit is in flag.
 */
Byteflag.check = function(flag, checkBit) {
    return (flag & checkBit) === checkBit;
};

module.exports = Byteflag;
