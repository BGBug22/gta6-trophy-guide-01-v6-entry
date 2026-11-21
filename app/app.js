// Neon Coastal Trophy Guide v6 — offline tracker for the 55 official GTA VI trophies.
// State lives in localStorage only: earned ids, sub-progress counters, per-trophy notes.
// The Platinum (id 1) is derived: it earns itself when the other 54 are earned.
const KEY = 'neon-coastal-gta6-v6';
const listEl = document.getElementById('trophyList');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('gradeFilter');
const statusEl = document.getElementById('statusFilter');
const shieldEl = document.getElementById('spoilerShield');

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

let state = { earned: [], counters: {}, notes: {} };
try {
  const raw = localStorage.getItem(KEY);
  if (raw) {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') state = { earned: [], counters: {}, notes: {}, ...parsed };
  }
} catch { /* corrupted state: start fresh */ }

const earned = new Set(state.earned.filter((id) => byId.has(id)));
const counters = {};
for (const [k, v] of Object.entries(state.counters || {})) {
  const t = byId.get(Number(k));
  if (t && t.target != null) counters[t.id] = Math.max(0, Math.min(t.target, Number(v) || 0));
}
const notes = {};
for (const [k, v] of Object.entries(state.notes || {})) {
  if (byId.has(Number(k)) && typeof v === 'string') notes[Number(k)] = v;
}

const expanded = new Set();
const revealed = new Set(); // hidden trophies the user chose to reveal under the shield

function save() {
  state = { earned: [...earned], counters, notes };
  localStorage.setItem(KEY, JSON.stringify(state));
}

function fmtTarget(t, n) {
  if (t.target_unit === '$') return '$' + n.toLocaleString('en-US');
  if (t.target_unit === '%') return n + '%';
  return String(n);
}

function syncPlatinum() {
  const others = trophies.filter((t) => t.id !== 1);
  if (others.every((t) => earned.has(t.id))) earned.add(1);
  else earned.delete(1);
}

function renderHeader() {
  syncPlatinum();
  const total = trophies.length;
  const done = earned.size;
  document.getElementById('earnedCount').textContent = done;
  document.getElementById('progressFill').style.width = ((done / total) * 100).toFixed(1) + '%';
  const counts = {};
  for (const t of trophies) {
    counts[t.grade] = counts[t.grade] || [0, 0];
    counts[t.grade][1]++;
    if (earned.has(t.id)) counts[t.grade][0]++;
  }
  const line = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => g[0].toUpperCase() + g.slice(1) + ' ' + (counts[g]?.[0] ?? 0) + '/' + (counts[g]?.[1] ?? 0))
    .join(' · ');
  document.getElementById('gradeLine').textContent = line;
  const plat = document.getElementById('platinumState');
  if (earned.has(1)) {
    plat.textContent = 'Platinum earned — Leonida Legend';
    plat.classList.add('earned');
  } else {
    plat.textContent = 'Platinum locked';
    plat.classList.remove('earned');
  }
  // Audit metrics, computed from the real data.
  const steps = trophies.reduce((a, t) => a + t.steps.length, 0);
  document.getElementById('auditCoverage').textContent = trophies.length + '/55';
  document.getElementById('auditCitations').textContent = steps;
  document.getElementById('auditTracker').textContent = trophies.filter((t) => t.target != null).length;
}

function trophyMatches(t) {
  const q = searchEl.value.trim().toLowerCase();
  if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || (t.guide || '').toLowerCase().includes(q))) return false;
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (statusEl.value === 'earned' && !earned.has(t.id)) return false;
  if (statusEl.value === 'todo' && earned.has(t.id)) return false;
  if (statusEl.value === 'hidden' && !t.hidden) return false;
  if (statusEl.value === 'visible' && t.hidden) return false;
  return true;
}

