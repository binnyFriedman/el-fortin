#!/usr/bin/env node

/**
 * Local ads + first-party dashboard.
 *
 * Usage:
 *   node dashboard.mjs
 *   node dashboard.mjs --no-open
 */

import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { fetchAds } from './dashboard/ads.mjs';
import { fetchD1 } from './dashboard/d1.mjs';
import { renderDashboard } from './dashboard/render.mjs';
import { LAUNCH_DATE } from './dashboard/verdict.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, 'dashboard.html');

const NO_OPEN = process.argv.includes('--no-open');

console.log(`Fetching the lead score since ${LAUNCH_DATE}…`);

const [ads, d1] = await Promise.all([
  fetchAds({ launchDate: LAUNCH_DATE }),
  fetchD1({ launchDate: LAUNCH_DATE })
]);

const adsErrs = Object.keys(ads.errors || {});
const d1Errs = Object.keys(d1.errors || {});
if (adsErrs.length) console.warn(`Ads partial errors: ${adsErrs.join(', ')}`);
if (d1Errs.length) console.warn(`D1 partial errors: ${d1Errs.join(', ')}`);

const generatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19) + 'Z';
const html = renderDashboard({ ads, d1, generatedAt });
await writeFile(OUT, html, 'utf8');
console.log(`Wrote ${OUT}`);

if (!NO_OPEN) openBrowser(OUT);

function openBrowser(path) {
  const command =
    process.platform === 'darwin'
      ? 'open'
      : process.platform === 'win32'
        ? 'cmd'
        : 'xdg-open';
  const args =
    process.platform === 'win32' ? ['/c', 'start', '', path] : [path];
  const child = spawn(command, args, { detached: true, stdio: 'ignore' });
  child.unref();
}
