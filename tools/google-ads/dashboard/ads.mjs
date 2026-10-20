/**
 * Google Ads GAQL pulls for the local ads dashboard.
 */

import { googleAdsRequest, normalizeCustomerId } from '../client.mjs';

const managerCustomerId = normalizeCustomerId(
  process.env.GOOGLE_ADS_MANAGER_CUSTOMER_ID || '925-809-1560'
);
const customerId = normalizeCustomerId(
  process.env.GOOGLE_ADS_CUSTOMER_ID || '664-073-0266'
);
const customer = `customers/${customerId}`;
export const CAMPAIGN_ID = process.env.GOOGLE_ADS_CAMPAIGN_ID || '24259919998';

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

function mapAdGroup(r) {
  const impressions = num(r.metrics?.impressions);
  const clicks = num(r.metrics?.clicks);
  const costEur = microsToEur(r.metrics?.costMicros);
  const conversions = num(r.metrics?.conversions);
  return {
    id: String(r.adGroup.id),
    name: r.adGroup.name,
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
          SELECT ad_group.id, ad_group.name, ad_group.status, ad_group.cpc_bid_micros,
                 metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions
          FROM ad_group
          WHERE campaign.id = ${CAMPAIGN_ID} AND ad_group.status != 'REMOVED'${sinceLaunch}
          ORDER BY metrics.cost_micros DESC
        `);
        return rows.map(mapAdGroup);
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
