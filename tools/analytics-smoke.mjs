#!/usr/bin/env node
/**
 * Smoke test: visit → events → lead → stage → summary/funnel math.
 * Expects local pages dev OR direct Miniflare via wrangler.
 * Default base: http://127.0.0.1:8788
 */
const BASE = (process.env.EF_ANALYTICS_BASE_URL || 'http://127.0.0.1:8788').replace(/\/$/, '');
const TOKEN = process.env.EF_ADMIN_TOKEN || process.env.ADMIN_TOKEN || 'dev-admin-token-change-me';

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, opts);
  const ct = res.headers.get('content-type') || '';
  const body = ct.includes('json') ? await res.json() : await res.text();
  if (!res.ok) {
    throw new Error(`${opts.method || 'GET'} ${path} → ${res.status} ${JSON.stringify(body)}`);
  }
  return body;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const visitId = crypto.randomUUID();
const today = new Date().toISOString().slice(0, 10);

console.log('Base:', BASE);

// 1) Events
const events = await req('/api/events', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    events: [
      {
        event: 'page_view',
        visit_id: visitId,
        page_id: 'site_en',
        page_version: 'v1',
        locale: 'en',
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'smoke',
        utm_term: 'buy apartment valencia',
        gclid: 'smoke-gclid-1',
        idempotency_key: `${visitId}:page_view`
      },
      {
        event: 'section_seen',
        visit_id: visitId,
        page_id: 'site_en',
        page_version: 'v1',
        locale: 'en',
        section_id: 'economics',
        idempotency_key: `${visitId}:section_seen:economics`
      },
      {
        event: 'fear_selected',
        visit_id: visitId,
        page_id: 'site_en',
        page_version: 'v1',
        locale: 'en',
        fear_id: 'show_me_documents',
        idempotency_key: `${visitId}:fear_selected:show_me_documents`
      }
    ]
  })
});
assert(events.ok && events.accepted >= 1, 'events not accepted');

// duplicate should not double-count
const dup = await req('/api/events', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    events: [
      {
        event: 'page_view',
        visit_id: visitId,
        page_id: 'site_en',
        page_version: 'v1',
        locale: 'en',
        idempotency_key: `${visitId}:page_view`
      }
    ]
  })
});
assert(dup.duplicates >= 1, 'idempotency failed');

// 2) Lead
const lead = await req('/api/leads', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    visit_id: visitId,
    page_id: 'site_en',
    page_version: 'v1',
    locale: 'en',
    name: 'Smoke Tester',
    email: 'smoke@example.com',
    preferred_channel: 'email',
    fear_id: 'show_me_documents',
    fear_label: 'Show me the title and licence documents first',
    free_text: 'Please send the pack',
    privacy_ack: true,
    utm_source: 'google',
    utm_campaign: 'smoke',
    utm_term: 'buy apartment valencia',
    gclid: 'smoke-gclid-1'
  })
});
assert(lead.ok && lead.lead_code, 'lead not created');

// 3) Admin path
const auth = { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' };

await req(`/api/admin/lead/${lead.lead_id}`, {
  method: 'PATCH',
  headers: auth,
  body: JSON.stringify({
    value_judgment: 'valuable',
    value_judgment_reason: 'Can afford entry price; serious document request',
    value_judgment_confidence: 'high',
    call_status: 'held',
    stage: 'call_held',
    call_result: 'Interested in data room'
  })
});

await req('/api/admin/import-ads', {
  method: 'POST',
  headers: auth,
  body: JSON.stringify({
    csv: `date,campaign,ad group,keyword,impressions,clicks,spend\n${today},smoke,group1,buy apartment valencia,100,5,42.50`
  })
});

const summary = await req(`/api/admin/summary?from=${today}&to=${today}`, { headers: auth });
assert(summary.funnel.leads >= 1, 'summary leads missing');
assert(summary.funnel.held >= 1, 'summary held missing');
assert(summary.ads.spend_eur >= 40, 'spend import missing');

const funnel = await req(`/api/admin/funnel?from=${today}&to=${today}`, { headers: auth });
assert(funnel.steps?.length >= 5, 'funnel steps missing');

const listed = await req(`/api/admin/leads?q=Smoke&from=${today}&to=${today}`, { headers: auth });
assert(listed.leads?.some((l) => l.lead_code === lead.lead_code), 'lead list missing smoke lead');

console.log('OK — synthetic journey passed');
console.log(
  JSON.stringify(
    {
      visitId,
      lead_code: lead.lead_code,
      spend: summary.ads.spend_eur,
      leads: summary.funnel.leads,
      held: summary.funnel.held,
      cost_per_held_call: summary.unit_economics.cost_per_held_call,
      bottleneck: funnel.bottleneck
    },
    null,
    2
  )
);
