// stockfish-loader.js
// Charge Stockfish depuis le même domaine (fichier local) au lieu d'un CDN externe,
// pour éviter les erreurs de sécurité liées au mixed-content HTTP/HTTPS.
window.loadStockfish = function () {
  return new Promise((resolve, reject) => {
    try {
      const w = new Worker('stockfish.js');
      resolve(w);
    } catch (e) {
      reject(new Error('Stockfish unavailable: ' + e.message));
    }
  });
};
