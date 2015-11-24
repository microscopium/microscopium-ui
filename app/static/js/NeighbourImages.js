var _ = require('lodash');

/**
 * NeighbourImages: Object to get and set images in the gallery.
 *
 * @constructor
 */
function NeighbourImages() {
    var self = this;
    this.neighbours = [];
    this.selectedImage = "";
    this.neighbourImages = [];

    // When a jQuery selector is called, the DOM must be traversed in order
    // to find the element. if the selector is saved to a variable (ie cached), the
    // element is remembered thus the DOM doesn't need to be traversed on subsequent
    // calls. Frequently used selectors are cached in the object constructor so the
    // selectors are cached when the object is created.
    this.selectors = {
        $nebula0: $('#nebula-0'),
        // create an array of jquery selectors for all the neighbour images
        $nebula: _.map(_.range(1, 24), function(value) {
            return $('#nebula-' + (value));
        }),
        $body:  $('body'),
        $imgZoomButton: $('#img-zoom-button'),
        $thumbnailChildImg: $('.thumbnail > img'),
        $imageButtons: $('.img-button')
    };

    var divWidth = Math.round($('#image-column').width());
    var imgWidth = Math.round(divWidth/3);

    // set size of fullsize image
    $('.selected-image-display')
        .css('width', divWidth);

    // set size of thumbnail size image
    $('.thumb')
        .css('width', imgWidth);

    // hide/unhide image buttons on hover
    $('#main-image').hover(function() {
        self.selectors.$imageButtons.removeClass('hidden');
    }, function() {
        self.selectors.$imageButtons.addClass('hidden');
    });
}

/**
 * getImages: Get images for selected sample.
 *
 * Send two AJAX requests to get the medium size image of the
 * input sample_id, and the images of the neighbouring
 * samples.
 *
 * @this {NeighbourImages}
 * @params {string} sample_id - The _id of the query sample
 */
NeighbourImages.prototype.getImages = function(sample_id) {
    var self = this;

    var imageQueryLarge = {
        select: ['image_large', 'sample_id']
    };

    var imageQueryNeighbour = {
        select: ['image_thumb', 'sample_id', 'gene_name']
    };

    $.when(
        $.ajax({
            type: 'GET',
            url: '/api/images/' + sample_id + '?' + $.param(imageQueryLarge, true),
            dataType: 'json',
            success: function(json) {
                self.selectedImage = json[0];
            }
        }),
        $.ajax({
            type: 'GET',
            url: '/api/images/' + sample_id + '/neighbours' + '?' + $.param(imageQueryNeighbour, true),
            dataType: 'json',
            success: function(json) {
                self.neighbourImages = json;
            }

        })).then(function() {

            // match the height of the image gallery to the plots..
            // do this *after* the images are loaded from the DB
            var height = Math.round($('#plot-column').height());
            $('#image-column')
                .css('height', height);

            self.setImages();
        });
};

/**
 * setImages: Convert base64 encoded strings to images and set them in the DOM.
 *
 * Clicking on 'neighbour' images sets the corresponding point in the PCA plot as the
 * active point.
 *
 * @this {NeighbourImages}
 */
NeighbourImages.prototype.setImages = function() {
    var self = this;

    // make all image frames empty, this is done to prevent
    // images belonging to the previous sample selected
    // from displaying if something goes wrong when the
    // images are loaded.
    this.selectors.$nebula0
        .attr('src', '//:0')
        .attr('title', 'not found');

    this.selectors.$thumbnailChildImg
        .attr('src', '//:0')
        .attr('title', 'not found');

    // add selected main image, if it exists
    if(this.selectedImage) {
        this.selectors.$nebula0
            .attr('src', 'data:image/jpg;base64,' +
                this.selectedImage.image_large.$binary)
            .attr('title', this.selectedImage.sample_id + '&#013;' +
                this.selectedImage.gene_name);
    }

    this.selectors.$imgZoomButton.unbind('click');
    this.selectors.$imgZoomButton.on('click', function(event) {
        event.preventDefault();
        self.openFullModal();
    });

    // iterate through all found images and add them to the gallery
    for(var i = 0; i < self.neighbourImages.length; i++) {

        this.selectors.$nebula[i]
            .attr('src', 'data:image/jpg;base64,' +
                self.neighbourImages[i].image_thumb.$binary)
            .attr('title', self.neighbourImages[i].sample_id);
        this.selectors.$nebula[i].unbind('click');

        // use IIFE (immediately invoked function expression)
        // here as a closure is being called in a loop
        // see http://www.mennovanslooten.nl/blog/post/62 for additional details
        (function(j) {
            self.selectors.$nebula[i].on('click', function(event) {
                event.preventDefault();
                self.selectors.$body.trigger('updateSample',
                    self.neighbourImages[j].sample_id);
            });
        })(i);
    }
};

/**
 * openFullModal: Open the modal that displays the full size image.
 *
 * Send an AJAX request to get the full-size image and set the content of
 * the image modal before opening it.
 *
 * @this {NeighbourImages}
 */
NeighbourImages.prototype.openFullModal = function() {
    var imageQuery = {
        sample_id: this.selectedImage.sample_id,
        select: ['image_full image_large sample_id']
    };
    $.ajax({
        type: 'GET',
        url: '/api/images?' + $.param(imageQuery),
        success: function(data) {
            // TODO remove once all collections reliably have a fullsize image
            var image = data[0].image_full || data[0].image_large;

            // add image title
            $('#full-size-img-title').html(data[0].sample_id);

            // add image to modal HTML
            $('#full-size-image')
                .attr('src', 'data:image/jpg;base64,' + image)
                .attr('title', data[0].sample_id);
            // open the modal!
            $('#image-modal').modal('show');
        }
    });
};

module.exports = NeighbourImages;
