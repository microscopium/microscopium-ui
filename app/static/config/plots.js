module.exports = {
    neighbourPlot: {
        // create space between the x and y axis. this value is a pct of the
        // range of the data plotted to the axis. eg 0.02 creates a 2% margin
        // between the points and x/y axis
        axisMargin: 0.02,
        // the duration of the transition between changes in the axis scale
        // triggered by a change in dimensionality reduction methods
        // this duration also applies to the transformation applied to the
        // plot points
        axisTransitionDuration: 750,
        // the duration of the transition between active and inactive
        // class for points
        pointTransitionDuration: 150,
        // the radius of the currently selected point on the plot
        activePointRadius: 7,
        // the radius of every other point, this should probably
        // be smaller than the active point radius
        inactivePointRadius: 5,
        // the number of ticks to use in the x-axis, d3 will use
        // this number of ticks, otherwise something close to it.
        xAxisTicks: 10,
        // as above, for the y-axis
        yAxisTicks: 10,
        // the margin between the edge of the SVG canvas and the
        // edges of the 'drawing area' of the plot. this is needed
        // so axis labels, ticks, ete. are rendered
        margin: {top: 10, right: 40, bottom: 40, left: 40},
        // at the time of drawing, the plots width is taken
        // from its containing div. the height of the plot is calculated
        // using this aspect ratio.
        aspectRatio: {
            width: 16,
            height: 9
        },
        // offset the tooltip relative to the
        tooltip: {
            timeout: 500,
            offset: { top: -10, left: 0 }
        },
        navigateTimeout: 350,
        pointStyle: {
            defaultStyle: {
                fillStyle: 'steelblue',
                strokeStyle: 'white',
                strokeWidth: 1,
                globalAlpha: 1,
                radius: 5
            },
            filteredOut: {
                fillStyle: 'steelblue',
                strokeStyle: 'white',
                strokeWidth: 1,
                globalAlpha: 0.2,
                radius: 5
            },
            active: {
                fillStyle: 'red',
                strokeStyle: 'white',
                strokeWidth: 1,
                globalAlpha: 1,
                radius: 7
            },
            neighbours: {
                fillStyle: 'yellow',
                strokeStyle: 'white',
                strokeWidth: 1,
                globalAlpha: 1,
                radius: 5
            }
        }
    },
    featureVectorlinePlot: {
        // create space between the x and y axis. this value is a pct of the
        // range of the data plotted to the axis. eg 0.02 creates a 2% margin
        // between the points and x/y axis
        axisMargin: 0.02,
        // the number of ticks to use in the x-axis, d3 will use
        // this number of ticks, otherwise something close to it.
        xAxisTicks: 8,
        // as above, for the y-axis
        yAxisTicks: 5,
        // the margin between the edge of the SVG canvas and the
        // edges of the 'drawing area' of the plot. this is needed
        // so axis labels, ticks, etc. have enough room to draw
        margin: {top: 20, right: 40, bottom: 30, left: 40},
        // at the time of drawing, the plots width is taken
        // from its containing div. the height of the plot is calculated
        // using this aspect ratio.
        aspectRatio: {
            width: 16,
            height: 9
        }
    },
    featureDistributionHistogram: {
        // the number of ticks to use in the x-axis, d3 will use
        // this number of ticks, otherwise something close to it.
        xAxisTicks: 8,
        // as above, for the y-axis
        yAxisTicks: 5,
        // the margin between the edge of the SVG canvas and the
        // edges of the 'drawing area' of the plot. this is needed
        // so axis labels, ticks, etc. have enough room to draw
        margin: {top: 20, right: 30, bottom: 30, left: 50},
        // at the time of drawing, the plots width is taken
        // from its containing div. the height of the plot is calculated
        // using this aspect ratio.
        aspectRatio: {
            width: 16,
            height: 9
        }
    }
};
