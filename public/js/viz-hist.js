var renderHistogram = function(sampleData, featureNames, feature) {

    // delete any histograms already plotted
    d3.select('#histbox > svg').remove();

    // column data for sample of interest
    var featureData = getFeatureRow(sampleData, feature);

    // define canvas margins
    var margin = {top: 20, right: 30, bottom: 20, left: 45},
        width = 500 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // define xScale and xAxis
    var xScale = d3.scale.linear()
        .domain([d3.min(featureData), d3.max(featureData)])
        .range([0, width]);
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom');

    // find bins for histogram, fit bins to x scale
    var data = d3.layout.histogram()
        .bins(xScale.ticks(10))
    (featureData);

    // define y Scale and y axis
    var yScale = d3.scale.linear()
        .domain([0, d3.max(data, function(d) { return d.y; })])
        .range([height, 0]);
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left');

    // add SVG canvas
    var svg = d3.select('#histbox').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // add transformation to bars
    var bar = svg.selectAll(".bar")
        .data(data)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; });

    // append bars
    bar.append("rect")
        .attr("x", 1)
        .attr("width", function(d) {
            return xScale(d.dx + d.x ) - xScale(d.x) - 1;
        })
        .attr("height", function(d) { return height - yScale(d.y); });

    // append x axis
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    // append y axis
    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    // add title
    svg.append('text')
        .attr('x', 20)
        .attr('y', -5)
        .style('text-anchor', 'left')
        .text(featureNames[feature]);
};
