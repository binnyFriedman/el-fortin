#!/usr/bin/env node

/**
 * Draft a Search experiment: 50/50 cookie split of campaign 24259919998.
 * Control keeps /index-nl. Treatment NL ads point at /expanded-nl.
 * Ad copy and keywords are not changed. The EN ad group is not changed.
 *
 * Search experiments split by cookie, so the same person keeps the same arm.
 *
 * Do not run this until Checkpoint 2 (the live Dutch page is approved).
 * Scheduling waits for Checkpoint 3.
 *
 *   node experiment-expanded-nl.mjs --dry-run     # print the plan, no API calls
 *   node experiment-expanded-nl.mjs --create      # create the draft, do not schedule
 *   node experiment-expanded-nl.mjs --schedule    # only after Checkpoint 3
 *
 * If the API path fights back, create the same experiment in Ads UI →
 * Experiments (custom experiment, 50/50, cookie split) and write the ids into
 * experiment-expanded-nl.json:
 *   { "experimentResource": "...", "treatmentCampaignId": "...", "scheduled": false }
 */

import { writeFile } from 'node:fs/promises';

import { campaignIds, experimentState, STATE_PATH, BASE_CAMPAIGN_ID } from './campaigns.mjs';
import { googleAdsRequest, normalizeCustomerId } from './client.mjs';

const managerCustomerId = normalizeCustomerId(
  process.env.GOOGLE_ADS_MANAGER_CUSTOMER_ID || '925-809-1560'
);
const customerId = normalizeCustomerId(
  process.env.GOOGLE_ADS_CUSTOMER_ID || '664-073-0266'
);
const customer = `customers/${customerId}`;

const FINAL_URL_B = 'https://invest.elfortincapital.com/expanded-nl';
const URL_SUFFIX_B =
  'utm_source=google&utm_medium=cpc&utm_campaign=ef-search-nl-investor-b&utm_content={adgroupid}&utm_term={keyword}';

const dryRun = process.argv.includes('--dry-run');
const create = process.argv.includes('--create');
const schedule = process.argv.includes('--schedule');

function isoDate(offsetDays) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

