# Analytics Measurement Plan

**Branch:** `analytics` · **Page version baseline:** `v1`  
**Main score:** valuable leads who hold a call  
**No Google Analytics at launch.** Google Ads remains the ad system.

This doc is the contract for every number, event, and content version. Code must match these definitions.

---

## 1. Funnel stages

| Stage | Meaning | When it becomes true |
|---|---|---|
| visit | A real browser session on a measured page | `page_view` saved with visit_id |
| engaged | Visitor showed meaningful attention | active dwell ≥ 15s **or** section_seen beyond intrigue **or** any CTA event |
| lead | Identity captured first-party | lead row created with contact + privacy acknowledgement |
| contacted | We replied or attempted contact | first_reply_at or contact attempt logged |
| valuable | Binny judged the lead valuable | value_judgment = valuable |
| call_booked | Meeting scheduled | call_status = booked |
| call_held | Meeting happened | call_status = held |
| diligence | Documents / counsel in progress | stage = diligence |
| reserved | Unit reserved | stage = reserved |
| sold | Unit closed | stage = sold |
| lost | Pipeline ended without sale | stage = lost |

Unknown is always valid. Never invent a stage.

---

## 2. KPI dictionary

| KPI | Formula | Notes |
|---|---|---|
| spend | sum(campaign_daily_stats.spend_eur) | Imported from Google Ads CSV |
| CPC | spend ÷ clicks | Ads report |
| cost_per_lead | spend ÷ leads | Last-touch attribution by default |
| cost_per_valuable_lead | spend ÷ valuable leads | Main early economics KPI |
| cost_per_held_call | spend ÷ held calls | **Primary campaign score companion** |
| cost_per_reservation | spend ÷ reservations | Mid-funnel economics |
| cost_per_sale | spend ÷ sales | Compare to broker €4,600–7,000/buyer (F4) |
| visit→lead | leads ÷ visits | |
| lead→valuable | valuable ÷ leads | Quality of acquisition |
| valuable→held | held ÷ valuable | Handling quality |
| held→reserved | reserved ÷ held | Offer / diligence quality |
| reserved→sold | sold ÷ reserved | Close quality |

Always show denominator and sample size. Flag any rate with denominator < 5 as low confidence.

### Main score

**Valuable leads who hold a call.**  
A held call counts even if no next step is agreed. Call result is stored separately.

---

## 3. Lead value judgment

Binny decides. No hidden formula.

| Field | Values |
|---|---|
| value_judgment | `unknown` · `valuable` · `not_valuable` |
| value_judgment_reason | Required when not unknown |
| value_judgment_confidence | `low` · `medium` · `high` |
| value_judgment_at | ISO timestamp |
| value_judgment_by | Operator id (default `binny`) |

Optional facts learned in conversation (each may be unknown):

- capital_band
- buyer_type
- goal
- buying_timeframe
- country
- area_connection
- prior_property_experience
- main_fear

---

## 4. Event contract

Client sends only these events. Names are stable.

| Event | When | Payload extras |
|---|---|---|
| `page_view` | Landing load | page_id, page_version, locale |
| `section_seen` | Section ≥50% visible once | section_id |
| `active_dwell` | Every 15s of active time | seconds |
| `cta_opened` | Fear/details panel opened | cta_id |
| `fear_selected` | Fear button chosen | fear_id |
| `cta_opened` | Booking, email, or WhatsApp CTA chosen | cta_id |
| `handoff_opened` | Email / WhatsApp / calendar opened | channel |

`document_requested` and `lead_submitted` remain in historical reporting for the retired form-gated flow; the live landing no longer emits them.

Do **not** collect: keystrokes, heatmaps, fingerprints, raw IP, mouse trails, continuous scroll %.

### Stable content IDs (shared ES/EN)

| section_id | Job |
|---|---|
| `intrigue` | Opening promise |
| `location` | Location trust |
| `gallery` | Desire / liveability |
| `ownership` | Ownership clarity |
| `economics` | Price / floor / target |
| `evidence` | Developer competence |
| `candor` | Honesty / track record |
| `agency` | Action / documents / questions |

