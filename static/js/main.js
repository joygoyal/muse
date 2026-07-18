const appState = {
  audioContext: null,
  particleFrame: null,
  audioElement: null,
  previewNodes: [],
  previewTimer: null,
};

document.addEventListener("DOMContentLoaded", () => {
  hideLoader();
  setupThemeToggle();
  setupCursor();
  setupParticles();
  setupPageAnimations();
  setupTransitions();
  setupIntroSound();
  setupModal();
  setupStoryMusic();
  setupPuzzleGame();
  setupTyping();
  setupEnding();
});

/** Hide the loading overlay after the first browser paint. */
function hideLoader() {
  const loader = document.querySelector("[data-loader]");
  window.addEventListener("load", () => {
    window.setTimeout(() => loader?.classList.add("is-hidden"), 280);
  });
}

/** Persist and toggle the light/dark theme. */
function setupThemeToggle() {
  const root = document.documentElement;
  const button = document.querySelector("[data-theme-toggle]");
  const savedTheme = localStorage.getItem("muse-theme");
  if (savedTheme) root.dataset.theme = savedTheme;

  button?.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = nextTheme;
    localStorage.setItem("muse-theme", nextTheme);
    button.innerHTML = nextTheme === "dark"
      ? '<i class="fa-solid fa-moon"></i>'
      : '<i class="fa-solid fa-sun"></i>';
  });
}

/** Move the custom cursor and enlarge it over interactive controls. */
function setupCursor() {
  const dot = document.querySelector("[data-cursor-dot]");
  const ring = document.querySelector("[data-cursor-ring]");
  if (!dot || !ring || window.matchMedia("(pointer: coarse)").matches) return;

  window.addEventListener("pointermove", (event) => {
    dot.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
    ring.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
  });

  document.querySelectorAll("a, button, input, textarea").forEach((item) => {
    item.addEventListener("pointerenter", () => ring.classList.add("is-hovering"));
    item.addEventListener("pointerleave", () => ring.classList.remove("is-hovering"));
  });
}

/** Draw soft moving background particles on a canvas. */
function setupParticles() {
  const canvas = document.querySelector("[data-particles]");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  const particles = Array.from({ length: 72 }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: Math.random() * 2.4 + 0.6,
    speed: Math.random() * 0.22 + 0.08,
    hue: Math.random() > 0.5 ? "246, 196, 83" : "255, 79, 163",
  }));

  const resize = () => {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  };

  const draw = () => {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach((particle) => {
      particle.y -= particle.speed / window.innerHeight;
      particle.x += Math.sin(Date.now() * 0.0004 + particle.size) * 0.00012;
      if (particle.y < -0.05) particle.y = 1.05;

      context.beginPath();
      context.arc(particle.x * window.innerWidth, particle.y * window.innerHeight, particle.size, 0, Math.PI * 2);
      context.fillStyle = `rgba(${particle.hue}, 0.42)`;
      context.fill();
    });
    appState.particleFrame = window.requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener("resize", resize);
}

/** Animate page elements when they enter the viewport. */
function setupPageAnimations() {
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);

  gsap.from(".site-header", { y: -24, opacity: 0, duration: 0.7, ease: "power3.out" });
  gsap.utils.toArray(".reveal-up").forEach((element) => {
    gsap.from(element, {
      y: 36,
      opacity: 0,
      duration: 0.85,
      ease: "power3.out",
      scrollTrigger: { trigger: element, start: "top 88%" },
    });
  });
}

/** Fade out before following internal navigation links. */
function setupTransitions() {
  document.querySelectorAll("[data-transition-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey) return;
      event.preventDefault();
      document.body.classList.add("is-transitioning");
      window.setTimeout(() => {
        window.location.href = link.href;
      }, 260);
    });
  });
}

