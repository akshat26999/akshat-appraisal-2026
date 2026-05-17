/* growth-ai.html — reads q3-bracket.json, renders bracket + false9 + lamasia + closer */

function scorelineHTML(s) {
  if (!s) return '';
  const upper = s.toUpperCase();
  let cls = 'win', label = s, sub = '';
  if (upper.includes('LOST')) {
    cls = 'loss';
    const parts = s.split('—').map(x => x.trim());
    label = parts[0] || 'LOST';
    sub = parts.slice(1).join(' · ');
  } else if (upper.includes('PENDING')) {
    cls = 'pending';
    label = '1st Leg Won';
    sub = '2nd Leg Pending';
  } else if (upper.includes('WON')) {
    cls = 'win';
    label = 'WON';
  }
  return `<div class="scoreline ${cls}">
    <span class="score-dot"></span>
    <span class="score-label">${label}</span>
    ${sub ? `<span class="score-sub">${sub}</span>` : ''}
  </div>`;
}

function buildBracket(bracket) {
  const list = document.getElementById('bracket-list');
  if (!list) return;

  list.innerHTML = bracket.map((tie) => {
    const isLoss = tie.scoreline && tie.scoreline.toLowerCase().includes('lost');
    const isPending = tie.scoreline && tie.scoreline.toUpperCase().includes('PENDING');
    let roundClass = '';
    if (isLoss) roundClass = 'special';
    else if (isPending) roundClass = 'pending';
    const tags = (tie.tags || []).map(t => `<span class="bracket-tag">${t}</span>`).join('');

    return `
      <article class="bracket-item ${roundClass}" role="listitem">
        <div class="bracket-round-bar ${roundClass}">
          <span class="bracket-round-badge">${tie.round}</span>
          ${scorelineHTML(tie.scoreline)}
        </div>
        <div class="bracket-body">
          <h3>${tie.fixture}</h3>
          <div class="report-text">${tie.report}</div>
          ${tags ? `<div class="bracket-tags">${tags}</div>` : ''}
        </div>
      </article>`;
  }).join('');
}

function buildFalse9(data) {
  const el = document.getElementById('false9-panel');
  if (!el || !data) return;
  el.innerHTML = `
    <h3>The False 9</h3>
    ${data.lines.map(l => `<p>${l}</p>`).join('')}`;
}

function buildLaMasia(data) {
  const el = document.getElementById('lamasia-panel');
  if (!el || !data) return;
  el.innerHTML = `
    <h3>⚽ La Masia Notes</h3>
    ${data.lines.map(l => `<p>${l}</p>`).join('')}`;
}

function buildCloser(quote) {
  const el = document.getElementById('manager-closer');
  if (!el || !quote) return;
  el.innerHTML = `<span style="font-family:var(--serif);font-style:italic;font-size:1.2rem">"${quote.replace(' — The Gaffer', '')}"</span>
    <cite>— The Gaffer</cite>`;
}

fetch('assets/data/q3-bracket.json')
  .then(r => r.json())
  .then(data => {
    buildBracket(data.bracket || []);
    buildFalse9(data.false9);
    buildLaMasia(data.laMasia);
    buildCloser(data.managerQuote);
  })
  .catch(err => {
    console.error('bracket.js:', err);
    const el = document.getElementById('bracket-list');
    if (el) el.innerHTML = '<p style="color:var(--ink-soft)">Could not load bracket data.</p>';
  });
