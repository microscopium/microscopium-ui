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
          .append('<li><a href="#" role="presenation">' + screen_data[i]['screen_name'] +
            '</a></li>');
    }
};

// update summary tab on page load
var updateTab = function(screen_data) {
    $('#name').text(screen_data['screen_name']);
    $('#desc').text(screen_data['screen_desc']);
    $('#samples').text(screen_data['number_samples']);
    featureNames = screen_data['screen_features'];
};

// get screen data for dropdown tab
$.ajax({
    url: '/api/screens',
    async: false,
    success: function (json) {
        updateTab(json[0]);
        updateSelector(json);
    },
    dataType: 'json'
});

// get sample data
$.ajax({
    url: '/api/samples/MYORES',
    async: false,
    success: function (json) {
        console.log(json);
        renderLinePlot(json, featureNames, 0);
        renderHistogram(json, featureNames, 0);
        renderScatterplot(json, featureNames)
    },
    dataType: 'json'
});
