#!/usr/bin/env node

/**
 * Keyword Planner pull for the investor-intent buyer.
 *
 * Seeds describe what a Dutch 50–60 professional types when deciding where
 * to put ~€250k for passive income — capital, deeded asset, foreign real
 * estate as investment — not "buy a flat in Valencia".
 *
 * Usage: node keyword-planner-investor.mjs
 */

import { writeFile } from 'node:fs/promises';
import { googleAdsRequest, normalizeCustomerId } from './client.mjs';

const managerCustomerId = normalizeCustomerId(
  process.env.GOOGLE_ADS_MANAGER_CUSTOMER_ID || '925-809-1560'
);
const customerId = normalizeCustomerId(
  process.env.GOOGLE_ADS_CUSTOMER_ID || '664-073-0266'
);

const GEO_NL = 'geoTargetConstants/2528';
const LANG_NL = 'languageConstants/1010';
const LANG_EN = 'languageConstants/1000';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function compactMetrics(m = {}) {
  return {
    searches: Number(m.avgMonthlySearches || 0),
    competition: m.competition || 'UNSPECIFIED',
    competitionIndex:
      m.competitionIndex === undefined || m.competitionIndex === null
        ? null
        : Number(m.competitionIndex),
    lowBid:
      m.lowTopOfPageBidMicros === undefined
        ? null
        : Number(m.lowTopOfPageBidMicros) / 1_000_000,
    highBid:
      m.highTopOfPageBidMicros === undefined
        ? null
        : Number(m.highTopOfPageBidMicros) / 1_000_000
  };
}

async function generateIdeas({ label, language, geo, keywords }) {
  const ideas = [];
  let pageToken;
  do {
    const body = {
      language,
      geoTargetConstants: [geo],
      includeAdultKeywords: false,
      keywordPlanNetwork: 'GOOGLE_SEARCH',
      keywordSeed: { keywords },
      pageSize: 1000
    };
    if (pageToken) body.pageToken = pageToken;
    const data = await googleAdsRequest(
      `customers/${customerId}:generateKeywordIdeas`,
      {
        method: 'POST',
        loginCustomerId: managerCustomerId,
        body
      }
    );
    for (const row of data.results || []) {
      ideas.push({
        text: row.text,
        ...compactMetrics(row.keywordIdeaMetrics)
      });
    }
    pageToken = data.nextPageToken;
  } while (pageToken);
  ideas.sort((a, b) => b.searches - a.searches || a.text.localeCompare(b.text));
  return { label, language, geo, seedCount: keywords.length, ideaCount: ideas.length, ideas };
}

async function historicalMetrics({ label, language, geo, keywords }) {
  const data = await googleAdsRequest(
    `customers/${customerId}:generateKeywordHistoricalMetrics`,
    {
      method: 'POST',
      loginCustomerId: managerCustomerId,
      body: {
        keywords,
        language,
        geoTargetConstants: [geo],
        includeAdultKeywords: false,
        keywordPlanNetwork: 'GOOGLE_SEARCH'
      }
    }
  );
  const results = (data.results || []).map((row) => ({
    text: row.text,
    closeVariants: row.closeVariants || [],
    ...compactMetrics(row.keywordMetrics)
  }));
  results.sort((a, b) => b.searches - a.searches || a.text.localeCompare(b.text));
  return {
    label,
    language,
    geo,
    requested: keywords.length,
    returned: results.length,
    results
  };
}

