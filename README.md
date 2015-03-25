# Microscopium User Interface

The web interface for [Microscopium](https://github.com/microscopium/microscopium).

Prerequisites
-------------

* Node.js version > v0.10.35
* MongoDB version > 2.6
* A modern browser, at least IE9+.

Install Instructions
--------------------

First install dependencies using NPM and Bower.

```console
$ npm install
$ bower install
```

Then then run this locally using grunt.

```console
$ grunt
```

The dev gruntfile is currently configured to run the following tasks:
* Run JSHint with [default settings](https://github.com/jshint/jshint/blob/master/examples/.jshintrc)
with the following excepions:

```
white: false,
indent: 4
```
* Browserify all JS files.
* Run the express server.
* Watch all JS files for changes and run the above tasks on change.

After running grunt, the UI should be up and running on http://localhost:8080.

MongoDB Schema
--------------

Documents should by default be stored in the the database ``microscopium``,
however this can be changed by updating the ``config/db.js`` file.

Screen descriptions are saved in the ``screens`` collection with the
following format:

```
var Screen = {
    _id: String, // A short ID for the screen.
    screen_desc: String, // A description of the screen.
    number_samples: Number // The number of
    screen_features: Array // An array of strings labelling each feature used in
                           // the screen.
}
```

Each sample saved in document with format:

```
var Sample = {
        _id: String,  // A unique identifier for each sample. Currently takes
                      // screen_id-plate-well
        screen: String  // The screen_id for the sample. An index should be
                        // setup on this field.
        gene_name: String,  // The name of the gene silenced or treatment
                            // applied to the sample.
        feature_vector: Array,  // An array of Numbers, the vector of
                                // unstandardised features
        featute_vector_std: Array  // An array of Numbers, the vector of standardised
                                   // features.
        neighbours: Array  // An array of sample_id strings, the 25 nearest
                           // neighbours of the sample.
        column: String,  // The column the sample is on in the plate
                         // e.g. '01', '02', '03', etc.
        row: String, // The row the sample is on in the plate
                     // e.g. 'A', 'B', 'C', etc.
        pca_vector: Array,  //  The first and second principal components.
        image: ObjectID, // image_id  The ID of the samples image document
                         // (see below).
        cluster_member: Array // Array of integers showing cluster memberships
                              // for clustering scheme k=2..20
    }
```

Each image saved in document with format:

```
var Image = {
        _id: ObjectID, // Mongo generated unique ID for this image
        sample_id: String, // The _id of the sample corresponding to this image.
        image_full: String, // BinData of image
        image_thumb: String // BinData of image (thumbnail)
    }
```
