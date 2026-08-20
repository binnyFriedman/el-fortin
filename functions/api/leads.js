import {
  clampString,
  clientKey,
  corsHeaders,
  ensureVisit,
  insertStage,
  json,
  nowIso,
  rateLimit,
  readJson,
  shortCode,
  uuid
} from '../_lib/analytics.js';

export async function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: corsHeaders(context.request) });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = corsHeaders(request);

  try {
    if (!rateLimit(`leads:${clientKey(request)}`, 20, 60_000)) {
      return json({ ok: false, error: 'rate_limited' }, 429, headers);
    }

    const body = await readJson(request, 24_000);
    const name = clampString(body.name, 120);
    const email = clampString(body.email, 200);
    const phone = clampString(body.phone, 40);
    const preferred = clampString(body.preferred_channel, 20);
    const privacyAck = body.privacy_ack === true || body.privacy_ack === 1 || body.privacy_ack === '1';

    if (!name) return json({ ok: false, error: 'name_required' }, 400, headers);
    if (!preferred || !['email', 'whatsapp', 'calendar'].includes(preferred)) {
      return json({ ok: false, error: 'preferred_channel_invalid' }, 400, headers);
    }
    if (preferred === 'email' && !email) {
      return json({ ok: false, error: 'email_required' }, 400, headers);
    }
    if (preferred === 'whatsapp' && !phone) {
      return json({ ok: false, error: 'phone_required' }, 400, headers);
    }
    if ((preferred === 'calendar' || preferred === 'email') && !email && !phone) {
      return json({ ok: false, error: 'contact_required' }, 400, headers);
    }
    if (!privacyAck) return json({ ok: false, error: 'privacy_ack_required' }, 400, headers);

    const visitId = clampString(body.visit_id, 80) || uuid();
    const occurredAt = nowIso();
    const pageId = clampString(body.page_id, 40) || 'unknown';
    const pageVersion = clampString(body.page_version, 40) || env.PAGE_VERSION || 'v1';
    const locale = clampString(body.locale, 16) || 'en';

    await ensureVisit(env, {
      visit_id: visitId,
      created_at: occurredAt,
      last_seen_at: occurredAt,
      page_id: pageId,
      page_version: pageVersion,
      locale,
      referrer: clampString(body.referrer, 500),
      referrer_class: clampString(body.referrer_class, 40),
      device_class: clampString(body.device_class, 20),
      utm_source: clampString(body.utm_source, 120),
      utm_medium: clampString(body.utm_medium, 120),
      utm_campaign: clampString(body.utm_campaign, 120),
      utm_content: clampString(body.utm_content, 120),
      utm_term: clampString(body.utm_term, 120),
      gclid: clampString(body.gclid, 200),
      gbraid: clampString(body.gbraid, 200),
      wbraid: clampString(body.wbraid, 200),
      campaign: clampString(body.campaign, 120),
      adgroup: clampString(body.adgroup, 120),
      ad: clampString(body.ad, 120),
      keyword: clampString(body.keyword, 200),
      engaged: 1
    });

    // First touch = earliest visit with same gclid or same visit; for v1 use this visit.
    const firstTouch = visitId;
    const lastTouch = visitId;
    const leadId = uuid();
    let leadCode = shortCode(6);
    for (let i = 0; i < 5; i++) {
      const clash = await env.DB.prepare(`SELECT lead_id FROM leads WHERE lead_code = ?`)
        .bind(leadCode)
        .first();
      if (!clash) break;
      leadCode = shortCode(6);
    }

    const fearId = clampString(body.fear_id, 60);
    const fearLabel = clampString(body.fear_label, 200);
    const freeText = clampString(body.free_text, 2000);
    const heardAbout = clampString(body.heard_about, 200);

    await env.DB.prepare(
      `INSERT INTO leads (
        lead_id, lead_code, created_at, updated_at, visit_id,
        page_id, page_version, locale, name, email, phone,
        preferred_channel, fear_id, fear_label, free_text, heard_about,
        privacy_ack, stage, owner,
        first_touch_visit_id, last_touch_visit_id,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term,
        gclid, gbraid, wbraid, campaign, adgroup, ad, keyword
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'lead', 'binny',
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        leadId,
        leadCode,
        occurredAt,
        occurredAt,
        visitId,
        pageId,
        pageVersion,
        locale,
        name,
        email,
        phone,
        preferred,
        fearId,
        fearLabel,
        freeText,
        heardAbout,
        firstTouch,
        lastTouch,
        clampString(body.utm_source, 120),
        clampString(body.utm_medium, 120),
        clampString(body.utm_campaign, 120),
        clampString(body.utm_content, 120),
        clampString(body.utm_term, 120),
        clampString(body.gclid, 200),
        clampString(body.gbraid, 200),
        clampString(body.wbraid, 200),
        clampString(body.campaign, 120),
        clampString(body.adgroup, 120),
        clampString(body.ad, 120),
        clampString(body.keyword, 200)
      )
      .run();

    await insertStage(env, leadId, null, 'lead', 'system', 'Lead captured from landing page');

    const idempotency = `lead_submitted:${leadId}`;
    await env.DB.prepare(
      `INSERT INTO events (
        event_id, visit_id, lead_id, event_name, occurred_at,
        page_id, page_version, locale, fear_id, channel, lead_code, idempotency_key, payload_json
      ) VALUES (?, ?, ?, 'lead_submitted', ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        uuid(),
        visitId,
        leadId,
        occurredAt,
        pageId,
        pageVersion,
        locale,
        fearId,
        preferred,
        leadCode,
        idempotency,
        JSON.stringify({ name_len: name.length }).slice(0, 500)
      )
      .run();

    return json(
      {
        ok: true,
        lead_id: leadId,
        lead_code: leadCode,
        preferred_channel: preferred
      },
      201,
      headers
    );
  } catch (err) {
    const status = err.status || 500;
    return json({ ok: false, error: err.message || 'server_error' }, status, headers);
  }
}
