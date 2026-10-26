/**
 * First-party D1 pulls for the local ads dashboard.
 * Runs wrangler from the repo root so wrangler.jsonc binds el-fortin-analytics.
 */

import { execFile } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '../../..');
const DB_NAME = 'el-fortin-analytics';
const WRANGLER = resolve(HERE, '../node_modules/.bin/wrangler');

const PAID_FILTER = `(utm_campaign = 'ef-search-nl-investor' OR utm_campaign = 'ef-search-nl-investor-b' OR utm_source = 'google')`;
const PAID_PAGES = `page_id IN ('home_nl', 'home', 'expanded_nl')`;

/**
 * @param {string} sql
 * @returns {Promise<object[]>}
 */
export async function d1Query(sql) {
  const { stdout, stderr } = await execFileAsync(
    WRANGLER,
    ['d1', 'execute', DB_NAME, '--remote', '--json', '--command', sql],
    {
      cwd: REPO_ROOT,
      maxBuffer: 16 * 1024 * 1024,
      env: process.env
    }
  );

  if (stderr && /error|Error|failed/i.test(stderr) && !stdout.trim()) {
    throw new Error(stderr.trim());
  }

  let parsed;
  try {
    parsed = JSON.parse(stdout);
  } catch (err) {
    throw new Error(
      `D1 JSON parse failed: ${err.message}\nstdout: ${stdout.slice(0, 500)}\nstderr: ${stderr.slice(0, 500)}`
    );
  }

  // wrangler --json shape: [{ results: [...], success: true, meta: {...} }]
  const block = Array.isArray(parsed) ? parsed[0] : parsed;
  if (block?.success === false) {
    throw new Error(block?.error || 'D1 query failed');
  }
  return block?.results || [];
}

/**
 * @param {{ launchDate: string }} opts
 */
