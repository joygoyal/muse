"""Public-facing routes for the Muse experience."""

from flask import Blueprint, jsonify, redirect, render_template, request, url_for

from .utils import load_json, load_site_data


main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def index():
    """Landing page for the journey."""
    return render_template("index.html")


@main_bp.route("/intro")
def intro():
    """Earphones prompt before the story begins."""
    return render_template("intro.html")


@main_bp.route("/story")
@main_bp.route("/story/<int:chapter_number>")
def story(chapter_number=1):
    """Render one story chapter at a time from JSON."""
    chapters = load_json("story.json")
    songs = load_json("songs.json")
    chapter_count = len(chapters)

    if chapter_number < 1:
        return redirect(url_for("main.story", chapter_number=1))
    if chapter_number > chapter_count:
        return redirect(url_for("main.playlist"))

    chapter = chapters[chapter_number - 1]
    next_url = (
        url_for("main.story", chapter_number=chapter_number + 1)
        if chapter_number < chapter_count
        else url_for("main.playlist")
    )
    chapter_song = next(
        (
            song
            for song in songs
            if song["title"].lower() == chapter["song"].lower()
            and song["artist"].lower() == chapter["artist"].lower()
        ),
        None,
    )

    return render_template(
        "story.html",
        chapter=chapter,
        song=chapter_song,
        chapter_number=chapter_number,
        chapter_count=chapter_count,
        next_url=next_url,
    )


@main_bp.route("/playlist")
def playlist():
    """Show Spotify-inspired song cards."""
    return render_template("playlist.html", songs=load_json("songs.json"))


@main_bp.route("/puzzle")
def puzzle():
    """Render mini games that unlock the reveal page."""
    return render_template("puzzle.html", puzzles=load_json("puzzles.json"))


@main_bp.route("/api/puzzle/check", methods=["POST"])
def check_puzzle():
    """Validate a puzzle answer without a page refresh."""
    puzzles = load_json("puzzles.json")
    payload = request.get_json(silent=True) or {}
    puzzle_id = payload.get("id")
    answer = str(payload.get("answer", "")).strip().lower()

    puzzle = next((item for item in puzzles if item["id"] == puzzle_id), None)
    if not puzzle:
        return jsonify({"correct": False, "message": "That puzzle disappeared."}), 404

    valid_answers = [str(item).strip().lower() for item in puzzle["answers"]]
    is_correct = answer in valid_answers
    return jsonify(
        {
            "correct": is_correct,
            "message": puzzle["success"] if is_correct else puzzle["hint"],
        }
    )


@main_bp.route("/reveal")
def reveal():
    """Hidden memories and special moments."""
    data = load_site_data()
    return render_template(
        "reveal.html",
        timeline=data["timeline"],
        memories=data["memories"],
        songs=data["songs"],
    )


@main_bp.route("/moments")
def moments():
    """A dedicated timeline route for special moments."""
    return render_template("reveal.html", timeline=load_json("timeline.json"), memories=load_json("memories.json"), songs=load_json("songs.json"))


@main_bp.route("/secret", methods=["GET", "POST"])
def secret():
    """Locked handwritten-note page."""
    settings = load_json("settings.json")
    unlocked = False
    error = None

    if request.method == "POST":
        guess = request.form.get("secret_code", "").strip().lower()
        accepted_codes = [code.lower() for code in settings["secret_codes"]]
        unlocked = guess in accepted_codes
        if not unlocked:
            error = "That was close, but the lock is still glowing."

    return render_template("reveal.html", locked=True, unlocked=unlocked, error=error)


@main_bp.route("/ending")
def ending():
    """The emotional closing page."""
    return render_template("ending.html")


@main_bp.route("/healthz")
def healthz():
    """Tiny health check used during smoke testing."""
    return jsonify({"status": "ok"})