/** Play a short Web Audio intro tone without needing a bundled MP3. */
function setupIntroSound() {
  document.querySelectorAll("[data-play-intro]").forEach((button) => {
    button.addEventListener("click", () => {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      appState.audioContext = appState.audioContext || new AudioContext();
      const now = appState.audioContext.currentTime;
      const oscillator = appState.audioContext.createOscillator();
      const gain = appState.audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(392, now);
      oscillator.frequency.exponentialRampToValueAtTime(659, now + 0.7);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      oscillator.connect(gain).connect(appState.audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.95);
    });
  });
}

/** Open and close the reusable modal for memories and Spotify embeds. */
function setupModal() {
  const modal = document.querySelector("[data-modal]");
  const content = document.querySelector("[data-modal-content]");
  if (!modal || !content) return;

  const openModal = (html) => {
    content.innerHTML = html;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    if (window.gsap) gsap.from(".modal-panel", { y: 24, scale: 0.98, opacity: 0, duration: 0.25 });
  };

  const closeModal = () => {
    stopMusePreview();
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    content.innerHTML = "";
  };

  document.querySelectorAll("[data-modal-close]").forEach((item) => item.addEventListener("click", closeModal));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });

  document.querySelectorAll("[data-spotify]").forEach((button) => {
    button.addEventListener("click", () => {
      const title = button.dataset.title || "Spotify preview";
      const source = button.dataset.spotify;
      const spotifyUrl = spotifyOpenUrl(source);
      const lyrics = parseLyrics(button.dataset.lyrics);
      const loopStart = Number(button.dataset.loopStart || 0);
      const loopEnd = Number(button.dataset.loopEnd || 30);
      openModal(`
        <div class="modal-copy">
          <h2>${escapeHtml(title)}</h2>
          <div class="local-preview" aria-label="Song clip player">
            <span class="preview-status" data-player-status><i class="fa-solid fa-volume-high"></i> Loading local clip...</span>
            <span class="mini-visualizer" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
          </div>
          <div class="lyric-window" data-lyric-window>
            <p class="eyebrow">Lyrics</p>
            <p data-current-lyric>${escapeHtml(lyrics[0]?.text || "Add lyric lines in songs.json.")}</p>
          </div>
          <div class="audio-controls">
            <button class="secondary-button" type="button" data-replay-clip>
              <i class="fa-solid fa-rotate-right"></i>
              <span>Replay Loop</span>
            </button>
            <button class="secondary-button" type="button" data-stop-preview>
              <i class="fa-solid fa-stop"></i>
              <span>Stop</span>
            </button>
          </div>
          <iframe class="spotify-frame" title="${escapeHtml(title)} Spotify player" src="${source}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
          <a class="secondary-button spotify-fallback" href="${spotifyUrl}" target="_blank" rel="noopener">
            <i class="fa-brands fa-spotify"></i>
            <span>Open in Spotify</span>
          </a>
        </div>
      `);
      content.querySelector("[data-stop-preview]")?.addEventListener("click", stopMusePreview);
      content.querySelector("[data-replay-clip]")?.addEventListener("click", () => {
        startSongClip({
          audioUrl: button.dataset.audio,
          audioFile: button.dataset.audioFile,
          title,
          loopStart,
          loopEnd,
          lyrics,
          content,
        });
      });
      startSongClip({
        audioUrl: button.dataset.audio,
        audioFile: button.dataset.audioFile,
        title,
        loopStart,
        loopEnd,
        lyrics,
        content,
      });
    });
  });

  document.querySelectorAll("[data-song-reason]").forEach((button) => {
    button.addEventListener("click", () => {
      openModal(`
        <div class="modal-copy">
          <p class="eyebrow">Why this song?</p>
          <h2>${escapeHtml(button.dataset.title || "Why this song?")}</h2>
          <p>${escapeHtml(button.dataset.songReason || "")}</p>
        </div>
      `);
    });
  });

  document.querySelectorAll("[data-memory-title]").forEach((button) => {
    button.addEventListener("click", () => {
      openModal(`
        <div class="modal-copy">
          <img src="${button.dataset.memoryImage}" alt="">
          <h2>${escapeHtml(button.dataset.memoryTitle || "Memory")}</h2>
          <p>${escapeHtml(button.dataset.memoryBody || "")}</p>
        </div>
      `);
    });
  });
}

