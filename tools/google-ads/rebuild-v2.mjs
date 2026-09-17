#!/usr/bin/env node

/**
 * Rebuilds campaign 24259919998 into v2:
 * NL + BE only, Dutch + English, five intent tiers with manual CPC caps.
 * Campaign stays PAUSED. Ad groups and ads are ENABLED so one flip launches it.
 *
 * Usage: node rebuild-v2.mjs
 */

import { googleAdsRequest, normalizeCustomerId } from './client.mjs';
import { RSA_NL, RSA_EN, FINAL_URL_EN, FINAL_URL_NL, assertRsaLengths, toRsaAd } from './rsa-copy.mjs';

const managerCustomerId = normalizeCustomerId(
  process.env.GOOGLE_ADS_MANAGER_CUSTOMER_ID || '925-809-1560'
);
const customerId = normalizeCustomerId(
  process.env.GOOGLE_ADS_CUSTOMER_ID || '664-073-0266'
);
const customer = `customers/${customerId}`;
const CAMPAIGN_ID = process.env.GOOGLE_ADS_CAMPAIGN_ID || '24259919998';
const campaignResource = `${customer}/campaigns/${CAMPAIGN_ID}`;

const URL_SUFFIX =
  'utm_source=google&utm_medium=cpc&utm_campaign=ef-search-nlbe&utm_content={adgroupid}&utm_term={keyword}';

const GEO_DE = 'geoTargetConstants/2276';
const LANGUAGE_NL = 'languageConstants/1010';

const kw = (text, match = 'EXACT') => ({ text, match });
const both = (text) => [kw(text, 'EXACT'), kw(text, 'PHRASE')];

const AD_GROUPS = [
  {
    name: 'NL | Investeren in vastgoed Spanje',
    cpcEur: 3.5,
    rsa: RSA_NL,
    finalUrl: FINAL_URL_NL,
    keywords: [
      ...both('investeren in vastgoed spanje'),
      ...both('investeren vastgoed spanje'),
      ...both('investeren in spaans vastgoed'),
      ...both('beleggen in spanje'),
      ...both('vastgoed beleggen spanje'),
      ...both('appartement kopen in spanje voor verhuur'),
      ...both('huis kopen spanje voor verhuur'),
      kw('rendementsvastgoed spanje'),
      kw('beleggingspand spanje'),
      kw('verhuurgarantie spanje'),
      kw('huurrendement spanje')
    ]
  },
  {
    name: 'NL | Nieuwbouw en tweede huis Spanje',
    cpcEur: 1.0,
    rsa: RSA_NL,
    finalUrl: FINAL_URL_NL,
    keywords: [
      ...both('nieuwbouw valencia'),
      ...both('nieuwbouw appartement spanje'),
      kw('nieuwbouwprojecten spanje'),
      kw('nieuwbouwprojecten in spanje'),
      kw('nieuwbouw spanje kopen'),
      kw('nieuwbouw kopen spanje'),
      kw('appartement kopen spanje nieuwbouw'),
      ...both('tweede huis spanje'),
      kw('tweede huis kopen spanje'),
      kw('tweede huis in spanje kopen')
    ]
  },
  {
    name: 'NL | Appartement kopen Valencia',
    cpcEur: 0.5,
    rsa: RSA_NL,
    finalUrl: FINAL_URL_NL,
    keywords: [
      ...both('appartement kopen valencia'),
      kw('appartement kopen in valencia'),
      kw('appartement valencia kopen'),
      kw('appartement te koop valencia')
    ]
  },
  {
    name: 'EN | Spain property investment',
    cpcEur: 2.5,
    rsa: RSA_EN,
    finalUrl: FINAL_URL_EN,
    keywords: [
      ...both('invest in spanish property'),
      ...both('property investment spain'),
      ...both('rental property spain'),
      kw('house in spain invest'),
      kw('spanish real estate investment'),
      kw('buying investment property in spain'),
      kw('buy to let spain'),
      kw('buy to let property in spain'),
      ...both('property investment valencia'),
      kw('valencia property investment'),
      kw('off plan property spain')
    ]
  },
  {
    name: 'EN | Apartments for sale Valencia',
    cpcEur: 0.5,
    rsa: RSA_EN,
    finalUrl: FINAL_URL_EN,
    keywords: [
      ...both('apartments for sale valencia'),
      kw('apartments for sale in valencia spain'),
      kw('buy apartment in valencia'),
      kw('buy apartment valencia'),
      kw('apartments to buy in valencia'),
      kw('new build apartments valencia')
    ]
  }
];

const NEW_NEGATIVES = [
  // Dutch rent / holiday / finance / occupier noise
  'huren',
  'te huur',
  'huur',
  'vakantie',
  'vakantiehuis',
  'vakantiewoning',
  'hypotheek',
  'b&b',
  'villa',
  'villas',
  'goedkoop',
  'goedkope',
  'gratis',
  'baan',
  'vacature',
  'vacatures',
  'kamer',
  'studenten',
  'stage',
  // Coastal towns and islands that appear in NL new-build searches
  'tenerife',
  'canarische',
  'gran canaria',
  'lanzarote',
  'javea',
  'altea',
  'denia',
  'calpe',
  'guardamar',
  'polop',
  'benijofar',
  'santa pola',
  'san pedro del pinatar',
  'torre del mar',
  'marbella',
  'malaga',
  'andalusie',
  'andalusië',
  'moraira',
  'benidorm',
  'orihuela'
];

// Negatives from v1 that now block a tier we want
const NEGATIVES_TO_DROP = ['buy apartment valencia'];

