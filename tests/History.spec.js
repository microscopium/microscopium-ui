var History = require('../public/js/History.js');

describe('History', function() {
    var history;

    beforeEach(function() {
        history = new History();
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

        it('it should return the expected order going back, forward and adding', function() {
            var actual = [];
            ['A', 'B', 'C'].forEach(function(value) {
                history.add(value);
            });
            history.back();
            history.add('D');
            actual.push(history.back());
            actual.push(history.back());
            actual.push(history.forward());
            actual.push(history.forward());
            expect(actual).toEqual(['B', 'A', 'B', 'D']);
        });
    });

    describe('length', function() {
        it('should return the correct length', function() {
            ['A', 'B', 'C'].forEach(function(value) {
                history.add(value);
            });
            history.back();
            history.add('D');
            expect(history.length).toEqual(3);
        });
    });

    describe('reset', function() {
        it('should remove all items from history', function() {
            var actual = [];
            history.reset();
            actual.push(history.back());
            actual.push(history.forward());
            expect(actual).toEqual([null, null]);
        });
    });
});
