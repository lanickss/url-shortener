# devweb — Réducteur d'URL (Node.js / Express)

Service de réduction d'URL (type bit.ly / tinyurl.com) : API REST + client
serveur (EJS) + client AJAX (SPA).

## État d'avancement

- [x] Partie 1 — prise en main (voir `REPONSES.md`) — tag `reponses`
- [x] Partie 2 — API v1 complète (JSON) — tag `api-v1`
- [x] Partie 3 — négociation de contenu + rendu HTML (EJS) — tag `api-v2`
- [x] Partie 4 — client AJAX (SPA) sur l'API v2 — tag `client-ajax`
- [x] Partie 5 — suppression authentifiée par clé secrète — tag `api-v2-delete`

## Installation

```bash
npm install
```

Créer un fichier `.env` à la racine (déjà fourni, à adapter si besoin) :

```
PORT=8080
LINK_LEN=6
DB_FILE=database/database.sqlite
DB_SCHEMA=database/database.sql
LOG_LEVEL=dev
API_VERSION=1.0.0
```

## Lancement

```bash
npm run dev    # développement (rechargement automatique, logs détaillés)
npm run prod   # production
```

La base `database/database.sqlite` est créée automatiquement au premier
démarrage à partir du schéma `database/database.sql`.

## Documentation interactive

Une fois le serveur démarré : http://localhost:8080/api-docs

Elle permet de choisir le serveur (`api-v1` ou `api-v2`) en haut de la page
et de tester toutes les routes directement depuis le navigateur.

## Structure du projet

```
server.mjs              point d'entrée Express
config.mjs              configuration centralisée (.env)
database/
  database.sql          schéma SQLite
  database.mjs          accès aux données (CRUD, ouverture/fermeture)
router/
  api-v1.mjs             API v1 — JSON uniquement
  api-v2.mjs             API v2 — négociation JSON/HTML + DELETE authentifiée
views/
  root.ejs               page HTML (formulaire + résultat) pour l'API v2
static/
  open-api.yaml           spécification Swagger/OpenAPI
  client.html / app.js    client AJAX (SPA) consommant l'API v2 en JSON
  logo_univ_16.png        favicon
REPONSES.md              réponses aux questions de la partie 1
```

## Routes principales

| Méthode | Route              | v1 (JSON) | v2 (JSON ou HTML)                          |
|---------|---------------------|-----------|---------------------------------------------|
| GET     | `/`                 | nb liens  | nb liens (JSON) / formulaire (HTML)         |
| POST    | `/`                 | crée lien | crée lien, réponse adaptée                  |
| GET     | `/status/:url`      | infos lien | *(supprimée, remplacée par `GET /:url` JSON)* |
| GET     | `/:url`             | redirige  | infos (JSON) / redirige + compte (HTML)     |
| DELETE  | `/:url`             | —         | supprime le lien (clé `X-API-Key` requise)  |
| GET     | `/error`            | erreur 500 | —                                            |

## Client AJAX

Servi statiquement à `http://localhost:8080/client.html`. Utilise `fetch`
pour dialoguer en JSON avec `/api-v2/`. Un bouton « Copier l'URL » utilise
`navigator.clipboard.writeText()`.

## Tests manuels

```bash
# compter les liens
http http://localhost:8080/api-v1/

# créer un lien
http POST http://localhost:8080/api-v1/ url="https://perdu.com"

# supprimer un lien (api-v2 uniquement)
http DELETE http://localhost:8080/api-v2/HdPWk7 X-API-Key:RatQak
```
