-- Leads from the public form. One row per submission, one write path
-- (functions/api/leads.js). Apply locally with:
--   wrangler d1 execute el-fortin-analytics --local --file schema/0001_site_leads.sql
--
-- Against --remote, --file needs the D1 import API, which the OAuth login token
-- cannot reach ("Authentication error [code: 10000]"). Pass each statement below
-- with --command instead, or use an API token with D1 write permission.
--
-- The `leads` table in this database belongs to the retired CRM: it requires
-- lead_code and preferred_channel and has a foreign key into `visits`. Rather
-- than bend the form to that shape, leads from the site live here.

CREATE TABLE IF NOT EXISTS site_leads (
  id            TEXT PRIMARY KEY,
  created_at    TEXT NOT NULL,

  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT NOT NULL,
  unit_type     TEXT,
  questions     TEXT,

  page          TEXT,
  source        TEXT NOT NULL CHECK (source IN ('short', 'long')),
  visit_id      TEXT,

  -- Salted hash, never the address itself. Only used for rate limiting.
  ip_hash       TEXT,
  -- 1 once the notification webhook has accepted the lead.
  notified      INTEGER NOT NULL DEFAULT 0,

  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  utm_content   TEXT,
  utm_term      TEXT,
  gclid         TEXT,
  gbraid        TEXT,
  wbraid        TEXT,
  campaign      TEXT,
  adgroup       TEXT,
  ad            TEXT,
  keyword       TEXT
);

CREATE INDEX IF NOT EXISTS idx_site_leads_created_at
  ON site_leads (created_at DESC);

-- Serves the per-IP rate limit lookup.
CREATE INDEX IF NOT EXISTS idx_site_leads_ip_hash
  ON site_leads (ip_hash, created_at);

-- Serves the Google Ads export.
CREATE INDEX IF NOT EXISTS idx_site_leads_utm_campaign
  ON site_leads (utm_campaign);
