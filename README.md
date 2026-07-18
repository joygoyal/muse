# Muse

Muse is a romantic interactive Flask web app that tells a story through music,
animations, hidden memories, small puzzle games, and a final reveal.

It is built as a beginner-friendly Flask project, but the interface is designed
to feel like a premium music experience: dark glass panels, animated gradients,
particles, neon buttons, Spotify-style cards, Lottie animations, page
transitions, puzzle unlocks, modals, confetti, fireflies, and a protected admin
editor.

## Features

- Flask app factory in `app.py`
- Flask Blueprints for public pages and admin pages
- Jinja2 templates with a shared `base.html`
- JSON storage instead of a database
- Hidden `/admin` route for editing content
- Story chapters loaded from JSON
- Spotify-style playlist cards
- Embedded Spotify preview modal
- "Why this song?" animated modal
- Puzzle page with answer validation through a Flask API route
- Hidden memory modal mode
- Vertical special moments timeline
- Locked secret message page
- Emotional ending page with typing text, vinyl animation, confetti, and fireflies
- Dark/light mode toggle
- Loading screen
- Animated cursor
- Particle background
- Responsive mobile layout

## Folder Structure

```text
Muse/
  app.py
  config.py
  requirements.txt
  README.md
  blueprints/
    __init__.py
    admin.py
    main.py
    utils.py
  data/
    memories.json
    puzzles.json
    settings.json
    songs.json
    story.json
    timeline.json
  static/
    animations/
    css/
    images/
    js/
    music/
  templates/
    404.html
    admin.html
    base.html
    ending.html
    index.html
    intro.html
    playlist.html
    puzzle.html
    reveal.html
    story.html
```

## How To Install

Create and activate a virtual environment:

```bash
python -m venv .venv
```

On Windows PowerShell:

```bash
.venv\Scripts\Activate.ps1
```

On macOS or Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

## How To Run

```bash
python app.py
```

Open:

```text
http://127.0.0.1:5000
```

The admin route is:

```text
http://127.0.0.1:5000/admin
```

Default admin password:

```text
muse-admin
```

For deployment, set `ADMIN_PASSWORD` as an environment variable instead of
using the default.

## How Flask Works In This Project

`app.py` creates the Flask application with an app factory called `create_app`.
An app factory is a function that builds and configures the Flask app. This is a
best practice because it keeps setup code clean and makes testing easier.

`config.py` stores configuration values such as `SECRET_KEY`,
`ADMIN_PASSWORD`, and the path to the `data` folder.

`blueprints/main.py` contains public routes such as `/`, `/intro`, `/story`,
`/playlist`, `/puzzle`, `/reveal`, `/secret`, and `/ending`.

`blueprints/admin.py` contains the hidden `/admin` route and the save route for
editing JSON files.

