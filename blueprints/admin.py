"""Password-protected JSON editor for Muse content."""

import json

from flask import Blueprint, current_app, redirect, render_template, request, session, url_for

from .utils import load_json, save_json


admin_bp = Blueprint("admin", __name__, template_folder="../templates")

EDITABLE_FILES = {
    "songs": "songs.json",
    "story": "story.json",
    "timeline": "timeline.json",
    "puzzles": "puzzles.json",
    "memories": "memories.json",
    "settings": "settings.json",
}


def is_logged_in():
    """Check whether the visitor entered the admin password."""
    return session.get("muse_admin") is True


@admin_bp.route("/", methods=["GET", "POST"])
def dashboard():
    """Show the login form or the JSON editor dashboard."""
    message = None
    error = None

    if request.method == "POST" and not is_logged_in():
        password = request.form.get("password", "")
        if password == current_app.config["ADMIN_PASSWORD"]:
            session["muse_admin"] = True
            return redirect(url_for("admin.dashboard"))
        error = "Wrong password. Try again."

    if not is_logged_in():
        return render_template("admin.html", logged_in=False, error=error)

    selected = request.args.get("file", "songs")
    if selected not in EDITABLE_FILES:
        selected = "songs"

    content = json.dumps(load_json(EDITABLE_FILES[selected]), indent=2, ensure_ascii=False)
    return render_template(
        "admin.html",
        logged_in=True,
        files=EDITABLE_FILES.keys(),
        selected=selected,
        content=content,
        message=message,
        error=error,
    )


@admin_bp.route("/save/<name>", methods=["POST"])
def save(name):
    """Validate and save an edited JSON document."""
    if not is_logged_in():
        return redirect(url_for("admin.dashboard"))
    if name not in EDITABLE_FILES:
        return redirect(url_for("admin.dashboard"))

    raw_content = request.form.get("content", "")
    try:
        parsed = json.loads(raw_content)
    except json.JSONDecodeError as exc:
        content = raw_content
        return render_template(
            "admin.html",
            logged_in=True,
            files=EDITABLE_FILES.keys(),
            selected=name,
            content=content,
            error=f"JSON error on line {exc.lineno}: {exc.msg}",
        )

    save_json(EDITABLE_FILES[name], parsed)
    return redirect(url_for("admin.dashboard", file=name, saved="1"))


@admin_bp.route("/logout")
def logout():
    """Log out of the admin editor."""
    session.pop("muse_admin", None)
    return redirect(url_for("admin.dashboard"))
