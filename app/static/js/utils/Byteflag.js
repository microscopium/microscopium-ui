'use strict';
var Byteflag = {};

/**
 * add: Return new byteflag with newBit added to existing flag.
 *
 * @param flag {number} - Query byteflag.
 * @param newBit {number} - New bit to add.
 * @returns {number} - Updated byteflag.
 */
Byteflag.add = function(flag, newBit) {
    return flag | newBit;
};

/**
 * remove: Return new byteflag with removeBit removed from existing flag.
 *
 * @param flag {number} - Query byteflag.
 * @param removeBit {number} - Bit to remove.
 * @returns {number} - Updated byteflag.
 */
Byteflag.remove = function(flag, removeBit) {
    return flag & ~ removeBit;
};

/**
 * check: Check if checkBit is in byteflag.
 *
 * @param flag {number} - Query byteflag.
 * @param checkBit {number} - Bit to check.
 * @returns {boolean} - True if checkBit is in flag.
 */
Byteflag.check = function(flag, checkBit) {
    return (flag & checkBit) === checkBit;
};

module.exports = Byteflag;
