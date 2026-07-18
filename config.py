"""Configuration values for Muse.

For a real deployment, set SECRET_KEY and ADMIN_PASSWORD as environment
variables instead of editing this file.
"""

import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent


class Config:
    """Default Flask configuration."""

    SECRET_KEY = os.environ.get("SECRET_KEY", "change-me-before-deploying-muse")
    ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "muse-admin")
    DATA_DIR = BASE_DIR / "data"
