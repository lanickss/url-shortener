// config.mjs
// Point unique de chargement des variables d'environnement (.env) et de
// définition des constantes de configuration utilisées dans toute l'app.
// Tous les autres fichiers importent depuis ce module plutôt que de relire
// process.env directement, pour éviter la duplication évoquée dans le sujet.

import dotenv from "dotenv";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";

export const config = {
  env: process.env.NODE_ENV ?? "development",
  isProd,
  port: Number(process.env.PORT ?? 8080),
  linkLength: Number(process.env.LINK_LEN ?? 6),
  dbFile: process.env.DB_FILE ?? "database/database.sqlite",
  dbSchema: process.env.DB_SCHEMA ?? "database/database.sql",
  // en dev on veut des logs verbeux (morgan "dev"), en prod des logs courts
  logLevel: process.env.LOG_LEVEL ?? (isProd ? "combined" : "dev"),
  apiVersion: process.env.API_VERSION ?? "1.0.0",
};

export default config;
