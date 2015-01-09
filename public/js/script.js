// simple function to subset a single column
var colSlice = function(array, k) {
    var slice = [];
    var N = array.length;
    for(var i = 0; i < N; i++) {
        slice.push(array[i][k]);
    }
    return slice;
};

// update summary tab on page load
// TODO - do I need jquery? probably, may as well use it..
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
    success: function (csv) {
        sample_data = $.csv.toArrays(csv);
    },
    dataType: "text"
});

var sample_pca = [];
$.ajax({
    url: "../temp_csv/sample_pca.csv",
    async: false,
    success: function (csv) {
        sample_pca = $.csv.toArrays(csv);
    },
    dataType: "text"
});

console.log(sample_data);
console.log(sample_pca);

// TODO angular controller to better manage scope?
updateTab();
renderLinePlot(sample_data, 3);
renderHistogram(sample_data, 1);
renderScatterplot(sample_pca);