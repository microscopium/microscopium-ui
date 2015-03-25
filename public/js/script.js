var Filter = require('./Filter.js');
var Histogram = require('./Histogram.js');
var Lineplot = require('./Lineplot.js');
var NeighbourPlot = require('./NeighbourPlot.js');
var NeighbourImages = require('./NeighbourImages.js');
var ClusterPlot = require('./ClusterPlot.js');
var Spinner = require('spin.js');
var spinner = new Spinner();

$.slidebars();

$(document).ready(function() {
    $.ajax({
        url: '/api/screen_ids/',
        async: false,
        success: function (json) {
            updateSelector(json);
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
    updateTab(screenData);
    var filter = new Filter(sampleData);
    var neighbourImages = new NeighbourImages(sampleData[0]._id);
    var histogram = new Histogram(sampleData, '#histplot' ,featureNames);
    var lineplot = new Lineplot(sampleData, '#lineplot', histogram);
    var neighbourPlot = new NeighbourPlot(sampleData, '#neighbourplot', lineplot, neighbourImages);
    var clusterPlot = new ClusterPlot(sampleData, '#clusterpcaplot');
}

// update summary tab
function updateTab(screen_data) {
    $('#name').text(screen_data._id);
    $('#desc').text(screen_data.screen_desc);
    $('#samples').text(screen_data.number_samples);
}
