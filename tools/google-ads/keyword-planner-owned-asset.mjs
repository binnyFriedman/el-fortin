#!/usr/bin/env node

/**
 * Keyword Planner pull for the owned-asset buyer, not the yield buyer.
 *
 * Seeds describe what people type before they know a ten-unit rental pool
 * exists: buy an apartment in Valencia, new-build Spain, professionally
 * managed / hassle-free, nearby towns, bricks-not-paper.
 *
 * Usage: node keyword-planner-owned-asset.mjs
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
    label: 'NL buy apartment Valencia / Spain',
    language: LANG_NL,
    keywords: [
      'appartement kopen valencia',
      'appartement kopen in valencia',
      'appartement te koop valencia',
      'huis kopen valencia',
      'woning kopen valencia',
      'appartement kopen spanje',
      'huis kopen spanje',
      'woning kopen in spanje',
      'vastgoed kopen spanje',
      'appartement kopen in spanje',
      'appartement valencia kopen',
      'appartement kopen valencia provincie',
      'appartement kopen bij valencia',
      'onroerend goed kopen spanje',
      'huis kopen in spanje vanuit nederland',
      'appartement kopen spanje nederlanders'
    ]
  },
  {
    label: 'NL new-build Valencia / Spain',
    language: LANG_NL,
    keywords: [
      'nieuwbouw valencia',
      'nieuwbouw appartement valencia',
      'nieuwbouw kopen spanje',
      'nieuwbouw appartement spanje',
      'nieuwbouwproject valencia',
      'nieuwbouwprojecten spanje',
      'nieuwbouwprojecten in spanje',
      'appartement kopen spanje nieuwbouw',
      'nieuwbouw spanje kopen',
      'off plan valencia',
      'off plan appartement spanje',
      'gemeubileerd appartement kopen valencia',
      'gemeubileerd appartement spanje',
      'sleutelklaar appartement valencia',
      'sleutelklaar appartement spanje',
      'instapklaar appartement spanje'
    ]
  },
  {
    label: 'NL managed / hassle-free / bricks',
    language: LANG_NL,
    keywords: [
      'volledig beheerd appartement spanje',
      'professioneel beheerd appartement spanje',
      'vastgoedbeheer spanje',
      'verhuurbeheer spanje',
      'appartement kopen spanje inclusief beheer',
      'appartement kopen spanje zonder zorgen',
      'passief vastgoed spanje',
      'waardevast vastgoed spanje',
      'investeren in stenen',
      'vermogen in vastgoed spanje',
      'appartement als belegging spanje',
      'eigendom appartement spanje',
      'beleggingsappartement spanje',
      'beleggingspand spanje',
      'turnkey appartement spanje',
      'gemeubileerd beleggingsappartement spanje'
    ]
  },
  {
    label: 'NL nearby towns / airport / metro',
    language: LANG_NL,
    keywords: [
      'appartement riba-roja',
      'appartement ribarroja',
      'appartement kopen riba-roja',
      'appartement kopen paterna',
      'appartement kopen l eliana',
      'appartement kopen manises',
      'appartement valencia vliegveld',
      'appartement kopen valencia airport',
      'appartement metro valencia',
      'huis kopen paterna',
      'huis kopen l eliana',
      'nieuwbouw paterna',
      'nieuwbouw l eliana',
      'nieuwbouw ribarroja',
      'appartement kopen horta nord',
      'appartement kopen camp de turia'
    ]
  },
  {
    label: 'EN buy apartment Valencia / Spain',
    language: LANG_EN,
    keywords: [
      'buy apartment valencia',
      'buy apartment in valencia',
      'apartments for sale valencia',
      'apartments for sale in valencia spain',
      'buy property valencia',
      'property for sale valencia',
      'buy apartment spain',
      'buy property in spain',
      'apartments to buy in valencia',
      'valencia apartments for sale',
      'house for sale valencia',
      'buy apartment near valencia'
    ]
  },
  {
    label: 'EN new-build / managed / turnkey',
    language: LANG_EN,
    keywords: [
      'new build apartments valencia',
      'new build apartment spain',
      'off plan apartments valencia',
      'off plan property spain',
      'fully managed property spain',
      'professionally managed apartment spain',
      'hassle free property spain',
      'turnkey apartment spain',
      'turnkey apartment valencia',
      'property management spain',
      'furnished apartment for sale valencia',
      'managed rental property spain',
      'serviced apartment spain',
      'title deed apartment spain'
    ]
  },
  {
    label: 'EN nearby towns',
    language: LANG_EN,
    keywords: [
      'riba-roja apartment',
      'ribarroja del turia property',
      'apartments near valencia airport',
      'paterna apartment for sale',
      'l eliana apartment',
      'manises apartment',
      'valencia metro apartment',
      'new build paterna',
      'camp de turia property'
    ]
  }
];

const HISTORICAL = {
  nl: [
    // Buy the physical thing
    'appartement kopen valencia',
    'appartement kopen in valencia',
    'appartement te koop valencia',
    'appartement valencia kopen',
    'huis kopen valencia',
    'woning kopen valencia',
    'appartement kopen spanje',
    'appartement kopen in spanje',
    'huis kopen spanje',
    'huis kopen in spanje',
    'woning kopen spanje',
    'vastgoed kopen spanje',
    'onroerend goed kopen spanje',
    'appartement kopen spanje vanuit nederland',
    'huis kopen spanje vanuit nederland',
    // New-build / furnished / ready
    'nieuwbouw valencia',
    'nieuwbouw appartement valencia',
    'nieuwbouw kopen spanje',
    'nieuwbouw appartement spanje',
    'nieuwbouwproject valencia',
    'nieuwbouwprojecten spanje',
    'nieuwbouwprojecten in spanje',
    'nieuwbouw spanje kopen',
    'appartement kopen spanje nieuwbouw',
    'off plan valencia',
    'off plan spanje',
    'gemeubileerd appartement kopen valencia',
    'gemeubileerd appartement spanje',
    'sleutelklaar appartement valencia',
    'sleutelklaar appartement spanje',
    'instapklaar appartement spanje',
    'turnkey appartement spanje',
    // Managed / no landlord job
    'volledig beheerd appartement spanje',
    'professioneel beheerd appartement spanje',
    'professioneel beheer vastgoed spanje',
    'vastgoedbeheer spanje',
    'verhuurbeheer spanje',
    'appartement kopen spanje inclusief beheer',
    'appartement kopen spanje zonder zorgen',
    'passief vastgoed spanje',
    'beleggingsappartement spanje',
    'beleggingspand spanje',
    'appartement als belegging spanje',
    'appartement kopen spanje voor verhuur',
    'huis kopen spanje voor verhuur',
    // Ownership / bricks
    'waardevast vastgoed',
    'waardevast vastgoed spanje',
    'investeren in stenen',
    'investeren in vastgoed',
    'vermogen in vastgoed',
    'eigendom appartement spanje',
    'appartement kopen spanje notaris',
    'inflatiebestendig vastgoed',
    // Nearby towns
    'appartement riba-roja',
    'appartement ribarroja',
    'appartement kopen riba-roja',
    'huis kopen ribarroja',
    'nieuwbouw ribarroja',
    'appartement kopen paterna',
    'huis kopen paterna',
    'nieuwbouw paterna',
    'appartement kopen l eliana',
    'huis kopen l eliana',
    'nieuwbouw l eliana',
    'appartement kopen manises',
    'appartement valencia vliegveld',
    'appartement kopen valencia airport',
    'appartement metro valencia',
    'appartement kopen horta nord',
    'appartement kopen camp de turia',
    // Control: holiday / yield / coastal (do not bid)
    'tweede huis spanje',
    'tweede huis kopen spanje',
    'vakantiehuis spanje',
    'vakantiewoning spanje',
    'airbnb kopen spanje',
    'huurrendement spanje',
    'verhuurgarantie spanje',
    'costa blanca appartement',
    'appartement kopen benidorm',
    'appartement kopen alicante',
    'appartement kopen malaga'
  ],
  en: [
    'buy apartment valencia',
    'buy apartment in valencia',
    'buy apartment in valencia spain',
    'apartments for sale valencia',
    'apartments for sale in valencia spain',
    'apartments to buy in valencia',
    'valencia apartments for sale',
    'buy property valencia',
    'property for sale valencia',
    'house for sale valencia',
    'buy apartment spain',
    'buy property in spain',
    'buy apartment near valencia',
    'new build apartments valencia',
    'new build apartment spain',
    'new build property spain',
    'off plan apartments valencia',
    'off plan property spain',
    'off plan valencia',
    'furnished apartment for sale valencia',
    'turnkey apartment spain',
    'turnkey apartment valencia',
    'fully managed property spain',
    'professionally managed apartment spain',
    'hassle free property spain',
    'managed rental property spain',
    'property management spain',
    'serviced apartment spain',
    'title deed apartment spain',
    'buy apartment spain from netherlands',
    'riba-roja apartment',
    'ribarroja del turia property',
    'apartments near valencia airport',
    'paterna apartment for sale',
    'l eliana apartment',
    'manises apartment',
    'valencia metro apartment',
    'new build paterna',
    'camp de turia property',
    // Control
    'holiday home spain',
    'second home spain',
    'buy to let spain',
    'rental yield spain',
    'guaranteed rental income spain',
    'costa blanca apartments',
    'benidorm apartment for sale'
  ]
};

const out = {
  pulledAt: new Date().toISOString(),
  geo: 'Netherlands',
  productFrame:
    'Owned apartment in Valencia, professionally managed — not yield, not holiday home',
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
    label: 'NL curated owned-asset list',
    language: LANG_NL,
    geo: GEO_NL,
    keywords: HISTORICAL.nl
  })
);
await sleep(400);
process.stderr.write('historical: English\n');
out.historical.push(
  await historicalMetrics({
    label: 'EN curated owned-asset list',
    language: LANG_EN,
    geo: GEO_NL,
    keywords: HISTORICAL.en
  })
);

const dest = new URL('./keyword-planner-owned-asset.json', import.meta.url);
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
          .slice(0, 12)
          .map((r) => `${r.text} (${r.searches})`)
      }))
    },
    null,
    2
  )
);
