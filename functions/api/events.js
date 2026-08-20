import {
  ALLOWED_EVENTS,
  classifyDevice,
  classifyReferrer,
  clampString,
  clientKey,
  corsHeaders,
  ensureVisit,
  json,
  looksLikeBot,
  nowIso,
  rateLimit,
  readJson,
  updateVisitProgress,
  uuid
} from '../_lib/analytics.js';

export async function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: corsHeaders(context.request) });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = corsHeaders(request);

  try {
    if (!rateLimit(`events:${clientKey(request)}`, 120, 60_000)) {
      return json({ ok: false, error: 'rate_limited' }, 429, headers);
    }

    const body = await readJson(request, 48_000);
    const events = Array.isArray(body.events) ? body.events : body.event ? [body] : [];
    if (!events.length) return json({ ok: false, error: 'no_events' }, 400, headers);
    if (events.length > 40) return json({ ok: false, error: 'too_many_events' }, 400, headers);

    const bot = looksLikeBot(request);
    let accepted = 0;
    let duplicates = 0;

    for (const raw of events) {
      const eventName = clampString(raw.event || raw.event_name, 64);
      if (!eventName || !ALLOWED_EVENTS.has(eventName)) continue;

      const visitId = clampString(raw.visit_id, 80);
      if (!visitId) continue;

      const idempotency =
        clampString(raw.idempotency_key || request.headers.get('x-idempotency-key'), 120) ||
        `${visitId}:${eventName}:${raw.section_id || ''}:${raw.cta_id || ''}:${raw.fear_id || ''}:${raw.channel || ''}:${raw.seconds || ''}`;

      const existing = await env.DB.prepare(
        `SELECT event_id FROM events WHERE idempotency_key = ?`
      )
        .bind(idempotency)
        .first();
      if (existing) {
        duplicates += 1;
        continue;
      }

      const occurredAt = clampString(raw.occurred_at, 40) || nowIso();
      const pageId = clampString(raw.page_id, 40) || 'unknown';
      const pageVersion = clampString(raw.page_version, 40) || env.PAGE_VERSION || 'v1';
      const locale = clampString(raw.locale, 16) || 'en';

      await ensureVisit(env, {
        visit_id: visitId,
        created_at: occurredAt,
        last_seen_at: occurredAt,
        page_id: pageId,
        page_version: pageVersion,
        locale,
        referrer: clampString(raw.referrer, 500),
        referrer_class: clampString(raw.referrer_class, 40) || classifyReferrer(raw.referrer),
        device_class:
          clampString(raw.device_class, 20) || classifyDevice(request.headers.get('user-agent')),
        utm_source: clampString(raw.utm_source, 120),
        utm_medium: clampString(raw.utm_medium, 120),
        utm_campaign: clampString(raw.utm_campaign, 120),
        utm_content: clampString(raw.utm_content, 120),
        utm_term: clampString(raw.utm_term, 120),
        gclid: clampString(raw.gclid, 200),
        gbraid: clampString(raw.gbraid, 200),
        wbraid: clampString(raw.wbraid, 200),
        campaign: clampString(raw.campaign, 120),
        adgroup: clampString(raw.adgroup, 120),
        ad: clampString(raw.ad, 120),
        keyword: clampString(raw.keyword, 200)
      });

      const sectionId = clampString(raw.section_id, 40);
      const seconds = Number.isFinite(Number(raw.seconds)) ? Math.max(0, Math.min(3600, Number(raw.seconds))) : null;
      const engage =
        eventName === 'section_seen' ||
        eventName === 'cta_opened' ||
        eventName === 'fear_selected' ||
        eventName === 'document_requested' ||
        eventName === 'lead_submitted' ||
        eventName === 'handoff_opened' ||
        (eventName === 'active_dwell' && (seconds || 0) >= 15);

      await updateVisitProgress(env, visitId, {
        sectionId,
        seconds: eventName === 'active_dwell' ? seconds : undefined,
        engage
      });

      await env.DB.prepare(
        `INSERT INTO events (
          event_id, visit_id, lead_id, event_name, occurred_at,
          page_id, page_version, locale, section_id, cta_id, fear_id,
          channel, seconds, lead_code, idempotency_key, payload_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          uuid(),
          visitId,
          clampString(raw.lead_id, 80),
          eventName,
          occurredAt,
          pageId,
          pageVersion,
          locale,
          sectionId,
          clampString(raw.cta_id, 40),
          clampString(raw.fear_id, 60),
          clampString(raw.channel, 40),
          seconds,
          clampString(raw.lead_code, 20),
          idempotency,
          JSON.stringify({
            bot,
            ...((raw.meta && typeof raw.meta === 'object') ? raw.meta : {})
          }).slice(0, 2000)
        )
        .run();

      accepted += 1;
    }

    return json({ ok: true, accepted, duplicates }, 200, headers);
  } catch (err) {
    const status = err.status || 500;
    return json({ ok: false, error: err.message || 'server_error' }, status, headers);
  }
}
