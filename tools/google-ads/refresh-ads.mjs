#!/usr/bin/env node

/**
 * Re-submits every ad in the campaign for policy review by pausing the current
 * ads and creating fresh ones from rsa-copy.mjs. Use after a landing-page or
 * copy change that should clear a policy label (the API has no "appeal" call).
 *
 * Ad groups named "NL | ..." get RSA_NL -> /index-nl; "EN | ..." get RSA_EN -> /.
 * Ad group status is left untouched, so paused groups stay paused.
 *
 * Usage: node refresh-ads.mjs [--dry-run]
 */

import { googleAdsRequest, normalizeCustomerId } from './client.mjs';
import { RSA_NL, RSA_EN, FINAL_URL_EN, FINAL_URL_NL, assertRsaLengths, toRsaAd } from './rsa-copy.mjs';

const managerCustomerId = normalizeCustomerId(process.env.GOOGLE_ADS_MANAGER_CUSTOMER_ID || '925-809-1560');
const customerId = normalizeCustomerId(process.env.GOOGLE_ADS_CUSTOMER_ID || '664-073-0266');
const customer = `customers/${customerId}`;
const CAMPAIGN_ID = process.env.GOOGLE_ADS_CAMPAIGN_ID || '24259919998';
const dryRun = process.argv.includes('--dry-run');

assertRsaLengths(RSA_NL, 'NL');
assertRsaLengths(RSA_EN, 'EN');

async function search(query) {
  const r = await googleAdsRequest(`${customer}/googleAds:search`, {
    method: 'POST',
    loginCustomerId: managerCustomerId,
    body: { query }
  });
  return r.results || [];
}

function copyForAdGroup(name) {
  if (name.startsWith('NL |')) return { rsa: RSA_NL, finalUrl: FINAL_URL_NL };
  if (name.startsWith('EN |')) return { rsa: RSA_EN, finalUrl: FINAL_URL_EN };
  throw new Error(`Ad group "${name}" has no language prefix; refusing to guess copy`);
}

const adGroups = await search(
  `SELECT ad_group.resource_name, ad_group.name FROM ad_group
   WHERE campaign.id = ${CAMPAIGN_ID} AND ad_group.status != 'REMOVED'`
);
const liveAds = await search(
  `SELECT ad_group_ad.resource_name, ad_group.name FROM ad_group_ad
   WHERE campaign.id = ${CAMPAIGN_ID} AND ad_group_ad.status = 'ENABLED'`
);

const pauseOps = liveAds.map((r) => ({
  adGroupAdOperation: {
    update: { resourceName: r.adGroupAd.resourceName, status: 'PAUSED' },
    updateMask: 'status'
  }
}));

const createOps = adGroups.map((r) => {
  const { rsa, finalUrl } = copyForAdGroup(r.adGroup.name);
  return {
    adGroupAdOperation: {
      create: { adGroup: r.adGroup.resourceName, status: 'ENABLED', ad: toRsaAd(rsa, finalUrl) }
    }
  };
});

console.log(`Pausing ${pauseOps.length} ads, creating ${createOps.length}:`);
for (const r of adGroups) console.log(`  ${r.adGroup.name} -> ${copyForAdGroup(r.adGroup.name).finalUrl}`);

if (dryRun) {
  console.log('Dry run, nothing sent.');
  process.exit(0);
}

const result = await googleAdsRequest(`${customer}/googleAds:mutate`, {
  method: 'POST',
  loginCustomerId: managerCustomerId,
  body: { mutateOperations: [...pauseOps, ...createOps], partialFailure: false }
});

const created = result.mutateOperationResponses
  .slice(pauseOps.length)
  .map((r) => r.adGroupAdResult?.resourceName)
  .filter(Boolean);
console.log(`Done. New ads: ${created.length}`);
for (const name of created) console.log(`  ${name}`);
