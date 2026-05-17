/* feature-delivery.html — reads tickets.json, renders highlights + full table + bugs */

const RESULT_META = {
  W:    { pill: 'win',   label: '⚽ FT W',   filterGroup: 'W',       jiraStatus: 'Done'        },
  PPD:  { pill: 'ppd',   label: '❌ PPD',    filterGroup: 'PPD',     jiraStatus: "Won't Do"    },
  HT:   { pill: 'ht',    label: '🟡 HT',     filterGroup: 'in-play', jiraStatus: 'UAT'         },
  LIVE: { pill: 'live',  label: '🔴 LIVE',   filterGroup: 'in-play', jiraStatus: 'QA Running'  },
  SCHED:{ pill: 'sched', label: '📅 SCHED',  filterGroup: 'in-play', jiraStatus: 'To Do / Ready to Live' },
};

function pillHTML(result) {
  const m = RESULT_META[result] || { pill: 'ppd', label: result, jiraStatus: result };
  return `<span class="pill ${m.pill} pill-tip" data-jira="${m.jiraStatus}">${m.label}</span>`;
}

function ticketLink(id) {
  return `<a href="https://ambk.atlassian.net/browse/${id}" target="_blank" rel="noopener" class="ticket-link">${id}</a>`;
}

function fmtDate(d) {
  if (!d) return '—';
  const [y, mo, day] = d.split('-');
  return `${day}/${mo}/${y.slice(2)}`;
}

function buildSeasonStats(tickets) {
  const all = tickets;
  const wins  = all.filter(t => t.result === 'W').length;
  const total = all.length;
  const rate  = Math.round((wins / total) * 100);

  document.getElementById('headline-text').innerHTML =
    `<span>${total} appearances &nbsp;·&nbsp; <span style="color:var(--gold)">${wins} goals</span> &nbsp;·&nbsp; ${rate}% win rate. A title-winning campaign in Blaugrana.</span>`;

  const strip = document.getElementById('stat-strip');
  const stats = [
    { v: total,                         l: 'Appearances' },
    { v: wins,                          l: 'Goals (Done)' },
    { v: all.filter(t=>t.result==='PPD').length, l: 'Postponed' },
    { v: all.filter(t=>['HT','LIVE','SCHED'].includes(t.result)).length, l: 'In Play' },
    { v: rate + '%',                    l: 'Win Rate' },
  ];
  strip.style.cssText = 'display:flex;gap:6px 16px;flex-wrap:wrap;align-items:center';
  strip.innerHTML = stats.map(s =>
    `<div class="season-stat" style="color:var(--gold);gap:5px">
       <span style="font-family:var(--serif);font-weight:900;font-size:1.4rem;line-height:1">${s.v}</span>
       <small style="font-size:.58rem;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.5)">${s.l}</small>
     </div>
     <div style="width:1px;height:32px;background:rgba(255,255,255,.18)"></div>`
  ).join('').replace(/<div style="width.*?<\/div>$/, '');
}

function buildHighlights(tickets) {
  const tier1 = tickets.filter(t => t.tier === 1 && t.kind === 'main');
  const grid = document.getElementById('highlight-grid');
  grid.innerHTML = tier1.map(t => `
    <article class="highlight-card">
      <div class="ticket-id">${ticketLink(t.id)}</div>
      <h3>${t.title}</h3>
      ${t.subtitle ? `<div class="subtitle">${t.subtitle}</div>` : ''}
      <p style="font-size:.88rem;color:var(--ink-soft);line-height:1.5;margin:0">${t.description}</p>
      ${t.matchReport ? `<div class="report-text">${t.matchReport}</div>` : ''}
      <div style="margin-top:10px">${pillHTML(t.result)}</div>
    </article>
  `).join('');
}

function buildTable(tickets) {
  const main = tickets.filter(t => t.kind === 'main')
    .slice().sort((a, b) => (a.start || '').localeCompare(b.start || ''));
  const tbody = document.getElementById('fixtures-body');
  tbody.innerHTML = main.map(t => `
    <tr data-result="${t.result}" data-filter-group="${RESULT_META[t.result]?.filterGroup || ''}">
      <td class="fix-id">${ticketLink(t.id)}</td>
      <td class="fix-title">${t.title}<br/><small>${t.description.length > 80 ? t.description.slice(0,80)+'…' : t.description}</small></td>
      <td class="fix-date">${fmtDate(t.start)}</td>
      <td class="fix-date">${fmtDate(t.end)}</td>
      <td>${pillHTML(t.result)}</td>
    </tr>
  `).join('');
}

function buildBugs(tickets) {
  const bugs = tickets.filter(t => t.kind === 'bug');
  const tbody = document.getElementById('bug-body');
  tbody.innerHTML = bugs.map(t => `
    <tr>
      <td class="fix-id">${ticketLink(t.id)}</td>
      <td><strong>${t.title}</strong><br/><small>${t.description}</small></td>
      <td class="fix-date">${fmtDate(t.start)}</td>
      <td class="fix-date">${fmtDate(t.end)}</td>
      <td>${pillHTML(t.result)}</td>
    </tr>
  `).join('');
}

function initFilters() {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;
      document.querySelectorAll('#fixtures-body tr').forEach(row => {
        if (filter === 'all') {
          row.removeAttribute('data-hidden');
        } else if (filter === 'in-play') {
          row.dataset.hidden = row.dataset.filterGroup !== 'in-play';
        } else {
          row.dataset.hidden = row.dataset.result !== filter;
        }
      });
    });
  });
}

fetch('assets/data/tickets.json')
  .then(r => r.json())
  .then(data => {
    const tickets = data.tickets;
    buildSeasonStats(tickets);
    buildHighlights(tickets);
    buildTable(tickets);
    buildBugs(tickets);
    initFilters();
  })
  .catch(() => {
    document.getElementById('headline-text').textContent = 'Could not load fixtures data.';
  });
