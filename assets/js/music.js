/* Music — autoplays on every page; the ♪ button is a global mute toggle.
   Browsers block unmuted autoplay, so we start MUTED (always allowed) and
   unmute on the first user gesture anywhere on the page. Per-track playback
   position is saved to localStorage so each tab resumes from where it left off.
   Tracks live in assets/audio/ (cover.wav, la-liga.wav, copa.wav,
   champions-league.wav, trophy-room.wav) — replace any file in-place. */
(function () {
  const btn   = document.getElementById('music-toggle');
  const audio = document.getElementById('anthem');
  if (!btn || !audio) return;

  const TIME_KEY  = 'music-time:' + (audio.getAttribute('src') || 'default');
  const MUTED_KEY = 'music-muted';
  const ICON_ON   = '♪';
  const ICON_OFF  = '🔇';

  // User's persistent intent (default: unmuted). Separate from audio.muted,
  // which we manipulate behind the scenes to bypass autoplay policy.
  let userWantsMuted = localStorage.getItem(MUTED_KEY) === '1';

  function paint() {
    btn.textContent = userWantsMuted ? ICON_OFF : ICON_ON;
    btn.setAttribute('aria-pressed', userWantsMuted ? 'false' : 'true');
    btn.title = userWantsMuted ? 'Unmute music' : 'Mute music';
  }
  paint();

  // Restore last position for THIS track
  const saved = parseFloat(localStorage.getItem(TIME_KEY));
  if (!isNaN(saved) && saved > 0) {
    const seek = () => {
      try { audio.currentTime = saved; } catch (e) {}
      audio.removeEventListener('loadedmetadata', seek);
    };
    if (audio.readyState >= 1) seek();
    else audio.addEventListener('loadedmetadata', seek);
  }

  // Start MUTED so autoplay is always allowed by the browser
  audio.muted = true;
  function tryPlay() { audio.play().catch(() => {}); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryPlay);
  } else {
    tryPlay();
  }

  // On the first user gesture, sync actual mute state to user's intent.
  // Even if intent is "muted", we still wire this in case play() never
  // started — pressing the button then triggers it.
  let gestureSeen = false;
  function onFirstGesture() {
    if (gestureSeen) return;
    gestureSeen = true;
    audio.muted = userWantsMuted;
    if (audio.paused) audio.play().catch(() => {});
    document.removeEventListener('pointerdown', onFirstGesture, true);
    document.removeEventListener('keydown',     onFirstGesture, true);
    document.removeEventListener('touchstart',  onFirstGesture, true);
  }
  document.addEventListener('pointerdown', onFirstGesture, true);
  document.addEventListener('keydown',     onFirstGesture, true);
  document.addEventListener('touchstart',  onFirstGesture, true);

  // Button = global mute toggle
  btn.addEventListener('click', () => {
    userWantsMuted = !userWantsMuted;
    audio.muted = userWantsMuted;
    localStorage.setItem(MUTED_KEY, userWantsMuted ? '1' : '0');
    paint();
    if (audio.paused) audio.play().catch(() => {});
  });

  // Persist position every second
  let lastSaved = 0;
  audio.addEventListener('timeupdate', () => {
    const t = audio.currentTime;
    if (t > 0.1 && Math.abs(t - lastSaved) > 1) {
      localStorage.setItem(TIME_KEY, t.toString());
      lastSaved = t;
    }
  });

  // Final save on unload (covers tab navigation)
  window.addEventListener('pagehide', () => {
    if (audio.currentTime > 0.1) {
      localStorage.setItem(TIME_KEY, audio.currentTime.toString());
    }
  });
})();
