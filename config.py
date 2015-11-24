"""
Classes for managing app configurations.

See Flask docs: http://flask.pocoo.org/docs/0.10/config/
"""

class Config:
    pass

class DevelopmentConfig(Config):
    DEBUG = True
    MONGO_DBNAME = "microscopium"

config = {
    "development": DevelopmentConfig,
    "default": DevelopmentConfig
}