| cta_id | Job |
|---|---|
| `book_call` | Review documents live with the developer |
| `send_whatsapp` | Start a direct WhatsApp conversation |
| `ask_question` | Write-first / fear path |
| `send_email` | Email handoff |
| `send_whatsapp` | WhatsApp handoff |

Page ids: `site_es` (`site/index.html`), `site_en` (`site/en.html`).

---

## 5. Attribution

On arrival, persist:

- visit_id (first-party UUID)
- utm_source, utm_medium, utm_campaign, utm_content, utm_term
- gclid, gbraid, wbraid
- campaign / adgroup / ad / keyword when present
- referrer_class, device_class, locale, page_version

On lead submit, attach visit_id → lead_id forever.

Views:

1. **First touch** — earliest known attributed visit for the lead  
2. **Last touch before lead** — default campaign view  
3. **Full path** — all visits before lead  

Also store self-reported `heard_about` when provided.  
Unknown attribution must remain `unknown`. Never force credit.

Offline conversions to Google Ads (later): valuable lead, call held, reservation, sale.

---

## 6. Content ↔ measurement contract

See also the plan section “Contract between content and measurement.”

- Every published page has page_id, page_version, locale, launch date.
- Tracking keys off stable IDs, never visible copy or CSS classes.
- Meaningful content change → new page_version; old results stay on old version.
- Section seen ≠ section persuaded.
- One important change per version, with a change card:

```
problem · audience · evidence · missing belief · one change ·
page_version · expected result · guardrail · review date
```

Decision rules:

| Signal | Change |
|---|---|
| Wrong people arrive | Campaign / keywords |
| Leave before understanding | Opening / order |
| Fear repeats, answer never seen | Move answer earlier |
| Fear repeats after answer seen | Strengthen proof |
| Many clicks, few valuable | Do not ease CTA; fix targeting |
| Valuable but no held call | Follow-up / handoff |
| Held calls, no reservations | Offer / docs / sales — not vanity landing tweaks |

---

## 7. Privacy & retention

| Data | Retention |
|---|---|
| Anonymous events / visits | 24 months |
| Lead PII + notes | Until sold + legal retention, or deletion request |
| Campaign daily stats | 36 months |
| Experiments / change cards | Indefinite (business record) |
| AI / admin access logs | 12 months |

Anonymous visit data stays joinable to leads via visit_id, but export/delete by lead must remove or anonymise PII fields.

AI MCP access includes full lead PII (operator choice). Access requires admin token + allowlist. All tool calls are audited. MCP is read-only.

---

## 8. Review cadence

**Twice weekly:** tracking health, wasted search terms, negatives.  
**Weekly:** weakest funnel step, objections, one change, version, wait for evidence.

Log repeated decision-driving observations in `field-data-log.md`.

---

## 9. Launch gates (measurement integrity)

Version 1 offer locked **2026-08-10 (F26)**:

- [x] Canonical price = **€236,141** all-in
- [x] Budget = **€1,000/month**
- [x] Paid search = **two campaigns** (EN → `site/en.html`, ES → `site/index.html`)
- [x] `noindex` removed on landing pages (`/analytics` stays noindex)
- [x] "Guaranteed" kept on page — **executive bypass** of approved-claims ban (F26); not a ship-blocker
- [x] Privacy notice updated and linked
- [x] Synthetic ad→sale journey verified against D1 (production)
- [ ] Cloudflare Access on `/analytics*` + `/api/admin*` (still open)
- [ ] SEO + GEO research plan for best organic/AI-citation results (see `seo-geo-research.md`)

---

## 10. Local run & deploy notes

```bash
cp .dev.vars.example .dev.vars   # set ADMIN_TOKEN
npm install
npm run db:migrate:local
npm run dev                      # http://127.0.0.1:8788
npm run test:analytics           # synthetic ad→sale path
```

Dashboard: `/analytics/` (enter admin token from `.dev.vars`).  
Production: https://el-fortin.pages.dev — D1 + `ADMIN_TOKEN` already set.
