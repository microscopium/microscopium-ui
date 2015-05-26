var _ = require('lodash');

/**
 * NeighbourImages: Object to get and set images in the gallery.
 *
 * @constructor
 */
function NeighbourImages() {
    this.neighbours = [];
    this.selectedImage = "";
    this.neighbourImages = [];

    // cache jquery selectors used frequency by gallery methods
    // call these in the constructor so the DOM is traversed only once
    // before caching.
    this.selectors = {
        $nebula0: $('#nebula-0'),
        // create an array of jquery selectors for all the neighbour images
        $nebula: _.map(_.range(1, 24), function(value) {
            return $('#nebula-' + (value))
        }),
        $body:  $('body'),
        $imgZoomButton: $('#img-zoom-button'),
        $thumbnailChildImg: $('.thumbnail > img')
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
        $('#image-buttons').removeClass('hidden');
    }, function() {
        $('#image-buttons').addClass('hidden');
    });
}

/**
 * getImages: Get images for selected sample.
 *
 * Sends two AJAX requests to get the medium size image of the
 * inputed sample_id, and to get the images of the neighbouring
 * samples.
 *
 * @this {NeighbourImages}
 * @params {string} sample_id - The _id of the query sample
 */
NeighbourImages.prototype.getImages = function(sample_id) {
    var self = this;

    var imageQueryLarge = {
        sample_id: sample_id,
        select: ['image_large sample_id']
    };

    var imageQueryNeighbour = {
        sample_id: sample_id,
        select: ['image_thumb sample_id'],
        neighbours: true
    };

    $.when(
        $.ajax({
            url: '/api/images/?' + $.param(imageQueryLarge),
            success: function(json) {
                self.selectedImage = json[0];
            }
        }),
        $.ajax({
            url: '/api/images?' + $.param(imageQueryNeighbour),
            success: function(json) {
                self.neighbourImages = json;
            }

        })).then(function() {

            // matches the height of the image gallery to the plots
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

    // make all img frames empty
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
                this.selectedImage.image_large)
            .attr('title', this.selectedImage.sample_id);
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
                self.neighbourImages[i].image_thumb)
            .attr('title', self.neighbourImages[i].sample_id);
        this.selectors.$nebula[i].unbind('click');

        // use IIFE here as closure being called in a loop
        // see http://www.mennovanslooten.nl/blog/post/62
        (function(j) {
            self.selectors.$nebula[i].on('click', function(event) {
                event.preventDefault();
                self.selectors.$body.trigger('updatePoint',
                    self.neighbourImages[j].sample_id);
            });
        })(i);
    }
};

/**
 * openFullModal: Open the modal that displays the full size image.
 *
 * Sends an AJAX request to get the full-size image, sets the content of
 * the image modal and opens it.
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
        url: '/api/images/?' + $.param(imageQuery),
        success: function(data) {
            // TODO some collections don't have a fullsize image, use the large image in lieu
            var image = data[0].image_full || data[0].image_large;

            // add image title
            $('#full-size-img-title').html(data[0].sample_id);

            // add image to modal HTML
            $('#full-size-img')
                .attr('src', 'data:image/jpg;base64,' +
                image)
                .attr('title', data[0].sample_id);
            // open the modal!
            $('#image-modal').modal('show');
        }
    })
};

module.exports = NeighbourImages;
