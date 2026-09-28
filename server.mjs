// server.mjs
// Point d'entrée de l'application : configuration d'Express, montage des
// routeurs, middlewares transverses et gestion des erreurs.

import express from "express";
import morgan from "morgan";
import favicon from "serve-favicon";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import config from "./config.mjs";
import { connectDatabase, closeDatabase } from "./database/database.mjs";
import apiV1Router from "./router/api-v1.mjs";
import apiV2Router from "./router/api-v2.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

// Ne plus exposer l'en-tête "X-Powered-By: Express"
app.disable("x-powered-by");

// Logging HTTP (niveau selon l'environnement, cf. config.mjs)
app.use(morgan(config.logLevel));

// Middleware applicatif ajoutant un en-tête X-API-version
app.use((req, res, next) => {
  res.set("X-API-version", config.apiVersion);
  next();
});

// Répond aux requêtes /favicon.ico avec le logo de l'université
app.use(favicon(join(__dirname, "static", "logo_univ_16.png")));

app.use(express.json());
app.use(express.static(join(__dirname, "static")));

app.set("view engine", "ejs");
app.set("views", join(__dirname, "views"));

// Documentation interactive Swagger UI, générée depuis static/open-api.yaml
const openApiSpec = YAML.load(join(__dirname, "static", "open-api.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use("/api-v1", apiV1Router);
app.use("/api-v2", apiV2Router);

// 404 générique pour tout le reste
app.use((req, res) => {
  res.status(404).json({ error: "Route inconnue" });
});

// Middleware de gestion d'erreurs centralisé (4 arguments obligatoires)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status ?? 500).json({ error: err.message ?? "Erreur interne" });
});

const server = await startServer();

async function startServer() {
  await connectDatabase();
  return app.listen(config.port, () => {
    console.log(
      `Serveur démarré (${config.env}) sur http://localhost:${config.port} — docs: /api-docs`
    );
  });
}

async function shutdown() {
  console.log("\nArrêt du serveur...");
  server.close();
  await closeDatabase();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

export default app;
