// add slidebars
$.slidebars();

// parse feature info
var getFeatureRow = function(json, feature) {
    var n_features = json.length;
    var feature_row = [];
    for(var i = 0; i < n_features; i++) {
        feature_row.push(json[i].feature_vector_std[feature]);
    }
    return feature_row;
};

// update dropdown menu
var updateSelector = function(screen_data) {
    for(var i = 0; i < screen_data.length; i++) {
        $('#screen-menu')
            .append('<li><a href="#" role="presentation">' + screen_data[i]._id +
            '</a></li>');

        $('#screen-menu li:last').on('click', function() {
            selectScreen($(this).text());
        });

    }
};

var selectScreen = function(screen_id) {
    var featureNames = [];
    var sampleData = [];
    var screenData = [];
    var uniqueRow = [];
    var uniqueCol = [];
    var uniquePlate = [];
    var uniqueGene = [];
    $('.navbar-nav a[href="#summary"]').tab('show');
    $('#sb-site').spin('large', '#000');
    $('#sb-site').addClass('load-overlay');
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
                console.log(json);
                sampleData = json;
            },
            error: function(err) {
                alert(err);
            },
            dataType: 'json'
        }),
        $.ajax({
            url: '/api/unique/' + screen_id + '/plate',
            async: true,
            success: function (json) {
                uniquePlate = json;
            },
            error: function(err) {
                console.log(err);
            },
            dataType: 'json'
        }),
        $.ajax({
            url: '/api/unique/' + screen_id + '/row',
            async: true,
            success: function (json) {
                uniqueRow = json;
            },
            error: function(err) {
                console.log(err);
            },
            dataType: 'json'
        }),
        $.ajax({
            url: '/api/unique/' + screen_id + '/column',
            async: true,
            success: function (json) {
                uniqueCol = json;
            },
            error: function(err) {
                console.log(err);
            },
            dataType: 'json'
        }),
        $.ajax({
            url: '/api/unique/' + screen_id + '/gene_name',
            async: true,
            success: function (json) {
                uniqueGene = json;
            },
            error: function(err) {
                console.log(err);
            },
            dataType: 'json'
        })).then(function() {
            $('.navbar-item').removeClass('hidden');
            $('#navbar-screen-name').text(screenData._id);
            updatePlots(screenData, sampleData, featureNames);
            filter(uniqueRow, uniqueCol, uniquePlate, uniqueGene);
            $('#sb-site').spin(false);
            $('#sb-site').removeClass('load-overlay');
            $('.navbar-nav a[href="#summary"]').tab('show');
        });
};

function updatePlots(screenData, sampleData, featureNames) {
    renderLinePlot(sampleData, featureNames, 0);
    renderHistogram(sampleData, featureNames, 0);
    renderScatterplot(sampleData, featureNames);
    updateNebulaImages(sampleData[0]._id);
    renderScatterCluster(sampleData);
    updateTab(screenData);
}

// update summary tab
var updateTab = function(screen_data) {
    $('#name').text(screen_data._id);
    $('#desc').text(screen_data.screen_desc);
    $('#samples').text(screen_data.number_samples);
};

// ON PAGE LOAD -- setup screens dropdown menu
$.ajax({
    url: '/api/screen_ids/',
    async: false,
    success: function (json) {
        updateSelector(json);
    },
    dataType: 'json'
});
