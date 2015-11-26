from flask import Flask
from flask.ext.bootstrap import Bootstrap
from flask.ext.compress import Compress
from flask.ext.pymongo import PyMongo

from config import config

mongo = PyMongo()

def create_app(config_name):
    """
    An "application factory" used to initialise the app object. Configs and
    extensions are loaded here.

    See Flask docs for additional information:
    http://flask.pocoo.org/docs/0.10/patterns/appfactories/

    Parameters
    ----------
    config_name : str
        The configuration to run. Currently should be one of "development"
        or "default".

    Returns
    -------
    app : flask.app.Flask
        Flask application object.
    """
    app = Flask(__name__, static_url_path="/static")
    app.config.from_object(config[config_name])

    bootstrap = Bootstrap()
    compress = Compress()

    bootstrap.init_app(app)
    compress.init_app(app)
    mongo.init_app(app)

    from app.main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    from app.dbapi import dbapi as dbapi_blueprint
    app.register_blueprint(dbapi_blueprint, url_prefix="/api")

    return app
