var _ = require('lodash');
var utils = require('./Utils.js');

// add findByValues and uniqueData functions to lodash namespace
// so they can be used in lodash chains
_.mixin({
    'findByValues': utils.findByValues,
    'uniqueData': utils.uniqueData
});

// cache all jQuery selectors where possible.
// see: http://ttmm.io/tech/selector-caching-jquery/
var $filterButton = $('#filter-button');
var $filterMenu = $('#filter-menu');
var $geneSelect = $('#gene-select');
var $geneSelected = $('#gene-selected');
var $geneFilterText = $('#gene-filter-text');
var $filterForm = $('#filter-form');
var $filterAdd = $('#filter-add');
var $filterRemove = $('#filter-remove');

var ENTER = 13;


/**
 * SampleFilter: Setup sample filter.
 *
 * The constructor function adds all filters based on the current
 * sample data and attaches event listeners that drive behaviour filter.
 *
 * @constructor
 * @param {array} sampleData - The sample data for the screen. Each element
 *     in the array is an instance of a Sample document.
 * @param {NeighbourPlot} neighbourPlot - The NeighbourPlot object that this
 *     filter acts upon.
 */
function SampleFilter(sampleData, neighbourPlot) {
    this.data = sampleData;
    this.neighbourPlot = neighbourPlot;
    this.uniqueCol = _.uniqueData(this.data, 'column');
    this.uniqueRow = _.uniqueData(this.data, 'row');
    this.uniquePlate = _.uniqueData(this.data, 'plate');
    this.genes = _.uniqueData(this.data, 'gene_name');
    this.selectedGenes = [];

    // reset filter before mounting
    $('.filter-menu-item').children().remove();
    $geneSelect.children().remove();
    $geneSelected.children().remove();
    $filterButton.removeClass('filtering');

    // mount filter components
    this.mountFilterComponent(this.uniqueCol, 'col', 3);
    this.mountFilterComponent(this.uniqueRow, 'row', 2);
    this.mountFilterComponent(this.uniquePlate, 'plate', 2);
    this.mountEventListeners();
    this.updateGeneList();
    $filterButton.removeClass('hidden');
}

/**
 * mountFilterComponent: Add filter menu items for rows, columns or plates.
 *
 * Given an array of items, the function will append the checkboxes that
 * comprise the options for the filter interface.
 *
 * @param {array} uniqueValues - An array of strings that will be added to the
 *     filter menu as options. These should be unique values.
 * @param {string} label - Whether the unique values are for columns, rows, or
 *     plates. Value should be one of 'col', 'row' or 'plate'.
 * @param {number} numberCols - The number of columns to use when displaying
 *     options in the menu. This number should be a divisor of 12 (due to the
 *     Bootstrap grid layout system).
 *     e.g. 2 will append the items to display
 *     'A' 'D'
 *     'B' 'E'
 *     'C' 'F'
 *     3 will append the items such that:
 *     'A' 'C' 'E'
 *     'B' 'D' 'F'
 */
SampleFilter.prototype.mountFilterComponent = function(uniqueValues, label, numberCols) {
    var bootstrapColSize = 12/numberCols;
    var displayCols = Math.ceil(uniqueValues.length/numberCols);
    var i;
    var j = 0;

    // append a div with class row to contain the menu items
    var $labelFilter = $('#' + label + '-filter');
    $labelFilter.children().remove();
    $labelFilter.append('<div class="row">');

    // append a div for each column of the menu
    for(i = 0; i < numberCols; i++) {
        $('<div/>')
            .attr('id', label + '-' + i)
            .addClass('filter-item')
            .addClass('col-md-' + bootstrapColSize)
            .appendTo('#' + label + '-filter div:first');
    }

    //append items to each column in the menu
    for(i = 0; i < uniqueValues.length; i++) {
        var element = '#' + label + '-' + j;

        $('<input/>')
            .attr('type', 'checkbox')
            .attr('id', uniqueValues[i])
            .attr('name', label + '[' + [uniqueValues[i]] + ']')
            .attr('value', true)
            .attr('checked', true)
            .appendTo(element);

        $('<label/>')
            .attr('for', uniqueValues[i])
            .html(uniqueValues[i])
            .appendTo(element);

        $('<br/>').appendTo(element);

        if((i+1) % displayCols === 0) {
            j++;
        }
    }
};

/**
 * mountEventListeners: Add event listeners to filter.
 *
 * Add event listeners to filter elements to drive the behaviour
 * of the filter UI.
 *
 * @this {SampleFilter}
 */
