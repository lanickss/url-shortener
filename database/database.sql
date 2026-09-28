-- Schéma de la base de données du réducteur d'URL
CREATE TABLE IF NOT EXISTS links (
  short_url  TEXT PRIMARY KEY,       -- code court généré (ex: WmFJQp)
  origin_url TEXT NOT NULL,          -- URL longue d'origine
  secret     TEXT NOT NULL,          -- clé secrète pour autoriser la suppression
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  visits     INTEGER NOT NULL DEFAULT 0
);
