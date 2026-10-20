/**
 * Pure rules for the local ads dashboard.
 * Thresholds from ADVERTISING.md pilot section.
 */

export const LAUNCH_DATE = '2026-10-01';
export const DAILY_BUDGET_EUR = 40;
export const PILOT_DAYS = 21;
export const LEAD_GOAL = 3;
export const T1_T3_STOP_CLICKS = 150;

/** Noise patterns reused from weekly-review.mjs */
export const NOISE_RE =
  /huren|hypotheek|cursus|boek|podcast|uitleg|wat is|aandelen|etf|crypto|bitcoin|vacature|vakantie|goedkoop|beginners|spaarrekening|goud/;

const T1_T3_RE = /\bT[123]\b|T1 |T2 |T3 /i;

/**
 * @param {{ clicks: number, costEur: number, leads: number, sawForm: number, started: number }} row
 * @returns {{ level: 'green'|'amber'|'red'|'grey', label: string }}
 */
export function adGroupVerdict(row) {
  const clicks = Number(row.clicks || 0);
  const costEur = Number(row.costEur || 0);
  const leads = Number(row.leads || 0);
  const sawForm = Number(row.sawForm || 0);
  const started = Number(row.started || 0);

  if (leads > 0) return { level: 'green', label: 'lead' };
  if (clicks < 10 && costEur < 20) return { level: 'grey', label: 'too early' };
  if (sawForm > 0 || started > 0) return { level: 'amber', label: 'reached form' };
  if (clicks >= 25 || costEur >= 60) return { level: 'red', label: 'spend, no form' };
  return { level: 'amber', label: 'watching' };
}

/**
 * @param {string} name
 */
export function isT1T3(name) {
  return T1_T3_RE.test(name || '');
}

/**
 * @param {{ ads: object, d1: object, days: number, now?: Date }} input
 */