/** Attach local looping music controls to story chapter pages. */
function setupStoryMusic() {
  document.querySelectorAll("[data-story-music]").forEach((button) => {
    const content = button.closest("[data-story-player]");
    if (!content) return;

    const play = () => {
      const lyrics = parseLyrics(button.dataset.lyrics);
      startSongClip({
        audioUrl: button.dataset.audio,
        audioFile: button.dataset.audioFile,
        title: button.dataset.title || "Chapter music",
        loopStart: Number(button.dataset.loopStart || 0),
        loopEnd: Number(button.dataset.loopEnd || 30),
        lyrics,
        content,
        exactOnly: button.dataset.exactOnly === "true",
        triggerButton: button,
      });
      button.innerHTML = '<i class="fa-solid fa-rotate-right"></i><span>Restart Music</span>';
    };

    button.addEventListener("click", play);
    content.querySelector("[data-stop-preview]")?.addEventListener("click", stopMusePreview);
    if (button.dataset.storyAutoplay === "true") {
      window.setTimeout(play, 650);
    }
  });
}

/** Validate puzzle answers and unlock each following card. */
function setupPuzzleGame() {
  const cards = [...document.querySelectorAll("[data-puzzle-card]")];
  const unlockPanel = document.querySelector("[data-unlock-panel]");
  if (!cards.length) return;

  cards.forEach((card, index) => {
    const form = card.querySelector("[data-puzzle-form]");
    const input = card.querySelector("input");
    const feedback = card.querySelector("[data-feedback]");

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const response = await fetch("/api/puzzle/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: card.dataset.puzzleId, answer: input.value }),
      });
      const result = await response.json();

      feedback.textContent = result.message;
      if (result.correct) {
        card.classList.add("is-solved");
        input.disabled = true;
        form.querySelector("button").disabled = true;
        const nextCard = cards[index + 1];
        if (nextCard) {
          nextCard.classList.remove("is-locked");
          nextCard.querySelector("input").disabled = false;
          nextCard.querySelector("input").focus();
        } else if (unlockPanel) {
          unlockPanel.hidden = false;
          unlockPanel.scrollIntoView({ behavior: "smooth", block: "center" });
          burstConfetti(28);
        }
      } else {
        card.classList.remove("shake");
        void card.offsetWidth;
        card.classList.add("shake");
      }
    });
  });
}

/** Type text into any element with the data-typing attribute. */
function setupTyping() {
  const element = document.querySelector("[data-typing]");
  if (!element) return;
  const text = element.dataset.typing || "";
  let index = 0;

  const tick = () => {
    element.textContent = text.slice(0, index);
    index += 1;
    if (index <= text.length) window.setTimeout(tick, 42);
  };

  tick();
}

