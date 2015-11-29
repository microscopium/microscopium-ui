from flask import current_app, render_template

from htmlmin.main import minify

from app.main import main
from .. import mongo

@main.route("/")
def index():
    """Render index.html.
    """
    screens = mongo.db.screens.find()
    return render_template("index.html", screens=screens)

@main.route("/<screen_id>")
def load_screen(screen_id):
    """Render UI html and send back in response.

    The screen_id parameter is passed to the JavaScript variable
    SCREEN_ID in the pages HTML.
    """
    return render_template("screen_ui.html",
                           screen_id=screen_id)

@main.after_request
def minify_html_response(response):
    """Minify any responses that contain HTML.
    """
    if response.content_type == u"text/html; charset=utf-8" and \
            current_app.config["MINIFY_HTML"]:
        response.set_data(minify(response.get_data(as_text=True)))
        return response
    return response
