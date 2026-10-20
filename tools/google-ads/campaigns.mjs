/**
 * Campaign ids for the investor Search pilot and, once created, the
 * expanded-nl experiment arm. The treatment id is written by
 * experiment-expanded-nl.mjs into experiment-expanded-nl.json.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

export const BASE_CAMPAIGN_ID = '24259919998';
export const STATE_PATH = resolve(HERE, 'experiment-expanded-nl.json');

export function experimentState() {
  if (!existsSync(STATE_PATH)) return null;
  try {
    return JSON.parse(readFileSync(STATE_PATH, 'utf8'));
  } catch {
    return null;
  }
}

/** Base campaign first, treatment second when the draft exists. */
export function campaignIds() {
  const fromList = process.env.GOOGLE_ADS_CAMPAIGN_IDS;
  if (fromList) {
    return fromList
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  const base = process.env.GOOGLE_ADS_CAMPAIGN_ID || BASE_CAMPAIGN_ID;
  const treatment = experimentState()?.treatmentCampaignId;
  return treatment ? [String(base), String(treatment)] : [String(base)];
}
