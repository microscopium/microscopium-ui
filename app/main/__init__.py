from flask import Blueprint

main = Blueprint("dbapi", __name__)

from app.main import views