export function buildPilotVerdict({ ads, d1, days, now = new Date() }) {
  const launch = new Date(`${LAUNCH_DATE}T00:00:00Z`);
  const msPerDay = 86_400_000;
  const daysLive = Math.max(1, Math.floor((now - launch) / msPerDay) + 1);
  const daysLeft = Math.max(0, PILOT_DAYS - daysLive);
  const budgetCap = DAILY_BUDGET_EUR * Math.min(daysLive, PILOT_DAYS);

  const allTime = ads.campaignAllTime || {
    costEur: 0,
    clicks: 0,
    conversions: 0
  };
  const spent = Number(allTime.costEur || 0);
  const budgetPace = budgetCap > 0 ? spent / budgetCap : 0;

  const adGroups = ads.adGroupsAllTime || [];
  const t1t3 = adGroups.filter((g) => isT1T3(g.name));
  const t1t3Clicks = t1t3.reduce((s, g) => s + Number(g.clicks || 0), 0);

  const funnelAll = d1.funnelByAdGroupAllTime || [];
  const d1Leads = funnelAll.reduce((s, r) => s + Number(r.leads || 0), 0);
  const healthLeads = Number(d1.health?.d1_leads_all || d1Leads);
  const leads = Math.max(d1Leads, healthLeads, Number(d1.health?.site_leads_all || 0));

  const t1t3SawForm = t1t3.reduce((s, g) => {
    const d = funnelAll.find((f) => String(f.ad_group_id) === String(g.id));
    return s + Number(d?.saw_form || 0) + Number(d?.started || 0) + Number(d?.leads || 0);
  }, 0);

  let budgetLevel = 'green';
  let budgetLabel = 'on pace';
  if (budgetPace > 1.15) {
    budgetLevel = 'red';
    budgetLabel = 'over budget';
  } else if (budgetPace < 0.5 && daysLive >= 3) {
    budgetLevel = 'amber';
    budgetLabel = 'underspending';
  } else if (budgetPace > 0.95) {
    budgetLevel = 'amber';
    budgetLabel = 'near cap';
  }

  let stopLevel = 'green';
  let stopLabel = `${t1t3Clicks}/${T1_T3_STOP_CLICKS} T1–T3 clicks`;
  if (t1t3Clicks >= T1_T3_STOP_CLICKS && t1t3SawForm === 0 && leads === 0) {
    stopLevel = 'red';
    stopLabel = `stop: ${t1t3Clicks} T1–T3 clicks, no form`;
  } else if (t1t3Clicks >= T1_T3_STOP_CLICKS * 0.7 && leads === 0) {
    stopLevel = 'amber';
    stopLabel = `${t1t3Clicks}/${T1_T3_STOP_CLICKS} T1–T3, no lead yet`;
  }

  let leadLevel = 'amber';
  let leadLabel = `${leads}/${LEAD_GOAL} leads`;
  if (leads >= LEAD_GOAL) {
    leadLevel = 'green';
    leadLabel = `${leads}/${LEAD_GOAL} leads — goal met`;
  } else if (daysLive >= PILOT_DAYS && leads === 0) {
    leadLevel = 'red';
    leadLabel = `0/${LEAD_GOAL} leads — pilot ended`;
  } else if (leads === 0 && daysLive >= 10) {
    leadLevel = 'red';
    leadLabel = `${leads}/${LEAD_GOAL} leads`;
  } else if (leads > 0) {
    leadLevel = 'amber';
  } else {
    leadLevel = 'grey';
  }

  let daysLevel = daysLeft <= 3 ? 'amber' : 'green';
  if (daysLeft === 0) daysLevel = 'red';

  return {
    daysLive,
    daysLeft,
    budgetCap,
    spent,
    budgetPace,
    t1t3Clicks,
    leads,
    windowDays: days,
    chips: [
      {
        key: 'budget',
        level: budgetLevel,
        label: `€${spent.toFixed(0)} / €${budgetCap.toFixed(0)} · ${budgetLabel}`
      },
      {
        key: 'stop',
        level: stopLevel,
        label: stopLabel
      },
      {
        key: 'leads',
        level: leadLevel,
        label: leadLabel
      },
      {
        key: 'days',
        level: daysLevel,
        label: daysLeft === 0 ? 'pilot window closed' : `${daysLeft}d left in pilot`
      }
    ]
  };
}

/**
 * Join Ads ad groups with D1 funnel for the window (primary table).
 */
export function joinAdGroups(adGroups, funnelRows) {
  const byId = new Map(
    (funnelRows || []).map((r) => [String(r.ad_group_id), r])
  );
  const joined = (adGroups || []).map((g) => {
    const d = byId.get(String(g.id)) || {};
    const visits = Number(d.visits || 0);
    const sawForm = Number(d.saw_form || 0);
    const started = Number(d.started || 0);
    const leads = Number(d.leads || 0);
    const row = {
      ...g,
      visits,
      sawForm,
      started,
      leads,
      costPerLead: leads > 0 ? g.costEur / leads : null
    };
    row.verdict = adGroupVerdict(row);
    return row;
  });

  // Orphan D1 ad groups with no Ads row (e.g. removed)
  for (const [id, d] of byId) {
    if (id === '(none)') continue;
    if (joined.some((g) => String(g.id) === id)) continue;
    const row = {
      id,
      name: `utm_content=${id}`,
      status: 'UNKNOWN',
      cpcCapEur: 0,
      impressions: 0,
      clicks: 0,
      costEur: 0,
      conversions: 0,
      ctr: 0,
      avgCpc: 0,
      visits: Number(d.visits || 0),
      sawForm: Number(d.saw_form || 0),
      started: Number(d.started || 0),
      leads: Number(d.leads || 0),
      costPerLead: null
    };
    row.verdict = adGroupVerdict(row);
    joined.push(row);
  }

  return joined;
}

/**
 * @param {object[]} terms
 */
