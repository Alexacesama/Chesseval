// app.js — ChessEval

// ─── State ─────────────────────────────────────────────────────────────────
let allResults = [], allFens = [], allScores = [];
let cursor = 0;
let activeFilter = 'all';
let selectedDepth = 16;

// ─── Import ────────────────────────────────────────────────────────────────
const dropZone  = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag'));
dropZone.addEventListener('drop', e => {
  e.preventDefault(); dropZone.classList.remove('drag');
  if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', e => { if (e.target.files[0]) loadFile(e.target.files[0]); });

// Keyboard navigation
document.addEventListener('keydown', e => {
  if (document.getElementById('analysisView').classList.contains('hidden')) return;
  if (e.key === 'ArrowLeft')  step(-1);
  if (e.key === 'ArrowRight') step(1);
  if (e.key === 'Home')       goTo(0);
  if (e.key === 'End')        goTo(-1);
});

function loadFile(f) {
  const r = new FileReader();
  r.onload = e => { document.getElementById('pgnPaste').value = e.target.result; };
  r.readAsText(f);
}

function setDepth(d) {
  selectedDepth = d;
  document.querySelectorAll('.depth-btn').forEach(b => {
    b.classList.toggle('active', +b.dataset.d === d);
  });
}

// ─── Analysis ──────────────────────────────────────────────────────────────
async function startAnalysis() {
  const pgn = document.getElementById('pgnPaste').value.trim();
  if (!pgn) { alert('Collez ou importez un PGN d\'abord.'); return; }

  show('loadingView');
  document.getElementById('btnGo').disabled = true;

  try {
    const { headers, results, scores, fens } = await analyzeGame(
      pgn,
      selectedDepth,
      (done, total) => {
        const pct = total ? Math.round(done / total * 100) : 0;
        document.getElementById('progFill').style.width = pct + '%';
        document.getElementById('loadSub').textContent = `${done} / ${total} positions`;
        document.getElementById('loadText').textContent =
          done === 0 ? 'Initialisation de Stockfish...' : `Évaluation position ${done + 1}...`;
      }
    );

    allResults = results;
    allFens    = fens;
    allScores  = scores;
    cursor     = 0;

    hide('loadingView');
    buildAnalysisView(headers, results, scores);
    show('analysisView');
    hide('importView');

  } catch (err) {
    hide('loadingView');
    show('importView');
    alert('Erreur : ' + err.message);
  }

  document.getElementById('btnGo').disabled = false;
}

function resetAll() {
  hide('analysisView');
  show('importView');
  document.getElementById('pgnPaste').value = '';
  document.getElementById('progFill').style.width = '0%';
  allResults = []; allFens = []; allScores = [];
  cursor = 0;
}

// ─── Build analysis view ────────────────────────────────────────────────────
function buildAnalysisView(headers, results, scores) {
  buildTopBar(headers, results);
  buildStats(results);
  buildMoveTable(results);
  buildChart(scores, results);
  updateBoard();
}

// Top bar — joueurs
function buildTopBar(h, results) {
  const w = h['White'] || '—', b = h['Black'] || '—';
  const we = h['WhiteElo'] || '', be = h['BlackElo'] || '';
  const res = h['Result'] || '';
  document.getElementById('gamePlayers').innerHTML = `
    <div class="gp"><span class="gp-dot gp-dot-w"></span><span>${w}</span>${we ? `<span class="gp-elo">(${we})</span>` : ''}</div>
    <span class="gp-vs">vs</span>
    <div class="gp"><span class="gp-dot gp-dot-b"></span><span>${b}</span>${be ? `<span class="gp-elo">(${be})</span>` : ''}</div>
    ${res ? `<span class="gp-vs">${res}</span>` : ''}
  `;
  document.getElementById('depthInfo').textContent = `DEPTH ${selectedDepth}`;

  // Joueurs autour du plateau
  const wAcc = calcAccuracy(results, 'white');
  const bAcc = calcAccuracy(results, 'black');
  document.getElementById('boardTopPlayer').innerHTML = `
    <span class="bp-dot bp-dot-b"></span>
    <span>${b}</span>${be ? `<span class="bp-elo">(${be})</span>` : ''}
    <span class="bp-acc">${bAcc}%</span>
  `;
  document.getElementById('boardBotPlayer').innerHTML = `
    <span class="bp-dot bp-dot-w"></span>
    <span>${w}</span>${we ? `<span class="bp-elo">(${we})</span>` : ''}
    <span class="bp-acc">${wAcc}%</span>
  `;
}

// Stats
function buildStats(results) {
  const c = { blunder: 0, mistake: 0, inaccuracy: 0, good: 0 };
  results.forEach(r => {
    if (r.quality.key === 'best' || r.quality.key === 'good' || r.quality.key === 'brilliant') c.good++;
    else if (c[r.quality.key] !== undefined) c[r.quality.key]++;
  });
  const acc = Math.round((calcAccuracy(results, 'white') + calcAccuracy(results, 'black')) / 2);
  document.getElementById('statsBar').innerHTML = `
    <div class="stat s-bl"><span class="stat-n">${c.blunder}</span><span class="stat-l">?? Gaffes</span></div>
    <div class="stat s-ms"><span class="stat-n">${c.mistake}</span><span class="stat-l">? Erreurs</span></div>
    <div class="stat s-in"><span class="stat-n">${c.inaccuracy}</span><span class="stat-l">?! Imprécisions</span></div>
    <div class="stat s-gd"><span class="stat-n">${c.good}</span><span class="stat-l">Bons coups</span></div>
    <div class="stat s-ac"><span class="stat-n">${acc}%</span><span class="stat-l">Précision moy.</span></div>
  `;
}

// ─── Move table (paires, comme lichess) ────────────────────────────────────
function buildMoveTable(results) {
  const table = document.getElementById('movesTable');
  table.innerHTML = '';

  // Regrouper par paires (1 ligne = blancs + noirs)
  for (let i = 0; i < results.length; i += 2) {
    const rw = results[i];       // coup blanc
    const rb = results[i + 1];  // coup noir (peut être undefined)

    const row = document.createElement('div');
    row.className = 'mv-row';
    row.dataset.moveNum = rw.moveNum;

    // Numéro
    const numEl = document.createElement('div');
    numEl.className = 'mv-num';
    numEl.textContent = rw.moveNum;
    row.appendChild(numEl);

    // Coup blanc
    row.appendChild(makeMoveCell(rw, i, 'w'));
    row.appendChild(makeScoreCell(rw));

    // Coup noir
    if (rb) {
      row.appendChild(makeMoveCell(rb, i + 1, 'b'));
      row.appendChild(makeScoreCell(rb));
    } else {
      row.appendChild(document.createElement('div'));
      row.appendChild(document.createElement('div'));
    }

    table.appendChild(row);
  }

  applyFilter(activeFilter);
}

function makeMoveCell(r, idx, side) {
  const q = r.quality;
  const cell = document.createElement('div');
  cell.className = 'mv-cell';
  cell.dataset.idx = idx;
  cell.innerHTML = `
    <span class="mv-san">${r.san}</span>
    ${q.label ? `<span class="mv-badge q-${q.key}">${q.label}</span>` : ''}
  `;
  cell.addEventListener('click', () => goTo(idx + 1));
  return cell;
}

function makeScoreCell(r) {
  const score = r.scoreAfter;
  const str = Math.abs(score) >= 99
    ? (score > 0 ? 'M+' : 'M-')
    : (score > 0 ? '+' : '') + score.toFixed(2);
  const cls = Math.abs(score) >= 99 ? 'sc-mate' : score > 0.1 ? 'sc-pos' : score < -0.1 ? 'sc-neg' : 'sc-neu';
  const cell = document.createElement('div');
  cell.className = 'mv-score-cell';
  cell.innerHTML = `<span class="mv-score ${cls}">${str}</span>`;
  return cell;
}

// ─── Filter ────────────────────────────────────────────────────────────────
function setFilter(f) {
  activeFilter = f;
  document.querySelectorAll('.flt').forEach(b => b.classList.toggle('active', b.dataset.f === f));
  applyFilter(f);
}

function applyFilter(f) {
  document.querySelectorAll('.mv-row').forEach(row => {
    if (f === 'all') { row.classList.remove('row-hidden'); return; }
    const mn = +row.dataset.moveNum;
    // Chercher si la ligne contient un coup du type filtré
    const idxW = (mn - 1) * 2;
    const idxB = idxW + 1;
    const rw = allResults[idxW], rb = allResults[idxB];
    const match = (rw && rw.quality.key === f) || (rb && rb.quality.key === f);
    row.classList.toggle('row-hidden', !match);
  });
}

// ─── Chart ─────────────────────────────────────────────────────────────────
function buildChart(scores, results) {
  const canvas = document.getElementById('evalChart');
  const W = canvas.parentElement.offsetWidth || 300;
  const H = 100;
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const n = scores.length;
  if (!n) return;

  const clamp = s => Math.max(-8, Math.min(8, s));
  const clamped = scores.map(clamp);
  const mid = H / 2;
  const xOf = i => i / (n - 1) * W;
  const yOf = i => mid - (clamped[i] / 8) * (mid - 4);

  // Zone blancs (au-dessus) → bleu
  ctx.beginPath();
  ctx.moveTo(0, mid);
  for (let i = 0; i < n; i++) ctx.lineTo(xOf(i), Math.min(yOf(i), mid));
  ctx.lineTo(W, mid); ctx.closePath();
  ctx.fillStyle = 'rgba(59,130,246,.2)'; ctx.fill();

  // Zone noirs (en-dessous) → rouge
  ctx.beginPath();
  ctx.moveTo(0, mid);
  for (let i = 0; i < n; i++) ctx.lineTo(xOf(i), Math.max(yOf(i), mid));
  ctx.lineTo(W, mid); ctx.closePath();
  ctx.fillStyle = 'rgba(239,68,68,.2)'; ctx.fill();

  // Ligne principale
  ctx.beginPath();
  for (let i = 0; i < n; i++) i === 0 ? ctx.moveTo(xOf(i), yOf(i)) : ctx.lineTo(xOf(i), yOf(i));
  ctx.strokeStyle = '#d0d0d0'; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.stroke();

  // Points gaffes/erreurs
  results.forEach((r, i) => {
    if (!['blunder','mistake'].includes(r.quality.key)) return;
    const x = xOf(i + 1), y = yOf(i + 1);
    ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = r.quality.key === 'blunder' ? '#e84040' : '#e88c2a'; ctx.fill();
  });

  // Clic sur le graphe → naviguer
  canvas.onclick = e => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(x * (n - 1));
    goTo(idx);
  };

  updateChartCursor();
}

function updateChartCursor() {
  const canvas = document.getElementById('evalChart');
  const cursorEl = document.getElementById('chartCursor');
  const n = allScores.length;
  if (!n || !canvas.offsetWidth) return;
  const x = (cursor / (n - 1)) * canvas.offsetWidth;
  cursorEl.style.left = x + 'px';
  cursorEl.classList.toggle('hidden', cursor <= 0);
}

// ─── Board update ───────────────────────────────────────────────────────────
function updateBoard() {
  const fen = allFens[cursor] || allFens[0];
  if (!fen) return;

  const r = cursor > 0 ? allResults[cursor - 1] : null;
  renderBoard(fen, document.getElementById('boardWrap'), {
    lastFrom: r?.from,
    lastTo:   r?.to,
  });

  // Label nav
  document.getElementById('navLabel').textContent = cursor === 0
    ? 'Position initiale'
    : `Coup ${allResults[cursor-1].moveNum} · ${allResults[cursor-1].san}`;

  // Barre d'évaluation verticale
  const score = r ? r.scoreAfter : 0;
  const clamped = Math.max(-8, Math.min(8, score));
  // % pour les noirs = quand score < 0, noirs avantageux → barre sombre grandit
  // fill = zone sombre (avantage noir) en bas de la barre
  // fill height = 50% + (avantage noir en %) = 50% - score/8*50%
  const blackPct = Math.round(50 - (clamped / 8) * 50);
  document.getElementById('evalBarFill').style.height = blackPct + '%';

  const scoreStr = Math.abs(score) >= 99
    ? (score > 0 ? 'M+' : 'M-')
    : (score > 0 ? '+' : '') + score.toFixed(1);
  const valEl = document.getElementById('evalScore');
  valEl.textContent = scoreStr;
  valEl.style.color = clamped > 0.2 ? '#93c5fd' : clamped < -0.2 ? '#f87171' : '#777';

  // Surligner le coup actif dans le tableau
  document.querySelectorAll('.mv-cell').forEach(el => {
    const idx = +el.dataset.idx;
    const isActive = idx === cursor - 1;
    const isWhiteMove = allResults[idx]?.isWhite ?? false;
    el.classList.toggle('active', isActive && isWhiteMove);
    el.classList.toggle('active-red', isActive && !isWhiteMove);
  });

  const activeCell = document.querySelector('.mv-cell.active, .mv-cell.active-red');
  if (activeCell) activeCell.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

  updateChartCursor();
}

// ─── Navigation ─────────────────────────────────────────────────────────────
function step(d) { goTo(cursor + d); }
function goTo(idx) {
  if (idx < 0) idx = allFens.length - 1;
  cursor = Math.max(0, Math.min(allFens.length - 1, idx));
  updateBoard();
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function show(id) { document.getElementById(id).classList.remove('hidden'); }
function hide(id) { document.getElementById(id).classList.add('hidden'); }
