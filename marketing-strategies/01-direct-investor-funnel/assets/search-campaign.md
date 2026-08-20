# A6 — Search campaign spec — v1

**Goal:** intercept existing buy-in-Valencia intent.  
**Primary KPI (owned analytics):** cost per valuable lead / held call.  
**Leading diagnostic:** cost per named fear / lead submitted.  
Benchmark long-term: broker ≈ €4,600–7,000/buyer (F4).

**Version 1 lock (F26):** entry **€236,141**; media **€1,000/month**; two language campaigns.

## Campaigns (two, separate)

| Campaign | Language | Landing | Role |
|---|---|---|---|
| `elfortin-search-en` | English | `https://el-fortin.pages.dev/en` (or custom domain `/en`) | Northern/Western EU capital-preservers |
| `elfortin-search-es` | Spanish | `https://el-fortin.pages.dev/` | Spain / Spanish-intent searchers |

Do **not** mix languages in one campaign. Compare EN vs ES in the dashboard by `locale` / `utm_campaign`.

## Shared settings

| Setting | Value |
|---|---|
| Network | Google Search only (no Display, no Search Partners) |
| Budget | **€1,000/month** total across both campaigns (F22/F26). Start ~€15–20/day combined; scale only on valuable-lead / held-call data |
| Bidding | Manual/max clicks to start; switch to conversions after enough owned conversions exist |
| Conversion signals | Lead submitted (primary for Ads) · later: valuable lead / call held via offline import |
| Tracking | First-party analytics + UTMs + gclid on both landings |

### EN geo (start)

Germany, Netherlands, Belgium, Austria, Switzerland, Nordics, UK, Ireland

### ES geo (start)

Spain (and Spanish-language queries; expand carefully after search-terms review)

## Keywords

### EN (phrase/exact — validate in Keyword Planner)

- buy apartment valencia
- buy property valencia spain
- new build valencia
- valencia property investment
- invest in spanish property
- buy rental property spain
- spain buy to let
- valencia real estate for foreigners

Adjacent (low bid): best place to buy property in spain rental · spanish property pre sale new development

### ES (phrase/exact — validate in Keyword Planner)

- comprar piso valencia
- comprar apartamento valencia
- inversión inmobiliaria valencia
- obra nueva valencia
- comprar vivienda inversión españa
- piso en preventa valencia
- alquiler turístico inversión valencia *(test carefully — may attract operators, not end buyers)*

Negatives (both; grow weekly from search-terms): alquiler de habitación / room rent seeker terms, holiday, vacation, cheap, student, ibiza, mallorca, barcelona, madrid *(as city substitution)*, job, visa free

## Ad copy rules

- No yield figures in headlines. No exclamation marks.
- EN ads: fluent Valencia/Metro anchor + honesty; final price **from €236,141 all-in** when a price is shown.
- ES ads: same facts in Spanish; land on `index.html`.
- "Guaranteed" in **ads**: still avoid in headlines where possible (policy + clarity). Live page keeps contractual floor wording per F26 executive bypass.
- Always send traffic with UTMs, e.g.  
  `?utm_source=google&utm_medium=cpc&utm_campaign=elfortin-search-en&utm_content={creative}&utm_term={keyword}`

### EN variant sketch

- H: Deeded New-Build Near Valencia · 10-Unit Building · From €236,141 All-In
- D: Title in your name, handover 2027. Licensed, small building — 9 of 10 left. See what it is — and what it isn't.

### ES variant sketch

- H: Apartamento en propiedad cerca de Valencia · Preventa desde 236.141 €
- D: Escritura a tu nombre. Entrega prevista 2027. Edificio pequeño, 9 de 10 disponibles. Sin folleto vacío.

## Week-1 review checklist

- [ ] Search-terms report → new negatives → field-data-log (per language)
- [ ] CTR by variant; kill the worst, draft one challenger
- [ ] Cost per landing visit, per lead, per valuable lead — by EN vs ES
- [ ] Which fear / question dominates — by language
- [ ] Do not merge campaigns to "fix" a language underperformance

## Tooling

1. Account + billing: Binny only.
2. Build both campaigns paused for review.
3. Import daily/search-term CSVs into `/analytics` (or ask Cursor to analyse exports).
