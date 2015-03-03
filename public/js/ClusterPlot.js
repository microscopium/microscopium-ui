var d3 = require('d3');
require('d3-tip')(d3); // load d3-tip plugin

function ClusterPlot(sampleData, element) {
    this.clusterMin = 2;
    this.clusterMax = 20;
    this.clusterMid = Math.round((this.clusterMax+this.clusterMin)/2);
    this.sampleData = sampleData;

    this.element = element;
    this.fullWidth = 650;
    this.fullHeight = 450;
    this.pointRadius = 5;
    this.xAxisTicks = 10;
    this.yAxisTicks = 10;

    this.margin = {top: 10, right: 40, bottom: 30, left: 40};
    this.width = this.fullWidth - this.margin.left - this.margin.right;
    this.height = this.fullHeight - this.margin.top - this.margin.bottom;

    this.colourScale = d3.scale.category20();
    this.drawScatterplot();
    this.mountSlider();
}

ClusterPlot.prototype.drawScatterplot = function() {
    var self = this;
    self.destroy();

    // find min/max for each axis
    var xMin = d3.min(self.sampleData, function(d) { return d.pca[0]; });
    var yMin = d3.min(self.sampleData, function(d) { return d.pca[1]; });
    var xMax = d3.max(self.sampleData, function(d) { return d.pca[0]; });
    var yMax = d3.max(self.sampleData, function(d) { return d.pca[1]; });

    // setup scales and axis
    var xScale = d3.scale.linear()
        .domain([xMin-1, xMax+1])
        .range([0, self.width]);
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .ticks(self.xAxisTicks)
        .orient('bottom');

    var yScale = d3.scale.linear()
        .domain([yMin-1, yMax+1])
        .range([self.height, 0]);
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .ticks(self.yAxisTicks)
        .orient('left');

    // tooltip function
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<p><strong>ID: </strong>" + d._id + "</p>" +
                "<p><strong>Gene: </strong>" + d.gene_name + "</p>" +
                "<p><strong>Cluster: </strong>" +
                (d.cluster_member[self.clusterMid-self.clusterMin] + 1) + "</span></p>";
        });

    // setup canvas
    self.svg = d3.select(self.element).append('svg')
        .attr('width', self.width + self.margin.left + self.margin.right)
        .attr('height', self.height + self.margin.top + self.margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + self.margin.left + ',' + self.margin.top + ')')
        .call(tip);

    // add scatter points
    self.svg.selectAll('circle')
        .data(self.sampleData)
        .enter()
        .append('circle')
        .attr('cx', function(d) {
            return xScale(d.pca[0]);
        })
        .attr('cy', function(d) {
            return yScale(d.pca[1]);
        })
        .attr('r', self.pointRadius)
        .attr('stroke', 'white')
        .attr('fill', function(d) {
            var cluster_id = d.cluster_member[self.clusterMid-self.clusterMin];
            return self.colourScale(cluster_id);
        })
        .attr('id', function(d) {
            return d._id;
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    // append axis
    self.svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + self.height + ')')
        .call(xAxis);

    self.svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    // append axis labels
    self.svg.append('text')
        .attr('transform', 'translate(' + self.width/2 + ' ,' + (self.height +
        self.margin.bottom) + ')')
        .style('text-anchor', 'middle')
        .text('PC1');

    self.svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -self.margin.left)
        .attr('x', -self.height/2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('PC2');
};

ClusterPlot.prototype.redrawClusters = function(newk) {
    var self = this;

    //reset tooltips
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<p><strong>ID: </strong>" + d._id + "</p>" +
                "<p><strong>Gene: </strong>" + d.gene_name + "</p>" +
                "<p><strong>Cluster: </strong>" +
                (d.cluster_member[newk-self.clusterMin] + 1) + "</span></p>";
        });

    d3.selectAll('.d3-tip').remove();

    // recolour points
    self.svg.selectAll('circle')
        .data(self.sampleData)
        .attr('fill', function(d) {
            var cluster_id = d.cluster_member[newk-self.clusterMin];
            return self.colourScale(cluster_id);
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .call(tip);
};

ClusterPlot.prototype.destroy = function() {
    d3.select(this.element + ' > svg').remove();
};

ClusterPlot.prototype.mountSlider = function() {
    var self = this;

    $('#cluster-slider')
        .attr('min', self.clusterMin)
        .attr('max', self.clusterMax)
        .attr('value', self.clusterMid);

    $('#cluster-number').html(self.clusterMid.toString());

    $('#cluster-slider').unbind('change');
    $('#cluster-slider').on('change', function() {
        self.redrawClusters(this.value);
        $('#cluster-number').html(this.value);
    });
};

module.exports = ClusterPlot;