/** Handle the final song, player embed, confetti, and fireflies. */
function setupEnding() {
  const button = document.querySelector("[data-final-song]");
  const player = document.querySelector("[data-final-player]");
  if (!button || !player) return;

  button.addEventListener("click", () => {
    player.innerHTML = `<iframe title="One Last Song" src="${button.dataset.finalSong}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
    burstConfetti(60);
    releaseFireflies(28);
    playMusePreview(button.dataset.finalTitle || "her by JVKE", 24);
  });
}

/** Create or resume the shared Web Audio context. */
function ensureAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  appState.audioContext = appState.audioContext || new AudioContext();
  if (appState.audioContext.state === "suspended") appState.audioContext.resume();
  return appState.audioContext;
}

/** Play a short original synth preview so audio works without Spotify. */
function playMusePreview(seedText = "Muse", duration = 12) {
  const context = ensureAudioContext();
  if (!context) return;

  stopMusePreview();
  const notes = [261.63, 293.66, 329.63, 392.0, 440.0, 493.88, 523.25];
  const seed = [...seedText].reduce((total, char) => total + char.charCodeAt(0), 0);
  const master = context.createGain();
  const filter = context.createBiquadFilter();
  const start = context.currentTime + 0.02;

  filter.type = "lowpass";
  filter.frequency.value = 1250;
  master.gain.setValueAtTime(0.0001, start);
  master.gain.exponentialRampToValueAtTime(0.12, start + 0.35);
  master.gain.setValueAtTime(0.12, start + Math.max(duration - 1.2, 1));
  master.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  master.connect(filter).connect(context.destination);
  appState.previewNodes.push(master, filter);

  for (let index = 0; index < duration * 2; index += 1) {
    const note = notes[(seed + index * 2) % notes.length];
    scheduleTone(context, master, note, start + index * 0.5, 0.42, "sine", 0.16);
    if (index % 4 === 0) scheduleTone(context, master, note / 2, start + index * 0.5, 1.4, "triangle", 0.09);
  }

  appState.previewTimer = window.setTimeout(stopMusePreview, duration * 1000 + 250);
}

/** Play a local MP3 segment and loop it between configured timestamps. */
function startSongClip({ audioUrl, audioFile, title, loopStart, loopEnd, lyrics, content, exactOnly = false, triggerButton = null }) {
  stopMusePreview();
  ensureAudioContext();

  const status = content.querySelector("[data-player-status]");
  const lyricTarget = content.querySelector("[data-current-lyric]");
  const duration = Math.max(8, loopEnd - loopStart);

  if (lyrics[0] && lyricTarget) lyricTarget.textContent = lyrics[0].text;
  if (status && exactOnly) {
    status.innerHTML = `<i class="fa-solid fa-volume-high"></i> Loading exact song: ${escapeHtml(title)}`;
  } else if (status) {
    status.innerHTML = `<i class="fa-solid fa-volume-high"></i> Playing local fallback while checking MP3`;
  }
  if (!exactOnly) playFallbackAudio(title, duration);

  const startLocalAudio = () => {
    stopMusePreview();
    const audio = new Audio(audioUrl);
    appState.audioElement = audio;

    audio.preload = "auto";
    audio.volume = 0.82;

    const updateLyric = () => {
    const position = Math.max(0, audio.currentTime - loopStart);
    const current = lyrics
      .filter((line) => Number(line.time) <= position)
      .at(-1);
    if (current && lyricTarget) lyricTarget.textContent = current.text;
    };

    audio.addEventListener("loadedmetadata", () => {
      audio.currentTime = Math.min(loopStart, Math.max(audio.duration - 1, 0));
    }, { once: true });

    audio.addEventListener("timeupdate", () => {
      if (audio.currentTime >= loopEnd) audio.currentTime = loopStart;
      updateLyric();
    });

    audio.addEventListener("playing", () => {
      if (status) status.innerHTML = `<i class="fa-solid fa-volume-high"></i> Playing ${escapeHtml(title)} loop`;
    });

    audio.addEventListener("error", () => {
      if (status) {
        status.innerHTML = exactOnly
          ? `<i class="fa-solid fa-circle-info"></i> Exact song missing. Add ${escapeHtml(audioFile)} to static/music.`
          : `<i class="fa-solid fa-circle-info"></i> Add ${escapeHtml(audioFile)} to static/music. Local fallback is playing.`;
      }
      if (!exactOnly) playFallbackAudio(title, duration);
    }, { once: true });

    audio.play().catch(() => {
      if (status) {
        status.innerHTML = exactOnly
          ? `<i class="fa-solid fa-circle-info"></i> Autoplay was blocked. Tap the button to play the exact song.`
          : `<i class="fa-solid fa-circle-info"></i> Browser blocked the MP3. Local fallback is playing.`;
      }
      if (triggerButton) {
        triggerButton.innerHTML = '<i class="fa-solid fa-play"></i><span>Tap to Play Exact Song</span>';
      }
      if (!exactOnly) playFallbackAudio(title, duration);
    });
  };

  fetch(audioUrl, { method: "HEAD", cache: "no-store" })
    .then((response) => {
      if (response.ok) {
        startLocalAudio();
        return;
      }
      if (status) {
        status.innerHTML = exactOnly
          ? `<i class="fa-solid fa-circle-info"></i> Exact song missing. Add ${escapeHtml(audioFile)} to static/music.`
          : `<i class="fa-solid fa-circle-info"></i> Add ${escapeHtml(audioFile)} to static/music. Local fallback is playing.`;
      }
    })
    .catch(() => {
      if (status) {
        status.innerHTML = exactOnly
          ? `<i class="fa-solid fa-circle-info"></i> Could not check exact song file. Tap the button to try again.`
          : `<i class="fa-solid fa-circle-info"></i> Local fallback is playing. Add ${escapeHtml(audioFile)} for the real song.`;
      }
    });
}

/** Play the bundled fallback WAV with HTML audio, then Web Audio if needed. */
function playFallbackAudio(seedText = "Muse", duration = 12) {
  const audio = new Audio("/static/music/muse-preview.wav?v=1");
  appState.audioElement = audio;
  audio.loop = true;
  audio.volume = 0.88;

  audio.play().catch(() => {
    playMusePreview(seedText, duration);
  });
}

/** Schedule one soft oscillator note. */
function scheduleTone(context, destination, frequency, start, length, type, volume) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  oscillator.connect(gain).connect(destination);
  oscillator.start(start);
  oscillator.stop(start + length + 0.05);
  appState.previewNodes.push(oscillator, gain);
}

/** Stop the local Web Audio preview and clean up nodes. */
function stopMusePreview() {
  if (appState.previewTimer) {
    window.clearTimeout(appState.previewTimer);
    appState.previewTimer = null;
  }

  if (appState.audioElement) {
    appState.audioElement.pause();
    appState.audioElement.src = "";
    appState.audioElement.load();
    appState.audioElement = null;
  }

  appState.previewNodes.forEach((node) => {
    try {
      if (typeof node.stop === "function") node.stop();
      if (typeof node.disconnect === "function") node.disconnect();
    } catch (error) {
      if (typeof node.disconnect === "function") {
        try {
          node.disconnect();
        } catch (disconnectError) {
          void disconnectError;
        }
      }
    }
  });
  appState.previewNodes = [];
}

/** Create colorful falling confetti pieces. */
function burstConfetti(count) {
  const colors = ["#ff4fa3", "#f6c453", "#8e5cff", "#8de3ff", "#fff8f2"];
  for (let index = 0; index < count; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.top = "-20px";
    piece.style.background = colors[index % colors.length];
    piece.style.setProperty("--x", `${Math.random() * 240 - 120}px`);
    piece.style.animationDelay = `${Math.random() * 0.35}s`;
    document.body.appendChild(piece);
    window.setTimeout(() => piece.remove(), 2800);
  }
}

/** Create glowing fireflies that rise from the bottom of the screen. */
function releaseFireflies(count) {
  for (let index = 0; index < count; index += 1) {
    const firefly = document.createElement("span");
    firefly.className = "firefly";
    firefly.style.left = `${Math.random() * 100}vw`;
    firefly.style.bottom = "-10px";
    firefly.style.setProperty("--x", `${Math.random() * 180 - 90}px`);
    firefly.style.animationDelay = `${Math.random() * 0.7}s`;
    document.body.appendChild(firefly);
    window.setTimeout(() => firefly.remove(), 3600);
  }
}

/** Escape text before inserting it into modal HTML. */
function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

/** Convert a Spotify embed URL into a regular Spotify URL. */
function spotifyOpenUrl(value) {
  return String(value || "").replace("open.spotify.com/embed/", "open.spotify.com/").split("?")[0];
}

/** Safely parse lyric/caption lines from data attributes. */
function parseLyrics(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}
