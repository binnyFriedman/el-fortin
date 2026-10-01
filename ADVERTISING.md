# How to advertise El Fortín

Live since 1 Oct 2026: `EF | Search | NL | Investor` (campaign `24259919998`). Financial-services advertiser verification for account `664-073-0266` was granted 29 Sep 2026. Netherlands only. Belgium stays off — the Dutch route is an exemption; the Belgian classification is sharper and can require a prospectus.

## Read it like the sheet

The sheet at `site/sheet.html` is the order. Managed building. Passive income. Then the terms: 8% projected yearly return, 4% minimum in the contract, one bedroom €236,000 with furniture and appliances included, delivery August 2027, turnkey. Then the asset: a deeded apartment, and we operate. Ten apartments, one building. The place comes after that. The last line is: indicative, not an offer. The 4% is a minimum in the contract. The 8% is a projected yearly return.

That is a financial vehicle. The buyer takes title to one apartment and a contract that sets the floor. It is not a fund share, and it is not a home to live in.

## Audience

Dutch professionals, about 50–60, deciding where to put ~€250k for passive income. Spain is a detail they accept, not the query they type. Search volume for Spain home-shopping is large and cheap; investor intent is smaller and expensive (`investeren in vastgoed` ~€3.70–11 CPC). The ad does the filtering: deal-sheet headlines, ticket size, AFM sentence.

## Say this

A managed building, passive income. An 8% projected yearly return. A 4% floor in the contract. Deed in the buyer's name. We operate. One bedroom €236,000. Two bedrooms €270,000. Furniture and appliances are included. Operations start August 2027. Net means nothing further is deducted.

The 4% is a commitment Uriel stands behind. The euro amount is filled in per apartment, because each apartment is appraised separately. The 8% is a projection over several years. It is already labelled projected. Do not explain it further in the ad or the opening.

Ad copy lives in `tools/google-ads/rsa-copy.mjs`. AFM licence-exemption sentence is pinned as description 1 on every RSA. Headlines include "Vastgoed Valencia, op uw naam" / "Valencia property, deeded" and "Vanaf € 236.000" / "From EUR 236,000" so place and ticket size filter before the click.

## Do not say

- guaranteed, secured, or risk-free
- 7%, or 10% upside
- a forward-looking blended return, or an IRR. The retired "above 40%" line is what drew the misleading-content flags
- 14 nights. The benefit is real, the terms are not final
- a 15-year term in the opening. It belongs in the later detail
- "low management fees" as a headline
- a bank guarantee. There is none
- a new apartment, a second home, metro, or the historic centre as the reason to click

## The ad that ran before (v1)

`EF | Search | NL-BE | Deeded` spent €58 for 37 clicks and no enquiry. Headlines were "Nieuw appartement in Valencia"; groups were nieuwbouw, tweede huis, and appartement kopen. People arrived shopping for a flat, read the page, and left. Nieuwbouw / tweede huis keywords stay off. Do not turn them back on.

## Current campaign (v3)

Rebuilt by `tools/google-ads/rebuild-v3.mjs` from the pull in `keyword-planner-investor.json` (`keyword-planner-investor.mjs`). Manual CPC. No Smart Bidding until ~15 conversions.

| Tier | Ad group | CPC cap | Intent |
| --- | --- | --- | --- |
| 1 | NL \| T1 Capital passief inkomen | €5.00 | Exact: investeren/beleggen in vastgoed, passief inkomen, spaargeld, box 3, alternatief spaarrekening |
| 2 | NL \| T2 Tangible deeded asset | €3.00 | Exact + phrase: beleggingspand, investeren in stenen, verhuurd vastgoed kopen |
| 3 | NL \| T3 Foreign RE investment | €1.50 | Exact + phrase: vastgoed buitenland, vastgoed spanje, investeren in vastgoed spanje |
| 4 | NL \| T4 Appartement kopen Valencia | €0.40 | Cheap Spain-property; ad copy filters home-shoppers |
| 1 EN | EN \| T1 Property investment | €2.50 | property investment spain/europe, passive income property |
| 4 EN | EN \| T4 Apartments for sale Valencia | €0.40 | buy apartment valencia |

Final URL: Dutch groups → `/index-nl`, English → `/`. UTM: `utm_campaign=ef-search-nl-investor&utm_content={adgroupid}&utm_term={keyword}`.

Observation only (no bid modifiers yet): ages outside 45–64 excluded; in-market Real Estate (`80131`) and Investment Services (`80149`) on every ad group. Bid adjustments only after data.

Landing page is unchanged. The ad carries the terms; the page's rendement section under the hero already states the floor and the projection. Funnel by `utm_content` shows whether investor-tier visitors get past the hero — a separate decision if they do not.

## Compliance

- Dutch €100,000 exemption is in use: each apartment is above that, so the licence sentence applies, not the prospectus sentence. AFM graphic on the Dutch page only. Same sentence pinned as RSA description 1.
- Financial-services verification is complete for this account. Keep claims inside the "Say this" / "Do not say" lists or a new flag can revoke it.
- Put each apartment's 4% amount in that buyer's contract before they sign.

## Pilot

- €40 / day for 21 days (~€840). Investor CPCs need the room; €15/day would starve Tier 1.
- Manual CPC throughout. Revisit Max Conversions after ~15 leads.
- Weekly: `node tools/google-ads/weekly-review.mjs` — search terms, promote converters to exact, add negatives (`--add-negatives "term1,term2"`), read D1 funnel by `utm_content` (queries printed by the script; see `ANALYTICS.md`).
- Stop: new misleading-content flag, or 150 clicks in T1–T3 with no form.
- Success: 3 leads and 1 call in 21 days — not a click count.
