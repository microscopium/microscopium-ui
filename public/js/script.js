var Filter = require('./Filter.js');
var Histogram = require('./Histogram.js');
var Lineplot = require('./Lineplot.js');
var NeighbourPlot = require('./NeighbourPlot.js');
var NeighbourImages = require('./NeighbourImages.js');
var Spinner = require('spin.js');
var spinner = new Spinner();

$.slidebars();

$(document).ready(function() {
    $.ajax({
        url: '/api/screens/_id',
        async: false,
        success: function (json) {
            updateSelector(json);
            // automatically select a screen if there is only one to choose from
            if(json.length === 1) {
                selectScreen(json[0]._id);
            }
        },
        dataType: 'json'
    });
});

function updateSelector(screen_data) {
    for(var i = 0; i < screen_data.length; i++) {
        $('#screen-menu')
            .append('<li><a href="#" role="presentation">' + screen_data[i]._id +
            '</a></li>');

        $('#screen-menu li:last').on('click', function() {
            selectScreen($(this).text());
        });
    }
}

function selectScreen(screen_id) {
    var featureNames = [];
    var sampleData = [];
    var screenData = [];
    $('.navbar-nav a[href="#summary"]').tab('show');
    $('#sb-site').addClass('load-overlay');
    spinner.spin(document.getElementById('sb-site'));
    $.when(
        $.ajax({
            url: 'api/screen/' + screen_id,
            async: true,
            success: function(json) {
                screenData = json[0];
                featureNames = json[0].screen_features;
            },
            error: function(err) {
                alert(err);
            },
            dataType: 'json'
        }),
        $.ajax({
            url: 'api/samples/' + screen_id,
            async: true,
            success: function (json) {
                sampleData = json;
            },
            error: function(err) {
                alert(err);
            },
            dataType: 'json'
        })).then(function() {
            $('.navbar-item').removeClass('hidden');
            $('#navbar-screen-name').text(screenData._id);
            mountPlots(screenData, sampleData, featureNames);
            $('#sb-site').removeClass('load-overlay');
            spinner.spin(false);
            $('.navbar-nav a[href="#summary"]').tab('show');
        });
}

function mountPlots(screenData, sampleData, featureNames) {
    var $body = $('body');

    var neighbourImages = new NeighbourImages();
    var histogram = new Histogram(screenData._id, featureNames, '#histplot');
    var lineplot = new Lineplot('#lineplot');
    var neighbourPlot = new NeighbourPlot(sampleData, '#neighbourplot');
    var filter = new Filter(sampleData, neighbourPlot);

    $body.unbind('updateLineplot');
    $body.unbind('updatePoint');

    $body.on('updateLineplot', function(event, activeFeature) {
        lineplot.updateActiveLine(activeFeature);
        histogram.getFeatureDistribution(activeFeature-1);
    });

    $body.on('updatePoint', function(event, sampleId) {
        lineplot.getSampleData(sampleId);
        neighbourPlot.updatePoint(sampleId);
        neighbourImages.getImages(sampleId);
    });

    // default select first point
    $body.trigger('updatePoint', sampleData[0]._id);
}
