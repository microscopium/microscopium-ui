// generate scatterplot

var renderScatterplot = function(pca_json) {

    // find min/max for each axis
    var xMin = d3.min(pca_json, function(d) { return d['pca'][0]; });
    var yMin = d3.min(pca_json, function(d) { return d['pca'][1]; });
    var xMax = d3.max(pca_json, function(d) { return d['pca'][0]; });
    var yMax = d3.max(pca_json, function(d) { return d['pca'][1]; });

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
        .html(function(d, i) {
            return "<p><strong>ID: </strong>" + d['_id'] + "</span></p>";
        });

    // setup canvas
    var svg = d3.select('#scatterbox').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .call(tip);

    // add scatter points
    svg.selectAll('circle')
        .data(pca_json)
        .enter()
        .append('circle')
        .attr('cx', function(d) {
            return xScale(d['pca'][0]);
        })
        .attr('cy', function(d) {
            return yScale(d['pca'][1]);
        })
        .attr('r', 5)
        .attr('fill', 'steelblue')
        .attr('stroke', 'white')
        .classed('scatterpt', true)
        .classed('activept', false)
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .on('click', function() {
          var selection = d3.select(this);
          // only update the active point if it's not already active
          if(!selection.classed('activept')) {
            updatePoint(selection);
          }
        });

    var updatePoint = function(selection) {
      // reset class and attr of prev active point
      d3.selectAll('.activept')
        .classed('activept', false)
        .transition()
        .duration(125)
        .attr('r', 5)
        .attr('fill', 'steelblue')
        .attr('stroke', 'white');

      var pointIndex = selection.data()[0][3];

      // set class and attr of new active point
      selection
        .classed('activept', true)
        .transition()
        .duration(125)
        .attr('r', 7)
        .attr('fill', 'red')
        .attr('stroke', 'white');

      // update plots in feature tab
      // renderLinePlot(sample_data, pointIndex);
      // renderHistogram(sample_data, 1)
      alert('thanks for clicking on me!');
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





