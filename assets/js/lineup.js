/* quality-ux.html — reads q2-lineup.json, renders pitch + player profiles */

function buildManagerReport(lines) {
  const el = document.getElementById('manager-report');
  if (!el) return;
  el.innerHTML = lines.map(l => `<p>${l}</p>`).join('');
}

function makePlayerHTML(p, role) {
  const num = p.number != null ? p.number : '';
  const player = p.player || p.name;
  const initiative = p.name;
  const blurb = p.profile || p.blurb || '';
  const ticketList = (p.tickets || []).join(', ');
  const tipPayload = JSON.stringify({
    player, num, role, initiative, blurb, tickets: ticketList
  }).replace(/"/g, '&quot;');
  return `
    <div class="player" tabindex="0" role="button" data-tip="${tipPayload}" aria-label="${player} #${num}: ${initiative}">
      <div class="player-dot">
        <span class="pnum">${num}</span>
      </div>
      <div class="player-pos">${role}</div>
      <div class="player-label">${player}</div>
    </div>`;
}

function buildPitch(positions) {
  const pitchRows = document.getElementById('pitch-rows');
  if (!pitchRows) return;

  const rows = [];

  if (positions.FWD?.length) {
    rows.push(`<div class="pitch-row row-fwd">${positions.FWD.map(p => makePlayerHTML(p, p.role || 'FWD')).join('')}</div>`);
  }
  if (positions.MID?.length) {
    rows.push(`<div class="pitch-row row-mid">${positions.MID.map(p => makePlayerHTML(p, p.role || 'MID')).join('')}</div>`);
  }
  if (positions.DEF?.length) {
    rows.push(`<div class="pitch-row row-def">${positions.DEF.map(p => makePlayerHTML(p, p.role || 'DEF')).join('')}</div>`);
  }
  if (positions.GK?.length) {
    rows.push(`<div class="pitch-row row-gk">${positions.GK.map(p => makePlayerHTML(p, 'GK')).join('')}</div>`);
  }

  pitchRows.innerHTML = rows.join('');
  initPlayerTooltip();
}

const POS_LABELS = {
  GK: 'Goalkeeper',
  RB: 'Right Back',
  LB: 'Left Back',
  CB: 'Centre Back',
  CDM: 'Defensive Mid',
  CM:  'Central Mid',
  CAM: 'Attacking Mid',
  LW:  'Left Wing',
  RW:  'Right Wing',
  ST:  'Striker',
};

function buildPlayerProfiles(positions) {
  const grid = document.getElementById('trophy-grid');
  if (!grid) return;

  const all = [
    ...(positions.GK  || []).map(p => ({...p, _row:'GK'})),
    ...(positions.DEF || []).map(p => ({...p, _row:'DEF'})),
    ...(positions.MID || []).map(p => ({...p, _row:'MID'})),
    ...(positions.FWD || []).map(p => ({...p, _row:'FWD'})),
  ];

  grid.innerHTML = all.map(p => {
    const role = p.role || p._row;
    const posLabel = POS_LABELS[role] || role;
    const ticketLinks = (p.tickets || [])
      .map(id => `<a href="https://ambk.atlassian.net/browse/${id}" target="_blank" rel="noopener" class="ticket-link">${id}</a>`)
      .join(' · ');
    const text = p.profile || p.blurb;
    const player = p.player || '';
    const num = p.number != null ? p.number : '';
    return `
      <div class="player-card">
        <div class="player-card-head">
          <span class="player-card-num">#${num}</span>
          <span class="player-card-pos">${role}</span>
          <span class="player-card-pos-full">${posLabel}</span>
        </div>
        <h4>${player}</h4>
        <div class="player-card-initiative">${p.name}</div>
        <p class="player-card-profile">${text}</p>
        ${ticketLinks ? `<div class="player-card-tickets">${ticketLinks}</div>` : ''}
      </div>`;
  }).join('');
}

/* Singleton tooltip — escapes all stacking contexts via fixed positioning on <body> */
function initPlayerTooltip() {
  let tip = document.getElementById('player-floating-tip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'player-floating-tip';
    document.body.appendChild(tip);
  }

  const show = (el) => {
    const data = JSON.parse(el.dataset.tip.replace(/&quot;/g, '"'));
    tip.innerHTML = `
      <div class="ftip-head">
        <span class="ftip-num">#${data.num}</span>
        <span class="ftip-name">${data.player}</span>
        <span class="ftip-pos">${data.role}</span>
      </div>
      <div class="ftip-initiative">${data.initiative}</div>
      <div class="ftip-body">${data.blurb}</div>
      ${data.tickets ? `<div class="ftip-tickets">Tickets: ${data.tickets}</div>` : ''}`;
    tip.classList.add('visible');
    position(el);
  };
  const hide = () => tip.classList.remove('visible');
  const position = (el) => {
    const r = el.getBoundingClientRect();
    const tipW = tip.offsetWidth, tipH = tip.offsetHeight;
    let left = r.left + r.width / 2;
    let top  = r.top - tipH - 12;
    // Clamp to viewport
    left = Math.max(tipW/2 + 8, Math.min(window.innerWidth - tipW/2 - 8, left));
    if (top < 8) top = r.bottom + 12;
    tip.style.left = left + 'px';
    tip.style.top  = top + 'px';
  };

  document.querySelectorAll('.player').forEach(el => {
    el.addEventListener('mouseenter', () => show(el));
    el.addEventListener('mouseleave', hide);
    el.addEventListener('focus',  () => show(el));
    el.addEventListener('blur',   hide);
  });
}

fetch('assets/data/q2-lineup.json')
  .then(r => r.json())
  .then(data => {
    buildManagerReport(data.managerReport || []);
    buildPitch(data.positions || {});
    buildPlayerProfiles(data.positions || {});
  })
  .catch(err => {
    console.error('lineup.js:', err);
    const el = document.getElementById('pitch-rows');
    if (el) el.innerHTML = '<p style="color:rgba(255,255,255,.5);text-align:center">Could not load lineup data.</p>';
  });
