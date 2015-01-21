// generate scatterplot

var renderScatterplot = function(sampleData, featureNames) {

    // delete any scatterplots already plotted
    d3.select('#neighbourpca > svg').remove();

    // find min/max for each axis
    var xMin = d3.min(sampleData, function(d) { return d['pca'][0]; });
    var yMin = d3.min(sampleData, function(d) { return d['pca'][1]; });
    var xMax = d3.max(sampleData, function(d) { return d['pca'][0]; });
    var yMax = d3.max(sampleData, function(d) { return d['pca'][1]; });

    // define canvas margins
    var margin = {top: 10, right: 40, bottom: 30, left: 40},
        width = 700 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // setup scales and axis
    var xScale = d3.scale.linear()
        .domain([xMin-1, xMax+1])
        .range([0, width]);
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .ticks(10);

    var yScale = d3.scale.linear()
        .domain([yMin-1, yMax+1])
        .range([height, 0]);
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .ticks(10)
        .orient('left');

    // tooltip function
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<p><strong>ID: </strong>" + d['_id'] + "</span></p>";
        });

    // setup canvas
    var svg = d3.select('#neighbourpca').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .call(tip);

    // add scatter points
    svg.selectAll('circle')
        .data(sampleData)
        .enter()
        .append('circle')
        .attr('cx', function(d) {
            return xScale(d['pca'][0]);
        })
        .attr('cy', function(d) {
            return yScale(d['pca'][1]);
        })
        .attr('r', 5)
        .classed('scatterpt', true)
        .classed('activept', false)
        .classed('neighbourpt', false)
        .attr('id', function(d) {
            return d['_id'];
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .on('click', function(d, i) {
            var selection = d3.select(this);
            // only update the active point if it's not already active
            if(!selection.classed('activept')) {
                updatePoint(selection, i);
                // update line plot and histogram
                renderLinePlot(sampleData, featureNames, i);
                renderHistogram(sampleData, featureNames, 0);
                updateNebula(d['_id']);
            }
        });

    var updatePoint = function(selection) {
        // reset class and attr of prev active point
        d3.selectAll('.activept')
            .classed('activept', false)
            .classed('neighbourpt', false)
            .transition()
            .duration(125)
            .attr('r', 5);

        d3.selectAll('.neighbourpt')
            .classed('neighbourpt', false)
            .attr('r', 5)
            .transition()
            .duration(125);

        // add neighbour class to all neighbours
        var neighbours = selection.data()[0]['neighbours'];
        for(var i = 1 ; i < neighbours.length; i++) {
            d3.select('[id=' + neighbours[i] + ']')
                .classed('neighbourpt', true)
                .transition()
                .duration(125)
                .attr('r', 5);
        }

        // set class and attr of new active point
        selection
            .classed('activept', true)
            .transition()
            .duration(125)
            .attr('r', 7);

    };

    // append axis
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    // append axis labels
    svg.append('text')
        .attr('transform', 'translate(' + (width / 2) + ' ,' + (height + margin.bottom) + ')')
        .style('text-anchor', 'middle')
        .text('PC1');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x',0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('PC2');
};





