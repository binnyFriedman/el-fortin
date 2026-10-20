/**
 * Google Ads GAQL pulls for the local ads dashboard.
 */

import { campaignIds } from '../campaigns.mjs';
import { googleAdsRequest, normalizeCustomerId } from '../client.mjs';

const managerCustomerId = normalizeCustomerId(
  process.env.GOOGLE_ADS_MANAGER_CUSTOMER_ID || '925-809-1560'
);
const customerId = normalizeCustomerId(
  process.env.GOOGLE_ADS_CUSTOMER_ID || '664-073-0266'
);
const customer = `customers/${customerId}`;

async function search(query) {
  const r = await googleAdsRequest(`${customer}/googleAds:search`, {
    method: 'POST',
    loginCustomerId: managerCustomerId,
    body: { query }
  });
  return r.results || [];
}

function microsToEur(m) {
  return Number(m || 0) / 1_000_000;
}

function num(v) {
  return Number(v || 0);
}

function mapAdGroup(r, baseId) {
  const impressions = num(r.metrics?.impressions);
  const clicks = num(r.metrics?.clicks);
  const costEur = microsToEur(r.metrics?.costMicros);
  const conversions = num(r.metrics?.conversions);
  const campaignId = String(r.campaign?.id || '');
  const arm = campaignId && campaignId !== baseId ? ' · B' : '';
  return {
    id: String(r.adGroup.id),
    campaignId,
    name: `${r.adGroup.name}${arm}`,
    status: r.adGroup.status,
    cpcCapEur: microsToEur(r.adGroup.cpcBidMicros),
    impressions,
    clicks,
    costEur,
    conversions,
    ctr: impressions ? clicks / impressions : 0,
    avgCpc: clicks ? costEur / clicks : 0
  };
}

/**
 * @param {{ launchDate: string }} opts
 */
export async function fetchAds({ launchDate }) {
  const sinceLaunch = ` AND segments.date BETWEEN '${launchDate}' AND '${todayIso()}'`;
  const ids = campaignIds();
  const inClause = ids.join(', ');

  const errors = {};
  const out = {
    adGroupsAllTime: [],
    errors
  };

  const jobs = [
    [
      'adGroupsAllTime',
      async () => {
        const rows = await search(`
          SELECT campaign.id, ad_group.id, ad_group.name, ad_group.status, ad_group.cpc_bid_micros,
                 metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions
          FROM ad_group
          WHERE campaign.id IN (${inClause}) AND ad_group.status != 'REMOVED'${sinceLaunch}
          ORDER BY metrics.cost_micros DESC
        `);
        return rows.map((row) => mapAdGroup(row, ids[0]));
      }
    ]
  ];

  await Promise.all(
    jobs.map(async ([key, fn]) => {
      try {
        out[key] = await fn();
      } catch (err) {
        errors[key] = err.message || String(err);
      }
    })
  );

  return out;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
