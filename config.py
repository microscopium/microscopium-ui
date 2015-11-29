"""
Classes for managing app configurations.

See Flask docs: http://flask.pocoo.org/docs/0.10/config/
"""

class Config:
    DEBUG = True

    # If true, minified HTML will be sent to the browser.
    # This should be False during development
    MINIFY_HTML = True

class DevelopmentConfig(Config):
    DEBUG = True

    MINIFY_HTML = False

    MONGO_DBNAME = "microscopium"

config = {
    "development": DevelopmentConfig,
    "default": DevelopmentConfig
}
