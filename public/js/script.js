var featureNames = [];

// parse feature info
var getFeatureRow = function(json, feature) {
    var n_features = json.length;
    var feature_row = [];
    for(var i = 0; i < n_features; i++) {
        feature_row.push(json[i]['feature_vector'][feature]);
    }
    return feature_row;
};

// update dropdown menu
var updateSelector = function(screen_data) {
    for(var i = 0; i < screen_data.length; i++) {
        $('#screen-menu')
            .append('<li><a href="#" role="presentation">' + screen_data[i]['_id'] +
            '</a></li>');

        $('#screen-menu li:last').on('click', function() {
            selectScreen($(this).text());
        });

    }
};

var selectScreen = function(screen_id) {
    var featureNames = [];
    // TODO start loading screen
    $.when(
        $.ajax({
            url: 'api/screen/' + screen_id,
            async: false,
            success: function(json) {
                featureNames = json[0]['screen_features'];
                updateTab(json[0]);
            },
            dataType: 'json'
        }),
        $.ajax({
            url: 'api/samples/' + screen_id,
            async: false,
            success: function (json) {
                renderLinePlot(json, featureNames, 0);
                renderHistogram(json, featureNames, 0);
                renderScatterplot(json, featureNames);
                updateNebula(json[0]['_id']);
            },
            dataType: 'json'
        }).then(function(res, status) {
            // TODO close loading screen
        }));
};

// update summary tab
var updateTab = function(screen_data) {
    $('#name').text(screen_data['_id']);
    $('#desc').text(screen_data['screen_desc']);
    $('#samples').text(screen_data['number_samples']);
};

// ON PAGE LOAD -- setup screens dropdown menu
$.ajax({
    url: '/api/screens/',
    async: false,
    success: function (json) {
        updateSelector(json);
    },
    dataType: 'json'
});
