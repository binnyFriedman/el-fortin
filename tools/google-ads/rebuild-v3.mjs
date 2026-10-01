#!/usr/bin/env node

/**
 * Rebuilds campaign 24259919998 into v3: investor-intent Search (NL only).
 *
 * Four CPC-capped tiers from keyword-planner-investor.json:
 *   1. Capital / passive income     — exact, ~EUR 5
 *   2. Tangible / deeded asset      — exact + phrase, ~EUR 3
 *   3. Foreign RE as investment     — exact + phrase, ~EUR 1.50
 *   4. Spain property (ad filters)  — exact + phrase, ~EUR 0.40
 *
 * Campaign stays PAUSED. Ad groups and ads are ENABLED so one flip launches.
 * Belgium geo is removed. Daily budget set to EUR 40.
 * Age 45–64 and in-market Real Estate / Investing added in observation mode.
 *
 * Usage: node rebuild-v3.mjs
 */

import { googleAdsRequest, normalizeCustomerId } from './client.mjs';
import {
  RSA_NL,
  RSA_EN,
  FINAL_URL_EN,
  FINAL_URL_NL,
  assertRsaLengths,
  toRsaAd
} from './rsa-copy.mjs';

const managerCustomerId = normalizeCustomerId(
  process.env.GOOGLE_ADS_MANAGER_CUSTOMER_ID || '925-809-1560'
);
const customerId = normalizeCustomerId(
  process.env.GOOGLE_ADS_CUSTOMER_ID || '664-073-0266'
);
const customer = `customers/${customerId}`;
const CAMPAIGN_ID = process.env.GOOGLE_ADS_CAMPAIGN_ID || '24259919998';
const campaignResource = `${customer}/campaigns/${CAMPAIGN_ID}`;
const BUDGET_RESOURCE = `${customer}/campaignBudgets/15879264921`;
const DAILY_BUDGET_EUR = 40;

const URL_SUFFIX =
  'utm_source=google&utm_medium=cpc&utm_campaign=ef-search-nl-investor&utm_content={adgroupid}&utm_term={keyword}';

const GEO_NL = 'geoTargetConstants/2528';
const GEO_BE = 'geoTargetConstants/2056';
const LANGUAGE_NL = 'languageConstants/1010';
const LANGUAGE_EN = 'languageConstants/1000';

// In-market vertical IDs used with customers/{id}/userInterests/{id}.
const IN_MARKET_REAL_ESTATE = '80131'; // In-market: Real Estate
const IN_MARKET_INVESTING = '80149'; // In-market: Investment Services

const kw = (text, match = 'EXACT') => ({ text, match });
const both = (text) => [kw(text, 'EXACT'), kw(text, 'PHRASE')];

const AD_GROUPS = [
  {
    name: 'NL | T1 Capital passief inkomen',
    cpcEur: 5.0,
    rsa: RSA_NL,
    finalUrl: FINAL_URL_NL,
    keywords: [
      kw('investeren in vastgoed'),
      kw('beleggen in vastgoed'),
      kw('vastgoed beleggen'),
      kw('in vastgoed investeren'),
      kw('in vastgoed beleggen'),
      kw('passief inkomen'),
      kw('passief inkomen vastgoed'),
      kw('passief inkomen opbouwen'),
      kw('geld laten renderen'),
      kw('vermogen beleggen'),
      kw('spaargeld beleggen'),
      kw('spaargeld investeren'),
      kw('rendement op spaargeld'),
      kw('alternatief spaarrekening'),
      kw('alternatief voor sparen'),
      kw('waardevast beleggen'),
      kw('box 3 vastgoed'),
      kw('box 3 beleggen'),
      kw('investeren in onroerend goed'),
      kw('particulier beleggen in vastgoed')
    ]
  },
  {
    name: 'NL | T2 Tangible deeded asset',
    cpcEur: 3.0,
    rsa: RSA_NL,
    finalUrl: FINAL_URL_NL,
    keywords: [
      ...both('beleggingspand kopen'),
      ...both('beleggingspand te koop'),
      ...both('investeren in stenen'),
      ...both('verhuurd vastgoed kopen'),
      ...both('verhuurde woning kopen'),
      ...both('woning kopen voor verhuur'),
      kw('beleggingspand'),
      kw('appartement als belegging'),
      kw('beleggingsappartement'),
      kw('2e huis kopen voor verhuur')
    ]
  },
  {
    name: 'NL | T3 Foreign RE investment',
    cpcEur: 1.5,
    rsa: RSA_NL,
    finalUrl: FINAL_URL_NL,
    keywords: [
      ...both('vastgoed buitenland'),
      ...both('investeren in buitenlands vastgoed'),
      ...both('beleggen in vastgoed buitenland'),
      ...both('investeren in vastgoed spanje'),
      ...both('vastgoed spanje'),
      ...both('vastgoed in spanje'),
      kw('vastgoed kopen buitenland'),
      kw('huis kopen spanje voor verhuur'),
      kw('appartement kopen spanje voor verhuur'),
      kw('beleggingspand spanje'),
      kw('beleggingsappartement spanje'),
      kw('huurrendement spanje')
    ]
  },
  {
    name: 'NL | T4 Appartement kopen Valencia',
    cpcEur: 0.4,
    rsa: RSA_NL,
    finalUrl: FINAL_URL_NL,
    keywords: [
      ...both('appartement kopen valencia'),
      kw('appartement kopen in valencia'),
      kw('appartement valencia kopen'),
      kw('appartement te koop valencia'),
      ...both('appartement kopen spanje')
    ]
  },
  {
    name: 'EN | T1 Property investment',
    cpcEur: 2.5,
    rsa: RSA_EN,
    finalUrl: FINAL_URL_EN,
    keywords: [
      ...both('property investment spain'),
      ...both('property investment europe'),
      ...both('property investment valencia'),
      kw('real estate investment europe'),
      kw('passive income property'),
      kw('passive income real estate'),
      kw('foreign property investment'),
      kw('buy to let spain'),
      kw('buy to let europe')
    ]
  },
  {
    name: 'EN | T4 Apartments for sale Valencia',
    cpcEur: 0.4,
    rsa: RSA_EN,
    finalUrl: FINAL_URL_EN,
    keywords: [
      ...both('apartments for sale valencia'),
      kw('apartments for sale in valencia spain'),
      kw('buy apartment in valencia'),
      kw('buy apartment valencia'),
      kw('apartments to buy in valencia')
    ]
  }
];

