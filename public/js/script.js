// update summary tab on page load
var updateTab = function() {
    $('#name').text('MYORES');
    $('#desc').text('MYORES');
    $('#samples').text(1780);
    $('#clusters').text(30);
};

// TODO investigate crossfilter for efficient column slicing of arrays -- no need for two CSVs
var feature_data = [];
$.ajax({
    url: "../temp_csv/full_data_feature.csv",
    async: false,
    success: function (csvd) {
        feature_data = $.csv.toArrays(csvd);
    },
    dataType: "text",
    complete: function () {
        // TODO add CSV parsing here!
    }
});

var sample_data = [];
$.ajax({
    url: "../temp_csv/full_data_sample.csv",
    async: false,
    success: function (csvd) {
        sample_data = $.csv.toArrays(csvd);
    },
    dataType: "text"
});

var title = sample_data[1][0];
var values = [];
for(var i = 1; i <= 271; i++) {
    var newPoint = [];
    newPoint.push(i);
    newPoint.push(Number(sample_data[1][i]));
    values.push(newPoint);
}

// TODO angular controller to better manage scope?
updateTab();
renderLinePlot(values, feature_data);
renderHistogram(feature_data, 1);

