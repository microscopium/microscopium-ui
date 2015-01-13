var mongoose = require('mongoose');

var screenSchema = mongoose.Schema(
  {
      _id: String, // short screen name < 8 char
      screen_name: String, // full screen name
      screen_desc: String,
      number_samples: Number,
  },
  {
        collection: "screens"
  }
);

module.exports = mongoose.model('Screen', screenSchema);
