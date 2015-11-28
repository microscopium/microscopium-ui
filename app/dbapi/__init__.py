from flask import Blueprint

dbapi = Blueprint("dbapi", __name__)

from app.dbapi import views
