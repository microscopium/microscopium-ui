var Filter = require('./Filter.js');
var Histogram = require('./Histogram.js');
var History = require('./History.js');
var FeatureVectorLineplot = require('./FeatureVectorLineplot.js');
var NeighbourPlot = require('./NeighbourPlot.js');
var NeighbourImages = require('./NeighbourImages.js');
var Spinner = require('spin.js');

var history = new History();
var spinner = new Spinner();

var neighbourPlot;

$.slidebars();

$(document).ready(function() {
    // get the _id's of all screens currently in the DB and use these to
    // render the dropdown menu
    $.ajax({
        url: '/api/screens?select=_id',
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

// main page event listeners
// update scatterplot
$('.btn-dim-select').on('click', function() {
    // ignore clicks from already active button
    if(!$(this).hasClass('active')) {
        var val = $(this).val();
        $('.btn-dim-select').removeClass('active');
        $(this).addClass('active');
        neighbourPlot.drawScatterplot(val);
    }
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

    // define which fields to get for the query to the samples collection
    var samplesQuery =  {
        'screen': screen_id,
        'select': ['row', 'column', 'plate', 'gene_name', 'dimension_reduce']
    };

    var screensQuery = {
        'id': screen_id,
        'select': ['screen_features']
    };

    $('.navbar-nav a[href="#summary"]').tab('show');
    $('#sb-site').addClass('load-overlay');
    spinner.spin(document.getElementById('sb-site'));

    $.when(
        $.ajax({
            url: 'api/screens/?' + $.param(screensQuery),
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
            url: 'api/samples/?' + $.param(samplesQuery),
            async: true,
            success: function (json) {
                sampleData = json;
            },
            error: function(err) {
                alert(err);
            },
            dataType: 'json'
        })).then(function() {
            $('#back-button').removeClass('hidden');
            $('#forward-button').removeClass('hidden');
            $('.navbar-item').removeClass('hidden');
            $('#neighbourplot-options').removeClass('hidden');
            $('#dimensionality-reduction-select').val('tsne');
            $('#navbar-screen-name').text(screenData._id);
            mountPlots(screenData, sampleData, featureNames);
            $('#sb-site').removeClass('load-overlay');
            spinner.spin(false);
        });
}

function mountPlots(screenData, sampleData, featureNames) {
    var $body = $('body');
    var $backButton = $('#back-button');
    var $forwardButton = $('#forward-button');

    var neighbourImages = new NeighbourImages();
    var histogram = new Histogram(screenData._id, featureNames, '#histplot');
    var featureVectorLineplot =
        new FeatureVectorLineplot('#featureVectorLineplot');
    neighbourPlot = new NeighbourPlot(sampleData, '#neighbourplot');
    var filter = new Filter(sampleData, neighbourPlot);

    // attach behaviour to backwards and forwards buttons, unhide them
    $backButton.unbind('click');
    $forwardButton.unbind('click');

    $backButton.on('click', function() {
        var backId = history.back();
        if(backId) {
            featureVectorLineplot.drawLineplot(backId);
            neighbourPlot.updatePoint(backId);
            neighbourImages.getImages(backId);
        }
    });

    $forwardButton.on('click', function() {
        var forwardId = history.forward();
        if(forwardId) {
            featureVectorLineplot.drawLineplot(forwardId);
            neighbourPlot.updatePoint(forwardId);
            neighbourImages.getImages(forwardId);
        }
    });

    // append listeners for plot update events
    $body.unbind('updateLineplot');
    $body.unbind('updatePoint');

    $body.on('updateLineplot', function(event, activeFeature) {
        histogram.getFeatureDistribution(activeFeature-1);
    });

    $body.on('updatePoint', function(event, sampleId) {
        // add sample to history
        history.add(sampleId);

        // update plots
        featureVectorLineplot.drawLineplot(sampleId);
        neighbourPlot.updatePoint(sampleId);
        neighbourImages.getImages(sampleId);
    });

    // default select first point
    $body.trigger('updatePoint', sampleData[0]._id);
}