function assertLengths(rsa, label) {
  assertRsaLengths(rsa, label);
  if (rsa.headlines.length < 3 || rsa.headlines.length > 15) throw new Error(`${label}: 3–15 headlines required`);
  if (rsa.descriptions.length < 2 || rsa.descriptions.length > 4) throw new Error(`${label}: 2–4 descriptions required`);
}

async function search(query) {
  const r = await googleAdsRequest(`${customer}/googleAds:search`, {
    method: 'POST',
    loginCustomerId: managerCustomerId,
    body: { query }
  });
  return r.results || [];
}

const eurToMicros = (eur) => String(Math.round(eur * 1_000_000));
const tempAdGroup = (i) => `${customer}/adGroups/-${100 + i}`;

assertLengths(RSA_NL, 'NL');
assertLengths(RSA_EN, 'EN');

console.log(`Rebuilding ${campaignResource} → v2 (NL+BE, Dutch+English, manual CPC tiers)…`);

const [oldAdGroups, oldCriteria] = await Promise.all([
  search(`SELECT ad_group.resource_name FROM ad_group WHERE campaign.id = ${CAMPAIGN_ID} AND ad_group.status != 'REMOVED'`),
  search(`
    SELECT campaign_criterion.resource_name, campaign_criterion.type,
           campaign_criterion.location.geo_target_constant,
           campaign_criterion.keyword.text, campaign_criterion.negative
    FROM campaign_criterion
    WHERE campaign.id = ${CAMPAIGN_ID} AND campaign_criterion.status != 'REMOVED'
  `)
]);

const removeAdGroupOps = oldAdGroups.map((r) => ({
  adGroupOperation: { remove: r.adGroup.resourceName }
}));

const removeCriterionOps = oldCriteria
  .filter((r) => {
    const c = r.campaignCriterion;
    if (c.type === 'LOCATION' && c.location?.geoTargetConstant === GEO_DE) return true;
    if (c.type === 'KEYWORD' && c.negative && NEGATIVES_TO_DROP.includes(c.keyword?.text)) return true;
    return false;
  })
  .map((r) => ({ campaignCriterionOperation: { remove: r.campaignCriterion.resourceName } }));

const existingNegatives = new Set(
  oldCriteria
    .filter((r) => r.campaignCriterion.type === 'KEYWORD' && r.campaignCriterion.negative)
    .map((r) => r.campaignCriterion.keyword.text.toLowerCase())
);

const addNegativeOps = NEW_NEGATIVES.filter((t) => !existingNegatives.has(t.toLowerCase())).map((text) => ({
  campaignCriterionOperation: {
    create: { campaign: campaignResource, negative: true, keyword: { text, matchType: 'BROAD' } }
  }
}));

const hasDutch = oldCriteria.some(
  (r) => r.campaignCriterion.type === 'LANGUAGE' && r.campaignCriterion.resourceName.endsWith('~1010')
);
const addLanguageOps = hasDutch
  ? []
  : [{ campaignCriterionOperation: { create: { campaign: campaignResource, language: { languageConstant: LANGUAGE_NL } } } }];

const updateCampaignOp = {
  campaignOperation: {
    updateMask: 'name,manual_cpc.enhanced_cpc_enabled,final_url_suffix',
    update: {
      resourceName: campaignResource,
      name: 'EF | Search | NL-BE | Deeded',
      manualCpc: { enhancedCpcEnabled: false },
      finalUrlSuffix: URL_SUFFIX
    }
  }
};

const createAdGroupOps = AD_GROUPS.map((g, i) => ({
  adGroupOperation: {
    create: {
      resourceName: tempAdGroup(i),
      name: g.name,
      campaign: campaignResource,
      status: 'ENABLED',
      type: 'SEARCH_STANDARD',
      cpcBidMicros: eurToMicros(g.cpcEur)
    }
  }
}));

const createKeywordOps = AD_GROUPS.flatMap((g, i) =>
  g.keywords.map((k) => ({
    adGroupCriterionOperation: {
      create: { adGroup: tempAdGroup(i), status: 'ENABLED', keyword: { text: k.text, matchType: k.match } }
    }
  }))
);

const createAdOps = AD_GROUPS.map((g, i) => ({
  adGroupAdOperation: {
    create: {
      adGroup: tempAdGroup(i),
      status: 'ENABLED',
      ad: toRsaAd(g.rsa, g.finalUrl)
    }
  }
}));

const mutateOperations = [
  ...removeAdGroupOps,
  ...removeCriterionOps,
  updateCampaignOp,
  ...addLanguageOps,
  ...addNegativeOps,
  ...createAdGroupOps,
  ...createKeywordOps,
  ...createAdOps
];

const result = await googleAdsRequest(`${customer}/googleAds:mutate`, {
  method: 'POST',
  loginCustomerId: managerCustomerId,
  body: { mutateOperations }
});

const summary = { removedAdGroups: removeAdGroupOps.length, removedCriteria: removeCriterionOps.length, addedNegatives: addNegativeOps.length, addedDutch: addLanguageOps.length, adGroups: [], keywords: 0, ads: 0 };
for (const row of result.mutateOperationResponses || []) {
  if (row.adGroupResult?.resourceName && !row.adGroupResult.resourceName.includes('/-')) summary.adGroups.push(row.adGroupResult.resourceName);
  if (row.adGroupCriterionResult) summary.keywords += 1;
  if (row.adGroupAdResult) summary.ads += 1;
}
summary.adGroups = summary.adGroups.slice(-AD_GROUPS.length);
summary.keywords -= 0;
console.log(JSON.stringify({ ok: true, summary, operations: mutateOperations.length }, null, 2));
