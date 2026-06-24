// stockfish-loader.js
// Un seul worker réutilisable pour toute la session
window.loadStockfish = function () {
  return new Promise((resolve, reject) => {
    try {
      const w = new Worker(
        'https://cdn.jsdelivr.net/npm/stockfish@16.0.0/src/stockfish.js'
      );
      resolve(w);
    } catch (e) {
      reject(new Error('Stockfish unavailable: ' + e.message));
    }
  });
};
