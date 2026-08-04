# A6 — Search campaign spec — v1 draft

**Goal:** intercept existing buy-in-Valencia intent. Primary KPI: **cost per named fear** (secondary: cost per booked call). Benchmark to beat long-term: broker channel ≈ €4,600/buyer (F4). Launch does not depend on Uriel — only on the landing page being live.

## Settings

| Setting | Value |
|---|---|
| Network | Google Search only (no Display, no Search Partners) |
| Budget | Contract ceiling **€1,000/month** (F22). Start €15–20/day; scale toward the ceiling only on cost-per-fear data |
| Geo | Germany, Netherlands, Belgium, Austria, Switzerland, Nordics, UK, Ireland |
| Language | English |
| Bidding | Manual/max clicks to start; switch to conversions after ~30 fear-CTA conversions |
| Conversion events | Fear named (primary) · Call booked (secondary) |

## Keywords (phrase/exact only — validate volumes in Keyword Planner first, log to field-data-log)

**Core intent:**
- "buy apartment valencia"
- "buy property valencia spain"
- "new build valencia"
- "valencia property investment"
- "invest in spanish property"
- "buy rental property spain"
- "spain buy to let"
- "valencia real estate for foreigners"

**Adjacent (test at low bid):**
- "best place to buy property in spain rental"
- "spanish property pre sale new development"

**Negative keywords (start list, grow weekly from search-terms report):**
rent, rental (as *seeker*: "apartment for rent valencia"), holiday, vacation, cheap, student, room, ibiza, mallorca, barcelona, madrid, job, visa free — *review search-terms report twice weekly; every irrelevant click is budget.*

## Ad copy rules (P4, P9, P12)

- No yield figures in headlines. No "guaranteed". No exclamation marks.
- Fluent anchor first (Valencia / Metro), honesty marker second, specificity throughout.

**Variant 1 (anchor + specificity):**
- H: Deeded New-Build Near Valencia · 10-Unit Building on Metro L1 · From €209k All-In
- D: Title in your name, handover 2027. Licensed, small building — 9 of 10 units left. See what it is — and what it isn't.

**Variant 2 (honesty-forward):**
- H: Valencia-Area Apartment, Deeded · The Honest Version · No Brochure Talk
- D: A working commuter town on Metro L1 — not the city centre, and we say so. Real comps, real license numbers, one page.

**Variant 3 (question-mirror):**
- H: Buying Property Near Valencia? · Read This Before Any Brochure · 10 Units, Deeded
- D: What a new-build near Valencia actually costs all-in, what it realistically rents for, and what can go wrong. Then decide.

## Tooling (agent-operated)

1. **Account + billing:** Binny only — spending authority never delegated.
2. **One-time build:** agent constructs the campaign via the Cursor browser (Binny logged into ads.google.com), everything created **paused** for review.
3. **Ongoing:** official Google Ads MCP (`googleads/google-ads-mcp`, free, read-only) for weekly pulls — search terms, CTR by variant, cost per named fear → field-data-log. Changes staged as a short list, applied under Binny's eyes.
4. Paid write-enabled MCPs: not justified at one campaign / €15 per day; revisit if channel count grows.

## Week-1 review checklist

- [ ] Search-terms report → new negatives → field-data-log
- [ ] CTR by variant (kill the worst, draft one challenger)
- [ ] Cost per landing visit and per named fear → field-data-log
- [ ] Which fear button gets clicked most → landing reorder decision
