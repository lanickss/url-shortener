# Réponses — Partie 1 : prise en main

**1. Commande httpie équivalente à la requête curl POST**

```
http POST http://localhost:8080/api-v1/ url="https://perdu.com"
```

**2. Différences entre `npm run prod` et `npm run dev`**

-En dev, le serveur redémarre tout seul à chaque fois qu'on modifie un 
fichier (grâce à l'outil "nodemon"). Pratique pendant qu'on code, on 
n'a pas besoin de tout arrêter/relancer à la main. Les messages 
affichés dans le terminal sont aussi plus détaillés.

-En prod, le serveur ne redémarre pas tout seul, et les messages 
affichés sont plus courts. C'est le mode utilisé quand l'application 
est en ligne pour de vrai, pas pendant qu'on développe.

**3. Script npm pour formatter automatiquement les fichiers `.mjs`**

```
npm run format
```
ca arrange et uniforme l'ecriture du code automatiquement sans qu'on 
ait a le faire.

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
-Un "middleware" est juste une fonction qui s'exécute sur chaque 
requête avant d'arriver à la vraie route. Ici, elle ajoute un en-tête 
personnalisé dans chaque réponse pour indiquer la version de l'appli.

**6. Middleware Express pour répondre aux requêtes `favicon.ico`**

Le paquet [`serve-favicon`](https://www.npmjs.com/package/serve-favicon) :

```js
import favicon from "serve-favicon";
app.use(favicon(join(__dirname, "static", "logo_univ_16.png")));
```
Quand le navigateur demande automatiquement /favicon.ico (il le fait 
toujours, même sans qu'on lui demande), cet outil répond avec notre 
image au lieu de renvoyer une erreur.

**7. Documentation du driver SQLite utilisé**
On utilise SQLite en utilisant ces deux liens:

- https://www.npmjs.com/package/sqlite
- https://github.com/TryGhost/node-sqlite3/wiki/API

**8. Ouverture/fermeture de la connexion à la base de données**

Elle s'ouvre une seule fois, au tout début, quand le serveur démarre. 
Elle reste ouverte tout le temps que le serveur tourne (on ne la rouvre 
pas à chaque requête, ce serait trop lent). Elle se ferme seulement 
quand on arrête le serveur (par exemple en faisant Ctrl+C).

**9. Navigation privée + `Ctrl+Shift+R` : gestion du cache par Express**

Les pages qui changent tout le temps (JSON, résultats de l'API) ne sont 
jamais gardées en mémoire par le navigateur, elles sont toujours 
redemandées au serveur. Par contre, les fichiers qui ne changent pas 
souvent (images, CSS, JS) sont gardés en mémoire par le navigateur, 
mais celui-ci revérifie quand même auprès du serveur si le fichier a 
changé, avant de réutiliser sa copie. Faire Ctrl+Shift+R force le 
navigateur à tout retélécharger sans rien garder en mémoire, même ce 
qui n'a pas changé.

**10. Deux instances (8080 et 8081) : partage des liens créés**

Parce que les deux utilisent le même fichier de base de données sur le 
disque dur. Le numéro de port ne sert qu'à savoir sur quelle "porte" le 
serveur écoute les requêtes du navigateur — ça n'a rien à voir avec où 
sont stockées les données. Comme le fichier de base de données est le 
même pour les deux serveurs, ils voient forcément les mêmes liens créés.