const IDEA_BATCHES = [
  {
    label: 'NL capital / passive income',
    language: LANG_NL,
    keywords: [
      'passief inkomen',
      'passief inkomen opbouwen',
      'passief inkomen vastgoed',
      'beleggen in vastgoed',
      'investeren in vastgoed',
      'vastgoed beleggen',
      'beleggen met 200.000 euro',
      'groot bedrag beleggen',
      'vermogen beleggen',
      'geld laten renderen',
      'passief inkomen beleggen',
      'inkomen uit vastgoed',
      'rendement uit vastgoed',
      'beleggen 250.000',
      'kapitaal beleggen vastgoed'
    ]
  },
  {
    label: 'NL savings / Box 3 / inflation',
    language: LANG_NL,
    keywords: [
      'alternatief spaarrekening',
      'spaargeld beleggen',
      'rendement op spaargeld',
      'box 3 vastgoed',
      'inflatiebestendig beleggen',
      'waardevast beleggen',
      'spaargeld investeren',
      'beter dan spaarrekening',
      'box 3 beleggen',
      'vermogen bescherming inflatie',
      'waardevast vastgoed',
      'inflatiebestendig vastgoed',
      'spaargeld in vastgoed',
      'alternatief voor sparen'
    ]
  },
  {
    label: 'NL tangible / deeded asset',
    language: LANG_NL,
    keywords: [
      'investeren in stenen',
      'beleggingspand kopen',
      'verhuurd vastgoed kopen',
      'beleggingsappartement kopen',
      'vastgoed op eigen naam',
      'direct vastgoed beleggen',
      'vastgoed zonder gedoe',
      'verhuurde woning kopen',
      'beleggingsappartement',
      'beleggingspand',
      'appartement als belegging',
      'woning kopen voor verhuur',
      'verhuurbeheer vastgoed',
      'professioneel beheerd vastgoed',
      'beheerd beleggingsappartement'
    ]
  },
  {
    label: 'NL foreign real estate as investment',
    language: LANG_NL,
    keywords: [
      'vastgoed buitenland',
      'investeren in buitenlands vastgoed',
      'beleggen in vastgoed buitenland',
      'rendement vastgoed buitenland',
      'tweede woning als investering',
      'vastgoed kopen buitenland',
      'investeren vastgoed europa',
      'beleggingsappartement buitenland',
      'vastgoedbelegging buitenland',
      'appartement kopen buitenland investering',
      'passief inkomen buitenland',
      'vastgoed spanje belegging',
      'investeren in vastgoed spanje',
      'beleggen in spanje vastgoed'
    ]
  },
  {
    label: 'NL paper-vastgoed substitutes',
    language: LANG_NL,
    keywords: [
      'vastgoedfonds',
      'vastgoed obligaties',
      'vastgoed crowdfunding',
      'beleggen in vastgoed zonder eigen pand',
      'vastgoed etf',
      'vastgoedfonds rendement',
      'indirect vastgoed beleggen',
      'vastgoedcertificaat',
      'vastgoed crowdfunding nederland',
      'reits nederland',
      'beleggen vastgoed zonder kopen'
    ]
  },
  {
    label: 'EN capital / passive / europe (NL geo)',
    language: LANG_EN,
    keywords: [
      'passive income real estate europe',
      'property investment europe',
      'invest 250k property',
      'passive income property',
      'real estate investment europe',
      'buy investment property europe',
      'deeded property investment',
      'managed rental property europe',
      'turnkey investment property europe',
      'property investment netherlands',
      'passive income real estate',
      'invest in european property',
      'buy to let europe',
      'foreign property investment'
    ]
  }
];

