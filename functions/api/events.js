/* POST /api/events — the only write path for pseudonymous page events.
   The page batches events and sends them with sendBeacon, including as the tab
   closes, so one request carries many rows and nobody reads our response. That
   shapes the rules here: one bad row must not lose the batch, and a storage
   problem must never become an error the visitor could notice. */

import {
  declaredBodyTooBig,
  isOurSite,
  json,
  line,
  readJson,
} from "../../shared/request.js";

/* A pagehide flush can carry a whole visit's worth of events. */
const MAX_BODY_BYTES = 64 * 1024;
const MAX_EVENTS = 60;

/* Only events the pages actually send. An unknown name is a stale script or
   someone poking the endpoint; either way we do not want it in the funnel. */
const EVENT_NAMES = [
  "page_view",
  "section_seen",
  "scroll_depth",
  "active_dwell",
  "cta_opened",
  "handoff_opened",
  "door_opened",
  "unit_selected",
  "fear_selected",
  "form_started",
  "form_submitted",
  "form_failed",
];

/* Campaign parameters kept by site/assets/analytics.js, stored verbatim. */
const ATTRIBUTION_FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "gbraid",
  "wbraid",
  "campaign",
  "adgroup",
  "ad",
  "keyword",
];

/* Short labels, because every one of them is an identifier we chose. */
const LABEL_FIELDS = [
  "section_id",
  "cta_id",
  "door_id",
  "channel",
  "unit_id",
  "fear_id",
];

const LIMITS = {
  label: 60,
  visitId: 100,
  pageId: 60,
  locale: 20,
  referrer: 500,
  attribution: 200,
  idempotencyKey: 300,
};

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!isOurSite(request)) return json(403, { error: "forbidden" });
  if (declaredBodyTooBig(request, MAX_BODY_BYTES)) {
    return json(413, { error: "too_large" });
  }

  const payload = await readJson(request, MAX_BODY_BYTES);
  if (!payload || !Array.isArray(payload.events)) {
    return json(400, { error: "bad_request" });
  }

  const receivedAt = new Date().toISOString();
  const rows = payload.events
    .slice(0, MAX_EVENTS)
    .map((event) => buildEvent(event, receivedAt))
    .filter(Boolean);

  if (!rows.length) return json(202, { ok: true, stored: 0 });
  if (!env.DB) return json(500, { error: "unconfigured" });

  try {
    const stored = await insertEvents(env.DB, rows);
    return json(202, { ok: true, stored });
  } catch (err) {
    /* Measurement is not worth an error the page has to handle. */
    console.error("event insert failed", err);
    return json(202, { ok: false, stored: 0 });
  }
}

/* The page only ever posts. Anything else is a mistake or a crawler. */
export function onRequest() {
  return json(405, { error: "method_not_allowed" }, { Allow: "POST" });
}

/* ---------- validation ---------- */

/* Returns the row to insert, or null if the event is not usable. */
function buildEvent(payload, receivedAt) {
  if (!payload || typeof payload !== "object") return null;

  const event = line(payload.event, LIMITS.label);
  const visitId = line(payload.visit_id, LIMITS.visitId);
  const pageId = line(payload.page_id, LIMITS.pageId);

  if (!EVENT_NAMES.includes(event)) return null;
  if (!visitId || !pageId) return null;

  const row = {
    id: crypto.randomUUID(),
    occurred_at: timestamp(payload.occurred_at) || receivedAt,
    received_at: receivedAt,

    event,
    visit_id: visitId,

    page_id: pageId,
    page_version: line(payload.page_version, LIMITS.label) || null,
    locale: line(payload.locale, LIMITS.locale) || null,

    depth: wholeNumber(payload.depth, 100),
    seconds: wholeNumber(payload.seconds, 86_400),

    referrer: line(payload.referrer, LIMITS.referrer) || null,
    referrer_class: line(payload.referrer_class, LIMITS.label) || null,
    device_class: line(payload.device_class, LIMITS.label) || null,

    /* Two events from one visit must not collapse into one row, so fall back
       to something unique rather than trusting the page to send a key. */
    idempotency_key:
      line(payload.idempotency_key, LIMITS.idempotencyKey) ||
      `${visitId}:${event}:${crypto.randomUUID()}`,
  };

  for (const field of LABEL_FIELDS) {
    row[field] = line(payload[field], LIMITS.label) || null;
  }
  for (const field of ATTRIBUTION_FIELDS) {
    row[field] = line(payload[field], LIMITS.attribution) || null;
  }

  return row;
}

/* Clock skew and stale tabs are real, so an unusable stamp is dropped rather
   than stored: the caller falls back to arrival time. */
function timestamp(value) {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return null;
  return new Date(parsed).toISOString();
}

function wholeNumber(value, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  const rounded = Math.round(parsed);
  if (rounded < 0 || rounded > max) return null;
  return rounded;
}

/* ---------- store ---------- */

const INSERT_COLUMNS = [
  "id",
  "occurred_at",
  "received_at",
  "event",
  "visit_id",
  "page_id",
  "page_version",
  "locale",
  ...LABEL_FIELDS,
  "depth",
  "seconds",
  "referrer",
  "referrer_class",
  "device_class",
  ...ATTRIBUTION_FIELDS,
  "idempotency_key",
];

/* Resolves to the number of rows actually written, which is lower than the
   batch size whenever a beacon we already stored arrives again. */
async function insertEvents(db, rows) {
  const placeholders = INSERT_COLUMNS.map((_, i) => `?${i + 1}`).join(", ");
  /* OR IGNORE leans on the unique idempotency_key: a duplicate is silently the
     same row, not a failed batch. */
  const insert = db.prepare(
    `INSERT OR IGNORE INTO site_events (${INSERT_COLUMNS.join(", ")})
     VALUES (${placeholders})`
  );

  const results = await db.batch(
    rows.map((row) =>
      insert.bind(...INSERT_COLUMNS.map((column) => row[column] ?? null))
    )
  );

  return results.reduce((total, result) => total + (result.meta?.changes ?? 0), 0);
}
