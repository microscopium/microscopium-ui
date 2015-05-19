var History = require('../public/js/History.js');

describe('History', function() {
    var history;

    beforeEach(function() {
        history = new History();
    });

    describe('add', function() {
        it('should not add the same item consecutively', function() {
            history.add('A');
            history.add('A');
            expect(history.length).toEqual(1);
        });
    });

    describe('back', function() {
        it('should return null if nothing to return', function() {
            expect(history.back()).toBeNull();
        });

        it('should return items in expected order', function() {
            ['A', 'B', 'C'].forEach(function(value) {
                history.add(value);
            });
            var actual = [];
            actual.push(history.back());
            actual.push(history.back());
            expect(actual).toEqual(['B', 'A']);
        });
    });

    describe('forward', function() {
        it('should return null if nothing to return', function() {
            expect(history.forward()).toBeNull();
        });

        it('should return items in expected order', function() {
            ['A', 'B', 'C'].forEach(function(value) {
                history.add(value);
            });
            var actual = [];
            history.back();
            history.back();
            actual.push(history.forward());
            actual.push(history.forward());
            expect(actual).toEqual(['B', 'C']);
        });
    });

    describe('reset', function() {
        it('should remove all items from history', function() {
            history.add('A');
            history.add('B');
            history.reset();
            expect(history.length).toEqual(0);
        });
    });
});
