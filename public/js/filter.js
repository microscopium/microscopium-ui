function SampleFilter(uniqueRow, uniqueCol, uniquePlate, uniqueGene) {

    $('.filter-items').children().remove();

    this.genes = uniqueGene;
    this.selectedGenes = [];
    var self = this;

    var length = uniquePlate.length/2;
    console.log(length);
    for(var j = 0; j < 2; j++) {
        for(var i = 0; i < length; i++) {
            var el = '#plate-' + (j+1);
            $('<input />', { type: 'checkbox',
                name: 'uniquePlate[' + [uniquePlate[i+j*length]] + ']',
                value: true,
                checked: true}).appendTo(el);
            $('<label />', { 'for': uniquePlate[i], text: uniquePlate[i+j*length] }).appendTo(el);
            $('<br />').appendTo(el);
        }
    }

    var length = uniqueRow.length/2;
    console.log(length);
    for(var j = 0; j < 2; j++) {
        for(var i = 0; i < length; i++) {
            var el = '#row-' + (j+1);
            $('<input />', { type: 'checkbox',
                name: 'uniqueRow[' + [uniqueRow[i+j*length]] + ']',
                value: true,
                checked: true}).appendTo(el);
            $('<label />', { 'for': uniqueRow[i], text: uniqueRow[i+j*length] }).appendTo(el);
            $('<br />').appendTo(el);
        }
    }

    var length = uniqueCol.length/3;
    for(var j = 0; j < 3; j++) {
        for(var i = 0; i < length; i++) {
            var el = '#col-' + (j+1);
            $('<input />', { type: 'checkbox',
                name: 'uniqueCol[' + [uniqueCol[i+j*length]] + ']',
                value: true,
                checked: true}).appendTo(el);
            $('<label />', { 'for': uniqueCol[i], text: uniqueCol[i+j*length] }).appendTo(el);
            $('<br />').appendTo(el);
        }
    }

    $('#gene-list-textbox').on('input', function() {
        self.updateGeneList($(this).val());
    });

    this.updateGeneList();
    $('#filter-button').removeClass('hidden');
}

SampleFilter.prototype.updateGeneList = function(size) {

    var genesToDisplay;

    if(size) {
        genesToDisplay =  this.genes.filter(regexFilter(size));
    }
    else {
        genesToDisplay = this.genes;
    }

    $('#gene-select').children().remove();

    for(var i = 0; i < genesToDisplay.length; i++) {
        $('<option />', {
            value: genesToDisplay[i],
            text: genesToDisplay[i]
        }).appendTo('#gene-select');
    }
};

$('#filter-down').on('click', function() {
    console.log($('#gene-select').val());
});

$('#filter-up').on('click', function() {
    console.log($('#gene-select').val());
});

function regexFilter(pattern) {
    return function(element) {
        return element.match(new RegExp(pattern, 'i'))
    }
}