# ChessEval — Instructions de déploiement

## ⚠️ ÉTAPE OBLIGATOIRE avant upload : télécharger Stockfish

Pour des raisons de sécurité (HTTP/HTTPS mixte sur EOHost), Stockfish doit être
hébergé directement sur ton serveur plutôt que sur un CDN externe.

### 1. Télécharge ces 2 fichiers depuis ton navigateur (clic droit → Enregistrer la cible sous) :

- https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.wasm.js
- https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.wasm

### 2. Renomme-les :

| Fichier téléchargé        | Renommer en      |
|----------------------------|-------------------|
| stockfish.wasm.js          | stockfish.js      |
| stockfish.wasm             | stockfish.wasm    |

### 3. Place ces 2 fichiers renommés dans le même dossier que les autres
(`chessanalyzer/`, à côté de `index.html`, `engine.js`, etc.)

---

## Fichiers de ce ZIP

| Fichier                  | Rôle                                                          |
|---------------------------|----------------------------------------------------------------|
| `index.html`               | Structure de la page                                          |
| `style.css`                | Design (dark, bleu/rouge)                                     |
| `app.js`                   | Logique UI : affichage, navigation, tableau de coups          |
| `board.js`                 | Rendu de l'échiquier en SVG                                    |
| `engine.js`                | **Corrigé** : évaluation Stockfish + classification des coups |
| `stockfish-loader.js`      | **Modifié** : charge `stockfish.js` en local (plus de CDN)     |

## Upload final sur EOHost

Le dossier `chessanalyzer/` doit contenir **8 fichiers** au total :
1. `index.html`
2. `style.css`
3. `app.js`
4. `board.js`
5. `engine.js`
6. `stockfish-loader.js`
7. `stockfish.js`       ← téléchargé à l'étape 1 (renommé)
8. `stockfish.wasm`     ← téléchargé à l'étape 1 (renommé)

## Après upload

Recharge la page avec **Ctrl+F5** (rechargement forcé, vide le cache du navigateur)
sur `http://marty.atwebpages.com/chessanalyzer/`

## En cas de nouvelle erreur

Ouvre la console développeur (**F12 → Console**) et regarde le message d'erreur
exact — il indique généralement quel fichier ne charge pas correctement.
