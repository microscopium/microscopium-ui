var mongoose = require('mongoose');

var sampleSchema = mongoose.Schema(
  {
    _id: String, // name-plate-well
    gene_name: String, // or gene_nane
    screen: String, // screen
    control_pos: Boolean, // true if sample is positive control
    control_neg: Boolean, // true if sample is negative control
    feature_vector: Array, // unstandardised features
    feature_vector_std: Array,
    neighbours: Array, // nearest neighbours (reference to samples)
    column: String, // '01', '02', '03', ...
    row: String, // 'A', 'B', 'C', ...
    pca_vector: Array,
    image_full: String, // BinData of image
    image_thumb: String // BinData of image (thumbnail)
  },
  {
    collection: "samples"
  }
);

module.exports = mongoose.model('Sample', sampleSchema);