function renderList() {
  renderHeader();
  const shown = trophies.filter(trophyMatches);
  document.getElementById('resultLine').textContent =
    'Showing ' + shown.length + ' of ' + trophies.length + ' trophies' +
    (earned.size ? ' — ' + earned.size + ' earned' : '');
  listEl.replaceChildren();
  for (const t of shown) {
    const shielded = t.hidden && shieldEl.checked && !revealed.has(t.id);
    const card = document.createElement('article');
    card.className = 'trophy' + (earned.has(t.id) ? ' earned' : '') + (shielded ? ' shielded' : '');
    card.dataset.id = t.id;

    const head = document.createElement('div');
    head.className = 'trophy-head';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', 'Mark ' + t.name + ' earned');
    if (t.id === 1) {
      box.disabled = true;
      box.title = 'The Platinum unlocks automatically when the other 54 are earned.';
    }
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      save();
      renderList();
    });
    const titleWrap = document.createElement('div');
    titleWrap.className = 'trophy-title';
    const h = document.createElement('h3');
    h.textContent = t.name;
    if ((notes[t.id] || '').trim()) {
      const flag = document.createElement('span');
      flag.className = 'note-flag';
      flag.textContent = ' ✎';
      flag.title = 'You have a note on this trophy';
      h.append(flag);
    }
    const desc = document.createElement('p');
    desc.className = 'trophy-desc';
    desc.textContent = t.description;
    const badges = document.createElement('div');
    badges.className = 'trophy-badges';
    const gradeBadge = document.createElement('span');
    gradeBadge.className = 'badge ' + t.grade;
    gradeBadge.textContent = t.grade;
    badges.append(gradeBadge);
    if (t.hidden) {
      const hb = document.createElement('span');
      hb.className = 'badge hidden-badge';
      hb.textContent = 'Hidden';
      badges.append(hb);
    }
    if (t.missable) {
      const mb = document.createElement('span');
      mb.className = 'badge missable';
      mb.textContent = 'Possibly missable';
      badges.append(mb);
    }
    if ((notes[t.id] || '').trim()) {
      const nb = document.createElement('span');
      nb.className = 'badge notes-badge';
      nb.textContent = '✎ Note';
      badges.append(nb);
    }
    if (shielded) {
      const sn = document.createElement('p');
      sn.className = 'shield-note';
      sn.textContent = 'Hidden trophy — spoiler shielded. Reveal it to see the name and guide.';
      titleWrap.append(h, sn, badges);
    } else {
      titleWrap.append(h, desc, badges);
    }
    const expandBtn = document.createElement('button');
    expandBtn.type = 'button';
    expandBtn.className = 'expand-btn';
    expandBtn.textContent = expanded.has(t.id) ? 'Hide guide' : 'Guide';
    expandBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (expanded.has(t.id)) expanded.delete(t.id);
      else expanded.add(t.id);
      renderList();
    });
    head.append(box, titleWrap, expandBtn);
    head.addEventListener('click', (ev) => {
      if (ev.target === box || ev.target === expandBtn) return;
      if (shielded) { revealed.add(t.id); }
      if (expanded.has(t.id)) expanded.delete(t.id);
      else expanded.add(t.id);
      renderList();
    });
    card.append(head);

    if (shielded) {
      const reveal = document.createElement('button');
      reveal.type = 'button';
      reveal.className = 'expand-btn';
      reveal.style.marginTop = '10px';
      reveal.textContent = 'Reveal this trophy';
      reveal.addEventListener('click', () => { revealed.add(t.id); renderList(); });
      card.append(reveal);
    } else if (expanded.has(t.id)) {
      const detail = document.createElement('div');
      detail.className = 'trophy-detail';
      const stepsH = document.createElement('h4');
      stepsH.textContent = 'How to get it';
      detail.append(stepsH);
      const ol = document.createElement('ol');
      for (const s of t.steps) {
        const li = document.createElement('li');
        li.textContent = s.text + ' ';
        const src = document.createElement('span');
        src.className = 'step-source';
        src.textContent = '(Source: ' + s.source + ')';
        li.append(src);
        ol.append(li);
      }
      detail.append(ol);

      if (t.target != null) {
        const cwrap = document.createElement('div');
        cwrap.className = 'counter';
        const minus = document.createElement('button');
        minus.type = 'button';
        minus.textContent = '−';
        minus.setAttribute('aria-label', 'Decrease progress');
        const plus = document.createElement('button');
        plus.type = 'button';
        plus.textContent = '+';
        plus.setAttribute('aria-label', 'Increase progress');
        const val = document.createElement('span');
        val.className = 'counter-value';
        const cur = counters[t.id] || 0;
        val.textContent = fmtTarget(t, cur) + ' / ' + fmtTarget(t, t.target);
        const bar = document.createElement('div');
        bar.className = 'mini-bar';
        const fill = document.createElement('div');
        fill.className = 'mini-bar-fill';
        fill.style.width = ((cur / t.target) * 100).toFixed(1) + '%';
        bar.append(fill);
        const done = document.createElement('span');
        done.className = 'counter-done';
        if (cur >= t.target) done.textContent = 'Target reached — trophy earned';
        minus.addEventListener('click', () => {
          counters[t.id] = Math.max(0, (counters[t.id] || 0) - 1);
          if (counters[t.id] < t.target) earned.delete(t.id);
          save();
          renderList();
        });
        plus.addEventListener('click', () => {
          counters[t.id] = Math.min(t.target, (counters[t.id] || 0) + 1);
          if (counters[t.id] >= t.target) earned.add(t.id);
          save();
          renderList();
        });
        cwrap.append(minus, val, plus, bar, done);
        detail.append(cwrap);
      }

      const srcP = document.createElement('p');
      srcP.className = 'trophy-sources';
      const strong = document.createElement('strong');
      strong.textContent = 'Sources: ';
      srcP.append(strong, document.createTextNode(t.sources.join(', ') + ' — list read 21 November 2026.'));
      detail.append(srcP);

      const notesH = document.createElement('h4');
      notesH.textContent = 'My notes';
      detail.append(notesH);
      const ta = document.createElement('textarea');
      ta.className = 'notes-area';
      ta.value = notes[t.id] || '';
      ta.placeholder = 'Your own note for this trophy — route, loadout, reminder…';
      ta.setAttribute('aria-label', 'My notes for ' + t.name);
      ta.addEventListener('input', () => {
        if (ta.value.trim()) notes[t.id] = ta.value;
        else delete notes[t.id];
        save();
        // Update the ✎ flag without rebuilding (keeps the caret in place).
        const flag = card.querySelector('.note-flag');
        const nb = card.querySelector('.notes-badge');
        if (ta.value.trim() && !flag) {
          const f = document.createElement('span');
          f.className = 'note-flag';
          f.textContent = ' ✎';
          h.append(f);
        } else if (!ta.value.trim() && flag) {
          flag.remove();
        }
        if (ta.value.trim() && !nb) {
          const b = document.createElement('span');
          b.className = 'badge notes-badge';
          b.textContent = '✎ Note';
          badges.append(b);
        } else if (!ta.value.trim() && nb) {
          nb.remove();
        }
      });
      const hint = document.createElement('p');
      hint.className = 'notes-hint';
      hint.textContent = 'Saved on this device only. Export your progress to back it up.';
      detail.append(ta, hint);
      card.append(detail);
    }
    listEl.append(card);
  }
}

