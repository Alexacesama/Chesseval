// board.js — Rendu échiquier SVG avec vraies pièces vectorielles

// ─── Pièces SVG (paths cburnett / Lichess style) ────────────────────────
// viewBox interne : 0 0 45 45
const PIECE_PATHS = {
  // ── Blancs ──
  wP: `<g fill="#fff" stroke="#000" stroke-width="1.5" stroke-linejoin="round">
    <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03L17.5 28h10l-.91-2C28.06 24.84 29 23.03 29 21c0-2.41-1.33-4.5-3.28-5.62A4 4 0 0 0 26.5 13c0-2.21-1.79-4-4-4z"/>
    <path d="M11.5 37c5.56 3.07 15.44 3.07 21 0v-7s3-4.5-.5-6.5c-4-.5-10-.5-14-.5s-10 0-14 .5c-3.5 2-.5 6.5-.5 6.5v7z"/>
  </g>`,
  wR: `<g fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 39h27v-3H9v3zm3-3v-4h21v4H12zm-1-22V9h4v2h5V9h5v2h5V9h4v5"/>
    <path d="M34 14l-3 3H14l-3-3"/>
    <path d="M31 17v12.5H14V17" stroke-linejoin="miter"/>
    <path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/>
    <path d="M11 14h23" fill="none"/>
  </g>`,
  wN: `<g fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/>
    <path d="M24 18c.38 5.1-5.55 8.45-8 6-3-2.5 4-12 4-12"/>
    <circle cx="9.5" cy="25.5" r=".5" fill="#000"/>
    <path d="M14.933 15.75c.313 4.896-5.521 8.042-7.933 5.75-3-2.5 4-12 4-12" fill="none"/>
  </g>`,
  wB: `<g fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <g fill="none" stroke-linecap="butt">
      <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2"/>
      <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
    </g>
    <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
    <path d="M17.5 26h10M15 30h15M22.5 15.5v5M20 18h5" fill="none" stroke="#000" stroke-width="1.5"/>
  </g>`,
  wQ: `<g fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="6" cy="12" r="2.75"/>
    <circle cx="14" cy="9" r="2.75"/>
    <circle cx="22.5" cy="8" r="2.75"/>
    <circle cx="31" cy="9" r="2.75"/>
    <circle cx="39" cy="12" r="2.75"/>
    <path d="M9 26c8.5-8.5 15.5-10.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26z" stroke-linecap="butt" stroke-linejoin="miter"/>
    <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/>
    <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c4-1.5 17-1.5 21 0" fill="none"/>
  </g>`,
  wK: `<g fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22.5 11.63V6M20 8h5" stroke-linejoin="miter"/>
    <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/>
    <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V17s-5.5-9.5-12-4c-3 3-.5 9 3.5 12.5L11.5 37z"/>
    <path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0" fill="none"/>
  </g>`,

  // ── Noirs ──
  bP: `<g fill="#000" stroke="#000" stroke-width="1.5" stroke-linejoin="round">
    <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03L17.5 28h10l-.91-2C28.06 24.84 29 23.03 29 21c0-2.41-1.33-4.5-3.28-5.62A4 4 0 0 0 26.5 13c0-2.21-1.79-4-4-4z" stroke="#aaa" stroke-width="1"/>
    <path d="M11.5 37c5.56 3.07 15.44 3.07 21 0v-7s3-4.5-.5-6.5c-4-.5-10-.5-14-.5s-10 0-14 .5c-3.5 2-.5 6.5-.5 6.5v7z" stroke="#aaa" stroke-width="1"/>
  </g>`,
  bR: `<g fill="#000" stroke="#aaa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 39h27v-3H9v3zm3-3v-4h21v4H12zm-1-22V9h4v2h5V9h5v2h5V9h4v5"/>
    <path d="M34 14l-3 3H14l-3-3"/>
    <path d="M31 17v12.5H14V17" stroke="#aaa" stroke-linejoin="miter"/>
    <path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/>
    <path d="M11 14h23" fill="none"/>
  </g>`,
  bN: `<g fill="#000" stroke="#aaa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/>
    <path d="M24 18c.38 5.1-5.55 8.45-8 6-3-2.5 4-12 4-12"/>
    <circle cx="9.5" cy="25.5" r=".5" fill="#aaa"/>
    <path d="M14.933 15.75c.313 4.896-5.521 8.042-7.933 5.75-3-2.5 4-12 4-12" fill="none"/>
  </g>`,
  bB: `<g fill="#000" stroke="#aaa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <g fill="none" stroke-linecap="butt">
      <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2"/>
      <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
    </g>
    <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
    <path d="M17.5 26h10M15 30h15M22.5 15.5v5M20 18h5" fill="none" stroke="#aaa" stroke-width="1.5"/>
  </g>`,
  bQ: `<g fill="#000" stroke="#aaa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="6" cy="12" r="2.75"/>
    <circle cx="14" cy="9" r="2.75"/>
    <circle cx="22.5" cy="8" r="2.75"/>
    <circle cx="31" cy="9" r="2.75"/>
    <circle cx="39" cy="12" r="2.75"/>
    <path d="M9 26c8.5-8.5 15.5-10.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26z" stroke-linecap="butt" stroke-linejoin="miter"/>
    <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/>
    <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c4-1.5 17-1.5 21 0" fill="none"/>
  </g>`,
  bK: `<g fill="#000" stroke="#aaa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22.5 11.63V6M20 8h5" stroke="#aaa" stroke-linejoin="miter"/>
    <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/>
    <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V17s-5.5-9.5-12-4c-3 3-.5 9 3.5 12.5L11.5 37z"/>
    <path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0" fill="none"/>
  </g>`,
};

