/**
 * Lead score, then one block per ad group: how far people read, and whether to keep the ad.
 */

import { campaignSteer, glanceScore } from './verdict.mjs';

const SECTION = {
  top: 'the opening',
  figures: 'the return',
  project: 'the place',
  apartments: 'the apartments',
  menu: 'the price',
  progress: 'construction, 25% done',
  guestbook: 'the form'
};

export function renderDashboard(data) {
  const { ads, d1, generatedAt } = data;
  const score = glanceScore({ ads, d1 });
  const tiers = campaignSteer({ ads, d1 });
  const errors = [
    ...Object.entries(ads.errors || {}),
    ...Object.entries(d1.errors || {})
  ];

  const stop = score.lines.find((line) => line.text.startsWith('Stop'));
  const err = errors.length
    ? `<p class="line red">${esc(
        errors.map(([k, v]) => `${k}: ${String(v).split('\n')[0]}`).join(' · ')
      )}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(score.leads)}/${esc(String(score.goal))} leads</title>
<style>
  :root { color-scheme: light; }
  body {
    margin: 0;
    background: #f7f6f2;
    color: #1a1a18;
    font: 16px/1.45 "IBM Plex Sans", "Segoe UI", sans-serif;
  }
  main { width: min(40rem, calc(100% - 48px)); margin: 48px auto 64px; }
  .score {
    margin: 0;
    font-size: 64px;
    font-weight: 600;
    letter-spacing: -0.04em;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
  .word { margin: 8px 0 0; font-size: 15px; font-weight: 600; }
  .green { color: #1f6b3a; }
  .amber { color: #8a5a00; }
  .red { color: #9b1c1c; }
  .grey { color: #5c5c56; }
  .line { margin: 16px 0 0; }
  article {
    margin-top: 22px;
    padding-top: 16px;
    border-top: 1px solid #e4e2da;
  }
  h2 { margin: 0; font-size: 16px; font-weight: 600; }
  .meta, .path { margin: 4px 0 0; color: #5c5c56; font-size: 14px; font-variant-numeric: tabular-nums; }
  .steer { margin: 8px 0 0; font-size: 15px; }
  .when { margin: 28px 0 0; font-size: 12px; color: #6b6a64; }
</style>
</head>
<body>
<main>
  <p class="score ${score.level}">${esc(String(score.leads))}/${esc(String(score.goal))}</p>
  <p class="word ${score.level}">${esc(score.word)}</p>
  ${stop ? `<p class="line ${stop.level}">${esc(stop.text)}</p>` : ''}
  ${tiers.map(tierBlock).join('')}
  ${err}
  <p class="when">People on the page are those who accepted analytics. ${esc(generatedAt)}</p>
</main>
</body>
</html>`;
}

function tierBlock(row) {
  const exit = row.exitSection
    ? `Leave most often on ${SECTION[row.exitSection] || row.exitSection} (${row.exitVisits})`
    : 'No section recorded';
  return `<article>
    <h2>${esc(row.name)}</h2>
    <p class="meta">€${Math.round(row.costEur)} · ${row.clicks} ${row.clicks === 1 ? 'click' : 'clicks'} · ${row.visits} on the page</p>
    <p class="path">${row.sawReturn} read the return · ${row.sawPrice} saw the price · ${row.sawForm} reached the form · ${row.started} wrote</p>
    <p class="path">${esc(exit)}</p>
    <p class="steer ${row.steer.level}">${esc(row.steer.text)}</p>
  </article>`;
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
