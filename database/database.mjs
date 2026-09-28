// database/database.mjs
// Couche d'accès aux données : ouverture de la connexion SQLite au démarrage
// du serveur, fermeture propre à l'arrêt, et fonctions CRUD utilisées par
// les routeurs api-v1 et api-v2.

import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { nanoid } from "nanoid";
import config from "../config.mjs";

let db = null;

/**
 * Ouvre (une seule fois) la connexion à la base SQLite et applique le schéma
 * si la base n'existe pas encore. Appelée une fois au démarrage de server.mjs.
 * La connexion reste ouverte pendant toute la durée de vie du processus.
 */
export async function connectDatabase() {
  if (db) return db;

  const dir = dirname(config.dbFile);
  if (dir && !existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  db = await open({
    filename: config.dbFile,
    driver: sqlite3.Database,
  });

  const schema = readFileSync(config.dbSchema, "utf-8");
  await db.exec(schema);

  return db;
}

/** Ferme proprement la connexion (appelée sur SIGINT/SIGTERM). */
export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
}

function getDb() {
  if (!db) {
    throw new Error(
      "La base de données n'est pas initialisée. Appelez connectDatabase() avant."
    );
  }
  return db;
}

/** Nombre total de liens créés. */
export async function countLinks() {
  const row = await getDb().get("SELECT COUNT(*) AS count FROM links");
  return row.count;
}

/**
 * Crée un nouveau lien raccourci pour originUrl.
 * Génère un code court unique et un secret aléatoire.
 * Retourne l'enregistrement créé.
 */
export async function createLink(originUrl) {
  const database = getDb();
  let shortUrl;

  // on s'assure de ne pas écraser un code existant (collision très rare)
  do {
    shortUrl = nanoid(config.linkLength);
    // eslint-disable-next-line no-await-in-loop
  } while (await database.get("SELECT 1 FROM links WHERE short_url = ?", shortUrl));

  const secret = nanoid(12);

  await database.run(
    "INSERT INTO links (short_url, origin_url, secret) VALUES (?, ?, ?)",
    shortUrl,
    originUrl,
    secret
  );

  return getLink(shortUrl);
}

/** Renvoie l'enregistrement complet (avec secret) d'un lien, ou undefined. */
export async function getLink(shortUrl) {
  return getDb().get("SELECT * FROM links WHERE short_url = ?", shortUrl);
}

/** Incrémente le compteur de visites d'un lien. */
export async function incrementVisit(shortUrl) {
  await getDb().run(
    "UPDATE links SET visits = visits + 1 WHERE short_url = ?",
    shortUrl
  );
}

/** Supprime un lien. Retourne true si une ligne a été supprimée. */
export async function deleteLink(shortUrl) {
  const result = await getDb().run(
    "DELETE FROM links WHERE short_url = ?",
    shortUrl
  );
  return result.changes > 0;
}
