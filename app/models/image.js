var mongoose = require('mongoose');

var imageSchema = mongoose.Schema(
  {
    screen_id: String,
    image_full: String,
    image_thumb: String
  },
  {
    collection: 'images'
  }
);

module.exports = mongoose.model('Image', imageSchema);
