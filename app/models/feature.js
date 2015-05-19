var mongoose = require('mongoose');

var featureSchema  = mongoose.Schema({
    screen: String,
    feature_name: String,
    feature_dist: Array,
    feature_dist_std: Array
}, {
    collection: 'features'
});

module.exports = mongoose.model('Feature', featureSchema);