export function splitSearchTerms(terms) {
  const list = terms || [];
  const promote = list.filter((t) => t.conversions > 0 || t.clicks >= 5);
  const waste = list
    .filter((t) => t.conversions === 0 && t.clicks > 0)
    .slice(0, 15);
  const noise = list.filter((t) => {
    if (t.conversions > 0 || t.clicks === 0) return false;
    return NOISE_RE.test((t.term || '').toLowerCase());
  });
  return { promote, waste, noise };
}

/**
 * The only glance: leads vs the pilot goal, plus a line when a tier or the
 * stop rule is actually in play. Too-early tiers stay off the page.
 *
 * @param {{ ads: object, d1: object }} input
 */
export function glanceScore({ ads, d1 }) {
  const groups = joinAdGroups(ads.adGroupsAllTime, d1.funnelByAdGroupAllTime);
  const funnelLeads = (d1.funnelByAdGroupAllTime || []).reduce(
    (s, r) => s + Number(r.leads || 0),
    0
  );
  const storedLeads = Number(d1.leadCount ?? d1.health?.site_leads_all ?? 0);
  const leads = Math.max(funnelLeads, storedLeads);

  const t1t3 = groups.filter((g) => isT1T3(g.name));
  const t1t3Clicks = t1t3.reduce((s, g) => s + Number(g.clicks || 0), 0);
  const t1t3Reached = t1t3.reduce(
    (s, g) => s + g.sawForm + g.started + g.leads,
    0
  );
  const stop =
    t1t3Clicks >= T1_T3_STOP_CLICKS && t1t3Reached === 0 && leads === 0;

  const notable = groups.filter((g) => {
    if (g.verdict.level === 'grey') return false;
    if (g.verdict.label === 'watching') return false;
    return true;
  });

  const lines = [];
  if (stop) {
    lines.push({
      level: 'red',
      text: `Stop. ${t1t3Clicks} clicks in T1–T3 and nobody reached the form.`
    });
  } else if (t1t3Clicks >= T1_T3_STOP_CLICKS * 0.7 && leads === 0) {
    lines.push({
      level: 'amber',
      text: `${t1t3Clicks} of ${T1_T3_STOP_CLICKS} T1–T3 clicks. Stop at ${T1_T3_STOP_CLICKS} with no form.`
    });
  }

  for (const g of notable) {
    lines.push({ level: g.verdict.level, text: tierLine(g) });
  }

  let word = 'too early';
  let level = 'grey';
  if (stop) {
    word = 'stop';
    level = 'red';
  } else if (leads >= LEAD_GOAL) {
    word = 'working';
    level = 'green';
  } else if (leads > 0) {
    word = 'not yet';
    level = 'amber';
  } else if (notable.some((g) => g.verdict.level === 'red')) {
    word = 'not working';
    level = 'red';
  } else if (notable.length) {
    word = 'not yet';
    level = 'amber';
  }

  return {
    leads,
    goal: LEAD_GOAL,
    word,
    level,
    lines
  };
}

const SECTION = {
  top: 'the opening',
  figures: 'the return',
  project: 'the place',
  apartments: 'the apartments',
  menu: 'the price',
  progress: 'construction, 25% done',
  guestbook: 'the form'
};

/**
 * One row per ad group that has either page reads or real spend.
 * The steer line is the campaign decision: keep the ad, or the click is wrong.
 */
