var feature_names = [];

// parse feature info
var featureRow = function(json, feature) {
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
};

$.ajax({
    url: '/api/screens',
    async: false,
    success: function (json) {
        feature_names = json[0]['screen_features'];
        updateTab(json[0]);
        updateSelector(json);
    },
    dataType: 'json'
});

$.ajax({
    url: '/api/sample/feature_vector/MYORES',
    async: false,
    success: function (json) {
        console.log(json);
        console.log(featureRow(json, 0));
        renderLinePlot(json[0]);
    },
    dataType: 'json'
});

$.ajax({
    url: '/api/sample/pca/MYORES',
    success: function(json) {
        renderScatterplot(json);
    }
});

// TODO angular controller to better manage scope?
//renderLinePlot(sample_data, 1);
//renderHistogram(sample_data, 1);
//renderScatterplot(sample_pca);
