/* Music toggle — each page has its own audio file in assets/audio/ (cover.wav,
   la-liga.wav, copa.wav, champions-league.wav, trophy-room.wav). Replace any
   file in-place to swap the track for that page. Autoplay attempted on load. */
(function () {
  const btn = document.getElementById('music-toggle');
  const audio = document.getElementById('anthem');
  if (!btn || !audio) return;

  let active = false;

  function setPlaying(playing) {
    active = playing;
    btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    btn.title = playing ? 'Mute music' : 'Play music';
  }

  // Attempt autoplay immediately when page loads
  function tryAutoplay() {
    audio.play().then(() => {
      setPlaying(true);
    }).catch(() => {
      // Browser blocked autoplay — user must interact first
      setPlaying(false);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryAutoplay);
  } else {
    tryAutoplay();
  }

  btn.addEventListener('click', () => {
    if (!active) {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setPlaying(false);
    }
  });
})();