const NEW_NEGATIVES = [
  // Occupier / holiday / rent noise
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
  // Research / education noise (investor-tier queries attract these)
  'cursus',
  'boek',
  'podcast',
  'uitleg',
  'wat is',
  'betekenis',
  'beginners',
  'voor beginners',
  'met weinig geld',
  // Paper markets we are not (already have fund/etf/reit; reinforce)
  'aandelen',
  'etf',
  'crypto',
  'bitcoin',
  'rente vergelijken',
  'spaarrekening',
  'goud',
  'ai',
  // Coastal towns / other regions
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
  'orihuela',
  'barcelona',
  'madrid',
  'mallorca',
  'ibiza',
  // Fund / crowdfunding brand noise that surfaces next to vastgoed
  'rabobank',
  'ferax',
  'geert schaaij',
  'vrijheid vastgoed',
  'fastned',
  // T3 phrase-match leak (1 Oct 2026 search terms) — do NOT add bare
  // "beleggen" / "te koop": those block T1/T2 keywords as broad negatives
  'huis kopen',
  'huizen kopen',
  'woning kopen',
  'funda',
  'bankbeslag',
  'estepona',
  'torremolinos',
  'frigiliana',
  'aspe',
  'la nucia',
  'denemarken',
  'frankrijk',
  'italie',
  'italië',
  'griekenland',
  'hongarije',
  'montenegro',
  'marokko',
  'antwerpen',
  'kust',
  'aan zee',
  'waar kan je',
  'het beste in beleggen',
  'geld investeren'
];

