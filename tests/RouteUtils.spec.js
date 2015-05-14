var RouteUtils = require('../app/RouteUtils.js');

describe('RouteUtils', function() {
    describe('parseSelectQuery', function() {

        it('parses a select query with one parameter', function() {
            var expected = 'singleField';
            var actual = RouteUtils.parseSelectQuery('singleField');
            expect(expected).toEqual(actual);
        });

        it('parses a select query with multiple parameters', function() {
            var expected = 'firstField secondField thirdField';
            var actual = RouteUtils.parseSelectQuery(['firstField',
                'secondField', 'thirdField']);
            expect(expected).toEqual(actual);
        });

        it('should return null if null input', function() {
            expect(RouteUtils.parseSelectQuery(null)).toBeNull();
        })

    });
});