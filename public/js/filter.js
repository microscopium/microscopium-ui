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
                name: 'plate[' + [uniquePlate[i+j*length]] + ']',
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
                name: 'rows[' + [uniqueRow[i+j*length]] + ']',
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
                name: 'cols[' + [uniqueCol[i+j*length]] + ']',
                value: true,
                checked: true}).appendTo(el);
            $('<label />', { 'for': uniqueCol[i], text: uniqueCol[i+j*length] }).appendTo(el);
            $('<br />').appendTo(el);
        }
    }

    // attach listener for 'add to filter' event
    $('#filter-add').on('click', function() {
        self.addToFilter();
    });

    // attach listener for 'remove from filter' event
    $('#filter-remove').on('click', function() {
        self.removeFromFilter();
    });

    // attach listener to gene filter textbox
    $('#gene-filter-text').on('input paste', function() {
        self.updateGeneList();
    });

    // attach listener to submit button
    $('#filter-form').on('submit', function(event) {
        event.preventDefault();
        var filterQuery = $('form').serializeJSON();
        // add genes to query
        filterQuery['gene_list'] = self.selectedGenes;
        console.log(filterQuery);
    });

    // attach additional behavior to reset button
    $('#filter-form').on('reset', function() {
        self.resetGeneFilter();
    });

    // display filter button once components mounted
    self.updateGeneList();
    $('#filter-button').removeClass('hidden');

}

SampleFilter.prototype.addToFilter = function() {
    var value = $('#gene-select').val();
    var index = this.genes.indexOf(value);

    if(index !== -1 && value) {
        this.genes.splice(index, 1);
        this.selectedGenes.push(value);
        this.updateGeneList();
        this.updateSelectedGeneList();
    }
};

SampleFilter.prototype.removeFromFilter = function() {
    var value = $('#gene-selected').val();
    var index = this.selectedGenes.indexOf(value);

    if(index !== -1 && value) {
        this.selectedGenes.splice(index, 1);
        this.genes.push(value);
        this.genes.sort();
        this.updateGeneList();
        this.updateSelectedGeneList();
    }
};

SampleFilter.prototype.resetGeneFilter = function() {
    $('#gene-selected').children().remove();
    this.genes.push.apply(this.genes, this.selectedGenes);
    this.genes.sort();
    this.selectedGenes = [];
    this.updateGeneList();
};

SampleFilter.prototype.updateGeneList = function() {
    console.log('updateGeneList');
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
            text: this.selectedGenes[i]
        }).appendTo('#gene-selected');
    }
};

function regexFilter(pattern) {
    return function(element) {
        return element.match(new RegExp(pattern, 'i'))
    }
}