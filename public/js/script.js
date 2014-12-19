// simple function to subset a single column
var colSlice = function(array, k) {
    var slice = [];
    var N = array.length;
    for(var i = 0; i <= N; i++) {
        slice.push(slice[i][k]);
    }
    return slice;
};

// update summary tab on page load
var updateTab = function() {
    $('#name').text('MYORES');
    $('#desc').text('MYORES');
    $('#samples').text(1780);
    $('#clusters').text(30);
};

var sample_data = [];
$.ajax({
    url: "../temp_csv/sample_data.csv",
    async: false,
    success: function (csvd) {
        sample_data = $.csv.toArrays(csvd);
    },
    dataType: "text"
});

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

