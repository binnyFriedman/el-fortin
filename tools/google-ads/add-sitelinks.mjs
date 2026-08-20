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
validateSitelinks(config.sitelinks);

const campaign = await findCampaign(config.name);
if (!campaign) throw new Error(`Campaign "${config.name}" was not found.`);

if (await hasSitelinks(campaign.id)) {
  console.log(`Campaign "${config.name}" already has sitelinks; no changes made.`);
  process.exit(0);
}

const assetResources = config.sitelinks.map(
  (_, index) => `customers/${customerId}/assets/${-100 - index}`
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

console.log(
  apply
    ? `Added ${config.sitelinks.length} sitelinks to "${config.name}".`
    : `Validated ${config.sitelinks.length} sitelinks for "${config.name}".`
);

async function findCampaign(name) {
  const response = await googleAdsRequest(
    `customers/${customerId}/googleAds:searchStream`,
    {
      method: 'POST',
      body: {
        query: `
          SELECT campaign.id, campaign.resource_name
          FROM campaign
          WHERE campaign.name = '${escapeGaql(name)}'
            AND campaign.status != 'REMOVED'
          LIMIT 1
        `
      }
    }
  );
  return response?.[0]?.results?.[0]?.campaign || null;
}

async function hasSitelinks(campaignId) {
  const response = await googleAdsRequest(
    `customers/${customerId}/googleAds:searchStream`,
    {
      method: 'POST',
      body: {
        query: `
          SELECT campaign.id, campaign_asset.resource_name
          FROM campaign_asset
          WHERE campaign.id = ${campaignId}
            AND campaign_asset.field_type = 'SITELINK'
            AND campaign_asset.status != 'REMOVED'
          LIMIT 1
        `
      }
    }
  );
  return Boolean(response?.[0]?.results?.length);
}

function validateSitelinks(sitelinks) {
  for (const sitelink of sitelinks) {
    if (sitelink.linkText.length > 25) {
      throw new Error(`Sitelink text exceeds 25 characters: ${sitelink.linkText}`);
    }
    if (
      sitelink.description1.length > 35 ||
      sitelink.description2.length > 35
    ) {
      throw new Error(`Sitelink description exceeds 35 characters: ${sitelink.linkText}`);
    }
  }
}

function escapeGaql(value) {
  return value.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
}