function renderSources() {
  const counts = new Map();
  for (const t of trophies) {
    for (const s of t.sources) counts.set(s, (counts.get(s) || 0) + 1);
    for (const st of t.steps) counts.set(st.source, (counts.get(st.source) || 0) + 1);
  }
  const table = document.getElementById('sourceTable');
  table.replaceChildren();
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  for (const [name, n] of rows) {
    const row = document.createElement('div');
    row.className = 'source-row';
    const strong = document.createElement('strong');
    strong.textContent = name;
    const span = document.createElement('span');
    span.textContent = n + ' citation' + (n === 1 ? '' : 's') + ' · read 21 Nov 2026';
    row.append(strong, span);
    table.append(row);
  }
}

// Tabs
document.querySelectorAll('.tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.add('hidden'));
    document.getElementById('tab-' + btn.dataset.tab).classList.remove('hidden');
  });
});

// Filters
for (const el of [searchEl, gradeEl, statusEl, shieldEl]) el.addEventListener('input', renderList);

// Export / Import / Wipe
document.getElementById('exportBtn').addEventListener('click', () => {
  const payload = { app: 'neon-coastal-gta6-v6', version: 1, exported: new Date().toISOString().slice(0, 10), earned: [...earned], counters, notes };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (Array.isArray(data.earned)) {
      earned.clear();
      for (const id of data.earned) if (byId.has(Number(id))) earned.add(Number(id));
    }
    if (data.counters && typeof data.counters === 'object') {
      for (const [k, v] of Object.entries(data.counters)) {
        const t = byId.get(Number(k));
        if (t && t.target != null) counters[t.id] = Math.max(0, Math.min(t.target, Number(v) || 0));
      }
    }
    if (data.notes && typeof data.notes === 'object') {
      for (const [k, v] of Object.entries(data.notes)) {
        if (byId.has(Number(k)) && typeof v === 'string') notes[Number(k)] = v;
      }
    }
    save();
    renderList();
  } catch {
    alert('That file could not be imported — it is not valid progress JSON.');
  }
  e.target.value = '';
});
document.getElementById('wipeBtn').addEventListener('click', () => {
  if (!confirm('Wipe all earned trophies, counters and notes on this device?')) return;
  earned.clear();
  for (const k of Object.keys(counters)) delete counters[k];
  for (const k of Object.keys(notes)) delete notes[k];
  save();
  renderList();
});

renderSources();
renderList();
