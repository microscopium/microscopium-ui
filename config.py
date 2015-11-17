class Config:
    @staticmethod
    def init_app(app):
        pass

class DevelopmentConfig(Config):
    DEBUG = True
    MONGO_DBNAME = "microscopium"

config = {
    "development": DevelopmentConfig,
    "default": DevelopmentConfig
}