`blueprints/utils.py` contains helper functions for loading and saving JSON.
Both the public pages and admin pages use these helpers.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/intro` | Earphones prompt |
| `/story` | First story chapter |
| `/story/<number>` | Specific story chapter |
| `/playlist` | Spotify-style playlist cards |
| `/puzzle` | Mini puzzle unlock game |
| `/api/puzzle/check` | JSON API used by the puzzle page |
| `/reveal` | Hidden memories and special moments timeline |
| `/moments` | Alternate route for the timeline page |
| `/secret` | Locked secret message |
| `/ending` | Final emotional page |
| `/admin` | Password-protected JSON editor |
| `/healthz` | Health check route |

## How Jinja Templates Work

Jinja lets Flask place Python data into HTML.

For example, the playlist route loads `data/songs.json` and sends it to
`playlist.html`:

```python
return render_template("playlist.html", songs=load_json("songs.json"))
```

Inside `playlist.html`, Jinja loops over the songs:

```jinja2
{% for song in songs %}
  <h2>{{ song.title }}</h2>
{% endfor %}
```

`base.html` is the shared layout. Every page extends it:

```jinja2
{% extends "base.html" %}
```

This avoids repeating the header, modal, scripts, CSS links, particle canvas,
and cursor markup on every page.

## Static Files

The `static` folder contains files the browser downloads directly:

- `static/css/style.css` has the full visual design
- `static/js/main.js` has interactions and animations
- `static/images` stores album art and memory images
- `static/animations` stores Lottie JSON files
- `static/music` is ready for your own MP3 files

Use `url_for` to link static files in templates:

```jinja2
{{ url_for('static', filename='css/style.css') }}
```

This is safer than hardcoding `/static/css/style.css`.

## How To Customize Songs

Open `/admin`, choose `songs`, and edit the JSON.

Each song looks like this:

```json
{
  "id": "golden-hour",
  "title": "Golden Hour",
  "artist": "JVKE",
  "mood": "Warm / glowing",
  "why": "It sounds like sunlight finding the room.",
  "album_image": "album-golden.svg",
  "spotify_embed": "https://open.spotify.com/embed/track/5odlY52u43F5BjByhxg7wg?utm_source=generator",
  "audio_file": "golden-hour.mp3",
  "loop_start": 25,
  "loop_end": 55,
  "lyrics": [
    { "time": 0, "text": "Soft light, warm silence." },
    { "time": 6, "text": "Every word feels golden." }
  ],
  "color": "#f6c453"
}
```

To add a song:

1. Add another object to `data/songs.json`.
2. Put the album image in `static/images`.
3. Set `album_image` to the image filename.
4. Put your MP3 file in `static/music`.
5. Set `audio_file` to the MP3 filename.
6. Set `loop_start` and `loop_end` to the seconds you want repeated.
7. Add your lyric or caption lines in `lyrics`.
8. Add a Spotify embed URL as a backup player.
9. Save and refresh `/playlist`.

The local player loops the clip between `loop_start` and `loop_end`. The lyric
line timestamps are relative to the start of that loop, so `"time": 6` appears
six seconds after `loop_start`.

## How To Customize Story Chapters

Open `/admin`, choose `story`, and edit `story.json`.

Each chapter has:

- `chapter`
- `song`
- `artist`
- `message`
- `explanation`
- `background`
- `accent`

The `/story/<number>` route reads this JSON and automatically decides the next
chapter link.

## How To Customize Puzzles

Open `/admin`, choose `puzzles`, and edit `puzzles.json`.

Each puzzle has:

- `id`
- `question`
- `placeholder`
- `answers`
- `hint`
- `success`

The answer check is not hardcoded in JavaScript. The browser sends the answer to
`/api/puzzle/check`, and Flask checks it against the JSON file.

## How To Customize Memories And Timeline

Use these admin tabs:

- `memories` controls the hidden memory buttons and modals
- `timeline` controls the vertical special moments timeline

Add images to `static/images`, then reference the filename from JSON.

## How To Change The Secret Code

Open `/admin`, choose `settings`, and edit:

```json
"secret_codes": ["2503", "birthday", "her birthday"]
```

You can add as many accepted codes as you want.

## How To Change Colors

Most colors are CSS variables at the top of `static/css/style.css`:

```css
:root {
  --black: #05050a;
  --navy: #081526;
  --purple: #8e5cff;
  --pink: #ff4fa3;
  --gold: #f6c453;
}
```

Change these variables to update the design globally.

## How To Change Animations

Most interactions live in `static/js/main.js`.

Useful functions:

- `setupParticles()` controls the animated particle canvas
- `setupPageAnimations()` controls GSAP entrance animations
- `setupPuzzleGame()` controls puzzle unlocking
- `setupTyping()` controls the ending text typing effect
- `burstConfetti()` creates the confetti
- `releaseFireflies()` creates the final fireflies

Lottie files live in `static/animations`.

## Deployment: Render

1. Push the project to GitHub.
2. Create a new Render Web Service.
3. Choose the repository.
4. Set build command:

```bash
pip install -r requirements.txt
```

5. Set start command:

```bash
gunicorn app:app
```

6. Add environment variables:

```text
SECRET_KEY=your-long-random-secret
ADMIN_PASSWORD=your-admin-password
```

7. Add `gunicorn` to `requirements.txt` before deploying:

```text
gunicorn
```

## Deployment: Railway

1. Push the project to GitHub.
2. Create a Railway project from the repository.
3. Add environment variables:

```text
SECRET_KEY=your-long-random-secret
ADMIN_PASSWORD=your-admin-password
```

4. Use this start command:

```bash
gunicorn app:app
```

5. Add `gunicorn` to `requirements.txt`.

## Deployment: PythonAnywhere

1. Upload the project files.
2. Create a virtual environment.
3. Install requirements.
4. Create a new Flask web app.
5. In the WSGI file, import the app:

```python
import sys
path = "/home/yourusername/Muse"
if path not in sys.path:
    sys.path.append(path)

from app import app as application
```

6. Set environment variables from the PythonAnywhere web dashboard if available.
7. Reload the web app.

## Common Beginner Mistakes

- Forgetting to activate the virtual environment before installing Flask.
- Running `flask run` from the wrong folder.
- Breaking JSON syntax by leaving a trailing comma.
- Forgetting quotes around JSON strings.
- Putting images outside `static/images`.
- Hardcoding `/static/...` instead of using `url_for`.
- Editing CSS but not refreshing the browser cache.
- Deploying with the default `SECRET_KEY`.
- Deploying with the default admin password.

## Flask Best Practices Used Here

- Use an app factory.
- Split routes with Blueprints.
- Keep templates in `templates`.
- Keep browser assets in `static`.
- Keep configuration in `config.py`.
- Keep data loading helpers separate from route functions.
- Use `url_for` for internal links and static files.
- Keep content in JSON so non-developers can edit it.
- Validate JSON before saving admin edits.
- Keep frontend JavaScript in a separate file.
- Keep CSS in a separate file.

## Notes About Music

The app uses Spotify embeds and Web Audio tones for the interactive sound
effects. This avoids bundling copyrighted music files. If you own or have the
right to use audio files, place them in `static/music` and connect them from the
JSON or JavaScript.
