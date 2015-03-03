# Microscopium User Interface

Prerequisites
-------------

* Node.js > v0.10.35

Install Instructions
--------------------

```
$ npm install
$ bower install
```

Run dev version locally with
```
grunt
```

MongoDB Schema
--------------

Screens saved in document with format:

```
var Screen = {
    _id: String, // short screen name < 8 char
    screen_name: String, // full screen name
    screen_desc: String,
    number_samples : Number
    features : Array // Array of features used in the screen
}
```

Each sample saved in document with format:

```
var Sample = {
        _id: String, // name-plate-well
        screen: String, // Screen _id
        gene_name: String, // or gene_nane
        feature_vector: Array, // unstandardised features
        featute_vector_std: Array, // standardised features
        neighbours: Array, of _id // nearest neighbours (reference to samples)
        column: String, // '01', '02', '03', ...
        row: String, // 'A', 'B', 'C', ...
        pca_vector: Array,
        image: ObjectID, // Image ID
        cluster_member: Array // array of cluster memberships for clustering scheme k=2..20
    }
```

Each image saved in document with format:

```
var Image = {
        sample_id: String, // name-plate-well ENSURE A UNIQUE INDEX IS CREATED HERE!
        image_full: String, // BinData of image
        image_thumb: String // BinData of image (thumbnail)
    }
```

Screen has a one to one relationship with Images.

Documents stored stored in the ``microscopium`` database, otherwise change specification in ``config/db.js``
Screen documents in ``screens`` collection.
Sample documents in ``samples`` collection.
Image documents in ``images`` collection.

