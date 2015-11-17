from bson.json_util import dumps
from flask import jsonify, request

from app.dbapi import dbapi
from app import mongo

@dbapi.route("/images")
def images():
    query_id = request.args.get("sample_id")
    query_neighbours = request.args.get("neighbours")
    query_select = request.args.getlist("select")

    if not query_id:
        raise InvalidParams("An id parameter must be supplied with"
                            " this request.")

    find_query = {}

    query_neighbours = query_neighbours == "true"

    if not query_select:
        query_select = None

    if not query_neighbours:
        find_query["sample_id"] = query_id
        result = mongo.db.images.find(find_query, fields=query_select)
    else:
        find_query["_id"] = query_id
        neighbours = mongo.db.samples.find(find_query,
                                           fields={"_id": False,
                                                   "neighbours": True})[0]['neighbours']

        result = mongo.db.images.find({"sample_id": {"$in": neighbours}},
                                      fields=query_select)

    return dumps(result)


@dbapi.route("/features")
def features():
    query_screen = request.args.get("screen")
    query_feature = request.args.get("feature")
    query_select = request.args.getlist("select")

    if not query_screen or not query_feature:
        raise InvalidParams("A screen and feature_name parameter must be supplied with"
                            " this request.")

    find_query = {}

    if query_screen:
        find_query["screen"] = query_screen

    if query_feature:
        find_query["feature_name"] = query_feature

    if not query_select:
        query_select = None

    feature = mongo.db.features.find(find_query, fields=query_select)

    return dumps(feature)


@dbapi.route("/samples")
def samples():
    query_id = request.args.get("id")
    query_screen = request.args.get("screen")
    query_select = request.args.getlist("select")

    if not query_id and not query_screen:
        raise InvalidParams("An id or screen parameter must be supplied "
                            "with this request.")

    find_query = {}

    if query_id:
        find_query["_id"] = query_id

    if query_screen:
        find_query["screen"] = query_screen

    if not query_select:
        query_select = None

    sample = mongo.db.samples.find(find_query, fields=query_select)

    return dumps(sample)


@dbapi.route("/screens")
def screens():
    query_id = request.args.get("id")
    query_select = request.args.getlist("select")

    find_query = {}

    if query_id:
        find_query["_id"] = query_id

    if not query_select:
        query_select = None

    screen = mongo.db.screens.find(find_query, fields=query_select)

    return dumps(screen)

# create custom exception class to reject invalid requests to API
class InvalidParams(Exception):
    def __init__(self, message):
        Exception.__init__(self)
        self.status_code = 400
        self.message = message

    def to_dict(self):
        error_dict = dict()
        error_dict['message'] = self.message
        return error_dict

# register error handler for InvalidParams exception
@dbapi.errorhandler(InvalidParams)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response
