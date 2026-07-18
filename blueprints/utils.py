"""Small JSON helpers shared by the public and admin blueprints."""

import json
from pathlib import Path

from flask import current_app


def data_path(filename):
    """Return the absolute path for a data JSON file."""
    return Path(current_app.config["DATA_DIR"]) / filename


def load_json(filename):
    """Load a JSON file from the configured data directory."""
    with data_path(filename).open("r", encoding="utf-8") as file:
        return json.load(file)


def save_json(filename, payload):
    """Save pretty-printed JSON to the configured data directory."""
    with data_path(filename).open("w", encoding="utf-8") as file:
        json.dump(payload, file, indent=2, ensure_ascii=False)
        file.write("\n")


def load_site_data():
    """Load all public content used across templates."""
    return {
        "story": load_json("story.json"),
        "songs": load_json("songs.json"),
        "timeline": load_json("timeline.json"),
        "puzzles": load_json("puzzles.json"),
        "memories": load_json("memories.json"),
        "settings": load_json("settings.json"),
    }
