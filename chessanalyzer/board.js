// board.js — Rendu échiquier DOM pur (optimisé pour les animations CSS)

// ─── Pièces SVG (paths cburnett) ────────────────────────
const PIECE_PATHS = {
  wP: `<g fill="#fff" stroke="#000" stroke-width="1.5" stroke-linejoin="round"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03L17.5 28h10l-.91-2C28.06 24.84 29 23.03 29 21c0-2.41-1.33-4.5-3.28-5.62A4 4 0 0 0 26.5 13c0-2.21-1.79-4-4-4z"/><path d="M11.5 37c5.56 3.07 15.44 3.07 21 0v-7s3-4.5-.5-6.5c-4-.5-10-.5-14-.5s-10 0-14 .5c-3.5 2-.5 6.5-.5 6.5v7z"/></g>`,
  wR: `<g fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zm3-3v-4h21v4H12zm-1-22V9h4v2h5V9h5v2h5V9h4v5"/><path d="M34 14l-3 3H14l-3-3"/><path d="M31 17v12.5H14V17" stroke-linejoin="miter"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/><path d="M11 14h23" fill="none"/></g>`,
  wN: `<g fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path d="M24 18c.38 5.1-5.55 8.45-8 6-3-2.5 4-12 4-12"/><circle cx="9.5" cy="25.5" r=".5" fill="#000"/><path d="M14.933 15.75c.313 4.896-5.521 8.042-7.933 5.75-3-2.5 4-12 4-12" fill="none"/></g>`,
  wB: `<g fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="none" stroke-linecap="butt"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/></g><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/><path d="M17.5 26h10M15 30h15M22.5 15.5v5M20 18h5" fill="none" stroke="#000" stroke-width="1.5"/></g>`,
  wQ: `<g fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="12" r="2.75"/><circle cx="14" cy="9" r="2.75"/><circle cx="22.5" cy="8" r="2.75"/><circle cx="31" cy="9" r="2.75"/><circle cx="39" cy="12" r="2.75"/><path d="M9 26c8.5-8.5 15.5-10.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26z" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c4-1.5 17-1.5 21 0" fill="none"/></g>`,
  wK: `<g fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5" stroke-linejoin="miter"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V17s-5.5-9.5-12-4c-3 3-.5 9 3.5 12.5L11.5 37z"/><path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0" fill="none"/></g>`,
  bP: `<g fill="#000" stroke="#000" stroke-width="1.5" stroke-linejoin="round"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03L17.5 28h10l-.91-2C28.06 24.84 29 23.03 29 21c0-2.41-1.33-4.5-3.28-5.62A4 4 0 0 0 26.5 13c0-2.21-1.79-4-4-4z" stroke="#aaa" stroke-width="1"/><path d="M11.5 37c5.56 3.07 15.44 3.07 21 0v-7s3-4.5-.5-6.5c-4-.5-10-.5-14-.5s-10 0-14 .5c-3.5 2-.5 6.5-.5 6.5v7z" stroke="#aaa" stroke-width="1"/></g>`,
  bR: `<g fill="#000" stroke="#aaa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zm3-3v-4h21v4H12zm-1-22V9h4v2h5V9h5v2h5V9h4v5"/><path d="M34 14l-3 3H14l-3-3"/><path d="M31 17v12.5H14V17" stroke="#aaa" stroke-linejoin="miter"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/><path d="M11 14h23" fill="none"/></g>`,
  bN: `<g fill="#000" stroke="#aaa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path d="M24 18c.38 5.1-5.55 8.45-8 6-3-2.5 4-12 4-12"/><circle cx="9.5" cy="25.5" r=".5" fill="#aaa"/><path d="M14.933 15.75c.313 4.896-5.521 8.042-7.933 5.75-3-2.5 4-12 4-12" fill="none"/></g>`,
  bB: `<g fill="#000" stroke="#aaa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="none" stroke-linecap="butt"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/></g><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/><path d="M17.5 26h10M15 30h15M22.5 15.5v5M20 18h5" fill="none" stroke="#aaa" stroke-width="1.5"/></g>`,
  bQ: `<g fill="#000" stroke="#aaa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="12" r="2.75"/><circle cx="14" cy="9" r="2.75"/><circle cx="22.5" cy="8" r="2.75"/><circle cx="31" cy="9" r="2.75"/><circle cx="39" cy="12" r="2.75"/><path d="M9 26c8.5-8.5 15.5-10.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26z" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c4-1.5 17-1.5 21 0" fill="none"/></g>`,
  bK: `<g fill="#000" stroke="#aaa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5" stroke="#aaa" stroke-linejoin="miter"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V17s-5.5-9.5-12-4c-3 3-.5 9 3.5 12.5L11.5 37z"/><path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0" fill="none"/></g>`,
};

// Pré-génération des Data URIs pour les utiliser en background-image
const PIECE_URLS = {};
for (const [key, pathData] of Object.entries(PIECE_PATHS)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">${pathData}</svg>`;
  PIECE_URLS[key] = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Convertit le code FEN en un tableau de 64 cases
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

// Fonction principale de rendu
window.renderBoard = function (fen, container, opts = {}) {
  if (!container) return;
  const { lastFrom, lastTo } = opts;
  const board = fenToArray(fen);
  const files = 'abcdefgh';

  // 1. Initialisation de la grille (ne se fait qu'une seule fois)
  if (!container.querySelector('.square')) {
    container.innerHTML = ''; // Nettoyer
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isLight = (row + col) % 2 === 0;
        const sqDiv = document.createElement('div');
        sqDiv.className = `square ${isLight ? 'light' : 'dark'}`;
        sqDiv.id = `sq-${files[col]}${8 - row}`;

        // Ajout des coordonnées sur les bords (comme Lichess/Chess.com)
        if (col === 0) {
          const rankLabel = document.createElement('div');
          rankLabel.className = 'coord coord-rank';
          rankLabel.textContent = 8 - row;
          sqDiv.appendChild(rankLabel);
        }
        if (row === 7) {
          const fileLabel = document.createElement('div');
          fileLabel.className = 'coord coord-file';
          fileLabel.textContent = files[col];
          sqDiv.appendChild(fileLabel);
        }

        container.appendChild(sqDiv);
      }
    }
  }

  // 2. Gestion de la mise en évidence des cases (dernier coup joué)
  container.querySelectorAll('.square.highlight').forEach(el => el.classList.remove('highlight'));
  if (lastFrom) document.getElementById(`sq-${lastFrom}`)?.classList.add('highlight');
  if (lastTo) document.getElementById(`sq-${lastTo}`)?.classList.add('highlight');

  // 3. Rendu des pièces dynamiques (optimisé pour transform CSS)
  // Dans une version plus poussée, on ferait un diff pour garder les éléments existants,
  // mais pour cette approche simple, on recrée les divs de pièces.
  container.querySelectorAll('.piece').forEach(el => el.remove());

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const p = board[row * 8 + col];
      if (p) {
        const key = (p === p.toUpperCase() ? 'w' : 'b') + p.toUpperCase();
        const pieceDiv = document.createElement('div');
        pieceDiv.className = `piece`;
        pieceDiv.style.backgroundImage = `url("${PIECE_URLS[key]}")`;

        // Placement via CSS transform pour des performances optimales (déplacement sur le GPU)
        // 100% fait référence à la propre largeur de la pièce (qui est de 12.5% du plateau)
        pieceDiv.style.transform = `translate(${col * 100}%, ${row * 100}%)`;

        container.appendChild(pieceDiv);
      }
    }
  }
};