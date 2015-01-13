// simple function to subset a single column
var colSlice = function(array, k) {
    var slice = [];
    var N = array.length;
    for(var i = 0; i < N; i++) {
        slice.push(array[i][k]);
    }
    return slice;
};

// update dropdown menu
var updateSelector = function(screen_data) {
    console.log(screen_data);
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
        updateTab(json[0]);
        updateSelector(json);
    },
    dataType: 'json'
});

$.ajax({
    url: '/api/sample/feature_vector/MYORES',
    async: false,
    success: function (json) {
        console.log(json.length);
        console.log(json[0]);
        renderLinePlot(json, 1);
    },
    dataType: 'json'
});

// TODO angular controller to better manage scope?
//renderLinePlot(sample_data, 1);
//renderHistogram(sample_data, 1);
//renderScatterplot(sample_pca);