export function campaignSteer({ ads, d1 }) {
  const names = new Map(
    (ads.adGroupsAllTime || []).map((g) => [String(g.id), g])
  );
  const died = new Map();
  for (const row of d1.diedByAdGroup || []) {
    const id = String(row.ad_group_id);
    const prev = died.get(id);
    if (!prev || Number(row.visits) > prev.visits) {
      died.set(id, { section: row.died_on, visits: Number(row.visits) });
    }
  }

  const rows = [];
  for (const id of names.keys()) {
    if (id === '(none)') continue;
    const ad = names.get(id);
    const funnel = (d1.funnelByAdGroupAllTime || []).find(
      (r) => String(r.ad_group_id) === id
    );
    const exit = died.get(id);
    const visits = Number(funnel?.visits || 0);
    const clicks = Number(ad?.clicks || 0);
    const costEur = Number(ad?.costEur || 0);
    if (visits === 0 && clicks < 5 && costEur < 10) continue;

    const fact = {
      id,
      name: (ad?.name || `utm ${id}`).replace(/^(NL|EN)\s*\|\s*/i, ''),
      clicks,
      costEur,
      visits,
      sawReturn: Number(funnel?.saw_return || 0),
      sawPrice: Number(funnel?.saw_price || 0),
      sawForm: Number(funnel?.saw_form || 0),
      started: Number(funnel?.started || 0),
      leads: Number(funnel?.leads || 0),
      exitSection: exit?.section || null,
      exitVisits: exit?.visits || 0
    };
    fact.steer = steerLine(fact);
    rows.push(fact);
  }

  rows.sort((a, b) => b.costEur - a.costEur || b.visits - a.visits);
  return rows;
}

function steerLine(row) {
  const exitName = SECTION[row.exitSection] || row.exitSection;
  const heroHeavy =
    row.exitSection === 'top' && row.visits > 0 && row.exitVisits / row.visits >= 0.4;
  const reads =
    row.visits >= 5 && row.sawReturn / row.visits >= 0.6;

  if (row.leads > 0) {
    return { level: 'green', text: 'Producing leads. Keep it.' };
  }
  if (row.visits === 0) {
    return { level: 'grey', text: 'Clicks, but nobody accepted analytics, so the page is blind here.' };
  }
  if (row.visits < 5) {
    return { level: 'grey', text: 'Too early to steer.' };
  }
  if (heroHeavy && row.sawForm === 0) {
    return {
      level: 'red',
      text: 'They leave on the opening and never reach the form. This click does not want the offer.'
    };
  }
  if (heroHeavy) {
    return {
      level: 'amber',
      text: 'Half leave on the opening. The ones who stay reach the form and do not write.'
    };
  }
  if (reads && row.exitSection && row.exitSection !== 'guestbook' && row.exitVisits >= 3) {
    return {
      level: 'amber',
      text: `Keep the ad. They read, then stop on ${exitName}.`
    };
  }
  if (row.sawForm >= 2 && row.started === 0) {
    return {
      level: 'amber',
      text: 'Keep the ad. They reach the form and do not write.'
    };
  }
  return {
    level: 'amber',
    text: exitName
      ? `They leave most often on ${exitName}.`
      : 'Reading, no lead yet.'
  };
}

function tierLine(g) {
  const name = g.name.replace(/^(NL|EN)\s*\|\s*/i, '');
  const money = `€${Math.round(g.costEur)} · ${g.clicks} clicks`;
  if (g.leads > 0) return `${name} — ${g.leads} lead${g.leads === 1 ? '' : 's'} · ${money}`;
  if (g.sawForm > 0 || g.started > 0) {
    return `${name} — reached the form, no lead · ${money}`;
  }
  return `${name} — spending, nobody reached the form · ${money}`;
}

/**
 * Merge Ads daily with D1 daily paid visits/leads.
 */
export function mergeDaily(adsDaily, d1Daily) {
  const d1ByDay = new Map((d1Daily || []).map((r) => [r.day, r]));
  const adsByDay = new Map((adsDaily || []).map((r) => [r.day, r]));
  const days = new Set([...adsByDay.keys(), ...d1ByDay.keys()]);
  return [...days]
    .sort()
    .map((day) => {
      const a = adsByDay.get(day) || {};
      const d = d1ByDay.get(day) || {};
      return {
        day,
        spend: Number(a.costEur || 0),
        clicks: Number(a.clicks || 0),
        adsConv: Number(a.conversions || 0),
        visits: Number(d.visits || 0),
        leads: Number(d.leads || 0)
      };
    });
}
