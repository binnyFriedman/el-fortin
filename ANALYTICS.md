# Analytics: what we measure and how to read it

Two places hold the answers, and they answer different questions.

| Question | Where | Why there |
| --- | --- | --- |
| Where does paid traffic die on the page? | D1 `site_events` | Google Ads cannot see scroll, sections, or deal-sheet reads |
| Who enquired, from which campaign? | D1 `site_leads` + the lead email | The lead carries `utm_*` and `gclid` |
| Which ads should get the budget? | Google Ads UI | The conversion tag reports a stored lead back to bidding |

Nothing is collected until the visitor accepts analytics on the banner. Reject
still leaves the form and the contact links fully working; it stores no events
and puts no click IDs on the lead.

## The one Google Ads conversion

Account `AW-18098845262` (El Fortín `664-073-0266`), conversion **Submit lead form**
(`AW-18098845262/fcvJCObXzKMcEM7smbZD`). **Single source:**
[`site/assets/ef-config.js`](site/assets/ef-config.js) — loaded by advertised
pages; do not duplicate the IDs in HTML. Manager Beanie’s `AW-18382198696` is
not used for site leads.

It fires from `site/assets/desk.js` **only after `/api/leads` returns `201`**, so
a failed send is never counted. Google's own event snippet must not be pasted in
as a page-load script — that would count every visit as a lead.

Deliberately **not** conversions: WhatsApp, email, calendar, the deal sheet, and
in-page jumps. They are interest, and they are measured first-party instead.

There is **no CSV import of offline conversions**. The tag is the connection to
Ads. If it ever cannot be configured, an import of `gclid` from `site_leads` is
the fallback, not the plan.

Consent Mode v2 starts denied and is granted on accept, so a rejected visit
still lets Google model conversions without cookies. Both are described in
`site/privacy-policy-en.html`.

## Applying the schema

```sh
wrangler d1 execute el-fortin-analytics --local  --file schema/0002_site_events.sql
wrangler d1 execute el-fortin-analytics --remote --file schema/0002_site_events.sql
```

If `--remote --file` fails with `Authentication error [code: 10000]`, the OAuth
login token cannot reach the D1 import API: pass each statement with `--command`
instead, or use an API token with D1 write permission.

## Reading the funnel

Run these with `wrangler d1 execute el-fortin-analytics --remote --command "..."`,
or in the Cloudflare dashboard under D1 → `el-fortin-analytics` → Console.

`page_id` is the A/B split: `home` is `site/index.html`, `site_index_d` is
`site/index-d.html`, `sheet` is the deal sheet.

**Visits per day, per page**

```sql
SELECT date(occurred_at) AS day, page_id, COUNT(DISTINCT visit_id) AS visits
FROM site_events
WHERE event = 'page_view'
GROUP BY day, page_id
ORDER BY day DESC, visits DESC;
```

**Section funnel — how far the page is actually read.** The share of visits that
reached each chapter. Reading order is not stored, so sort by reach.

```sql
SELECT section_id,
       COUNT(DISTINCT visit_id) AS reached,
       ROUND(100.0 * COUNT(DISTINCT visit_id) / (
         SELECT COUNT(DISTINCT visit_id) FROM site_events
         WHERE event = 'page_view' AND page_id = 'home'
       ), 1) AS pct_of_visits
FROM site_events
WHERE event = 'section_seen' AND page_id = 'home'
GROUP BY section_id
ORDER BY reached DESC;
```

**Where visits die.** The last chapter each visit reached. A pile-up on one
chapter is the chapter to rewrite.

```sql
WITH ranked AS (
  SELECT visit_id, section_id,
         ROW_NUMBER() OVER (PARTITION BY visit_id ORDER BY occurred_at DESC) AS rn
  FROM site_events
  WHERE event = 'section_seen' AND page_id = 'home'
)
SELECT section_id AS died_on, COUNT(*) AS visits
FROM ranked
WHERE rn = 1
GROUP BY section_id
ORDER BY visits DESC;
```

**Scroll depth as a backup.** One row per visit per page, the deepest quarter
reached. Use it to tell "never moved" from "read and left", not as a better
version of the section funnel.

