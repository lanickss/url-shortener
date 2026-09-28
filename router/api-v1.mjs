// router/api-v1.mjs
// API v1 : répond uniquement en JSON, pas de négociation de contenu.

import { Router } from "express";
import {
  countLinks,
  createLink,
  getLink,
  incrementVisit,
} from "../database/database.mjs";

const router = Router();

/** Petit wrapper pour éviter les try/catch répétés avec async/await. */
const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

/** Vérifie qu'une chaîne est une URL absolue syntaxiquement valide. */
function isValidUrl(value) {
  try {
    // eslint-disable-next-line no-new
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function toPublicLink(link) {
  return {
    short_url: link.short_url,
    origin_url: link.origin_url,
    created_at: link.created_at,
    visits: link.visits,
  };
}

// GET /api-v1/ : nombre de liens déjà créés
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const count = await countLinks();
    res.json({ count });
  })
);

// POST /api-v1/ : crée un lien réduit à partir d'une URL longue
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { url } = req.body ?? {};

    if (!url || typeof url !== "string" || !isValidUrl(url)) {
      return res.status(400).json({ error: "URL manquante ou invalide" });
    }

    const link = await createLink(url);
    res.status(201).json(toPublicLink(link));
  })
);

// GET /api-v1/status/:url : état d'un lien
router.get(
  "/status/:url",
  asyncHandler(async (req, res) => {
    const link = await getLink(req.params.url);

    if (!link) {
      return res.status(404).json({ error: "Lien inconnu" });
    }

    res.json(toPublicLink(link));
  })
);

// GET /api-v1/error : route de test, génère toujours une erreur 500
router.get(
  "/error",
  asyncHandler(async () => {
    throw new Error("Erreur de test provoquée volontairement");
  })
);

// GET /api-v1/:url : redirige vers l'URL d'origine (ne répond pas de JSON)
// Placée en dernier pour ne pas capter /status/:url ou /error avant eux.
router.get(
  "/:url",
  asyncHandler(async (req, res) => {
    const link = await getLink(req.params.url);

    if (!link) {
      return res.status(404).json({ error: "Lien inconnu" });
    }

    await incrementVisit(link.short_url);
    res.redirect(302, link.origin_url);
  })
);

export default router;
