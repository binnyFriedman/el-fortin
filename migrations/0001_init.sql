-- Own campaign analytics schema (v1)
-- Anonymous visit/event data and lead PII are separate tables, joined by ids.

CREATE TABLE IF NOT EXISTS visits (
  visit_id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  page_id TEXT NOT NULL,
  page_version TEXT NOT NULL,
  locale TEXT NOT NULL,
  referrer TEXT,
  referrer_class TEXT,
  device_class TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  gclid TEXT,
  gbraid TEXT,
  wbraid TEXT,
  campaign TEXT,
  adgroup TEXT,
  ad TEXT,
  keyword TEXT,
  deepest_section_id TEXT,
  active_seconds INTEGER NOT NULL DEFAULT 0,
  engaged INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS events (
  event_id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL,
  lead_id TEXT,
  event_name TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  page_id TEXT,
  page_version TEXT,
  locale TEXT,
  section_id TEXT,
  cta_id TEXT,
  fear_id TEXT,
  channel TEXT,
  seconds INTEGER,
  lead_code TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  payload_json TEXT,
  FOREIGN KEY (visit_id) REFERENCES visits(visit_id)
);

CREATE INDEX IF NOT EXISTS idx_events_visit ON events(visit_id);
CREATE INDEX IF NOT EXISTS idx_events_name_time ON events(event_name, occurred_at);
CREATE INDEX IF NOT EXISTS idx_events_lead ON events(lead_id);

CREATE TABLE IF NOT EXISTS leads (
  lead_id TEXT PRIMARY KEY,
  lead_code TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  visit_id TEXT,
  page_id TEXT,
  page_version TEXT,
  locale TEXT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  preferred_channel TEXT NOT NULL,
  fear_id TEXT,
  fear_label TEXT,
  free_text TEXT,
  heard_about TEXT,
  privacy_ack INTEGER NOT NULL DEFAULT 0,
  stage TEXT NOT NULL DEFAULT 'lead',
  value_judgment TEXT NOT NULL DEFAULT 'unknown',
  value_judgment_reason TEXT,
  value_judgment_confidence TEXT,
  value_judgment_at TEXT,
  value_judgment_by TEXT,
  capital_band TEXT,
  buyer_type TEXT,
  goal TEXT,
  buying_timeframe TEXT,
  country TEXT,
  area_connection TEXT,
  prior_property_experience TEXT,
  main_fear TEXT,
  first_reply_at TEXT,
  next_action TEXT,
  next_action_at TEXT,
  owner TEXT NOT NULL DEFAULT 'binny',
  call_status TEXT,
  call_booked_at TEXT,
  call_held_at TEXT,
  call_result TEXT,
  notes TEXT,
  loss_stage TEXT,
  loss_reason TEXT,
  loss_detail TEXT,
  unit_interest TEXT,
  reservation_at TEXT,
  sold_at TEXT,
  sale_value_eur REAL,
  first_touch_visit_id TEXT,
  last_touch_visit_id TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  gclid TEXT,
  gbraid TEXT,
  wbraid TEXT,
  campaign TEXT,
  adgroup TEXT,
  ad TEXT,
  keyword TEXT,
  FOREIGN KEY (visit_id) REFERENCES visits(visit_id)
);

CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_value ON leads(value_judgment);

CREATE TABLE IF NOT EXISTS lead_stage_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id TEXT NOT NULL,
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  changed_at TEXT NOT NULL,
  changed_by TEXT,
  note TEXT,
  FOREIGN KEY (lead_id) REFERENCES leads(lead_id)
);

CREATE INDEX IF NOT EXISTS idx_stage_history_lead ON lead_stage_history(lead_id);

CREATE TABLE IF NOT EXISTS contact_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id TEXT NOT NULL,
  attempted_at TEXT NOT NULL,
  channel TEXT,
  outcome TEXT,
  note TEXT,
  by_user TEXT,
  FOREIGN KEY (lead_id) REFERENCES leads(lead_id)
);

CREATE TABLE IF NOT EXISTS campaign_daily_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stat_date TEXT NOT NULL,
  campaign TEXT,
  adgroup TEXT,
  ad TEXT,
  keyword TEXT,
  search_term TEXT,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  spend_eur REAL NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'google_ads_csv',
  imported_at TEXT NOT NULL,
  UNIQUE(stat_date, campaign, adgroup, ad, keyword, search_term)
);

CREATE INDEX IF NOT EXISTS idx_campaign_stats_date ON campaign_daily_stats(stat_date);

CREATE TABLE IF NOT EXISTS experiments (
  experiment_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  hypothesis TEXT NOT NULL,
  owner TEXT NOT NULL DEFAULT 'binny',
  started_at TEXT NOT NULL,
  ended_at TEXT,
  page_version TEXT,
  campaign_version TEXT,
  change_summary TEXT NOT NULL,
  primary_metric TEXT NOT NULL,
  guardrail_metric TEXT,
  sample_size INTEGER,
  result_summary TEXT,
  decision TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS access_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  occurred_at TEXT NOT NULL,
  actor TEXT,
  action TEXT NOT NULL,
  detail TEXT
);
