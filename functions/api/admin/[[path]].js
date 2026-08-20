import {
  STAGES,
  audit,
  clampString,
  corsHeaders,
  insertStage,
  json,
  nowIso,
  parseCsv,
  readJson,
  requireAdmin,
  uuid
} from '../../_lib/analytics.js';

export async function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: corsHeaders(context.request) });
}

export async function onRequest(context) {
  const { request, env, params } = context;
  const headers = corsHeaders(request);
  const pathParts = (params.path ? (Array.isArray(params.path) ? params.path : [params.path]) : [])
    .filter(Boolean);
  const action = pathParts[0] || '';

  try {
    requireAdmin(request, env);
    await audit(env, 'binny', `admin:${request.method}:${action}`, pathParts.join('/'));

    if (request.method === 'GET' && action === 'summary') {
      return json(await getSummary(env, new URL(request.url).searchParams), 200, headers);
    }
    if (request.method === 'GET' && action === 'funnel') {
      return json(await getFunnel(env, new URL(request.url).searchParams), 200, headers);
    }
    if (request.method === 'GET' && action === 'leads') {
      return json(await listLeads(env, new URL(request.url).searchParams), 200, headers);
    }
    if (request.method === 'GET' && action === 'lead' && pathParts[1]) {
      return json(await getLead(env, pathParts[1]), 200, headers);
    }
    if (request.method === 'PATCH' && action === 'lead' && pathParts[1]) {
      const body = await readJson(request);
      return json(await patchLead(env, pathParts[1], body), 200, headers);
    }
    if (request.method === 'POST' && action === 'import-ads') {
      const body = await readJson(request, 2_000_000);
      return json(await importAdsCsv(env, body), 200, headers);
    }
    if (request.method === 'GET' && action === 'export') {
      return await exportCsv(env, new URL(request.url).searchParams, headers);
    }
    if (request.method === 'GET' && action === 'feedback') {
      return json(await searchFeedback(env, new URL(request.url).searchParams), 200, headers);
    }
    if (request.method === 'GET' && action === 'sources') {
      return json(await compareSources(env, new URL(request.url).searchParams), 200, headers);
    }
    if (request.method === 'GET' && action === 'versions') {
      return json(await compareVersions(env, new URL(request.url).searchParams), 200, headers);
    }
    if (request.method === 'GET' && action === 'dictionary') {
      return json(dataDictionary(), 200, headers);
    }
    if (request.method === 'POST' && action === 'experiments') {
      const body = await readJson(request);
      return json(await createExperiment(env, body), 201, headers);
    }
    if (request.method === 'GET' && action === 'experiments') {
      return json(await listExperiments(env), 200, headers);
    }
    if (request.method === 'POST' && action === 'contact' && pathParts[1]) {
      const body = await readJson(request);
      return json(await addContactAttempt(env, pathParts[1], body), 201, headers);
    }

    return json({ ok: false, error: 'not_found', action }, 404, headers);
  } catch (err) {
    const status = err.status || 500;
    return json({ ok: false, error: err.message || 'server_error' }, status, headers);
  }
}

function dateRange(params) {
  const to = params.get('to') || nowIso().slice(0, 10);
  const from = params.get('from') || daysAgo(30);
  return { from: `${from}T00:00:00.000Z`, to: `${to}T23:59:59.999Z`, fromDay: from, toDay: to };
}