function assertLengths(rsa, label) {
  assertRsaLengths(rsa, label);
  if (rsa.headlines.length < 3 || rsa.headlines.length > 15) {
    throw new Error(`${label}: 3–15 headlines required`);
  }
  if (rsa.descriptions.length < 2 || rsa.descriptions.length > 4) {
    throw new Error(`${label}: 2–4 descriptions required`);
  }
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

console.log(
  `Rebuilding ${campaignResource} → v3 (NL only, investor-intent, EUR ${DAILY_BUDGET_EUR}/day)…`
);

const [oldAdGroups, oldCriteria] = await Promise.all([
  search(
    `SELECT ad_group.resource_name FROM ad_group WHERE campaign.id = ${CAMPAIGN_ID} AND ad_group.status != 'REMOVED'`
  ),
  search(`
    SELECT campaign_criterion.resource_name, campaign_criterion.type,
           campaign_criterion.location.geo_target_constant,
           campaign_criterion.keyword.text, campaign_criterion.negative,
           campaign_criterion.age_range.type,
           campaign_criterion.user_interest.user_interest_category
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
    // Drop Belgium — NL only for this pilot
    if (c.type === 'LOCATION' && c.location?.geoTargetConstant === GEO_BE) return true;
    return false;
  })
  .map((r) => ({
    campaignCriterionOperation: { remove: r.campaignCriterion.resourceName }
  }));

const hasNl = oldCriteria.some(
  (r) =>
    r.campaignCriterion.type === 'LOCATION' &&
    r.campaignCriterion.location?.geoTargetConstant === GEO_NL
);
const addGeoOps = hasNl
  ? []
  : [
      {
        campaignCriterionOperation: {
          create: {
            campaign: campaignResource,
            location: { geoTargetConstant: GEO_NL }
          }
        }
      }
    ];

const existingNegatives = new Set(
  oldCriteria
    .filter((r) => r.campaignCriterion.type === 'KEYWORD' && r.campaignCriterion.negative)
    .map((r) => r.campaignCriterion.keyword.text.toLowerCase())
);

const addNegativeOps = NEW_NEGATIVES.filter(
  (t) => !existingNegatives.has(t.toLowerCase())
).map((text) => ({
  campaignCriterionOperation: {
    create: {
      campaign: campaignResource,
      negative: true,
      keyword: { text, matchType: 'BROAD' }
    }
  }
}));

const hasDutch = oldCriteria.some(
  (r) =>
    r.campaignCriterion.type === 'LANGUAGE' &&
    r.campaignCriterion.resourceName.endsWith('~1010')
);
const hasEnglish = oldCriteria.some(
  (r) =>
    r.campaignCriterion.type === 'LANGUAGE' &&
    r.campaignCriterion.resourceName.endsWith('~1000')
);
const addLanguageOps = [];
if (!hasDutch) {
  addLanguageOps.push({
    campaignCriterionOperation: {
      create: {
        campaign: campaignResource,
        language: { languageConstant: LANGUAGE_NL }
      }
    }
  });
}
if (!hasEnglish) {
  addLanguageOps.push({
    campaignCriterionOperation: {
      create: {
        campaign: campaignResource,
        language: { languageConstant: LANGUAGE_EN }
      }
    }
  });
}

// Search campaigns cannot positively target age — exclude outside 45–64.
// Undetermined is left in so Google can still serve when age is unknown.
const existingAges = new Set(
  oldCriteria
    .filter((r) => r.campaignCriterion.type === 'AGE_RANGE')
    .map((r) => r.campaignCriterion.ageRange?.type)
);
const ageOps = [
  'AGE_RANGE_18_24',
  'AGE_RANGE_25_34',
  'AGE_RANGE_35_44',
  'AGE_RANGE_65_UP'
]
  .filter((type) => !existingAges.has(type))
  .map((type) => ({
    campaignCriterionOperation: {
      create: {
        campaign: campaignResource,
        negative: true,
        ageRange: { type }
      }
    }
  }));

// In-market observation: attach after ad groups exist (ad-group criteria).
const interestIds = [IN_MARKET_REAL_ESTATE, IN_MARKET_INVESTING];

const updateCampaignOp = {
  campaignOperation: {
    updateMask: 'name,manual_cpc.enhanced_cpc_enabled,final_url_suffix',
    update: {
      resourceName: campaignResource,
      name: 'EF | Search | NL | Investor',
      manualCpc: { enhancedCpcEnabled: false },
      finalUrlSuffix: URL_SUFFIX
    }
  }
};

const updateBudgetOp = {
  campaignBudgetOperation: {
    updateMask: 'amount_micros',
    update: {
      resourceName: BUDGET_RESOURCE,
      amountMicros: eurToMicros(DAILY_BUDGET_EUR)
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
      create: {
        adGroup: tempAdGroup(i),
        status: 'ENABLED',
        keyword: { text: k.text, matchType: k.match }
      }
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

// Observation audiences on every ad group (bid unmodified = observation).
const createInterestOps = AD_GROUPS.flatMap((_, i) =>
  interestIds.map((interestId) => ({
    adGroupCriterionOperation: {
      create: {
        adGroup: tempAdGroup(i),
        status: 'ENABLED',
        userInterest: {
          userInterestCategory: `${customer}/userInterests/${interestId}`
        }
      }
    }
  }))
);

const mutateOperations = [
  ...removeAdGroupOps,
  ...removeCriterionOps,
  updateCampaignOp,
  updateBudgetOp,
  ...addGeoOps,
  ...addLanguageOps,
  ...addNegativeOps,
  ...ageOps,
  ...createAdGroupOps,
  ...createKeywordOps,
  ...createAdOps,
  ...createInterestOps
];

const result = await googleAdsRequest(`${customer}/googleAds:mutate`, {
  method: 'POST',
  loginCustomerId: managerCustomerId,
  body: { mutateOperations }
});

const summary = {
  removedAdGroups: removeAdGroupOps.length,
  removedCriteria: removeCriterionOps.length,
  addedNegatives: addNegativeOps.length,
  addedAgesExcluded: ageOps.length,
  addedInterestCriteria: createInterestOps.length,
  budgetEur: DAILY_BUDGET_EUR,
  adGroups: [],
  keywords: 0,
  ads: 0
};
for (const row of result.mutateOperationResponses || []) {
  if (row.adGroupResult?.resourceName && !row.adGroupResult.resourceName.includes('/-')) {
    summary.adGroups.push(row.adGroupResult.resourceName);
  }
  if (row.adGroupCriterionResult) summary.keywords += 1;
  if (row.adGroupAdResult) summary.ads += 1;
}
summary.adGroups = summary.adGroups.slice(-AD_GROUPS.length);
console.log(JSON.stringify({ ok: true, summary, operations: mutateOperations.length }, null, 2));
