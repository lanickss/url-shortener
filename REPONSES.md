# Réponses — Partie 1 : prise en main

**1. Commande httpie équivalente à la requête curl POST**

```
http POST http://localhost:8080/api-v1/ url="https://perdu.com"
```

**2. Différences entre `npm run prod` et `npm run dev`**

- `npm run dev` lance `nodemon` avec `NODE_ENV=development` : le serveur
  redémarre automatiquement à chaque modification de fichier, les logs HTTP
  (morgan) sont détaillés (format `dev`, coloré, avec le temps de réponse),
  et les erreurs peuvent être renvoyées avec plus de détails/stack trace.
- `npm run prod` lance directement `node` avec `NODE_ENV=production` : pas de
  rechargement automatique, des logs plus compacts (format `combined`), et
  Express active en interne des optimisations (cache des vues compilées,
  minification légère) liées à `NODE_ENV=production`.

**3. Script npm pour formatter automatiquement les fichiers `.mjs`**

```
npm run format
```
qui exécute `prettier --write "**/*.mjs"` (voir `package.json`).

**4. Configuration Express pour supprimer l'en-tête `X-Powered-By`**

```js
app.disable("x-powered-by");
```
(placé dans `server.mjs`, juste après `const app = express();`).

**5. Middleware ajoutant un en-tête `X-API-version`**

```js
app.use((req, res, next) => {
  res.set("X-API-version", config.apiVersion);
  next();
});
```
La version est lue depuis `config.mjs` (variable d'environnement
`API_VERSION`), pour éviter de la coder en dur.

**6. Middleware Express pour répondre aux requêtes `favicon.ico`**

Le paquet [`serve-favicon`](https://www.npmjs.com/package/serve-favicon) :

```js
import favicon from "serve-favicon";
app.use(favicon(join(__dirname, "static", "logo_univ_16.png")));
```
Il doit être monté tôt dans la chaîne de middlewares (avant les routes) et
répond directement aux requêtes `GET /favicon.ico` avec le fichier donné,
en gérant lui-même la mise en cache (en-têtes `ETag`/`Cache-Control`).

**7. Documentation du driver SQLite utilisé**

Le projet utilise le paquet [`sqlite`](https://github.com/kriasoft/node-sqlite)
(wrapper Promise/async au-dessus de [`sqlite3`](https://github.com/TryGhost/node-sqlite3)) :

- https://www.npmjs.com/package/sqlite
- https://github.com/TryGhost/node-sqlite3/wiki/API

**8. Ouverture/fermeture de la connexion à la base de données**

La connexion est ouverte **une seule fois**, au démarrage du serveur, dans
`connectDatabase()` (`database/database.mjs`), appelée depuis `server.mjs`
avant `app.listen()`. Elle est ensuite réutilisée pour toutes les requêtes
HTTP pendant toute la durée de vie du processus (pas de coût d'ouverture à
chaque requête). Elle est fermée proprement dans `closeDatabase()`, appelée
sur réception des signaux `SIGINT` (Ctrl+C) ou `SIGTERM`, pour éviter de
corrompre le fichier `.sqlite` en cas d'arrêt brutal.

**9. Navigation privée + `Ctrl+Shift+R` : gestion du cache par Express**

Par défaut, `express.static` (et les réponses JSON de nos routes) n'envoie
pas d'en-têtes de cache agressifs pour du contenu dynamique : chaque visite
recharge la page. En revanche, pour les fichiers statiques (CSS, JS, images
servis par `express.static`), Express ajoute par défaut un en-tête
`Cache-Control: public, max-age=0` avec des en-têtes `ETag`/`Last-Modified` :
le navigateur revalide donc le fichier (requête conditionnelle) plutôt que
de le recharger entièrement à chaque visite. Un rechargement forcé avec
`Ctrl+Shift+R` ("hard reload") ignore complètement le cache local et
force le navigateur à re-télécharger tous les fichiers, contournant même la
revalidation conditionnelle. Conclusion : Express ne met pas en cache les
réponses dynamiques (API), mais laisse le navigateur gérer le cache des
fichiers statiques via des en-têtes de validation plutôt qu'un cache "dur".

**10. Deux instances (8080 et 8081) : partage des liens créés**

Les liens créés sur l'instance `8080` sont visibles depuis l'instance
`8081` car **les deux processus utilisent le même fichier SQLite**
(`database/database.sqlite`, défini par la variable d'environnement
`DB_FILE`, identique dans les deux cas). Le port HTTP n'a aucun rapport
avec la base de données : ce sont deux serveurs Express distincts qui
pointent vers la même source de données persistante sur disque. Si l'on
voulait les isoler, il faudrait leur donner des fichiers `DB_FILE`
différents (ex: `DB_FILE=database/db-8081.sqlite`).
