function SampleFilter(uniqueRow, uniqueCol, uniquePlate, uniqueGene) {
    $('.filter-items').children().remove();

    this.genes = uniqueGene;
    this.selectedGenes = [];
    var self = this;

    // append plate checkboxes
    var length = uniquePlate.length/2;
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

    // append row checkboxes
    var length = uniqueRow.length/2;
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

    // append column checkboxes
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

    // attach listener for 'add to filter' event
    $('#filter-add').on('click', function() {

        var value = $('#gene-select').val();
        var index = self.genes.indexOf(value);

        if(index !== -1 && value) {
            self.genes.splice(index, 1);
            self.selectedGenes.push(value);
            self.updateGeneList();
            self.updateSelectedGeneList();
        }
    });

    // attach listener for 'remove from filter' event
    $('#filter-remove').on('click', function() {

        var value = $('#gene-selected').val();
        var index = self.selectedGenes.indexOf(value);

        if(index !== -1 && value) {
            self.selectedGenes.splice(index, 1);
            self.genes.push(value);
            self.genes.sort();
            self.updateGeneList();
            self.updateSelectedGeneList();
        }
    });

    // attach listener to gene filter textbox
    $('#gene-filter-text').on('input paste', function() {
        self.updateGeneList();
    });

    // display filter button once components mounted
    self.updateGeneList();
    $('#filter-button').removeClass('hidden');

}

SampleFilter.prototype.updateGeneList = function() {

    $('#gene-select').children().remove();

    var pattern = $('#gene-filter-text').val();
    var genesToDisplay;

    if(pattern) {
        genesToDisplay = this.genes.filter(regexFilter(pattern));
    }
    else {
        genesToDisplay = this.genes;
    }

    for(var i = 0; i < genesToDisplay.length; i++) {
        $('<option />', {
            value: genesToDisplay[i],
            text: genesToDisplay[i]
        }).appendTo('#gene-select');
    }
};

SampleFilter.prototype.updateSelectedGeneList = function() {
    $('#gene-selected').children().remove();

    for(var i = 0; i < this.selectedGenes.length; i++) {
        $('<option />', {
            value: this.selectedGenes[i],
            text: this.selectedGenes[i]
        }).appendTo('#gene-selected');
    }
};


function regexFilter(pattern) {
    return function(element) {
        return element.match(new RegExp(pattern, 'i'))
    }
}