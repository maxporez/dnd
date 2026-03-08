-- ============================================================
-- D&D Grimoire - Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- GAME DATA (partagé, données SRD + homebrew)
-- Pattern: colonnes indexées + JSONB pour le reste
-- ============================================================

CREATE TABLE IF NOT EXISTS races (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  source      text NOT NULL DEFAULT 'SRD',
  is_homebrew boolean NOT NULL DEFAULT false,
  data        jsonb NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS classes (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  source      text NOT NULL DEFAULT 'SRD',
  is_homebrew boolean NOT NULL DEFAULT false,
  data        jsonb NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS spells (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  level       integer NOT NULL DEFAULT 0,
  school      text,
  source      text NOT NULL DEFAULT 'SRD',
  is_homebrew boolean NOT NULL DEFAULT false,
  data        jsonb NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS items (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  category    text,
  rarity      text,
  source      text NOT NULL DEFAULT 'SRD',
  is_homebrew boolean NOT NULL DEFAULT false,
  data        jsonb NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS backgrounds (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  source      text NOT NULL DEFAULT 'SRD',
  is_homebrew boolean NOT NULL DEFAULT false,
  data        jsonb NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feats (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  source      text NOT NULL DEFAULT 'SRD',
  is_homebrew boolean NOT NULL DEFAULT false,
  data        jsonb NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- CHARACTERS (privé par utilisateur)
-- ============================================================

CREATE TABLE IF NOT EXISTS characters (
  id          text PRIMARY KEY,
  user_id     text,                    -- NULL = local/anonymous, sera un UUID quand on aura l'auth
  name        text NOT NULL,
  race_name   text,                    -- dénormalisé pour les requêtes rapides
  level       integer,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  data        jsonb NOT NULL           -- Character complet
);

-- ============================================================
-- HOMEBREW
-- ============================================================

CREATE TABLE IF NOT EXISTS homebrew_packs (
  id          text PRIMARY KEY,
  user_id     text,
  name        text NOT NULL,
  author      text,
  version     text,
  data        jsonb NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS homebrew_rules (
  id          text PRIMARY KEY,
  pack_id     text REFERENCES homebrew_packs(id) ON DELETE CASCADE,
  user_id     text,
  name        text NOT NULL,
  category    text,
  enabled     boolean NOT NULL DEFAULT true,
  data        jsonb NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- IMPORT STATUS (suivi des imports SRD)
-- ============================================================

CREATE TABLE IF NOT EXISTS import_status (
  id              text PRIMARY KEY DEFAULT 'status',
  version         text,
  last_import     timestamptz,
  races_count     integer DEFAULT 0,
  classes_count   integer DEFAULT 0,
  spells_count    integer DEFAULT 0,
  items_count     integer DEFAULT 0,
  backgrounds_count integer DEFAULT 0,
  feats_count     integer DEFAULT 0
);

-- ============================================================
-- INDEX (pour les requêtes fréquentes)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_spells_level    ON spells(level);
CREATE INDEX IF NOT EXISTS idx_spells_school   ON spells(school);
CREATE INDEX IF NOT EXISTS idx_items_category  ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_rarity    ON items(rarity);
CREATE INDEX IF NOT EXISTS idx_characters_user ON characters(user_id);
CREATE INDEX IF NOT EXISTS idx_homebrew_user   ON homebrew_packs(user_id);

-- Index GIN pour recherche dans JSONB
CREATE INDEX IF NOT EXISTS idx_spells_classes  ON spells USING GIN ((data->'classes'));
CREATE INDEX IF NOT EXISTS idx_races_name      ON races(name);
CREATE INDEX IF NOT EXISTS idx_classes_name    ON classes(name);

-- ============================================================
-- ROW LEVEL SECURITY
-- Pour l'instant : lecture publique sur les game data,
-- tout le monde peut lire/écrire les characters (sans auth).
-- On resserera les policies quand on aura l'Auth Supabase.
-- ============================================================

ALTER TABLE races           ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE spells          ENABLE ROW LEVEL SECURITY;
ALTER TABLE items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE backgrounds     ENABLE ROW LEVEL SECURITY;
ALTER TABLE feats           ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters      ENABLE ROW LEVEL SECURITY;
ALTER TABLE homebrew_packs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE homebrew_rules  ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_status   ENABLE ROW LEVEL SECURITY;

-- Game data: lecture publique, écriture publique (temporaire)
CREATE POLICY "game_data_read"  ON races        FOR SELECT USING (true);
CREATE POLICY "game_data_write" ON races        FOR ALL    USING (true);
CREATE POLICY "game_data_read"  ON classes      FOR SELECT USING (true);
CREATE POLICY "game_data_write" ON classes      FOR ALL    USING (true);
CREATE POLICY "game_data_read"  ON spells       FOR SELECT USING (true);
CREATE POLICY "game_data_write" ON spells       FOR ALL    USING (true);
CREATE POLICY "game_data_read"  ON items        FOR SELECT USING (true);
CREATE POLICY "game_data_write" ON items        FOR ALL    USING (true);
CREATE POLICY "game_data_read"  ON backgrounds  FOR SELECT USING (true);
CREATE POLICY "game_data_write" ON backgrounds  FOR ALL    USING (true);
CREATE POLICY "game_data_read"  ON feats        FOR SELECT USING (true);
CREATE POLICY "game_data_write" ON feats        FOR ALL    USING (true);
CREATE POLICY "import_read"     ON import_status FOR SELECT USING (true);
CREATE POLICY "import_write"    ON import_status FOR ALL    USING (true);

-- Characters & homebrew: accès public pour l'instant (on ajoutera auth plus tard)
CREATE POLICY "chars_all"       ON characters       FOR ALL USING (true);
CREATE POLICY "homebrew_all"    ON homebrew_packs   FOR ALL USING (true);
CREATE POLICY "homebrew_rules_all" ON homebrew_rules FOR ALL USING (true);

-- ============================================================
-- FONCTION updated_at automatique
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_races_updated_at        BEFORE UPDATE ON races        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_classes_updated_at      BEFORE UPDATE ON classes      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_spells_updated_at       BEFORE UPDATE ON spells       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_items_updated_at        BEFORE UPDATE ON items        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_backgrounds_updated_at  BEFORE UPDATE ON backgrounds  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_feats_updated_at        BEFORE UPDATE ON feats        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_characters_updated_at   BEFORE UPDATE ON characters   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_homebrew_updated_at     BEFORE UPDATE ON homebrew_packs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
