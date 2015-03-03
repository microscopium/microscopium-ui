var _ = require('lodash');

function SampleFilter(sampleData) {
    $('.filter-items').children().remove();

    this.data = sampleData;
    this.uniqueCol = uniqueData(this.data, 'column');
    this.uniqueRow = uniqueData(this.data, 'row');
    this.uniquePlate = uniqueData(this.data, 'plate');
    this.genes = uniqueData(this.data, 'gene_name');
    this.selectedGenes = [];
    var self = this;

    // append plate checkboxes
    var j = 0;
    var cols = Math.ceil(this.uniquePlate.length/2);
    for(var i = 0; i < this.uniquePlate.length; i++) {
        var el = '#plate-' + (j+1);
        $('<input />', { type: 'checkbox',
            name: 'plate[' + [this.uniquePlate[i]] + ']',
            value: true,
            checked: true}).appendTo(el);
        $('<label />', { 'for': this.uniquePlate[i], text: this.uniquePlate[i] }).appendTo(el);
        $('<br />').appendTo(el);

        if( (i+1) % cols === 0) {
            j++;
        }
    }

    // append row checkboxes
    var j = 0;
    var cols = Math.ceil(this.uniqueRow.length/2);
    for(var i = 0; i < this.uniqueRow.length; i++) {
        var el = '#row-' + (j+1);
        $('<input />', { type: 'checkbox',
            name: 'row[' + [this.uniqueRow[i]] + ']',
            value: true,
            checked: true}).appendTo(el);
        $('<label />', { 'for': this.uniqueRow[i], text: this.uniqueRow[i] }).appendTo(el);
        $('<br />').appendTo(el);

        if( (i+1) % cols === 0) {
            j++;
        }
    }

    // append column checkboxes
    var j = 0;
    var cols = Math.ceil(this.uniqueCol.length/3);
    for(var i = 0; i < this.uniqueCol.length; i++) {
        var el = '#col-' + (j+1);
        $('<input />', { type: 'checkbox',
            name: 'column[' + [this.uniqueCol[i]] + ']',
            value: true,
            checked: true}).appendTo(el);
        $('<label />', { 'for': this.uniqueCol[i], text: this.uniqueCol[i] }).appendTo(el);
        $('<br />').appendTo(el);

        if( (i+1) % cols === 0) {
            j++;
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

    // attach listener to gene filter textbox input
    $('#gene-filter-text').on('input paste', function() {
        self.updateGeneList();
    });

    // attach enter key listener to text input box
    $('#gene-filter-text').on('keypress', function(event) {
        if(event.which === 13) {
            event.preventDefault();
            self.addfromTextBox();
        }
    });

    // attach enter key listener to select box
    $('#gene-select').on('keypress', function(event) {
        if(event.which === 13) {
            event.preventDefault();
            self.addToFilter();
        }
    });

    // attach enter key listener to selected box
    $('#gene-selected').on('keypress', function(event) {
        if(event.which === 13) {
            event.preventDefault();
            self.removeFromFilter();
        }
    });

    // attach additional behavior to reset button
    $('#filter-form').on('reset', function() {
        self.resetGeneFilter();
    });

    // filter onchange
    $(':checkbox').on('change', function() {
        self.applyFilter();
    });

    // allow only one menu open at a time
    $('#filter-menu a').on('click', function() {
        if(!$(this).next().hasClass('in')) {
            $('#filter-menu a').next().removeClass('in');
        }
    });

    // display filter button once components mounted
    self.updateGeneList();
    $('#filter-button').removeClass('hidden');
}

SampleFilter.prototype.addfromTextBox = function() {
    var value = $('#gene-select option:eq(0)').val();
    var nextValue = $('#gene-select option:eq(1)').val();
    var index = this.genes.indexOf(value);

    if(index !== -1 && value) {
        this.genes.splice(index, 1);
        this.selectedGenes.push(value);
        this.updateGeneList();
        this.updateSelectedGeneList();
    }

    $('#gene-select').val(nextValue);
};

SampleFilter.prototype.addToFilter = function() {
    var value = $('#gene-select option:selected').val();
    var nextValue =  $('#gene-select option:selected').next().val();
    var index = this.genes.indexOf(value);

    if(index !== -1 && value) {
        this.genes.splice(index, 1);
        this.selectedGenes.push(value);
        this.updateGeneList();
        this.updateSelectedGeneList();
    }

    $('#gene-select').val(nextValue);
    this.applyFilter();
};

SampleFilter.prototype.removeFromFilter = function() {
    var value = $('#gene-selected option:selected ').val();
    var nextValue =  $('#gene-selected option:selected').next().val();
    var index = this.selectedGenes.indexOf(value);

    if(index !== -1 && value) {
        this.selectedGenes.splice(index, 1);
        this.genes.push(value);
        this.genes.sort();
        this.updateGeneList();
        this.updateSelectedGeneList();
    }

    $('#gene-selected').val(nextValue);
    this.applyFilter();
};

SampleFilter.prototype.resetGeneFilter = function() {
    $('#gene-selected').children().remove();
    this.genes.push.apply(this.genes, this.selectedGenes);
    this.genes.sort();
    this.selectedGenes = [];
    this.updateGeneList();
    this.applyFilter();
};

SampleFilter.prototype.updateGeneList = function() {
    $('#gene-select').children().remove();

    var pattern = $('#gene-filter-text').val();
    var genesToDisplay;

    if(pattern) {
        genesToDisplay = _.filter(this.genes, regexFilter(pattern));
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

SampleFilter.prototype.applyFilter = function() {
    var filterQuery = $('form').serializeJSON();

    var rows = $.map(filterQuery.row, function(val, key) { return val; });
    var cols = $.map(filterQuery.column, function(val, key) { return val; });
    var plates = $.map(filterQuery.plate, function(val, key) { return val; });

    var rowActive = rows.length < this.uniqueRow.length;
    var colActive = cols.length < this.uniqueCol.length;
    var plateActive = plates.length < this.uniquePlate.length;
    var geneActive = this.selectedGenes.length > 0;

    if(geneActive || plateActive || rowActive || colActive) {
        $('#filter-button').addClass('filtering');
    }

    if(!geneActive && !plateActive && !rowActive && !colActive) {
        $('#filter-button').removeClass('filtering');
    }

    // TODO apply filter here
};

function regexFilter(pattern) {
    return function(element) {
        return element.match(new RegExp(pattern, 'i'))
    }
}

function uniqueData(data, field) {
    return _.uniq(_.pluck(_.flatten(data), field)).sort()
}

module.exports = SampleFilter;
