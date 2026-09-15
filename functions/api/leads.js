/* POST /api/leads — the only write path for leads from the public form.
   Order matters: reject, validate, store, then notify. A notification that
   fails must never cost us the row, so it runs after the response. */

import {
  declaredBodyTooBig,
  isOurSite,
  json,
  line,
  readJson,
  text,
} from "../../shared/request.js";

const MAX_BODY_BYTES = 8 * 1024;
const UNIT_TYPES = ["", "One bedroom", "Two bedrooms", "Both"];
const SOURCES = ["short", "long"];

/* Ads parameters kept by site/assets/analytics.js, stored verbatim. */
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

const LIMITS = {
  name: 100,
  email: 254,
  phone: 40,
  questions: 2000,
  page: 500,
  visitId: 100,
  attribution: 200,
};

/* Generous enough that nobody typing by hand will notice. */
const RATE_LIMIT = { windowMinutes: 10, perWindow: 5, perDay: 20 };

export async function onRequestPost(context) {
  const { request, env, waitUntil } = context;

  if (!isOurSite(request)) return json(403, { error: "forbidden" });
  if (declaredBodyTooBig(request, MAX_BODY_BYTES)) {
    return json(413, { error: "too_large" });
  }

  const payload = await readJson(request, MAX_BODY_BYTES);
  if (!payload) return json(400, { error: "bad_request" });

  /* A filled honeypot is a bot. Say thank you, store nothing, tell nobody. */
  if (text(payload.company)) return json(200, { ok: true });

  const lead = buildLead(payload);
  if (!lead) return json(422, { error: "invalid" });

  if (!env.DB) return json(500, { error: "unconfigured" });

  lead.ip_hash = await hashIp(request.headers.get("CF-Connecting-IP"), env.LEAD_IP_SALT);
  if (await isRateLimited(env.DB, lead.ip_hash)) {
    return json(429, { error: "slow_down" });
  }

  try {
    await insertLead(env.DB, lead);
  } catch (err) {
    console.error("lead insert failed", err);
    return json(500, { error: "store_failed" });
  }

  waitUntil(notify(env, lead));
  return json(201, { ok: true });
}

/* The form is the only caller, so every other method is a mistake. */
export function onRequest() {
  return json(405, { error: "method_not_allowed" }, { Allow: "POST" });
}

/* ---------- validation ---------- */

/* Returns the row to insert, or null if the submission is not usable. */
function buildLead(payload) {
  const name = line(payload.name, LIMITS.name);
  const email = line(payload.email, LIMITS.email).toLowerCase();
  const phone = line(payload.phone, LIMITS.phone);
  const source = line(payload.source, 10);
  const unitType = line(payload.type, 20);

  if (!name) return null;
  if (!isEmail(email) || email.length < 5) return null;
  if (!isPhone(phone)) return null;
  if (!SOURCES.includes(source)) return null;
  if (!UNIT_TYPES.includes(unitType)) return null;

  const lead = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    name,
    email,
    phone,
    unit_type: unitType,
    questions: paragraph(payload.questions, LIMITS.questions),
    page: line(payload.page, LIMITS.page),
    source,
    visit_id: line(payload.visit_id, LIMITS.visitId) || null,
  };

  for (const field of ATTRIBUTION_FIELDS) {
    lead[field] = line(payload[field], LIMITS.attribution) || null;
  }

  return lead;
}

