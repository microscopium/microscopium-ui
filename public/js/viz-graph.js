/**
 * GENE GRAPH PLACEHOLDER
 */

var margin = {top: 10, right: 30, bottom: 30, left: 30},
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var xScale = d3.scale.linear()
    .range([0, width]);
var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom");

var yScale = d3.scale.linear()
    .range([height, 0]);
var yAxis = d3.svg.axis()
    .scale(yScale)
    .ticks(5)
    .orient("left");

var svg = d3.select("#graphbox").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis);

svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis);