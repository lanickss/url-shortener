// router/api-v2.mjs
// API v2 : mêmes fonctionnalités que la v1, mais avec négociation de contenu
// (JSON ou HTML selon l'en-tête Accept) et une route DELETE authentifiée
// par clé secrète (en-tête X-API-Key).

import { Router } from "express";
import {
  countLinks,
  createLink,
  getLink,
  incrementVisit,
  deleteLink,
} from "../database/database.mjs";

const router = Router();

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

function isValidUrl(value) {
  try {
    // eslint-disable-next-line no-new
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/** Représentation publique d'un lien : on ne renvoie JAMAIS le secret. */
function toPublicLink(link) {
  return {
    short_url: link.short_url,
    origin_url: link.origin_url,
    created_at: link.created_at,
    visits: link.visits,
  };
}

// GET /api-v2/ : nombre de liens (JSON) ou page d'accueil avec formulaire (HTML)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const count = await countLinks();

    res.format({
      "application/json": () => res.json({ count }),
      "text/html": () =>
        res.render("root", { count, origin: `${req.protocol}://${req.get("host")}` }),
    });
  })
);

// POST /api-v2/ : crée un lien réduit
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { url } = req.body ?? {};

    if (!url || typeof url !== "string" || !isValidUrl(url)) {
      const message = "URL manquante ou invalide";
      return res.status(400).format({
        "application/json": () => res.json({ error: message }),
        "text/html": async () => {
          const count = await countLinks();
          res.render("root", {
            count,
            error: message,
            submittedUrl: url ?? "",
            origin: `${req.protocol}://${req.get("host")}`,
          });
        },
      });
    }

    const link = await createLink(url);
    const count = await countLinks();

    res.status(201).format({
      "application/json": () => res.json(toPublicLink(link)),
      "text/html": () =>
        res.render("root", { count, link, origin: `${req.protocol}://${req.get("host")}` }),
    });
  })
);

// GET /api-v2/:url : infos JSON du lien, ou redirection + comptage en HTML
router.get(
  "/:url",
  asyncHandler(async (req, res) => {
    const link = await getLink(req.params.url);

    if (!link) {
      return res.status(404).format({
        "application/json": () => res.json({ error: "Lien inconnu" }),
        "text/html": () => res.type("html").send("<h1>404 — Lien inconnu</h1>"),
      });
    }

    res.format({
      "application/json": () => res.json(toPublicLink(link)),
      "text/html": async () => {
        await incrementVisit(link.short_url);
        res.redirect(302, link.origin_url);
      },
    });
  })
);

// DELETE /api-v2/:url : supprime un lien si la clé secrète correspond
router.delete(
  "/:url",
  asyncHandler(async (req, res) => {
    const link = await getLink(req.params.url);

    if (!link) {
      return res.status(404).json({ error: "Lien inconnu" });
    }

    const apiKey = req.get("X-API-Key");

    if (!apiKey) {
      return res.status(401).json({ error: "En-tête X-API-Key manquante" });
    }

    if (apiKey !== link.secret) {
      return res.status(403).json({ error: "Clé secrète invalide" });
    }

    await deleteLink(link.short_url);
    res.status(200).json({ message: "Lien supprimé" });
  })
);

export default router;
