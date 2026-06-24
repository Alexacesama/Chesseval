# ♟️ ChessEval

**Analysez vos parties d'échecs coup par coup, directement dans le navigateur.**

ChessEval importe une partie au format PGN et l'analyse avec le moteur **Stockfish**, affiché sur un échiquier interactif avec une barre d'évaluation verticale et un tableau de coups détaillé — dans le même esprit que les outils d'analyse de lichess.org, en 100% local : aucun serveur, aucune API, aucune donnée envoyée nulle part.

![Stockfish](https://img.shields.io/badge/Stockfish-WASM-blue) ![No Backend](https://img.shields.io/badge/Backend-None-red) ![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

## ✨ Fonctionnalités

- 📋 **Import PGN** — glisser-déposer un fichier `.pgn` ou coller directement le texte
- ♞ **Échiquier SVG** — pièces vectorielles, dernier coup surligné, coordonnées
- 📊 **Barre d'évaluation verticale** — bascule en temps réel selon la position
- 📈 **Courbe d'évaluation** — visualise les retournements de la partie, cliquable pour naviguer
- 🏷️ **Classification des coups** — Brillant `!!`, Bon, Imprécision `?!`, Erreur `?`, Gaffe `??`
- 📑 **Tableau de coups en paires** — format Blanc / Noir avec score à chaque demi-coup
- 🎯 **Précision moyenne** — calculée pour chaque joueur
- ⌨️ **Navigation clavier** — flèches ← → pour parcourir la partie
- 🎚️ **Profondeur réglable** — rapide (12), standard (16), profond (20)

---

## 🚀 Démo

Ouvre simplement `index.html` dans un navigateur — aucune installation requise.

👉 **[Voir en ligne](http://marty.atwebpages.com/chessanalyzer/)**

---

## 🛠️ Stack technique

| Composant       | Rôle                                              |
|------------------|----------------------------------------------------|
| `index.html`     | Structure de la page                               |
| `style.css`      | Design (thème sombre, accents bleu/rouge)          |
| `app.js`         | Logique d'interface : navigation, rendu, filtres   |
| `engine.js`      | Parsing PGN + pilotage de Stockfish                |
| `board.js`       | Rendu de l'échiquier en SVG                        |
| `stockfish-loader.js` | Chargement du moteur Stockfish (Web Worker)   |
| `stockfish.js` / `stockfish.wasm` | Moteur Stockfish compilé en WebAssembly |

Aucune dépendance backend : tout s'exécute côté client, dans un **Web Worker**, via **chess.js** pour la logique des règles et **Stockfish WASM** pour l'analyse.

---

## 📦 Installation

```bash
git clone https://github.com/Alexacesama/Chesseval.git
cd Chesseval
```

Ouvre `index.html` dans ton navigateur, ou héberge le dossier sur n'importe quel serveur web statique (Apache, Nginx, GitHub Pages, EOHost...).

> **Note :** Stockfish doit être servi depuis le même domaine que le site (voir `stockfish-loader.js`) pour éviter les erreurs de contenu mixte HTTP/HTTPS sur certains hébergeurs.

---

## 🎮 Utilisation

1. Glisse un fichier `.pgn` ou colle le texte d'une partie
2. Choisis la profondeur d'analyse Stockfish
3. Clique sur **Lancer l'analyse**
4. Navigue dans la partie avec les flèches, le tableau de coups, ou en cliquant sur la courbe d'évaluation

---

## 📐 Comment la qualité des coups est calculée

Chaque position est évaluée par Stockfish avant et après le coup joué. La variation du score (`delta`), ramenée du point de vue du joueur qui vient de jouer, détermine la classification :

| Badge | Catégorie     | Delta             |
|-------|----------------|--------------------|
| `!!`  | Brillant       | ≥ +0.15            |
| —     | Meilleur coup  | ≥ -0.10             |
| `⩲`   | Bon            | ≥ -0.50             |
| `?!`  | Imprécision    | ≥ -1.50             |
| `?`   | Erreur         | ≥ -3.00             |
| `??`  | Gaffe          | < -3.00              |

---

## 📄 Licence

Ce projet utilise le moteur [Stockfish](https://stockfishchess.org/) (GPL-3.0) et [chess.js](https://github.com/jhlywa/chess.js) (BSD-2-Clause) via CDN/fichiers locaux.

Le code de l'interface (`app.js`, `board.js`, `engine.js`, `style.css`, `index.html`) est distribué sous licence MIT — libre d'utilisation, de modification et de redistribution.

---

<p align="center">Fait avec ♟️ par <strong>Alexandre Marty</strong> — IUT Blagnac, R&T</p>
