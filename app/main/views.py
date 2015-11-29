from flask import render_template

from htmlmin.main import minify

from app.main import main

@main.route("/")
def index():
    return render_template("index.html")

@main.after_request
def minify_html_response(response):
    if response.content_type == u"text/html; charset=utf-8":
        response.set_data(minify(response.get_data(as_text=True)))
        return response
    return response