SampleFilter.prototype.mountEventListeners = function() {
    var self = this;

    // add treatment to filter when arrow clicked
    $filterAdd.on('click', function() {
        self.addToFilter();
    });

    // remove treatment from filter when arrow clicked
    $filterRemove.on('click', function() {
        self.removeFromFilter();
    });

    // attach enter key and doubleclick listener to select box
    // using $(parent).on(event, element, function) as events must be bound to
    // elements that may not exist at time of page rendering
    $filterMenu.on('keydown dblclick', '#gene-select', function(event) {
        if(event.which === ENTER || event.type === 'dblclick') {
            event.preventDefault();
            self.addToFilter();
        }
    });

    // attach enter key and double listener to selected box
    $filterMenu.on('keydown dblclick', '#gene-selected', function(event) {
        if(event.which === ENTER || event.type === 'dblclick') {
            event.preventDefault();
            self.removeFromFilter();
        }
    });

    // update treatment 'search' value on input, paste
    $geneFilterText.on('change keyup paste', function() {
        self.updateGeneList();
        var value = $('#gene-select option:first').val();
        $geneSelect.val(value);

    });

    // update selected gene when enter pressed on textbox
    $geneFilterText.on('keypress', function(event) {
        if(event.which === ENTER) {
            self.addToFilter();
        }
    });

    // prevent submit event from triggering
    $filterForm.on('submit', function(event) {
        event.preventDefault();
    });

    // define behaviour for reset button
    $filterForm.on('reset', function(event) {
        event.preventDefault();
        // reset all checkboxes
        $('#filter-form input[type="checkbox"]').prop('checked', true);

        // reset gene filter boxes, then apply filter
        self.resetGeneFilter();
        self.applyFilter();
    });

    // update filter when checkbox (un)selected
    $('#filter-form input[type="checkbox"]').on('change', function(event) {
        self.applyFilter();
    });

    // automatically focus on textbox when menu opened
    $filterButton.on('click', function() {
        $geneFilterText.focus();
    });

    $('a[href*="gene-menu"]').on('click', function() {
        // see http://stackoverflow.com/questions/779379/why-is-settimeoutfn-0-sometimes-useful
        // for an explanation of this hack
        setTimeout(function() {
            $geneFilterText.focus();
        }, 400)
    });
};

/**
 * addToFilter: Add gene to list of genes being filtered.
 *
 * Adds a gene to the list of genes currently being filtered,
 * then sets the selected genes to the next one on the list.
 *
 * @this {SampleFilter}
 */
SampleFilter.prototype.addToFilter = function() {

    var value = $('#gene-select option:selected').val();
    if(!value) {
        value = $('#gene-select option:first').val();
    }

    var nextValue =  $('#gene-select option:selected').next().val();
    var index = this.genes.indexOf(value);

    if(index !== -1 && value) {
        this.genes.splice(index, 1);
        this.selectedGenes.push(value);
        this.updateGeneList();
        this.updateSelectedGeneList();
    }

    $geneSelect.val(nextValue);
    this.applyFilter();
};

/**
 * removeFromFilter: Remove a gene from the list of genes being filtered.
 *
 * @this {SampleFilter}
 */
SampleFilter.prototype.removeFromFilter = function() {
    var value = $('#gene-selected option:selected ').val();
    var nextValue =  $('#gene-selected option:selected').next().val();
    var index = this.selectedGenes.indexOf(value);

    if(index !== -1 && value) {
        this.selectedGenes.splice(index, 1);
        utils.sortedPush(this.genes, value);
        this.updateGeneList();
        this.updateSelectedGeneList();
    }

    $geneSelected.val(nextValue);
    this.applyFilter();
};

/**
 * resetGeneFilter: Reset all selections in the filter.
 *
 * @this {SampleFilter}
 */
SampleFilter.prototype.resetGeneFilter = function() {
    $geneSelected.children().remove();
    this.selectedGenes = [];
    this.updateGeneList();
    this.applyFilter();
};

/**
 * updateSelectedGeneList: Update genes displayed in genes list.
 *
 * @this {SampleFilter}
 */
SampleFilter.prototype.updateGeneList = function() {
    $geneSelect.children().remove();

    var pattern = $geneFilterText.val();
    var genesToDisplay;

    if(pattern) {
        genesToDisplay = _.filter(this.genes, utils.regexFilter(pattern));
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

/**
 * updateSelectedGeneList: Update genes displayed in selected genes list.
 *
 * @this {SampleFilter}
 */
SampleFilter.prototype.updateSelectedGeneList = function() {
    $geneSelected.children().remove();

    for(var i = 0; i < this.selectedGenes.length; i++) {
        $('<option />', {
            text: this.selectedGenes[i]
        }).appendTo('#gene-selected');
    }
};

/**
 * applyFilter: Apply current filter parameters to dataset and update plot.
 *
 * Read selected values from filter menu, parse the values, filter the dataset
 * then update the neighbourPlot with the new filtered data.
 *
 * @this {SampleFilter}
 */
SampleFilter.prototype.applyFilter = function() {
    // parse the data from the filter menu
    var filterQuery = $filterForm.serializeJSON();
    var rows = _.keys(filterQuery.row);
    var cols = _.keys(filterQuery.col);
    var plates = _.keys(filterQuery.plate);

    // need to read the plates as integers
    plates = _.map(plates, function(d) { return +d; });

    var rowActive = rows.length < this.uniqueRow.length;
    var colActive = cols.length < this.uniqueCol.length;
    var plateActive = plates.length < this.uniquePlate.length;
    var geneActive = this.selectedGenes.length > 0;

    // apply filter and re-draw plot when filter active
    if(geneActive || plateActive || rowActive || colActive) {
        $filterButton.addClass('filtering');

        var result = _.chain(this.data)
            .findByValues('column', cols)
            .findByValues('row', rows)
            .findByValues('plate', plates);

        if(geneActive) {
            result = result.findByValues('gene_name', this.selectedGenes);
        }

        this.neighbourPlot.updatePlot(result.value());
    }

    // add all data back to plot when filters empty
    if(!geneActive && !plateActive && !rowActive && !colActive) {
        $filterButton.removeClass('filtering');
        this.neighbourPlot.updatePlot(this.data);
    }

};

module.exports = SampleFilter;
