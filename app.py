"""Application entry point for Muse.

Run this file with `python app.py`. It creates the Flask app, registers the
blueprints, and starts the development server when executed directly.
"""

from flask import Flask, render_template

from blueprints.admin import admin_bp
from blueprints.main import main_bp
from blueprints.utils import load_json
from config import Config


def create_app(config_class=Config):
    """Create and configure the Flask application.

    This app factory pattern keeps setup code in one place and makes the
    project easier to test or extend later.
    """
    app = Flask(__name__)
    app.config.from_object(config_class)

    app.register_blueprint(main_bp)
    app.register_blueprint(admin_bp, url_prefix="/admin")

    @app.context_processor
    def inject_global_data():
        """Make shared template data available to every route and error page."""
        return {
            "settings": load_json("settings.json"),
            "memories": load_json("memories.json"),
        }

    @app.errorhandler(404)
    def page_not_found(error):
        """Render a custom 404 page for unknown routes."""
        return render_template("404.html"), 404

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)
