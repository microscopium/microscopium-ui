// test suite for the Utils object
// below are Jasmine methods passed to Karma for testing
describe('Utils', function() {
    var Utils = require('../app/static/js/Utils.js');

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
        it('passes if objects with letter value A or C are returned', function() {
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
    })
});
