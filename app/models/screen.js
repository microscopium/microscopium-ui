// mongoose schema for screen object

var mongoose = require('mongoose');

var screenSchema = mongoose.Schema(
    // specify schema in existing mongo collection
    {
        name: String,
        description: String,
        no_samples: Number,
        no_clusters: Number,
        sample: { // TODO change to sample Schema (eventually)
            gene_name: String,
            column: Number,
            well: String,
            feature_vector: Array,
            pca_3d: Array,
            pca_2d: Array
        }
    },
    // specify collection where objects are
    {
        collection: 'interfacetest'
    });

module.exports = mongoose.model('Screen', screenSchema);
