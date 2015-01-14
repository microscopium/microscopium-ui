// TODO rewrite me as an object!
var renderLinePlot = function(sample_json) {

    var activeFeature;
    // delete any histograms already plotted
    d3.select('#linebox > svg').remove();

    // get column size of data (so selected feature line doesn't
    // fall off the edge
    var n_features = sample_json['feature_vector'].length;

    // update 'active feature' line
    var updateActiveLine = function(feature) {
        var x_coord = xScale(feature);
        svg.selectAll('.selectedLine').remove();
        svg.append('line')
            .attr('x1', x_coord)
            .attr('y1', 0)
            .attr('x2', x_coord)
            .attr('y2', height)
            .attr('stroke', 'red')
            .attr('stroke-width', 0.75)
            .attr('stroke-dasharray', '5, 5')
            .classed('selectedLine', true);
    };

    // update graph on mouseclick
    var onclickUpdate = function(d3Mouse) {
        var x_coord = d3Mouse[0];
        var clicked_feature = Math.round(xScale.invert(x_coord));
        if(clicked_feature <= n_features && clicked_feature > 0) {
            activeFeature = clicked_feature;
            updateActiveLine(activeFeature);
            //renderHistogram(sample_json, activeFeature);
        }
    };

    // update graph on keypress
    var keypressUpdate = function(keyCode) {
        var x_coord = xScale(activeFeature);
        if(activeFeature) {
            if(keyCode === 39 && activeFeature < n_features) {
                activeFeature++;
                //renderHistogram(sample_json, activeFeature);
                updateActiveLine(activeFeature);
            }
            else if(keyCode === 37 && activeFeature > 1) {
                activeFeature--;
                //renderHistogram(sample_json, activeFeature);
                updateActiveLine(activeFeature);
            }
        }
    };

    // get min/max x/y values -- needed for scaling axis/data
    var yMin = d3.min(sample_json['feature_vector']);
    var yMax = d3.max(sample_json['feature_vector']);

    // var create (x, y) pairs for plot
    var linePoints = [];
    for(var i = 0; i < n_features; i++) {
        var point = [];
        point.push(i+1);
        point.push(sample_json['feature_vector'][i]);
        linePoints.push(point);
    }

    // define size and margins
    var margin = {top: 20, right: 30, bottom: 20, left: 45},
        width = 650 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // define x-scale and x-axis
    var xScale = d3.scale.linear()
        .domain([0, n_features])
        .range([1, width]);
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom');

    // define y-scale and y-axis
    var yScale = d3.scale.linear()
        .domain([yMin-1, yMax+1])
        .range([height, 0]);
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .ticks(5)
        .orient('left');

    // define lineplot function -- draws svg path with data
    var line = d3.svg.line()
      .x(function(d) { return xScale(d[0]); })
      .y(function(d) { return yScale(d[1]); });

    // append canvas
    var svg = d3.select('#linebox').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .on('click', function() {
            onclickUpdate(d3.mouse(this));
        });

    // add keypress listenter to body
    // TODO attach listener to 'less global' part of the DOM (if possible)
    d3.select('body')
        .on('keydown', function() {
            keypressUpdate(d3.event.keyCode);
        });

    // append background (this is here so we can attach a listener to the background)
    svg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 650)
        .attr('height', 400)
        .style('fill', 'white')
        .on('click', function () {
            onclickUpdate(d3.mouse(this));
        });

    // add x-axis
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    // add y-axis
    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    // add line graphic
    svg.append('path')
        .datum(linePoints)
        .attr('class', 'line')
        .attr('d', line);

    // add title
    svg.append('text')
        .attr('x', width/2)
        .attr('y', -5)
        .style('text-anchor', 'middle')
        .text(sample_json['_id']);
};

