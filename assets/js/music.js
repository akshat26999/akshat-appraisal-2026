/* Music — autoplays unmuted on every page; the ♪ button is a global mute toggle.
   Per-track playback position is saved to localStorage so each tab resumes from
   where it last left off. Tracks live in assets/audio/ (cover.wav, la-liga.wav,
   copa.wav, champions-league.wav, trophy-room.wav) — replace any file in-place. */
(function () {
  const btn   = document.getElementById('music-toggle');
  const audio = document.getElementById('anthem');
  if (!btn || !audio) return;

  const TIME_KEY  = 'music-time:' + (audio.getAttribute('src') || 'default');
  const MUTED_KEY = 'music-muted';
  const ICON_ON   = '♪';      // ♪
  const ICON_OFF  = '🔇'; // 🔇

  // Restore global mute state (default: unmuted)
  audio.muted = localStorage.getItem(MUTED_KEY) === '1';

  // Restore last playback position for THIS track
  const saved = parseFloat(localStorage.getItem(TIME_KEY));
  if (!isNaN(saved) && saved > 0) {
    const seek = () => {
      try { audio.currentTime = saved; } catch (e) {}
      audio.removeEventListener('loadedmetadata', seek);
    };
    if (audio.readyState >= 1) seek();
    else audio.addEventListener('loadedmetadata', seek);
  }

  function paint() {
    btn.textContent = audio.muted ? ICON_OFF : ICON_ON;
    btn.setAttribute('aria-pressed', audio.muted ? 'false' : 'true');
    btn.title = audio.muted ? 'Unmute music' : 'Mute music';
  }
  paint();

  function start() {
    audio.play().catch(() => {
      // Autoplay blocked (browser policy). Resume on the first user gesture
      // anywhere on the page — clicking the ♪ button itself also qualifies.
      const wake = () => {
        audio.play().catch(() => {});
        document.removeEventListener('click',     wake, true);
        document.removeEventListener('keydown',   wake, true);
        document.removeEventListener('touchstart',wake, true);
      };
      document.addEventListener('click',      wake, true);
      document.addEventListener('keydown',    wake, true);
      document.addEventListener('touchstart', wake, true);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  // Button = global mute toggle (not play/pause)
  btn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    localStorage.setItem(MUTED_KEY, audio.muted ? '1' : '0');
    paint();
    if (audio.paused) audio.play().catch(() => {});
  });

  // Persist position every second so any reload/tab-change resumes cleanly
  let lastSaved = 0;
  audio.addEventListener('timeupdate', () => {
    const t = audio.currentTime;
    if (t > 0.1 && Math.abs(t - lastSaved) > 1) {
      localStorage.setItem(TIME_KEY, t.toString());
      lastSaved = t;
    }
  });

  // Final save on unload (covers tab navigation between pages)
  window.addEventListener('pagehide', () => {
    if (audio.currentTime > 0.1) {
      localStorage.setItem(TIME_KEY, audio.currentTime.toString());
    }
  });
})();
