/* Global pill tooltip — fixed-position div, bypasses all stacking contexts */
(function () {
  const tip = document.createElement('div');
  tip.id = 'pill-tooltip';
  document.body.appendChild(tip);

  document.addEventListener('mouseover', function (e) {
    const el = e.target.closest('.pill-tip');
    if (!el) return;
    const label = el.dataset.jira;
    if (!label) return;
    tip.textContent = 'JIRA: ' + label;
    tip.classList.add('visible');
    position(el);
  });

  document.addEventListener('mouseout', function (e) {
    if (!e.target.closest('.pill-tip')) return;
    tip.classList.remove('visible');
  });

  document.addEventListener('mousemove', function (e) {
    if (!tip.classList.contains('visible')) return;
    const el = e.target.closest('.pill-tip');
    if (el) position(el);
  });

  function position(el) {
    const r = el.getBoundingClientRect();
    tip.style.left = (r.left + r.width / 2) + 'px';
    tip.style.top  = (r.top - tip.offsetHeight - 8) + 'px';
    tip.style.transform = 'translateX(-50%)';
  }
})();