async function search(query) {
  const data = await googleAdsRequest(`${customer}/googleAds:search`, {
    method: 'POST',
    loginCustomerId: managerCustomerId,
    body: { query }
  });
  return data.results || [];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createDraft() {
  const existing = experimentState();
  if (existing?.experimentResource && existing?.treatmentCampaignId) {
    console.log(`Draft already exists: ${existing.experimentResource}`);
    console.log(`Treatment campaign ${existing.treatmentCampaignId}`);
    return existing;
  }

  const startDate = isoDate(1);
  const endDate = isoDate(29);
  const experiment = {
    name: 'EF | NL | expanded-nl vs index-nl',
    description:
      'Cookie split, 50/50. Treatment NL final URL is /expanded-nl. Ad copy and keywords unchanged. EN group unchanged.',
    type: 'SEARCH_CUSTOM',
    status: 'SETUP',
    suffix: 'B',
    startDate,
    endDate
  };

  console.log(`Creating experiment ${startDate} → ${endDate}`);
  const created = await googleAdsRequest(`${customer}/experiments:mutate`, {
    method: 'POST',
    loginCustomerId: managerCustomerId,
    body: { operations: [{ create: experiment }] }
  });
  const experimentResource = created.results?.[0]?.resourceName;
  if (!experimentResource) {
    throw new Error(`Experiment create returned no resource\n${JSON.stringify(created)}`);
  }

  await googleAdsRequest(`${customer}/experimentArms:mutate`, {
    method: 'POST',
    loginCustomerId: managerCustomerId,
    body: {
      operations: [
        {
          create: {
            experiment: experimentResource,
            name: 'Control · index-nl',
            control: true,
            trafficSplit: 50,
            campaigns: [`${customer}/campaigns/${BASE_CAMPAIGN_ID}`]
          }
        },
        {
          create: {
            experiment: experimentResource,
            name: 'Treatment · expanded-nl',
            control: false,
            trafficSplit: 50
          }
        }
      ]
    }
  });

  const treatmentCampaignId = await waitForTreatment(experimentResource);
  const state = {
    experimentResource,
    treatmentCampaignId,
    baseCampaignId: BASE_CAMPAIGN_ID,
    scheduled: false,
    startedAt: null,
    createdAt: new Date().toISOString()
  };
  await writeFile(STATE_PATH, JSON.stringify(state, null, 2) + '\n');
  console.log(`Wrote ${STATE_PATH}`);
  return state;
}

async function waitForTreatment(experimentResource) {
  const quoted = experimentResource.replaceAll("'", '');
  for (let attempt = 1; attempt <= 24; attempt++) {
    const rows = await search(`
      SELECT experiment_arm.name, experiment_arm.control, experiment_arm.in_design_campaigns
      FROM experiment_arm
      WHERE experiment_arm.experiment = '${quoted}'
    `);
    /* A control arm omits `control` in JSON when it is false. */
    const treatment = rows.find((row) => row.experimentArm?.control !== true);
    const resource =
      treatment?.experimentArm?.campaigns?.[0] ||
      treatment?.experimentArm?.inDesignCampaigns?.[0];
    if (resource) {
      const id = resource.split('/').pop();
      console.log(`Treatment campaign ${id}`);
      return id;
    }
    console.log(`Waiting for the treatment campaign (${attempt}/24)…`);
    await sleep(5000);
  }
  throw new Error(
    'Treatment campaign was not ready. In Ads UI → Experiments, copy the in-design campaign id into experiment-expanded-nl.json and re-run with --create.'
  );
}

async function pointTreatment(treatmentCampaignId) {
  const rows = await search(`
    SELECT campaign.id, campaign.name, campaign.final_url_suffix,
           ad_group.name, ad_group_ad.ad.resource_name, ad_group_ad.ad.final_urls
    FROM ad_group_ad
    WHERE campaign.id = ${treatmentCampaignId}
      AND ad_group_ad.status != 'REMOVED'
  `);

  const baseRows = await search(`
    SELECT ad_group_ad.ad.resource_name
    FROM ad_group_ad
    WHERE campaign.id = ${BASE_CAMPAIGN_ID}
      AND ad_group_ad.status != 'REMOVED'
  `);
  const baseAdResources = new Set(
    baseRows.map((row) => row.adGroupAd?.ad?.resourceName).filter(Boolean)
  );
  const nlAds = rows.filter((row) => String(row.adGroup?.name || '').startsWith('NL |'));
  const shared = nlAds.filter((row) => baseAdResources.has(row.adGroupAd?.ad?.resourceName));
  if (shared.length) {
    throw new Error(
      'Treatment still uses ads from the base campaign. Editing those URLs would move the control too.'
    );
  }
  const enAds = rows.filter((row) => String(row.adGroup?.name || '').startsWith('EN |'));

  console.log('\nFinal URL diff');
  console.log(`  control ${BASE_CAMPAIGN_ID}: NL → /index-nl (unchanged)`);
  for (const row of nlAds) {
    const from = (row.adGroupAd?.ad?.finalUrls || []).join(', ') || '(none)';
    console.log(`  treatment ${row.adGroup.name}: ${from} → ${FINAL_URL_B}`);
  }
  for (const row of enAds) {
    const from = (row.adGroupAd?.ad?.finalUrls || []).join(', ') || '(none)';
    console.log(`  treatment ${row.adGroup.name}: ${from} (unchanged)`);
  }
  console.log(`  treatment suffix: ${URL_SUFFIX_B}`);

  if (nlAds.length === 0) {
    throw new Error('Treatment campaign has no NL ads. Refusing to continue.');
  }

  await googleAdsRequest(`${customer}/ads:mutate`, {
    method: 'POST',
    loginCustomerId: managerCustomerId,
    body: {
      operations: nlAds.map((row) => ({
        update: {
          resourceName: row.adGroupAd.ad.resourceName,
          finalUrls: [FINAL_URL_B]
        },
        updateMask: 'final_urls'
      }))
    }
  });

  const campaignResource =
    rows[0]?.campaign?.resourceName || `${customer}/campaigns/${treatmentCampaignId}`;
  await googleAdsRequest(`${customer}/campaigns:mutate`, {
    method: 'POST',
    loginCustomerId: managerCustomerId,
    body: {
      operations: [
        {
          update: { resourceName: campaignResource, finalUrlSuffix: URL_SUFFIX_B },
          updateMask: 'final_url_suffix'
        }
      ]
    }
  });
}

async function scheduleExperiment(state) {
  if (!state?.experimentResource) {
    throw new Error('No draft in experiment-expanded-nl.json. Run with --create first.');
  }
  if (state.scheduled) {
    console.log(`Already scheduled: ${state.experimentResource}`);
    return;
  }
  console.log(`Scheduling ${state.experimentResource}`);
  await googleAdsRequest(`${state.experimentResource}:scheduleExperiment`, {
    method: 'POST',
    loginCustomerId: managerCustomerId,
    body: { resourceName: state.experimentResource }
  });
  const next = {
    ...state,
    scheduled: true,
    startedAt: new Date().toISOString()
  };
  await writeFile(STATE_PATH, JSON.stringify(next, null, 2) + '\n');
  console.log('Scheduled. Both arms are now live.');
}

function printPlan() {
  const state = experimentState();
  console.log('Dry run. Nothing is sent to Google Ads.');
  console.log(`Base campaign ${BASE_CAMPAIGN_ID} stays on /index-nl.`);
  console.log(`Treatment NL ads would point at ${FINAL_URL_B}.`);
  console.log(`Treatment suffix: ${URL_SUFFIX_B}`);
  console.log('EN ads are left as they are.');
  console.log('Split: SEARCH_CUSTOM, 50/50, cookie-based. Not scheduled.');
  console.log(state ? `Existing state: ${JSON.stringify(state)}` : 'No draft yet.');
  console.log(`Dashboard campaigns right now: ${campaignIds().join(', ')}`);
  console.log('UI fallback: Ads → Experiments → custom experiment, then fill experiment-expanded-nl.json.');
}

if (dryRun || (!create && !schedule)) {
  printPlan();
  if (!dryRun && !create && !schedule) {
    console.log('\nPass --create to make the draft. Pass --schedule only after Checkpoint 3.');
  }
  process.exit(0);
}

if (schedule && !create) {
  await scheduleExperiment(experimentState());
} else {
  const state = await createDraft();
  await pointTreatment(state.treatmentCampaignId);
  console.log('\nDraft is ready and not scheduled. Review it in Ads → Experiments.');
  console.log('Schedule only after Checkpoint 3: node experiment-expanded-nl.mjs --schedule');
  if (schedule) await scheduleExperiment({ ...state, ...experimentState() });
}
