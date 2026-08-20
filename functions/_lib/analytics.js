/** Shared helpers for Pages Functions analytics APIs. */

export const ALLOWED_EVENTS = new Set([
  'page_view',
  'section_seen',
  'active_dwell',
  'cta_opened',
  'fear_selected',
  'document_requested',
  'lead_submitted',
  'handoff_opened'
]);

export const SECTION_ORDER = [
  'intrigue',
  'location',
  'gallery',
  'ownership',
  'economics',
  'evidence',
  'candor',
  'agency'
];

export const STAGES = [
  'lead',
  'contacted',
  'valuable',
  'call_booked',
  'call_held',
  'diligence',
  'reserved',
  'sold',
  'lost'
];

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...headers
    }
  });
}

export function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allow = isAllowedOrigin(origin) ? origin : '';
  return {
    'access-control-allow-origin': allow || 'null',
    'access-control-allow-methods': 'GET, POST, PATCH, OPTIONS',
    'access-control-allow-headers': 'content-type, authorization, x-idempotency-key',
    'access-control-max-age': '86400',
    vary: 'Origin'
  };
}

export function isAllowedOrigin(origin) {
  if (!origin) return true;
  try {
    const u = new URL(origin);
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') return true;
    if (u.hostname.endsWith('.pages.dev')) return true;
    if (u.hostname === 'elfortincapital.com' || u.hostname.endsWith('.elfortincapital.com')) return true;
    return false;
  } catch {
    return false;
  }
}

export function nowIso() {
  return new Date().toISOString();
}

export function uuid() {
  return crypto.randomUUID();
}

export function shortCode(len = 6) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  let out = '';
  for (let i = 0; i < len; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

export function clampString(value, max) {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;
  return s.slice(0, max);
}

export function classifyReferrer(referrer) {
  if (!referrer) return 'direct';
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    if (host.includes('google.')) return 'google';
    if (host.includes('bing.') || host.includes('duckduckgo') || host.includes('yahoo.')) return 'search';
    if (host.includes('facebook') || host.includes('instagram') || host.includes('linkedin') || host.includes('x.com') || host.includes('twitter')) return 'social';
    return 'referral';
  } catch {
    return 'unknown';
  }
}

export function classifyDevice(ua) {
  if (!ua) return 'unknown';
  const s = ua.toLowerCase();
  if (/ipad|tablet/.test(s)) return 'tablet';
  if (/mobi|iphone|android/.test(s)) return 'mobile';
  return 'desktop';
}

export async function readJson(request, maxBytes = 32_000) {
  const text = await request.text();
  if (text.length > maxBytes) {
    const err = new Error('payload_too_large');
    err.status = 413;
    throw err;
  }
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    const err = new Error('invalid_json');
    err.status = 400;
    throw err;
  }
}

export function getAdminToken(env) {
  return env.ADMIN_TOKEN || env.ANALYTICS_ADMIN_TOKEN || '';
}

export function requireAdmin(request, env) {
  const expected = getAdminToken(env);
  if (!expected) {
    const err = new Error('admin_token_not_configured');
    err.status = 503;
    throw err;
  }
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token || token !== expected) {
    const err = new Error('unauthorized');
    err.status = 401;
    throw err;
  }
}

export async function audit(env, actor, action, detail) {
  try {
    await env.DB.prepare(
      `INSERT INTO access_audit (occurred_at, actor, action, detail) VALUES (?, ?, ?, ?)`
    )
      .bind(nowIso(), actor || null, action, clampString(detail, 2000))
      .run();
  } catch {
    // Audit failure must not break the request.
  }
}

/** Simple in-memory rate limit per isolate (best-effort). */
const buckets = new Map();

export function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now - b.start > windowMs) {
    b = { start: now, count: 0 };
    buckets.set(key, b);
  }
  b.count += 1;
  return b.count <= limit;
}

export function clientKey(request) {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for') ||
    'unknown'
  );
}

export function looksLikeBot(request) {
  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  if (!ua) return true;
  return /bot|crawl|spider|slurp|headless|wget|curl\//.test(ua);
}

export async function ensureVisit(env, visit) {
  const existing = await env.DB.prepare(`SELECT visit_id FROM visits WHERE visit_id = ?`)
    .bind(visit.visit_id)
    .first();
  if (existing) {
    await env.DB.prepare(`UPDATE visits SET last_seen_at = ? WHERE visit_id = ?`)
      .bind(visit.last_seen_at || nowIso(), visit.visit_id)
      .run();
    return;
  }
  await env.DB.prepare(
    `INSERT INTO visits (
      visit_id, created_at, last_seen_at, page_id, page_version, locale,
      referrer, referrer_class, device_class,
      utm_source, utm_medium, utm_campaign, utm_content, utm_term,
      gclid, gbraid, wbraid, campaign, adgroup, ad, keyword,
      deepest_section_id, active_seconds, engaged
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      visit.visit_id,
      visit.created_at,
      visit.last_seen_at,
      visit.page_id,
      visit.page_version,
      visit.locale,
      visit.referrer,
      visit.referrer_class,
      visit.device_class,
      visit.utm_source,
      visit.utm_medium,
      visit.utm_campaign,
      visit.utm_content,
      visit.utm_term,
      visit.gclid,
      visit.gbraid,
      visit.wbraid,
      visit.campaign,
      visit.adgroup,
      visit.ad,
      visit.keyword,
      visit.deepest_section_id || null,
      visit.active_seconds || 0,
      visit.engaged || 0
    )
    .run();
}

export function sectionDepth(sectionId) {
  const i = SECTION_ORDER.indexOf(sectionId);
  return i >= 0 ? i : -1;
}

export async function updateVisitProgress(env, visitId, { sectionId, seconds, engage }) {
  const row = await env.DB.prepare(
    `SELECT deepest_section_id, active_seconds, engaged FROM visits WHERE visit_id = ?`
  )
    .bind(visitId)
    .first();
  if (!row) return;

  let deepest = row.deepest_section_id;
  if (sectionId && sectionDepth(sectionId) > sectionDepth(deepest || '')) {
    deepest = sectionId;
  }
  const active = Math.max(row.active_seconds || 0, seconds || 0);
  const engagedFlag = row.engaged || engage ? 1 : 0;

  await env.DB.prepare(
    `UPDATE visits SET last_seen_at = ?, deepest_section_id = ?, active_seconds = ?, engaged = ? WHERE visit_id = ?`
  )
    .bind(nowIso(), deepest, active, engagedFlag, visitId)
    .run();
}

export async function insertStage(env, leadId, fromStage, toStage, by, note) {
  await env.DB.prepare(
    `INSERT INTO lead_stage_history (lead_id, from_stage, to_stage, changed_at, changed_by, note)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(leadId, fromStage || null, toStage, nowIso(), by || null, clampString(note, 1000))
    .run();
}

export function parseCsv(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter((l) => l.trim());
  if (!lines.length) return [];
  const headers = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = (cols[i] || '').trim();
    });
    return row;
  });
}

function splitCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}
