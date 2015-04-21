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

    var divWidth = Math.round($('#image-column').width()) - 20;
    var imgWidth = Math.round(divWidth/3) - 20;

    // set size of fullsize image
    $('.selected-image-display')
        .css('width', divWidth)
        .css('height', divWidth);

    // set size of thumbnail size image
    $('.thumb')
        .css('width', imgWidth)
        .css('height', imgWidth);

    $('body').on('updatePoint', function(event, d) {
        self.getImages(d._id);
    });

}

/**
 * getImages: Get med-size image for selected samples, and nearest
 * neighbour images.
 *
 * @this {NeighbourImages}
 * @params {string} - _id of the query sample
 */
NeighbourImages.prototype.getImages = function(query_id) {
    var self = this;

    var height = Math.round($('#plot-column').height() - 10);
    $('#image-column')
        .css('height', height);


    $.when(
        $.ajax({
            url: '/api/sample/neighbours/' + query_id,
            success: function(json) {
                json.shift(); // don't need first document
                self.neighbours = json;
            }
        }),
        $.ajax({
            url: '/api/image/' + query_id,
            success: function(json) {
                self.selectedImage = json[0];
            }
        }),
        $.ajax({
            type: 'GET',
            url: '/api/images/' + query_id,
            success: function(json) {
                json.shift(); // don't need first document
                self.neighbourImages = json;
            }
        })).then(function(res, status) {
            self.setImages();
        });
};

/**
 * setImages: Convert base64 encoded strings to images and set them in the DOM.
 *
 * @this {NeighbourImages}
 */
NeighbourImages.prototype.setImages = function() {
    var self = this;

    $('#nebula-0').attr('src', 'data:image/jpg;base64,' + self.selectedImage.image_full);
    $('#nebula-0').attr('title', self.selectedImage.sample_id);

    for(var i = 0; i < self.neighbourImages.length; i++) {
        var $nebulaSelector = $('#nebula-' + (i+1));
        $nebulaSelector
            .attr('src', 'data:image/jpg;base64,' + self.neighbourImages[i].image_thumb)
            .attr('title', self.neighbourImages[i].sample_id);
        $nebulaSelector.unbind('click');
        (function(j) {
            $nebulaSelector.on('click', function() {
                $('body').trigger('updatePoint', [self.neighbours[j]])
            });
        })(i);
    }
};

function foo(j) {
    console.log(s)
}

module.exports = NeighbourImages;
