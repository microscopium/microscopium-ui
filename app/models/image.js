var mongoose = require('mongoose');

var imageSchema = mongoose.Schema(
  {
    screen_id: String,
    image_full: { data: Buffer, contentType: String },
    image_thumb: { data: Buffer, contentType: String }
  },
  {
    collection: 'images'
  }
);

module.exports = mongoose.model('Image', imageSchema);
