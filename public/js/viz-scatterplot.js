// generate scatterplot

var renderScatterplot = function(data) {

    var xMin = d3.min(data, function(d) { return d.pca_2d[0]; });
    var yMin = d3.min(data, function(d) { return d.pca_2d[1]; });
    var xMax = d3.max(data, function(d) { return d.pca_2d[0]; });
    var yMax = d3.max(data, function(d) { return d.pca_2d[1]; });

    var margin = {top: 10, right: 40, bottom: 30, left: 40},
        width = 400 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;

    // setup scales and axis
    var xScale = d3.scale.linear()
        .domain([xMin-100, xMax+100])
        .range([0, width]);
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .ticks(5);

    var yScale = d3.scale.linear()
        .domain([yMin-100, yMax+100])
        .range([height, 0]);
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .ticks(5)
        .orient('left');

    // tooltip function
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<p><strong>ID: </strong>" + d._id + "</span></p>" +
                "<p><strong>Gene: </strong>" + d.gene_name + "</span></p>";
        });

    var svg = d3.select('#scatterbox').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .call(tip);

    svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', function(d) {
            return xScale(d.pca_2d[0]);
        })
        .attr('cy', function(d) {
            return yScale(d.pca_2d[1]);
        })
        .attr('r', 5)
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);
};





