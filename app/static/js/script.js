var NeighbourImages = require('./NeighbourImages.js');
var Spinner = require('spin.js');

var UIController = require('./UIController.js');

var spinner = new Spinner();

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

// this function will be removed once client-side rendering added
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

// this function populates the dropped down menu
// used to select screen -- this will be removed once
// we move to server-side templating
function selectScreen(screen_id) {
    var sampleData = [];
    var screenData = [];

    // define which fields to get for the query to the samples collection
    var samplesQuery =  {
        'select': ['row', 'column', 'plate', 'gene_name', 'dimension_reduce']
    };

    var screensQuery = {
        'select': ['screen_features']
    };

    $('#sb-site').addClass('load-overlay');
    spinner.spin(document.getElementById('sb-site'));

    $.when(
        $.ajax({
            url: 'api/screens/' + screen_id + '?' + $.param(screensQuery, true),
            async: true,
            success: function(json) {
                screenData = json[0];
            },
            error: function(err) {
                alert(err);
            },
            dataType: 'json'
        }),
        $.ajax({
            url: 'api/samples/' + screen_id + '?' + $.param(samplesQuery, true),
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
            mountUI(screenData, sampleData);
            $('#sb-site').removeClass('load-overlay');
            spinner.spin(false);
        });
}

/**
 * mountUI: Add all event handling to page.
 *
 * Connects front-end UI elements to the UI controller logic.
 *
 * @param screenData - Screen document for the selected screen.
 * @param sampleData - Sample document for the selected screen.
 */
function mountUI(screenData, sampleData) {
    var $body = $('body');
    var $backButton = $('#back-button');
    var $forwardButton = $('#forward-button');
    var $btnDimension = $('.btn-dim-select');

    var uiController = new UIController(screenData, sampleData);

    $backButton.on('click', function() {
        uiController.back();
    });

    $forwardButton.on('click', function() {
        uiController.forward();
    });

    $body.on('updateFeature', function(event, activeFeature) {
        uiController.updateFeature(activeFeature);
    });

    $body.on('updateFilter', function(event, filterOutId) {
        console.log('on updateFilter');
        console.log(filterOutId);
        uiController.updateFilter(filterOutId);
    });

    $body.on('updateSample', function(event, sampleId) {
        uiController.updateSample(sampleId);
    });

    $btnDimension.on('click', function() {
        // ignore clicks from already active button
        if(!$(this).hasClass('active')) {

            // update styling of button group
            // eg select tsne, deselect PCA
            var val = $(this).val();
            $('.btn-dim-select').removeClass('active');
            $(this).addClass('active');

            // handle plot/ui update logic
            uiController.updateDimensionReduction(val);
        }
    });

    // default select first point
    $body.trigger('updateSample', sampleData[0]._id);
}
