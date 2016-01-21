// test suite for the Utils object
// below are Jasmine methods passed to Karma for testing
describe('Utils', function() {
    var _ = require('lodash');
    var Utils = require('../app/static/js/utils/Utils.js');

    // add findByValues function as lodash mixin so we can test its behaviour in lodash chains
    _.mixin({
        'findByValues': Utils.findByValues
    });

    var testObjects = [{
        'letter': 'A',
        'number': 1
    }, {
        'letter': 'B',
        'number': 1
    },{
        'letter': 'A',
        'number': 2
    }, {
        'letter': 'C',
        'number': 2
    }, {
        'letter': 'A',
        'number': 3
    }, {
        'letter': 'B',
        'number': 3
    }];

    describe('uniqueData', function() {

        it('passes if letters are unique', function() {
            var expected = ['A', 'B', 'C'];
            var uniqueLetters = Utils.uniqueData(testObjects, 'letter');
            expect(uniqueLetters).toEqual(expected);
        });

        it('passes if numbers are unique', function() {
            var expected = [1, 2, 3];
            var uniqueNumbers = Utils.uniqueData(testObjects, 'number');
            expect(uniqueNumbers).toEqual(expected);
        });

    });

    describe('findByValues', function() {
        it('returns expected values', function() {
            var expected = [{
                'letter': 'A',
                'number': 1
            }, {
                'letter': 'A',
                'number': 2
            }, {
                'letter': 'C',
                'number': 2
            }, {
                'letter': 'A',
                'number': 3
            }];
            var testQuery = Utils.findByValues(testObjects, 'letter', ['A', 'C']);
            expect(testQuery).toEqual(expected);
        });

        it('returns expected values with invert option', function() {
            var expected = [{
                'letter': 'B',
                'number': 1
            }, {
                'letter': 'B',
                'number': 3
            }];
            var testQuery = Utils.findByValues(testObjects, 'letter',
                ['A', 'C'], true);
            expect(testQuery).toEqual(expected);
        });

        it('behaves as expected when used in chain', function() {
            var expected = [{
                'letter': 'A',
                'number': 1
            }];

            var result = _.chain(testObjects)
                .findByValues('letter', ['A'])
                .findByValues('number', [1]);
            var testQuery = result.value();

            expect(testQuery).toEqual(expected);
        });

        it('behaves as expected when used in chain with invert option', function() {
            var expected = [{
                'letter': 'C',
                'number': 2
            }];

            var result = _.chain(testObjects)
                .findByValues('letter', ['A', 'B'], true)
                .findByValues('number', [1], true);
            var testQuery = result.value();

            expect(testQuery).toEqual(expected);
        });

        it('behaves as expected in chain with and without invert option', function() {
            var expected = [{
                'letter': 'A',
                'number': 3
            }, {
                'letter': 'B',
                'number': 3
            }];

            var result = _.chain(testObjects)
                .findByValues('letter', ['A', 'B'])
                .findByValues('number', [1, 2], true);
            var testQuery = result.value();

            expect(testQuery).toEqual(expected);
        });
    });

    describe('sortedPush', function() {
        it('passes if sorted order after item pushed to the array', function() {
            var sortedArray = [1, 2, 4, 5];
            Utils.sortedPush(sortedArray, 3);
            expect(sortedArray).toEqual([1, 2, 3, 4, 5]);
        });
    });

    describe('makeSelector', function() {
        it('adds # to beginning of input', function() {
            var actual = Utils.makeSelector('element');
            expect(actual).toEqual('#element');
        });

        it('returns input string if it begins with #', function() {
            var actual = Utils.makeSelector('#element');
            expect(actual).toEqual('#element');
        });
    });

    describe('euclideanDistance', function() {
        it('finds correct distance between two points', function() {
            var actual = Utils.euclideanDistance(1, 1, 2, 2);
            expect(actual).toBeCloseTo(Math.sqrt(2), 5);
        });
    });
});