// ─── Couleurs des cases (bleu/rouge) ──────────────────────────────────────
const SQ = {
  // Demi-plateau bas (blancs) → bleu
  wLight: '#3a5fa0',
  wDark:  '#1a2e60',
  // Demi-plateau haut (noirs) → rouge
  bLight: '#a03040',
  bDark:  '#551018',
  // Dernier coup
  lastW:  '#4a7ed4',
  lastB:  '#c44060',
};

function fenToArray(fen) {
  const board = new Array(64).fill(null);
  for (let r = 0, idx = 0; r < 8; r++) {
    let f = 0;
    for (const ch of fen.split(' ')[0].split('/')[r]) {
      if (/\d/.test(ch)) f += +ch;
      else { board[r * 8 + f] = ch; f++; }
    }
  }
  return board;
}

function sqColor(row, col, isLastFrom, isLastTo) {
  const light = (row + col) % 2 === 1;
  const isBlackSide = row < 4; // rangées 0-3 = côté noir en haut

  if (isLastFrom || isLastTo) {
    return isBlackSide
      ? (light ? SQ.lastB : '#8b2030')
      : (light ? SQ.lastW : '#2a52a8');
  }
  return isBlackSide
    ? (light ? SQ.bLight : SQ.bDark)
    : (light ? SQ.wLight : SQ.wDark);
}

window.renderBoard = function (fen, container, opts = {}) {
  if (!container) return;
  const { lastFrom, lastTo } = opts;
  const board = fenToArray(fen);
  const S = 56;      // taille d'une case (px dans le viewBox)
  const PAD = 16;    // espace coordonnées gauche
  const PAD_B = 16;  // espace coordonnées bas
  const W = PAD + 8 * S;
  const H = 8 * S + PAD_B;
  const files = 'abcdefgh';

  let out = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:100%">`;

  // ── Cases
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const sqName = files[col] + (8 - row);
      const isLF = sqName === lastFrom, isLT = sqName === lastTo;
      const fill = sqColor(row, col, isLF, isLT);
      const x = PAD + col * S, y = row * S;
      out += `<rect x="${x}" y="${y}" width="${S}" height="${S}" fill="${fill}"/>`;

      // ── Pièce
      const p = board[row * 8 + col];
      if (p) {
        const key = (p === p.toUpperCase() ? 'w' : 'b') + p.toUpperCase();
        const svg = PIECE_PATHS[key] || '';
        if (svg) {
          const scale = S / 45;
          out += `<g transform="translate(${x},${y}) scale(${scale})">${svg}</g>`;
        }
      }
    }
  }

  // ── Coordonnées rangs (1-8) — à gauche, couleur alternée rouge/bleu
  for (let row = 0; row < 8; row++) {
    const label = String(8 - row);
    const color = row < 4 ? '#f87171' : '#93c5fd';
    out += `<text x="4" y="${row * S + S * 0.42}" font-size="11" font-family="monospace" fill="${color}" font-weight="700" opacity="0.85">${label}</text>`;
  }

  // ── Coordonnées fichiers (a-h) — en bas
  for (let col = 0; col < 8; col++) {
    const label = files[col];
    const color = col % 2 === 0 ? '#f87171' : '#93c5fd';
    out += `<text x="${PAD + col * S + S - 12}" y="${8 * S + 13}" font-size="11" font-family="monospace" fill="${color}" font-weight="700" opacity="0.85">${label}</text>`;
  }

  out += `</svg>`;
  container.innerHTML = out;
};
