from bson.json_util import dumps
from flask import request
from app.dbapi import dbapi
from app import mongo

@dbapi.route("/images/<sample_id>")
def get_images(sample_id):
    find_query = {"sample_id": sample_id}
    select_query = request.args.getlist("select")

    result = mongo.db.images.find(find_query, fields=select_query)

    return dumps(result)


@dbapi.route("/images/<sample_id>/neighbours")
def get_images_neighbours(sample_id):
    find_query = {"_id": sample_id}
    select_query = request.args.getlist("select")

    neighbours = mongo.db.samples.find(find_query,
                                       fields={"_id": False,
                                               "neighbours": True})
    neighbours = neighbours[0]['neighbours']

    result = mongo.db.images.find({"sample_id": {"$in": neighbours}},
                                  fields=select_query)

    return dumps(result)


@dbapi.route("/features/<screen_id>/<feature>")
def get_feature(screen_id, feature):
    find_query = {"screen": screen_id, "feature_name": feature}
    select_query = request.args.getlist("select")

    result = mongo.db.features.find(find_query, fields=select_query)

    return dumps(result)


@dbapi.route("/samples/<screen_id>")
def get_sample(screen_id):
    find_query = {"screen": screen_id}
    select_query = request.args.getlist("select")

    result = mongo.db.samples.find(find_query, fields=select_query)

    return dumps(result)


@dbapi.route("/samples/<screen_id>/<sample_id>")
def get_samples(screen_id, sample_id):
    find_query = {"screen": screen_id, "_id": sample_id}
    select_query = request.args.getlist("select")

    result = mongo.db.samples.find(find_query, fields=select_query)

    return dumps(result)


# this route is defined for consistency with the "/images/<sample_id>/neighbours" route
@dbapi.route("/samples/<screen_id>/<sample_id>/neighbours")
def get_samples_neighbours(screen_id, sample_id):
    find_query = {"screen": screen_id, "_id": sample_id}

    result = mongo.db.samples.find(find_query,
                                   fields={"_id": False, "neighbours": True})

    return dumps(result)


@dbapi.route("/screens")
def get_screens():
    select_query = request.args.getlist("select")

    result = mongo.db.screens.find({}, fields=select_query)

    return dumps(result)


@dbapi.route("/screens/<screen_id>")
def get_screen(screen_id):
    find_query = {"_id": screen_id}
    select_query = request.args.getlist("select")

    result = mongo.db.screens.find(find_query, fields=select_query)

    return dumps(result)