```sql
WITH deepest AS (
  SELECT visit_id, page_id, MAX(depth) AS depth
  FROM site_events
  WHERE event = 'scroll_depth'
  GROUP BY visit_id, page_id
)
SELECT page_id, depth, COUNT(*) AS visits
FROM deepest
GROUP BY page_id, depth
ORDER BY page_id, depth;
```

**Form funnel: reached it, started it, sent it.** `form_submitted` means the
lead is stored; `form_failed` means we lost one and showed the WhatsApp fallback.
A rising `failed` count is an outage, not a bad ad.

```sql
SELECT page_id,
       COUNT(DISTINCT CASE WHEN event = 'page_view'      THEN visit_id END) AS visits,
       COUNT(DISTINCT CASE WHEN event = 'section_seen'
                            AND section_id = 'guestbook' THEN visit_id END) AS saw_form,
       COUNT(DISTINCT CASE WHEN event = 'form_started'   THEN visit_id END) AS started,
       COUNT(DISTINCT CASE WHEN event = 'form_submitted' THEN visit_id END) AS submitted,
       COUNT(DISTINCT CASE WHEN event = 'form_failed'    THEN visit_id END) AS failed
FROM site_events
GROUP BY page_id
ORDER BY visits DESC;
```

**Deal sheet: clicked versus actually read.** The click alone overcounts, because
some visitors bounce on arrival. `sheet` page views are the honest number.

```sql
SELECT COUNT(DISTINCT CASE WHEN event = 'cta_opened' AND cta_id = 'deal_sheet'
                           THEN visit_id END) AS clicked,
       COUNT(DISTINCT CASE WHEN event = 'page_view' AND page_id = 'sheet'
                           THEN visit_id END) AS read_it
FROM site_events;
```

**Alternate conversions.** Useful, never the primary close.

```sql
SELECT channel, COUNT(DISTINCT visit_id) AS visits
FROM site_events
WHERE event = 'handoff_opened'
GROUP BY channel
ORDER BY visits DESC;
```

**Campaign quality.** Visits and stored leads per campaign. Compare with what
Ads reports as **Submit lead form**; they should track closely, allowing for
visitors who rejected analytics.

```sql
SELECT COALESCE(utm_campaign, '(none)') AS campaign,
       COUNT(DISTINCT CASE WHEN event = 'page_view'      THEN visit_id END) AS visits,
       COUNT(DISTINCT CASE WHEN event = 'form_submitted' THEN visit_id END) AS leads
FROM site_events
GROUP BY campaign
ORDER BY visits DESC;
```

**index versus index-d.** Same wiring on both pages, so the lead rate is the
comparison.

```sql
SELECT page_id,
       COUNT(DISTINCT CASE WHEN event = 'page_view'      THEN visit_id END) AS visits,
       COUNT(DISTINCT CASE WHEN event = 'form_submitted' THEN visit_id END) AS leads,
       ROUND(100.0 * COUNT(DISTINCT CASE WHEN event = 'form_submitted' THEN visit_id END)
             / NULLIF(COUNT(DISTINCT CASE WHEN event = 'page_view' THEN visit_id END), 0),
             2) AS lead_rate_pct
FROM site_events
WHERE page_id IN ('home', 'site_index_d')
GROUP BY page_id;
```

**The leads themselves**, with the campaign that produced them.

```sql
SELECT created_at, name, email, phone, unit_type, source,
       utm_source, utm_campaign, gclid, visit_id
FROM site_leads
ORDER BY created_at DESC
LIMIT 50;
```

`visit_id` is the join back to `site_events`: it shows what a person who
enquired actually read first.

```sql
SELECT e.occurred_at, e.event, COALESCE(e.section_id, e.cta_id, '') AS label
FROM site_events e
JOIN site_leads l ON l.visit_id = e.visit_id
WHERE l.email = 'someone@example.com'
ORDER BY e.occurred_at;
```

## Checking it still works after a deploy

1. Load the page, accept analytics, scroll to the bottom, submit a test enquiry.
2. `SELECT event, page_id, depth FROM site_events ORDER BY received_at DESC LIMIT 20;`
   should show `page_view`, `section_seen`, `form_started`, `form_submitted`, and
   a `scroll_depth`.
3. Google Ads → Goals → Conversions: **Submit lead form** should record it. Ads
   can take a few hours to display, so the D1 row is the faster confirmation.
4. Delete the test rows from `site_events` and `site_leads`.
