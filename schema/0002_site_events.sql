-- Pseudonymous page events from the landing pages. One row per event, one
-- write path (functions/api/events.js). Apply locally with:
--   wrangler d1 execute el-fortin-analytics --local --file schema/0002_site_events.sql
--
-- Against --remote, --file needs the D1 import API, which the OAuth login token
-- cannot reach ("Authentication error [code: 10000]"). Pass each statement below
-- with --command instead, or use an API token with D1 write permission.
--
-- Nothing here identifies a person: no name, email, phone, or IP address. The
-- visit_id is a random per-session value the browser forgets when the tab
-- closes, and the page sends nothing at all until analytics are accepted.

CREATE TABLE IF NOT EXISTS site_events (
  id              TEXT PRIMARY KEY,

  -- The browser stamps occurred_at, we stamp received_at. They differ because
  -- events batch in the page and the last ones arrive as the tab closes.
  occurred_at     TEXT NOT NULL,
  received_at     TEXT NOT NULL,

  event           TEXT NOT NULL,
  visit_id        TEXT NOT NULL,

  page_id         TEXT NOT NULL,
  page_version    TEXT,
  locale          TEXT,

  -- Each is set only by the events that carry it: a section_seen has a
  -- section_id, a cta_opened has a cta_id, and so on.
  section_id      TEXT,
  cta_id          TEXT,
  door_id         TEXT,
  channel         TEXT,
  unit_id         TEXT,
  fear_id         TEXT,
  depth           INTEGER,
  seconds         INTEGER,

  referrer        TEXT,
  referrer_class  TEXT,
  device_class    TEXT,

  utm_source      TEXT,
  utm_medium      TEXT,
  utm_campaign    TEXT,
  utm_content     TEXT,
  utm_term        TEXT,
  gclid           TEXT,
  gbraid          TEXT,
  wbraid          TEXT,
  campaign        TEXT,
  adgroup         TEXT,
  ad              TEXT,
  keyword         TEXT,

  -- The same key twice is the same event. Retried beacons and a page that
  -- flushes on both pagehide and beforeunload collapse onto one row.
  idempotency_key TEXT NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_site_events_occurred_at
  ON site_events (occurred_at DESC);

-- Serves the per-visit funnel: which sections one visit reached, in order.
CREATE INDEX IF NOT EXISTS idx_site_events_visit
  ON site_events (visit_id, occurred_at);

-- Serves the funnel and the index vs index-d comparison.
CREATE INDEX IF NOT EXISTS idx_site_events_page_event
  ON site_events (page_id, event);

-- Serves the same campaign breakdown the leads table indexes.
CREATE INDEX IF NOT EXISTS idx_site_events_utm_campaign
  ON site_events (utm_campaign);