/* Free text: newlines survive, everything else invisible does not. */
function paragraph(value, maxLength) {
  return text(value)
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function isPhone(value) {
  const digits = digitsOf(value);
  return digits.length >= 8 && digits.length <= 20;
}

function digitsOf(value) {
  return String(value || "").replace(/\D/g, "");
}

/* ---------- rate limit ---------- */

/* Hashed with a salt so the stored value cannot be walked back to an address. */
async function hashIp(ip, salt) {
  if (!ip) return null;
  const bytes = new TextEncoder().encode(`${salt || "el-fortin"}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function isRateLimited(db, ipHash) {
  if (!ipHash) return false;

  const since = (minutes) =>
    new Date(Date.now() - minutes * 60_000).toISOString();
  const countSince = db.prepare(
    "SELECT COUNT(*) AS n FROM site_leads WHERE ip_hash = ?1 AND created_at > ?2"
  );

  try {
    const [recent, today] = await db.batch([
      countSince.bind(ipHash, since(RATE_LIMIT.windowMinutes)),
      countSince.bind(ipHash, since(60 * 24)),
    ]);
    return (
      recent.results[0].n >= RATE_LIMIT.perWindow ||
      today.results[0].n >= RATE_LIMIT.perDay
    );
  } catch (err) {
    /* Never let a counting problem block a real lead. */
    console.error("rate limit check failed", err);
    return false;
  }
}

/* ---------- store ---------- */

const INSERT_COLUMNS = [
  "id",
  "created_at",
  "name",
  "email",
  "phone",
  "unit_type",
  "questions",
  "page",
  "source",
  "visit_id",
  "ip_hash",
  ...ATTRIBUTION_FIELDS,
];

function insertLead(db, lead) {
  const placeholders = INSERT_COLUMNS.map((_, i) => `?${i + 1}`).join(", ");
  return db
    .prepare(
      `INSERT INTO site_leads (${INSERT_COLUMNS.join(", ")}) VALUES (${placeholders})`
    )
    .bind(...INSERT_COLUMNS.map((column) => lead[column] ?? null))
    .run();
}

/* ---------- notify ---------- */

/* Uriel decides how to answer, so hand him both routes as links rather than
   opening anything for the visitor. */
function replyLinks(lead) {
  const subject = `El Fortín — ${lead.name}`;
  const links = {
    email: `mailto:${lead.email}?subject=${encodeURIComponent(subject)}`,
    whatsapp: "",
  };

  /* wa.me needs a country code and we will not invent one. Leading 00 is the
     international prefix, so it can go; anything shorter we leave alone and
     the raw number stays in the body. */
  const digits = digitsOf(lead.phone).replace(/^00/, "");
  if (digits.length >= 8) links.whatsapp = `https://wa.me/${digits}`;

  return links;
}

function summarise(lead, links) {
  const rows = (pairs) =>
    pairs.map(([label, value]) => `  ${label.padEnd(14)}${value || "-"}`);

  const body = [
    `New lead from the ${lead.source} page.`,
    "",
    "Reply",
    ...rows([
      ["Email:", links.email],
      ["WhatsApp:", links.whatsapp || `not enough digits (${lead.phone})`],
    ]),
    "",
    "Contact",
    ...rows([
      ["Name:", lead.name],
      ["Email:", lead.email],
      ["Phone:", lead.phone],
      ["Unit:", lead.unit_type],
    ]),
  ];

  if (lead.questions) body.push("", "Questions", indent(lead.questions));

  body.push(
    "",
    "Where it came from",
    ...rows([
      ["Page:", lead.page],
      ["Source:", lead.source],
      ["Received:", lead.created_at],
    ]),
    "",
    "Campaign",
    ...rows(ATTRIBUTION_FIELDS.map((field) => [field + ":", lead[field]]))
  );

  return body.join("\n");
}

function indent(value) {
  return value
    .split("\n")
    .map((line) => "  " + line)
    .join("\n");
}

function subjectFor(lead) {
  return `Lead (${lead.source}) — ${lead.utm_campaign || lead.campaign || "direct"}`;
}

/* Make owns the mailboxes it forwards to. We only hand it a finished message
   plus the raw fields, so nothing has to be reassembled downstream. */
async function notify(env, lead) {
  if (!env.MAKE_WEBHOOK_URL) {
    console.warn("MAKE_WEBHOOK_URL not set; lead stored without notification");
    return;
  }

  const links = replyLinks(lead);
  const form = new URLSearchParams({
    /* Field names the existing Make scenario already maps. */
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    type: lead.unit_type,
    questions: lead.questions,
    page: lead.page,
    submitted_at: lead.created_at,
    source: lead.source,

    lead_id: lead.id,
    subject: subjectFor(lead),
    summary: summarise(lead, links),
    reply_email_url: links.email,
    reply_whatsapp_url: links.whatsapp,
  });
  for (const field of ATTRIBUTION_FIELDS) form.set(field, lead[field] || "");

  try {
    const response = await fetch(env.MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: form.toString(),
    });
    if (!response.ok) throw new Error(`webhook responded ${response.status}`);

    await env.DB.prepare("UPDATE site_leads SET notified = 1 WHERE id = ?1")
      .bind(lead.id)
      .run();
  } catch (err) {
    /* The row is already safe; notified stays 0 so we can find it later. */
    console.error("lead notification failed", lead.id, err);
  }
}