function daysAgo(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

async function spendBetween(env, fromDay, toDay) {
  const row = await env.DB.prepare(
    `SELECT COALESCE(SUM(spend_eur),0) AS spend,
            COALESCE(SUM(impressions),0) AS impressions,
            COALESCE(SUM(clicks),0) AS clicks
     FROM campaign_daily_stats
     WHERE stat_date >= ? AND stat_date <= ?`
  )
    .bind(fromDay, toDay)
    .first();
  return row || { spend: 0, impressions: 0, clicks: 0 };
}

async function getSummary(env, params) {
  const { from, to, fromDay, toDay } = dateRange(params);
  const ads = await spendBetween(env, fromDay, toDay);

  const counts = await env.DB.prepare(
    `SELECT
      (SELECT COUNT(*) FROM visits WHERE created_at >= ? AND created_at <= ?) AS visits,
      (SELECT COUNT(*) FROM visits WHERE created_at >= ? AND created_at <= ? AND engaged = 1) AS engaged,
      (SELECT COUNT(*) FROM leads WHERE created_at >= ? AND created_at <= ?) AS leads,
      (SELECT COUNT(*) FROM leads WHERE created_at >= ? AND created_at <= ? AND value_judgment = 'valuable') AS valuable,
      (SELECT COUNT(*) FROM leads WHERE created_at >= ? AND created_at <= ? AND call_status = 'held') AS held,
      (SELECT COUNT(*) FROM leads WHERE created_at >= ? AND created_at <= ? AND stage = 'reserved') AS reserved,
      (SELECT COUNT(*) FROM leads WHERE created_at >= ? AND created_at <= ? AND stage = 'sold') AS sold
    `
  )
    .bind(from, to, from, to, from, to, from, to, from, to, from, to, from, to)
    .first();

  const spend = Number(ads.spend) || 0;
  const div = (n, d) => (d > 0 ? spend / d : null);

  return {
    ok: true,
    range: { from: fromDay, to: toDay },
    ads: {
      spend_eur: spend,
      impressions: Number(ads.impressions) || 0,
      clicks: Number(ads.clicks) || 0
    },
    funnel: counts,
    unit_economics: {
      cost_per_lead: div(spend, counts.leads),
      cost_per_valuable_lead: div(spend, counts.valuable),
      cost_per_held_call: div(spend, counts.held),
      cost_per_reservation: div(spend, counts.reserved),
      cost_per_sale: div(spend, counts.sold),
      broker_benchmark_eur: {
        low: Number(env.BROKER_CAC_LOW_EUR || 4600),
        high: Number(env.BROKER_CAC_HIGH_EUR || 7000)
      }
    },
    main_score: {
      name: 'valuable_leads_who_held_a_call',
      value: Number(counts.held) || 0,
      note: 'Held calls among leads created in range; refine with valuable filter in funnel view.'
    },
    low_confidence: Object.fromEntries(
      Object.entries(counts || {}).map(([k, v]) => [k, Number(v) < 5])
    )
  };
}

async function getFunnel(env, params) {
  const summary = await getSummary(env, params);
  const c = summary.funnel;
  const rate = (a, b) => (b > 0 ? a / b : null);
  return {
    ok: true,
    range: summary.range,
    steps: [
      { id: 'visits', count: c.visits, rate_from_prev: null },
      { id: 'engaged', count: c.engaged, rate_from_prev: rate(c.engaged, c.visits) },
      { id: 'leads', count: c.leads, rate_from_prev: rate(c.leads, c.engaged) },
      { id: 'valuable', count: c.valuable, rate_from_prev: rate(c.valuable, c.leads) },
      { id: 'held', count: c.held, rate_from_prev: rate(c.held, c.valuable) },
      { id: 'reserved', count: c.reserved, rate_from_prev: rate(c.reserved, c.held) },
      { id: 'sold', count: c.sold, rate_from_prev: rate(c.sold, c.reserved) }
    ],
    bottleneck: pickBottleneck([
      ['visits→engaged', rate(c.engaged, c.visits), c.visits],
      ['engaged→leads', rate(c.leads, c.engaged), c.engaged],
      ['leads→valuable', rate(c.valuable, c.leads), c.leads],
      ['valuable→held', rate(c.held, c.valuable), c.valuable],
      ['held→reserved', rate(c.reserved, c.held), c.held],
      ['reserved→sold', rate(c.sold, c.reserved), c.reserved]
    ])
  };
}

function pickBottleneck(rows) {
  const usable = rows.filter(([, rate, den]) => den >= 3 && rate != null);
  if (!usable.length) return { id: 'insufficient_data', rate: null };
  usable.sort((a, b) => a[1] - b[1]);
  return { id: usable[0][0], rate: usable[0][1], denominator: usable[0][2] };
}

async function listLeads(env, params) {
  const { from, to } = dateRange(params);
  const stage = params.get('stage');
  const judgment = params.get('value_judgment');
  const q = clampString(params.get('q'), 100);
  const limit = Math.min(200, Math.max(1, Number(params.get('limit') || 50)));

  let sql = `SELECT lead_id, lead_code, created_at, updated_at, name, email, phone,
    preferred_channel, stage, value_judgment, value_judgment_reason, call_status,
    next_action, next_action_at, utm_campaign, utm_term, locale, page_version, fear_id, fear_label
    FROM leads WHERE created_at >= ? AND created_at <= ?`;
  const binds = [from, to];
  if (stage) {
    sql += ` AND stage = ?`;
    binds.push(stage);
  }
  if (judgment) {
    sql += ` AND value_judgment = ?`;
    binds.push(judgment);
  }
  if (q) {
    sql += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR lead_code LIKE ? OR free_text LIKE ?)`;
    const like = `%${q}%`;
    binds.push(like, like, like, like, like);
  }
  sql += ` ORDER BY created_at DESC LIMIT ?`;
  binds.push(limit);

  const { results } = await env.DB.prepare(sql).bind(...binds).all();
  return { ok: true, leads: results || [], count: (results || []).length };
}

async function getLead(env, idOrCode) {
  const lead = await env.DB.prepare(
    `SELECT * FROM leads WHERE lead_id = ? OR lead_code = ? LIMIT 1`
  )
    .bind(idOrCode, idOrCode)
    .first();
  if (!lead) {
    const err = new Error('lead_not_found');
    err.status = 404;
    throw err;
  }
  const history = await env.DB.prepare(
    `SELECT * FROM lead_stage_history WHERE lead_id = ? ORDER BY changed_at ASC`
  )
    .bind(lead.lead_id)
    .all();
  const contacts = await env.DB.prepare(
    `SELECT * FROM contact_attempts WHERE lead_id = ? ORDER BY attempted_at ASC`
  )
    .bind(lead.lead_id)
    .all();
  const events = await env.DB.prepare(
    `SELECT event_name, occurred_at, section_id, cta_id, fear_id, channel, seconds
     FROM events WHERE visit_id = ? OR lead_id = ? ORDER BY occurred_at ASC`
  )
    .bind(lead.visit_id, lead.lead_id)
    .all();
  return {
    ok: true,
    lead,
    stage_history: history.results || [],
    contact_attempts: contacts.results || [],
    events: events.results || []
  };
}

async function patchLead(env, idOrCode, body) {
  const current = await env.DB.prepare(
    `SELECT * FROM leads WHERE lead_id = ? OR lead_code = ? LIMIT 1`
  )
    .bind(idOrCode, idOrCode)
    .first();
  if (!current) {
    const err = new Error('lead_not_found');
    err.status = 404;
    throw err;
  }

  const fields = {};
  const settable = [
    'stage',
    'value_judgment',
    'value_judgment_reason',
    'value_judgment_confidence',
    'capital_band',
    'buyer_type',
    'goal',
    'buying_timeframe',
    'country',
    'area_connection',
    'prior_property_experience',
    'main_fear',
    'next_action',
    'next_action_at',
    'call_status',
    'call_booked_at',
    'call_held_at',
    'call_result',
    'notes',
    'loss_stage',
    'loss_reason',
    'loss_detail',
    'unit_interest',
    'reservation_at',
    'sold_at',
    'sale_value_eur',
    'first_reply_at',
    'email',
    'phone',
    'heard_about'
  ];

  for (const key of settable) {
    if (body[key] !== undefined) fields[key] = body[key];
  }

  if (fields.value_judgment && fields.value_judgment !== 'unknown') {
    if (!clampString(fields.value_judgment_reason || current.value_judgment_reason, 1000)) {
      const err = new Error('value_judgment_reason_required');
      err.status = 400;
      throw err;
    }
    fields.value_judgment_at = nowIso();
    fields.value_judgment_by = clampString(body.value_judgment_by, 40) || 'binny';
  }

  if (fields.stage && !STAGES.includes(fields.stage)) {
    const err = new Error('invalid_stage');
    err.status = 400;
    throw err;
  }

  if (fields.call_status === 'held' && !fields.call_held_at && !current.call_held_at) {
    fields.call_held_at = nowIso();
  }
  if (fields.call_status === 'booked' && !fields.call_booked_at && !current.call_booked_at) {
    fields.call_booked_at = nowIso();
  }
  if (fields.stage === 'reserved' && !fields.reservation_at && !current.reservation_at) {
    fields.reservation_at = nowIso();
  }
  if (fields.stage === 'sold' && !fields.sold_at && !current.sold_at) {
    fields.sold_at = nowIso();
  }

  fields.updated_at = nowIso();
  const keys = Object.keys(fields);
  if (!keys.length) return { ok: true, lead: current };

  const sql = `UPDATE leads SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE lead_id = ?`;
  await env.DB.prepare(sql)
    .bind(...keys.map((k) => fields[k]), current.lead_id)
    .run();

  if (fields.stage && fields.stage !== current.stage) {
    await insertStage(env, current.lead_id, current.stage, fields.stage, 'binny', body.stage_note);
  }

  return getLead(env, current.lead_id);
}

async function addContactAttempt(env, idOrCode, body) {
  const lead = await env.DB.prepare(
    `SELECT lead_id, stage, first_reply_at FROM leads WHERE lead_id = ? OR lead_code = ?`
  )
    .bind(idOrCode, idOrCode)
    .first();
  if (!lead) {
    const err = new Error('lead_not_found');
    err.status = 404;
    throw err;
  }
  const attemptedAt = clampString(body.attempted_at, 40) || nowIso();
  await env.DB.prepare(
    `INSERT INTO contact_attempts (lead_id, attempted_at, channel, outcome, note, by_user)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(
      lead.lead_id,
      attemptedAt,
      clampString(body.channel, 40),
      clampString(body.outcome, 80),
      clampString(body.note, 1000),
      clampString(body.by_user, 40) || 'binny'
    )
    .run();

  const updates = [`updated_at = ?`];
  const binds = [nowIso()];
  if (!lead.first_reply_at) {
    updates.push(`first_reply_at = ?`);
    binds.push(attemptedAt);
  }
  if (lead.stage === 'lead') {
    updates.push(`stage = ?`);
    binds.push('contacted');
  }
  binds.push(lead.lead_id);
  await env.DB.prepare(`UPDATE leads SET ${updates.join(', ')} WHERE lead_id = ?`)
    .bind(...binds)
    .run();
  if (lead.stage === 'lead') {
    await insertStage(env, lead.lead_id, 'lead', 'contacted', 'binny', 'First contact attempt');
  }
  return getLead(env, lead.lead_id);
}

async function importAdsCsv(env, body) {
  const csv = typeof body.csv === 'string' ? body.csv : '';
  if (!csv.trim()) {
    const err = new Error('csv_required');
    err.status = 400;
    throw err;
  }
  const rows = parseCsv(csv);
  let imported = 0;
  const importedAt = nowIso();

  for (const row of rows) {
    const statDate =
      row.date || row.day || row.stat_date || row['day (date)'] || row['date (yyyy-mm-dd)'];
    if (!statDate) continue;
    const campaign = row.campaign || row['campaign name'] || null;
    const adgroup = row.adgroup || row['ad group'] || row['ad group name'] || null;
    const ad = row.ad || row['ad name'] || row.adid || null;
    const keyword = row.keyword || row['keyword text'] || null;
    const searchTerm = row['search term'] || row.search_term || row.query || null;
    const impressions = Number(String(row.impressions || 0).replace(/,/g, '')) || 0;
    const clicks = Number(String(row.clicks || 0).replace(/,/g, '')) || 0;
    const spend =
      Number(
        String(row.spend || row.cost || row['cost (eur)'] || row.amount || 0)
          .replace(/[€,\s]/g, '')
          .replace(',', '.')
      ) || 0;

    await env.DB.prepare(
      `INSERT INTO campaign_daily_stats (
        stat_date, campaign, adgroup, ad, keyword, search_term,
        impressions, clicks, spend_eur, source, imported_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'google_ads_csv', ?)
      ON CONFLICT(stat_date, campaign, adgroup, ad, keyword, search_term)
      DO UPDATE SET impressions = excluded.impressions,
                    clicks = excluded.clicks,
                    spend_eur = excluded.spend_eur,
                    imported_at = excluded.imported_at`
    )
      .bind(
        String(statDate).slice(0, 10),
        campaign,
        adgroup,
        ad,
        keyword,
        searchTerm,
        impressions,
        clicks,
        spend,
        importedAt
      )
      .run();
    imported += 1;
  }

  return { ok: true, imported };
}

async function exportCsv(env, params, headers) {
  const kind = params.get('kind') || 'leads';
  let rows = [];
  if (kind === 'leads') {
    const res = await env.DB.prepare(`SELECT * FROM leads ORDER BY created_at DESC`).all();
    rows = res.results || [];
  } else if (kind === 'events') {
    const res = await env.DB.prepare(`SELECT * FROM events ORDER BY occurred_at DESC LIMIT 5000`).all();
    rows = res.results || [];
  } else if (kind === 'campaign') {
    const res = await env.DB.prepare(`SELECT * FROM campaign_daily_stats ORDER BY stat_date DESC`).all();
    rows = res.results || [];
  } else {
    return json({ ok: false, error: 'unknown_export_kind' }, 400, headers);
  }

  if (!rows.length) {
    return new Response('no rows\n', {
      status: 200,
      headers: { ...headers, 'content-type': 'text/csv; charset=utf-8' }
    });
  }
  const cols = Object.keys(rows[0]);
  const lines = [cols.join(',')];
  for (const r of rows) {
    lines.push(cols.map((c) => csvEscape(r[c])).join(','));
  }
  return new Response(lines.join('\n') + '\n', {
    status: 200,
    headers: {
      ...headers,
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${kind}-${nowIso().slice(0, 10)}.csv"`
    }
  });
}

function csvEscape(v) {
  if (v == null) return '';
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

async function searchFeedback(env, params) {
  const q = clampString(params.get('q'), 100);
  const { from, to } = dateRange(params);
  let sql = `SELECT lead_code, created_at, name, fear_id, fear_label, free_text, loss_reason, loss_detail,
    value_judgment, stage, call_result, notes, locale, utm_campaign, utm_term
    FROM leads WHERE created_at >= ? AND created_at <= ?`;
  const binds = [from, to];
  if (q) {
    sql += ` AND (free_text LIKE ? OR fear_label LIKE ? OR loss_detail LIKE ? OR notes LIKE ? OR loss_reason LIKE ?)`;
    const like = `%${q}%`;
    binds.push(like, like, like, like, like);
  }
  sql += ` ORDER BY created_at DESC LIMIT 100`;
  const { results } = await env.DB.prepare(sql).bind(...binds).all();

  const fears = await env.DB.prepare(
    `SELECT fear_id, COUNT(*) AS n FROM leads
     WHERE created_at >= ? AND created_at <= ? AND fear_id IS NOT NULL
     GROUP BY fear_id ORDER BY n DESC`
  )
    .bind(from, to)
    .all();

  return { ok: true, feedback: results || [], fear_counts: fears.results || [] };
}

async function compareSources(env, params) {
  const { from, to } = dateRange(params);
  const dim = params.get('by') || 'utm_campaign';
  const allowed = new Set(['utm_campaign', 'utm_term', 'utm_source', 'locale', 'page_version', 'keyword', 'campaign']);
  const col = allowed.has(dim) ? dim : 'utm_campaign';
  const { results } = await env.DB.prepare(
    `SELECT COALESCE(${col}, 'unknown') AS key,
      COUNT(*) AS leads,
      SUM(CASE WHEN value_judgment = 'valuable' THEN 1 ELSE 0 END) AS valuable,
      SUM(CASE WHEN call_status = 'held' THEN 1 ELSE 0 END) AS held,
      SUM(CASE WHEN stage = 'reserved' THEN 1 ELSE 0 END) AS reserved,
      SUM(CASE WHEN stage = 'sold' THEN 1 ELSE 0 END) AS sold
     FROM leads
     WHERE created_at >= ? AND created_at <= ?
     GROUP BY COALESCE(${col}, 'unknown')
     ORDER BY leads DESC`
  )
    .bind(from, to)
    .all();
  return { ok: true, by: col, rows: results || [] };
}

async function compareVersions(env, params) {
  const { from, to } = dateRange(params);
  const { results } = await env.DB.prepare(
    `SELECT page_version,
      COUNT(*) AS leads,
      SUM(CASE WHEN value_judgment = 'valuable' THEN 1 ELSE 0 END) AS valuable,
      SUM(CASE WHEN call_status = 'held' THEN 1 ELSE 0 END) AS held
     FROM leads
     WHERE created_at >= ? AND created_at <= ?
     GROUP BY page_version
     ORDER BY page_version`
  )
    .bind(from, to)
    .all();
  const experiments = await listExperiments(env);
  return { ok: true, versions: results || [], experiments: experiments.experiments || [] };
}

async function createExperiment(env, body) {
  const id = uuid();
  const created = nowIso();
  await env.DB.prepare(
    `INSERT INTO experiments (
      experiment_id, name, hypothesis, owner, started_at, ended_at,
      page_version, campaign_version, change_summary, primary_metric,
      guardrail_metric, sample_size, result_summary, decision, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      clampString(body.name, 200) || 'Untitled change',
      clampString(body.hypothesis, 2000) || '',
      clampString(body.owner, 40) || 'binny',
      clampString(body.started_at, 40) || created,
      clampString(body.ended_at, 40),
      clampString(body.page_version, 40),
      clampString(body.campaign_version, 40),
      clampString(body.change_summary, 2000) || '',
      clampString(body.primary_metric, 80) || 'held_calls',
      clampString(body.guardrail_metric, 80),
      body.sample_size == null ? null : Number(body.sample_size),
      clampString(body.result_summary, 2000),
      clampString(body.decision, 40),
      created
    )
    .run();
  return { ok: true, experiment_id: id };
}

async function listExperiments(env) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM experiments ORDER BY created_at DESC`
  ).all();
  return { ok: true, experiments: results || [] };
}

function dataDictionary() {
  return {
    ok: true,
    main_score: 'valuable leads who hold a call',
    stages: STAGES,
    events: [
      'page_view',
      'section_seen',
      'active_dwell',
      'cta_opened',
      'fear_selected',
      'document_requested',
      'lead_submitted',
      'handoff_opened'
    ],
    value_judgment: ['unknown', 'valuable', 'not_valuable'],
    attribution_views: ['first_touch', 'last_touch_before_lead', 'full_path'],
    docs: 'marketing-strategies/analytics-measurement-plan.md'
  };
}
