from flask import Flask
from flask.ext.bootstrap import Bootstrap
from flask.ext.pymongo import PyMongo

from config import config

bootstrap = Bootstrap()
mongo = PyMongo()

def create_app(config_name):
    app = Flask(__name__, static_url_path="/static")
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)

    bootstrap.init_app(app)
    mongo.init_app(app)

    from app.main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    from app.dbapi import dbapi as dbapi_blueprint
    app.register_blueprint(dbapi_blueprint, url_prefix="/api")

    return app
