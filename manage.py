#!/usr/bin/env python
import os

from flask.ext.script import Manager, Shell
from app import create_app

app = create_app(os.getenv('FLASK_CONFIG') or 'default')

def make_shell_context():
    """Create dictionary for flask-script shell context

    Any objects that should be available in the flask shell context
    should be added to the dictionary returned by this function.
    """
    return dict(app=app)

manager = Manager(app)
manager.add_command("shell", Shell(make_context=make_shell_context))

if __name__ == "__main__":
    manager.run()
