// engine.js
// Moteur d'analyse : un seul worker Stockfish qui évalue toutes les positions
// en séquence → rapide, pas de spawning massif de workers.

// ─── Qualité des coups ────────────────────────────────────────────────────
// Delta = évolution du score du point de vue du joueur qui vient de jouer.
// Un delta négatif = le coup a perdu de l'avantage.
const QUALITY = [
  { key: 'brilliant',  label: '!!', color: '#21b7a8', minDelta:  0.15 },
  { key: 'best',       label: '',   color: '#96cc45', minDelta: -0.10 },
  { key: 'good',       label: '⩲',  color: '#96cc45', minDelta: -0.50 },
  { key: 'inaccuracy', label: '?!', color: '#f4bf42', minDelta: -1.50 },
  { key: 'mistake',    label: '?',  color: '#e88c2a', minDelta: -3.00 },
  { key: 'blunder',    label: '??', color: '#e84040', minDelta: -Infinity },
];
window.QUALITY = QUALITY;

function classifyMove(sb, sa, isWhite) {
  // tout ramener au point de vue du joueur qui joue
  const before = isWhite ?  sb : -sb;
  const after  = isWhite ?  sa : -sa;
  const delta  = after - before;
  for (const q of QUALITY) {
    if (delta >= q.minDelta) return q;
  }
  return QUALITY[QUALITY.length - 1];
}

// ─── Parse PGN via chess.js ────────────────────────────────────────────────
function parsePGN(pgn) {
  const headers = {};
  const hrx = /\[(\w+)\s+"([^"]*)"\]/g;
  let m;
  while ((m = hrx.exec(pgn)) !== null) headers[m[1]] = m[2];

  const chess = new Chess();
  const clean = pgn
    .replace(/\{[^}]*\}/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\$\d+/g, '');
  if (!chess.load_pgn(clean)) throw new Error('PGN invalide — vérifiez le format.');

  const history = chess.history({ verbose: true });
  if (!history.length) throw new Error('Aucun coup trouvé dans ce PGN.');

  const c2 = new Chess();
  const fens = [c2.fen()];
  const moves = []; // { san, from, to }
  for (const mv of history) {
    c2.move(mv.san);
    fens.push(c2.fen());
    moves.push({ san: mv.san, from: mv.from, to: mv.to });
  }
  return { headers, moves, fens };
}

// ─── Évaluation de toutes les positions en une seule passe ────────────────
// Un seul worker Stockfish, positions envoyées en séquence.
// FIX: on capture le score de CHAQUE ligne "info ... score ..." reçue
// (peu importe si "depth" matche exactement la profondeur cible), et on
// garde la dernière valeur vue juste avant "bestmove". C'est la correction
// du bug qui faisait que curScore restait bloqué à 0.
function evalAllFens(fens, depth, onProgress) {
  return new Promise(async (resolve, reject) => {
    let sf;
    try { sf = await loadStockfish(); } catch (e) { return reject(e); }

    const scores = new Array(fens.length).fill(0);
    let idx = 0;
    let curScore = 0;
    let gotScore = false;
    let waiting = false;

    const timeout = setTimeout(() => {
      sf.terminate();
      resolve(scores);
    }, 600000); // 10 min max pour les longues parties

    function sendNext() {
      if (idx >= fens.length) {
        clearTimeout(timeout);
        sf.terminate();
        return resolve(scores);
      }
      waiting = true;
      curScore = 0;
      gotScore = false;
      // Le FEN contient l'info "qui joue" (w ou b) — Stockfish donne
      // toujours le score du point de vue du joueur au trait.
      sf.postMessage('position fen ' + fens[idx]);
      sf.postMessage('go depth ' + depth);
    }

    sf.onmessage = e => {
      const line = typeof e === 'string' ? e : e.data;

      if (line === 'uciok') {
        sf.postMessage('setoption name Hash value 64');
        sf.postMessage('isready');
        return;
      }
      if (line === 'readyok') {
        sendNext();
        return;
      }

      if (!waiting) return;

      // Capturer le score dès qu'une ligne "info ... score ..." arrive,
      // SANS exiger que "depth" matche exactement — Stockfish envoie des
      // mises à jour progressives et la dernière avant bestmove est la bonne.
      if (line.startsWith('info') && line.includes(' score ')) {
        const sm = line.match(/score (cp|mate) (-?\d+)/);
        if (sm) {
          const sideToMoveScore = sm[1] === 'mate'
            ? (parseInt(sm[2]) > 0 ? 999 : -999)
            : parseInt(sm[2]) / 100;

          // IMPORTANT : Stockfish donne le score du point de vue du joueur
          // AU TRAIT dans la position envoyée. Il faut le convertir en score
          // "absolu" du point de vue des BLANCS pour que tout le reste du
          // pipeline (classification, graphique, barre) soit cohérent.
          const fen = fens[idx];
          const sideToMove = fen.split(' ')[1]; // 'w' ou 'b'
          curScore = sideToMove === 'w' ? sideToMoveScore : -sideToMoveScore;
          gotScore = true;
        }
      }

      if (line.startsWith('bestmove')) {
        scores[idx] = gotScore ? curScore : (idx > 0 ? scores[idx - 1] : 0);
        if (onProgress) onProgress(idx, fens.length - 1);
        idx++;
        waiting = false;
        sendNext();
      }
    };

    sf.onerror = () => {
      clearTimeout(timeout);
      sf.terminate();
      resolve(scores);
    };

    sf.postMessage('uci');
  });
}

// ─── Entrée publique ───────────────────────────────────────────────────────
window.analyzeGame = async function (pgn, depth, onProgress) {
  const { headers, moves, fens } = parsePGN(pgn);

  // scores[i] = évaluation absolue (point de vue des BLANCS) de la position fens[i]
  const scores = await evalAllFens(fens, depth, onProgress);

  const results = [];
  for (let i = 0; i < moves.length; i++) {
    const isWhite = fens[i].split(' ')[1] === 'w';
    const sb = scores[i];
    const sa = scores[i + 1] ?? scores[i];
    const quality = classifyMove(sb, sa, isWhite);
    const delta = isWhite ? (sa - sb) : (sb - sa);

    results.push({
      san:       moves[i].san,
      from:      moves[i].from,
      to:        moves[i].to,
      isWhite,
      scoreBefore: sb,
      scoreAfter:  sa,
      delta,
      quality,
      moveNum:  Math.ceil((i + 1) / 2),
      halfIdx:  i,
      fenBefore: fens[i],
      fenAfter:  fens[i + 1],
    });
  }

  return { headers, results, scores, fens };
};

// ─── Précision (0-100) ────────────────────────────────────────────────────
window.calcAccuracy = function (results, color) {
  const moves = results.filter(r => (color === 'white') === r.isWhite);
  if (!moves.length) return 100;
  const totalPen = moves.reduce((s, r) => {
    const loss = Math.max(0, -r.delta);
    return s + Math.min(loss, 6);
  }, 0);
  return Math.max(0, Math.round(100 - (totalPen / moves.length) * 18));
};
