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

const existing = await getNegativeKeywords(campaign.id);
const desired = new Set(config.negativeKeywords.map(normalizeKeyword));
const existingByText = new Map(
  existing.map((criterion) => [
    normalizeKeyword(criterion.keyword.text),
    criterion
  ])
);
const remove = existing.filter(
  (criterion) => !desired.has(normalizeKeyword(criterion.keyword.text))
);
const create = config.negativeKeywords.filter(
  (text) => !existingByText.has(normalizeKeyword(text))
);

if (!remove.length && !create.length) {
  console.log(`Negative keywords for "${config.name}" are already synchronized.`);
  process.exit(0);
}

const operations = [
  ...remove.map((criterion) => ({
    remove: criterion.resourceName
  })),
  ...create.map((text) => ({
    create: {
      campaign: campaign.resourceName,
      negative: true,
      keyword: {
        text,
        matchType: 'BROAD'
      }
    }
  }))
];

await googleAdsRequest(`customers/${customerId}/campaignCriteria:mutate`, {
  method: 'POST',
  body: {
    operations,
    partialFailure: false,
    validateOnly: !apply
  }
});

console.log(
  `${apply ? 'Synchronized' : 'Validated'} negative keywords for ` +
    `"${config.name}": ${create.length} add, ${remove.length} remove.`
);

async function findCampaign(name) {
  const response = await search(`
    SELECT campaign.id, campaign.resource_name
    FROM campaign
    WHERE campaign.name = '${escapeGaql(name)}'
      AND campaign.status != 'REMOVED'
    LIMIT 1
  `);
  return response?.[0]?.campaign || null;
}

async function getNegativeKeywords(campaignId) {
  const response = await search(`
    SELECT
      campaign.id,
      campaign_criterion.resource_name,
      campaign_criterion.keyword.text,
      campaign_criterion.keyword.match_type
    FROM campaign_criterion
    WHERE campaign.id = ${campaignId}
      AND campaign_criterion.type = 'KEYWORD'
      AND campaign_criterion.negative = TRUE
      AND campaign_criterion.status != 'REMOVED'
  `);
  return response.map((row) => row.campaignCriterion);
}

async function search(query) {
  const response = await googleAdsRequest(
    `customers/${customerId}/googleAds:searchStream`,
    { method: 'POST', body: { query } }
  );
  return response.flatMap((batch) => batch.results || []);
}

function normalizeKeyword(value) {
  return value.trim().toLocaleLowerCase();
}

function escapeGaql(value) {
  return value.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
}
