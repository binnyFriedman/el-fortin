#!/usr/bin/env node

import {
  googleAdsRequest,
  normalizeCustomerId
} from './client.mjs';
import { englishCampaign } from './campaigns/english.mjs';
import { spanishCampaign } from './campaigns/spanish.mjs';

const customerId = normalizeCustomerId(
  process.env.GOOGLE_ADS_CUSTOMER_ID || '664-073-0266'
);
const apply = process.argv.includes('--apply');
const localeArgument = process.argv.find((argument) =>
  argument.startsWith('--locale=')
);
const locale = localeArgument?.split('=')[1] || 'en';
const config = {
  en: englishCampaign,
  es: spanishCampaign
}[locale];

if (!config) throw new Error(`Unsupported campaign locale: ${locale}`);

const campaign = await findCampaign(config.name);
if (!campaign) throw new Error(`Campaign "${config.name}" was not found.`);

const [ads, sitelinks] = await Promise.all([
  getAds(campaign.id),
  getSitelinks(campaign.id)
]);

const adsToUpdate = ads.filter(
  (ad) => ad.finalUrls?.[0] !== config.finalUrl
);
if (adsToUpdate.length) {
  await googleAdsRequest(`customers/${customerId}/ads:mutate`, {
    method: 'POST',
    body: {
      operations: adsToUpdate.map((ad) => ({
        update: {
          resourceName: ad.resourceName,
          finalUrls: [config.finalUrl]
        },
        updateMask: 'final_urls'
      })),
      partialFailure: false,
      validateOnly: !apply
    }
  });
}

const desiredSitelinkUrls = new Set(
  config.sitelinks.map((sitelink) => sitelink.finalUrl)
);
const sitelinksNeedReplacement =
  sitelinks.length !== config.sitelinks.length ||
  sitelinks.some((sitelink) => !desiredSitelinkUrls.has(sitelink.finalUrls?.[0]));

if (sitelinksNeedReplacement) {
  const assetResources = config.sitelinks.map(
    (_, index) => `customers/${customerId}/assets/${-200 - index}`
  );
  const mutateOperations = [
    ...config.sitelinks.map((sitelink, index) => ({
      assetOperation: {
        create: {
          resourceName: assetResources[index],
          finalUrls: [sitelink.finalUrl],
          sitelinkAsset: {
            linkText: sitelink.linkText,
            description1: sitelink.description1,
            description2: sitelink.description2
          }
        }
      }
    })),
    ...assetResources.map((asset) => ({
      campaignAssetOperation: {
        create: {
          campaign: campaign.resourceName,
          asset,
          fieldType: 'SITELINK'
        }
      }
    })),
    ...sitelinks.map((sitelink) => ({
      campaignAssetOperation: {
        remove: sitelink.campaignAssetResourceName
      }
    }))
  ];

  await googleAdsRequest(`customers/${customerId}/googleAds:mutate`, {
    method: 'POST',
    body: {
      mutateOperations,
      partialFailure: false,
      validateOnly: !apply
    }
  });
}

if (!adsToUpdate.length && !sitelinksNeedReplacement) {
  console.log(`Destinations for "${config.name}" are already current.`);
} else {
  console.log(
    `${apply ? 'Updated' : 'Validated'} "${config.name}": ` +
      `${adsToUpdate.length} ad destination(s), ` +
      `${sitelinksNeedReplacement ? config.sitelinks.length : 0} sitelink(s).`
  );
}

async function findCampaign(name) {
  const rows = await search(`
    SELECT campaign.id, campaign.resource_name
    FROM campaign
    WHERE campaign.name = '${escapeGaql(name)}'
      AND campaign.status != 'REMOVED'
    LIMIT 1
  `);
  return rows?.[0]?.campaign || null;
}

async function getAds(campaignId) {
  const rows = await search(`
    SELECT
      campaign.id,
      ad_group_ad.ad.resource_name,
      ad_group_ad.ad.final_urls
    FROM ad_group_ad
    WHERE campaign.id = ${campaignId}
      AND ad_group_ad.status != 'REMOVED'
  `);
  return rows.map((row) => row.adGroupAd.ad);
}

async function getSitelinks(campaignId) {
  const rows = await search(`
    SELECT
      campaign.id,
      campaign_asset.resource_name,
      asset.resource_name,
      asset.final_urls
    FROM campaign_asset
    WHERE campaign.id = ${campaignId}
      AND campaign_asset.field_type = 'SITELINK'
      AND campaign_asset.status != 'REMOVED'
  `);
  return rows.map((row) => ({
    campaignAssetResourceName: row.campaignAsset.resourceName,
    resourceName: row.asset.resourceName,
    finalUrls: row.asset.finalUrls
  }));
}

async function search(query) {
  const response = await googleAdsRequest(
    `customers/${customerId}/googleAds:searchStream`,
    { method: 'POST', body: { query } }
  );
  return response.flatMap((batch) => batch.results || []);
}

function escapeGaql(value) {
  return value.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
}
