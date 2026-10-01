#!/usr/bin/env node

/**
 * Weekly review for EF | Search | NL | Investor.
 *
 * Pulls search terms (last 7 days by default), lists converting / high-spend
 * terms to promote to exact, and lists noise to add as negatives.
 * Prints the ANALYTICS.md D1 queries keyed by utm_content={adgroupid}.
 *
 * Usage:
 *   node weekly-review.mjs
 *   node weekly-review.mjs --days 14
 *   node weekly-review.mjs --add-negatives "cursus,boek"   # campaign negatives
 */

import { googleAdsRequest, normalizeCustomerId } from './client.mjs';

const managerCustomerId = normalizeCustomerId(
  process.env.GOOGLE_ADS_MANAGER_CUSTOMER_ID || '925-809-1560'
);
const customerId = normalizeCustomerId(
  process.env.GOOGLE_ADS_CUSTOMER_ID || '664-073-0266'
);
const customer = `customers/${customerId}`;
const CAMPAIGN_ID = process.env.GOOGLE_ADS_CAMPAIGN_ID || '24259919998';

const args = process.argv.slice(2);
const daysIdx = args.indexOf('--days');
const DAYS = daysIdx >= 0 ? Number(args[daysIdx + 1]) || 7 : 7;
const negIdx = args.indexOf('--add-negatives');
const NEGATIVES_TO_ADD =
  negIdx >= 0
    ? String(args[negIdx + 1] || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

async function search(query) {
  const r = await googleAdsRequest(`${customer}/googleAds:search`, {
    method: 'POST',
    loginCustomerId: managerCustomerId,
    body: { query }
  });
  return r.results || [];
}

function microsToEur(m) {
  return (Number(m || 0) / 1_000_000).toFixed(2);
}

const during = ` AND segments.date DURING LAST_${DAYS}_DAYS`;

const [campaignRows, adGroupRows, termRows, negativeRows] = await Promise.all([
  search(`
    SELECT campaign.name, campaign.status, metrics.impressions, metrics.clicks,
           metrics.cost_micros, metrics.conversions
    FROM campaign
    WHERE campaign.id = ${CAMPAIGN_ID}${during}
  `),
  search(`
    SELECT ad_group.id, ad_group.name, ad_group.status, ad_group.cpc_bid_micros,
           metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions
    FROM ad_group
    WHERE campaign.id = ${CAMPAIGN_ID} AND ad_group.status != 'REMOVED'${during}
    ORDER BY metrics.cost_micros DESC
  `),
  search(`
    SELECT search_term_view.search_term, ad_group.name, ad_group.id,
           segments.keyword.info.text, segments.keyword.info.match_type,
           metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions
    FROM search_term_view
    WHERE campaign.id = ${CAMPAIGN_ID}${during}
    ORDER BY metrics.cost_micros DESC
  `),
  search(`
    SELECT campaign_criterion.keyword.text
    FROM campaign_criterion
    WHERE campaign.id = ${CAMPAIGN_ID}
      AND campaign_criterion.type = 'KEYWORD'
      AND campaign_criterion.negative = TRUE
      AND campaign_criterion.status != 'REMOVED'
  `)
]);

const existingNegatives = new Set(
  negativeRows.map((r) => r.campaignCriterion.keyword.text.toLowerCase())
);

console.log(`# Weekly review — last ${DAYS} days`);
console.log(`Campaign ${CAMPAIGN_ID}\n`);

const camp = campaignRows[0];
if (camp) {
  console.log('## Campaign');
  console.log(
    JSON.stringify(
      {
        name: camp.campaign.name,
        status: camp.campaign.status,
        impressions: Number(camp.metrics?.impressions || 0),
        clicks: Number(camp.metrics?.clicks || 0),
        costEur: microsToEur(camp.metrics?.costMicros),
        conversions: Number(camp.metrics?.conversions || 0)
      },
      null,
      2
    )
  );
}

console.log('\n## Ad groups (by spend)');
for (const r of adGroupRows) {
  console.log(
    [
      `EUR ${microsToEur(r.metrics?.costMicros)}`.padEnd(12),
      `clk ${r.metrics?.clicks || 0}`.padEnd(8),
      `conv ${r.metrics?.conversions || 0}`.padEnd(10),
      `cap EUR ${(Number(r.adGroup.cpcBidMicros) / 1e6).toFixed(2)}`.padEnd(14),
      `${r.adGroup.name}  [utm_content=${r.adGroup.id}]`
    ].join(' ')
  );
}

console.log('\n## Search terms');
if (termRows.length === 0) {
  console.log('(none yet)');
} else {
  console.log(
    'cost'.padEnd(10),
    'clk'.padEnd(5),
    'conv'.padEnd(5),
    'term'.padEnd(40),
    'matched keyword / group'
  );
  for (const r of termRows) {
    const term = r.searchTermView.searchTerm;
    console.log(
      `EUR ${microsToEur(r.metrics?.costMicros)}`.padEnd(10),
      String(r.metrics?.clicks || 0).padEnd(5),
      String(r.metrics?.conversions || 0).padEnd(5),
      term.padEnd(40),
      `${r.segments?.keyword?.info?.matchType || ''} "${r.segments?.keyword?.info?.text || ''}" / ${r.adGroup.name}`
    );
  }
}

const promote = termRows.filter(
  (r) => Number(r.metrics?.conversions || 0) > 0 || Number(r.metrics?.clicks || 0) >= 5
);
const noise = termRows.filter((r) => {
  const term = r.searchTermView.searchTerm.toLowerCase();
  const clicks = Number(r.metrics?.clicks || 0);
  const conv = Number(r.metrics?.conversions || 0);
  if (conv > 0) return false;
  if (clicks === 0) return false;
  return /huren|hypotheek|cursus|boek|podcast|uitleg|wat is|aandelen|etf|crypto|bitcoin|vacature|vakantie|goedkoop|beginners|spaarrekening|goud/.test(
    term
  );
});

console.log('\n## Promote to exact (conversions, or ≥5 clicks)');
if (promote.length === 0) console.log('(none yet)');
for (const r of promote) {
  console.log(
    `  [${r.adGroup.name}] exact: "${r.searchTermView.searchTerm}"  (clk ${r.metrics?.clicks}, conv ${r.metrics?.conversions})`
  );
}

console.log('\n## Candidate negatives (noise patterns with clicks, no conv)');
if (noise.length === 0) console.log('(none yet)');
for (const r of noise) {
  const term = r.searchTermView.searchTerm;
  const already = existingNegatives.has(term.toLowerCase()) ? ' (already negative)' : '';
  console.log(`  "${term}"${already}  clk ${r.metrics?.clicks}  EUR ${microsToEur(r.metrics?.costMicros)}`);
}

if (NEGATIVES_TO_ADD.length) {
  const toCreate = NEGATIVES_TO_ADD.filter((t) => !existingNegatives.has(t.toLowerCase()));
  console.log(`\n## Adding ${toCreate.length} campaign negatives`);
  if (toCreate.length) {
    await googleAdsRequest(`${customer}/googleAds:mutate`, {
      method: 'POST',
      loginCustomerId: managerCustomerId,
      body: {
        mutateOperations: toCreate.map((text) => ({
          campaignCriterionOperation: {
            create: {
              campaign: `${customer}/campaigns/${CAMPAIGN_ID}`,
              negative: true,
              keyword: { text, matchType: 'BROAD' }
            }
          }
        }))
      }
    });
    console.log(toCreate.map((t) => `  + ${t}`).join('\n'));
  }
}

console.log(`
## First-party funnel (Cloudflare D1)

Run against el-fortin-analytics (see ANALYTICS.md). utm_content is the ad group id.

Visits and leads by ad group:
\`\`\`sql
SELECT COALESCE(utm_content, '(none)') AS ad_group_id,
       COUNT(DISTINCT CASE WHEN event = 'page_view' THEN visit_id END) AS visits,
       COUNT(DISTINCT CASE WHEN event = 'form_submitted' THEN visit_id END) AS leads
FROM site_events
WHERE utm_campaign = 'ef-search-nl-investor'
   OR utm_source = 'google'
GROUP BY ad_group_id
ORDER BY visits DESC;
\`\`\`

Where investor-tier visits die on the page:
\`\`\`sql
WITH ranked AS (
  SELECT visit_id, section_id,
         ROW_NUMBER() OVER (PARTITION BY visit_id ORDER BY occurred_at DESC) AS rn
  FROM site_events
  WHERE event = 'section_seen' AND page_id = 'home'
    AND visit_id IN (
      SELECT DISTINCT visit_id FROM site_events
      WHERE event = 'page_view' AND utm_campaign = 'ef-search-nl-investor'
    )
)
SELECT section_id AS died_on, COUNT(*) AS visits
FROM ranked WHERE rn = 1
GROUP BY section_id ORDER BY visits DESC;
\`\`\`

## Stop rules
- New misleading-content flag → pause and fix copy.
- 150 clicks in T1–T3 with no form → pause and review.
- Success in 21 days: 3 leads and 1 call.
`);