export async function fetchD1({ launchDate }) {
  const errors = {};
  const out = {
    funnelByAdGroupAllTime: [],
    diedByAdGroup: [],
    funnelByPage: [],
    diedByPage: [],
    openedOnExpanded: [],
    leadCount: 0,
    errors
  };

  const jobs = [
    [
      'funnelByAdGroupAllTime',
      () =>
        d1Query(`
          SELECT COALESCE(utm_content, '(none)') AS ad_group_id,
                 COUNT(DISTINCT CASE WHEN event = 'page_view' THEN visit_id END) AS visits,
                 COUNT(DISTINCT CASE WHEN event = 'section_seen' AND section_id IN ('figures', 'board') THEN visit_id END) AS saw_return,
                 COUNT(DISTINCT CASE WHEN event = 'section_seen' AND section_id = 'menu' THEN visit_id END) AS saw_price,
                 COUNT(DISTINCT CASE WHEN event = 'section_seen' AND section_id = 'guestbook' THEN visit_id END) AS saw_form,
                 COUNT(DISTINCT CASE WHEN event = 'form_started' THEN visit_id END) AS started,
                 COUNT(DISTINCT CASE WHEN event = 'form_submitted' THEN visit_id END) AS leads
          FROM site_events
          WHERE ${PAID_FILTER}
            AND ${PAID_PAGES}
            AND occurred_at >= '${launchDate}'
          GROUP BY ad_group_id
          ORDER BY visits DESC
        `)
    ],
    [
      'funnelByPage',
      () =>
        d1Query(`
          SELECT page_id,
                 COUNT(DISTINCT CASE WHEN event = 'page_view' THEN visit_id END) AS visits,
                 COUNT(DISTINCT CASE WHEN event = 'section_seen' AND section_id IN ('figures', 'board') THEN visit_id END) AS saw_return,
                 COUNT(DISTINCT CASE WHEN event = 'section_seen' AND section_id = 'menu' THEN visit_id END) AS saw_price,
                 COUNT(DISTINCT CASE WHEN event = 'section_seen' AND section_id = 'guestbook' THEN visit_id END) AS saw_form,
                 COUNT(DISTINCT CASE WHEN event = 'form_started' THEN visit_id END) AS started,
                 COUNT(DISTINCT CASE WHEN event = 'form_submitted' THEN visit_id END) AS leads,
                 COUNT(DISTINCT CASE WHEN event = 'handoff_opened' AND channel IN ('whatsapp', 'email') THEN visit_id END) AS handoffs,
                 COUNT(DISTINCT CASE WHEN event = 'fear_selected' THEN visit_id END) AS fears,
                 COUNT(DISTINCT CASE WHEN event = 'active_dwell' THEN visit_id END) AS dwell
          FROM site_events
          WHERE ${PAID_FILTER}
            AND ${PAID_PAGES}
            AND occurred_at >= '${launchDate}'
          GROUP BY page_id
          ORDER BY visits DESC
        `)
    ],
    [
      'diedByPage',
      () =>
        d1Query(`
          WITH paid AS (
            SELECT DISTINCT visit_id, page_id
            FROM site_events
            WHERE event = 'page_view'
              AND ${PAID_PAGES}
              AND ${PAID_FILTER}
              AND occurred_at >= '${launchDate}'
          ),
          ranked AS (
            SELECT e.visit_id, p.page_id, e.section_id,
                   ROW_NUMBER() OVER (PARTITION BY e.visit_id ORDER BY e.occurred_at DESC) AS rn
            FROM site_events e
            JOIN paid p ON p.visit_id = e.visit_id
            WHERE e.event = 'section_seen' AND e.${PAID_PAGES}
          )
          SELECT page_id, section_id AS died_on, COUNT(*) AS visits
          FROM ranked
          WHERE rn = 1
          GROUP BY page_id, section_id
          ORDER BY visits DESC
        `)
    ],
    [
      'diedByAdGroup',
      () =>
        d1Query(`
          WITH paid AS (
            SELECT DISTINCT visit_id, utm_content
            FROM site_events
            WHERE event = 'page_view'
              AND ${PAID_PAGES}
              AND ${PAID_FILTER}
              AND occurred_at >= '${launchDate}'
          ),
          ranked AS (
            SELECT e.visit_id, p.utm_content, e.section_id,
                   ROW_NUMBER() OVER (PARTITION BY e.visit_id ORDER BY e.occurred_at DESC) AS rn
            FROM site_events e
            JOIN paid p ON p.visit_id = e.visit_id
            WHERE e.event = 'section_seen' AND e.${PAID_PAGES}
          )
          SELECT COALESCE(utm_content, '(none)') AS ad_group_id,
                 section_id AS died_on,
                 COUNT(*) AS visits
          FROM ranked
          WHERE rn = 1
          GROUP BY ad_group_id, section_id
          ORDER BY visits DESC
        `)
    ],
    [
      'openedOnExpanded',
      () =>
        d1Query(`
          SELECT opened, COUNT(DISTINCT visit_id) AS visits
          FROM (
            SELECT visit_id,
                   CASE
                     WHEN event = 'cta_opened' AND cta_id IN (
                       'stay_long', 'stay_mid', 'stay_short',
                       'deal_sheet', 'view_investment',
                       'partner_enlaza', 'partner_nodhouses', 'partner_sofia',
                       'uriel_linkedin'
                     ) THEN cta_id
                     WHEN event = 'door_opened' AND door_id IN (
                       'place-map', 'listing-photos', 'puzol-story'
                     ) THEN door_id
                     WHEN event = 'unit_selected' THEN 'unit:' || unit_id
                     WHEN event = 'fear_selected' AND fear_id = 'developer' THEN 'fear:developer'
                   END AS opened
            FROM site_events
            WHERE page_id = 'expanded_nl'
              AND ${PAID_FILTER}
              AND occurred_at >= '${launchDate}'
          )
          WHERE opened IS NOT NULL
          GROUP BY opened
          ORDER BY visits DESC
        `)
    ],
    [
      'leadCount',
      async () => {
        const rows = await d1Query(`
          SELECT COUNT(*) AS n FROM site_leads
          WHERE created_at >= '${launchDate}'
            AND (utm_campaign = 'ef-search-nl-investor'
                 OR utm_campaign = 'ef-search-nl-investor-b'
                 OR utm_source = 'google'
                 OR gclid IS NOT NULL)
        `);
        return Number(rows[0]?.n || 0);
      }
    ]
  ];

  // Sequential: parallel wrangler processes race the OAuth refresh and flake.
  for (const [key, fn] of jobs) {
    try {
      out[key] = await fn();
    } catch (err) {
      errors[key] = err.message || String(err);
    }
  }

  return out;
}