const HISTORICAL = {
  nl: [
    // Capital / passive income
    'passief inkomen',
    'passief inkomen opbouwen',
    'passief inkomen vastgoed',
    'passief inkomen beleggen',
    'inkomen uit vastgoed',
    'beleggen in vastgoed',
    'investeren in vastgoed',
    'vastgoed beleggen',
    'beleggen met 200.000 euro',
    'beleggen 250.000',
    'groot bedrag beleggen',
    'vermogen beleggen',
    'geld laten renderen',
    'kapitaal beleggen vastgoed',
    'rendement uit vastgoed',
    // Savings / Box 3 / inflation
    'alternatief spaarrekening',
    'spaargeld beleggen',
    'spaargeld investeren',
    'spaargeld in vastgoed',
    'rendement op spaargeld',
    'beter dan spaarrekening',
    'alternatief voor sparen',
    'box 3 vastgoed',
    'box 3 beleggen',
    'inflatiebestendig beleggen',
    'inflatiebestendig vastgoed',
    'waardevast beleggen',
    'waardevast vastgoed',
    // Tangible / deeded
    'investeren in stenen',
    'beleggingspand kopen',
    'beleggingspand',
    'verhuurd vastgoed kopen',
    'beleggingsappartement kopen',
    'beleggingsappartement',
    'vastgoed op eigen naam',
    'direct vastgoed beleggen',
    'vastgoed zonder gedoe',
    'verhuurde woning kopen',
    'appartement als belegging',
    'woning kopen voor verhuur',
    'verhuurbeheer vastgoed',
    'professioneel beheerd vastgoed',
    'beheerd beleggingsappartement',
    // Foreign RE as investment
    'vastgoed buitenland',
    'vastgoed kopen buitenland',
    'investeren in buitenlands vastgoed',
    'beleggen in vastgoed buitenland',
    'rendement vastgoed buitenland',
    'tweede woning als investering',
    'investeren vastgoed europa',
    'beleggingsappartement buitenland',
    'vastgoedbelegging buitenland',
    'passief inkomen buitenland',
    'investeren in vastgoed spanje',
    'beleggen in spanje vastgoed',
    'vastgoed spanje belegging',
    'beleggingspand spanje',
    'beleggingsappartement spanje',
    'huis kopen spanje voor verhuur',
    'appartement kopen spanje voor verhuur',
    'huurrendement spanje',
    'verhuurgarantie spanje',
    // Paper substitutes
    'vastgoedfonds',
    'vastgoed obligaties',
    'vastgoed crowdfunding',
    'beleggen in vastgoed zonder eigen pand',
    'vastgoed etf',
    'indirect vastgoed beleggen',
    // Controls — measure only, do not bid
    'aandelen kopen',
    'etf beleggen',
    'crypto',
    'spaarrekening rente',
    // Tier 4 Spain property (kept for volume context)
    'appartement kopen valencia',
    'appartement kopen spanje',
    'huis kopen spanje'
  ],
  en: [
    'passive income real estate europe',
    'passive income property',
    'passive income real estate',
    'property investment europe',
    'real estate investment europe',
    'invest 250k property',
    'buy investment property europe',
    'invest in european property',
    'managed rental property europe',
    'turnkey investment property europe',
    'deeded property investment',
    'foreign property investment',
    'buy to let europe',
    'property investment spain',
    'property investment valencia',
    'buy to let spain',
    'managed rental property spain',
    'rental yield spain',
    // Controls
    'buy stocks',
    'etf investing',
    'crypto investing',
    // Tier 4
    'buy apartment valencia',
    'apartments for sale valencia'
  ]
};

const out = {
  pulledAt: new Date().toISOString(),
  geo: 'Netherlands',
  productFrame:
    'EU capital seeking passive income via a deeded, managed apartment — not a Spain home listing',
  ideas: [],
  historical: []
};

for (const batch of IDEA_BATCHES) {
  process.stderr.write(`ideas: ${batch.label}\n`);
  out.ideas.push(
    await generateIdeas({
      ...batch,
      geo: GEO_NL
    })
  );
  await sleep(400);
}

process.stderr.write('historical: Dutch\n');
out.historical.push(
  await historicalMetrics({
    label: 'NL curated investor-intent list',
    language: LANG_NL,
    geo: GEO_NL,
    keywords: HISTORICAL.nl
  })
);
await sleep(400);
process.stderr.write('historical: English\n');
out.historical.push(
  await historicalMetrics({
    label: 'EN curated investor-intent list',
    language: LANG_EN,
    geo: GEO_NL,
    keywords: HISTORICAL.en
  })
);

const dest = new URL('./keyword-planner-investor.json', import.meta.url);
await writeFile(dest, JSON.stringify(out, null, 2));
process.stderr.write(`wrote ${dest.pathname}\n`);
console.log(
  JSON.stringify(
    {
      ideaBatches: out.ideas.map((b) => ({
        label: b.label,
        ideaCount: b.ideaCount,
        top: b.ideas.slice(0, 8).map((i) => `${i.text} (${i.searches})`)
      })),
      historical: out.historical.map((h) => ({
        label: h.label,
        returned: h.returned,
        withVolume: h.results.filter((r) => r.searches > 0).length,
        top: h.results
          .filter((r) => r.searches > 0)
          .slice(0, 20)
          .map((r) => `${r.text} (${r.searches})`)
      }))
    },
    null,
    2
  )
);
