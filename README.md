# Réducteur d'URL — TP devweb

Ce projet permet de transformer une URL longue en un lien court, un peu
comme bit.ly ou tinyurl.com. Il y a une API (qui répond en JSON) et deux
petites interfaces web pour l'utiliser sans passer par des commandes.

j'ai demander a l'ia de commenter mes fonctions pour avoir une meilleure comprehension de
ce que je fais au fur et mesure que j'avance pour ne pas etre perdu lorsque je reprends le projet 
dans le temps. Car plus on avance, plus on code et plus on ne se souvient plus de pourqui on a fait cela,
donc je me suis aide de l'ia pour commenter mes lignes de codes et me rememore ou 'en etais dans le projet.

## Ce qui a été fait

- [x] Partie 1 : réponses aux questions — tag `reponses`
- [x] Partie 2 : création et redirection de liens (API v1, en JSON) — tag `api-v1`
- [x] Partie 3 : la même API mais avec une page HTML en plus — tag `api-v2`
- [x] Partie 4 : une page web qui utilise l'API sans se recharger (AJAX) — tag `client-ajax`
- [x] Partie 5 : possibilité de supprimer un lien avec un code secret — tag `api-v2-delete`

## Comment installer le projet

D'abord installer les dépendances (les bibliothèques dont le code a besoin) :

'''
npm install
'''

Il faut aussi un fichier `.env` à la racine du projet (déjà présent, on
peut le modifier si besoin) qui contient les réglages de l'application :

'''
PORT=8080
LINK_LEN=6
DB_FILE=database/database.sqlite
DB_SCHEMA=database/database.sql
LOG_LEVEL=dev
API_VERSION=1.0.0
'''

## Comment lancer le serveur

'''
npm run dev    # pour développer (redémarre tout seul à chaque modif)
npm run prod   # pour la vraie mise en ligne
'''

La base de données (`database/database.sqlite`) se crée toute seule au
premier démarrage, pas besoin de la créer à la main.

## Voir la documentation et tester l'API

Une fois le serveur lancé, aller sur : http://localhost:8080/api-docs

C'est une page qui liste toutes les routes disponibles et permet de les
tester directement depuis le navigateur, sans taper de commande. En haut
de la page, on peut choisir entre `api-v1` et `api-v2` selon la partie
qu'on veut tester.

## Organisation des fichiers

'''
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
  open-api.yaml           décrit toutes les routes pour la doc Swagger
  client.html / app.js    la page qui utilise l'API sans recharger (AJAX)
  logo_univ_16.png        petite image utilisée comme favicon
REPONSES.md              réponses aux questions de la partie 1
'''

## Les routes principales

| Méthode | Route              | Version 1 (JSON) | Version 2 (JSON ou HTML)                     |
|---------|---------------------|-------------------|-----------------------------------------------|
| GET     | `/`                 | nombre de liens créés | pareil, ou une page avec un formulaire        |
| POST    | `/`                 | crée un lien      | pareil, ou une page qui affiche le résultat    |
| GET     | `/status/:url`      | infos sur le lien | *(remplacée par `GET /:url` en JSON)*          |
| GET     | `/:url`             | redirige vers le site d'origine | infos (JSON) ou redirection + comptage (HTML) |
| DELETE  | `/:url`             | pas disponible    | supprime le lien (il faut la clé `X-API-Key`) |
| GET     | `/error`            | provoque une erreur 500 (pour tester) | —                                |

## La page qui utilise l'API sans recharger (AJAX)

Accessible sur `http://localhost:8080/client.html`. Elle envoie les
requêtes en JSON vers `/api-v2/` sans jamais recharger la page. Il y a un
bouton « Copier l'URL » qui copie le lien directement dans le presse-papier.

## Comment tester à la main (sans navigateur)

'''
# voir combien de liens existent
http http://localhost:8080/api-v1/

# créer un lien
http POST http://localhost:8080/api-v1/ url="https://perdu.com"

# supprimer un lien (uniquement possible sur l'api-v2, avec la bonne clé)
http DELETE http://localhost:8080/api-v2/HdPWk7 X-API-Key:RatQak
'''
