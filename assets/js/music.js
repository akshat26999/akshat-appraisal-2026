/* Music — autoplays unmuted ~500ms after each page load (if not muted by user).
   The ♪ button is a global mute toggle whose state persists across pages.
   Per-track playback position is saved so each tab resumes where it left off.
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
  const DELAY_MS  = 200;

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

  // After 500ms, try to autoplay unmuted (or muted if user has muted).
  // If the browser blocks unmuted autoplay, fall back: play muted now,
  // then unmute on the next user gesture.
  function start() {
    audio.muted = userWantsMuted;
    const p = audio.play();
    if (!p || typeof p.catch !== 'function') return;
    p.catch(() => {
      // Blocked. Start muted (always allowed) and unmute on first gesture.
      audio.muted = true;
      audio.play().catch(() => {});
      if (!userWantsMuted) wireGestureUnmute();
    });
  }
  function wireGestureUnmute() {
    const wake = () => {
      audio.muted = userWantsMuted;
      if (audio.paused) audio.play().catch(() => {});
      document.removeEventListener('pointerdown', wake, true);
      document.removeEventListener('keydown',     wake, true);
      document.removeEventListener('touchstart',  wake, true);
    };
    document.addEventListener('pointerdown', wake, true);
    document.addEventListener('keydown',     wake, true);
    document.addEventListener('touchstart',  wake, true);
  }

  function kick() { setTimeout(start, DELAY_MS); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', kick);
  } else {
    kick();
  }

  // Button = mute toggle. Always counts as a user gesture, so play() will work.
  btn.addEventListener('click', () => {
    userWantsMuted = !userWantsMuted;
    audio.muted = userWantsMuted;
    localStorage.setItem(MUTED_KEY, userWantsMuted ? '1' : '0');
    paint();
    if (audio.paused) audio.play().catch(() => {});
  });

  // Persist position every ~1s
  let lastSaved = 0;
  audio.addEventListener('timeupdate', () => {
    const t = audio.currentTime;
    if (t > 0.1 && Math.abs(t - lastSaved) > 1) {
      localStorage.setItem(TIME_KEY, t.toString());
      lastSaved = t;
    }
  });

  // Final save on unload (covers tab/page navigation)
  window.addEventListener('pagehide', () => {
    if (audio.currentTime > 0.1) {
      localStorage.setItem(TIME_KEY, audio.currentTime.toString());
    }
  });
})();
