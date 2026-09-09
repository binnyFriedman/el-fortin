# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary buyers: high-earning professionals, aged about 50–60, in the Netherlands, Belgium, and Germany, who value their time. They are considering a ~€230k Valencia investment they will not live in full-time. They read English (campaign language). They are not local Spanish retail buyers and not Uriel/Binny as the audience.

Secondary (do not design for first): the developer (Uriel Nabel) and the campaign operator, who use the same surfaces to sell remaining units.

## Product Purpose

El Fortín Riba-Roja is a 10-unit, fully managed residential building in Riba-roja de Túria, Valencia. The buyer takes title (*escritura*) to a specific apartment. The building is operated as one asset (hotel-grade, ready for guests at operations start). Turnkey delivery: August 2027.

This repository’s digital product is the English campaign site that sells the remaining units. Success is a **lead-form submission** (name, email, phone). That form exists on `site/sniper.html` and hands off to WhatsApp with Uriel. It is **not** yet on `site/index.html` / the current design brief. WhatsApp and Uriel’s booking calendar are contact channels, not the success metric.

## Positioning

Deeded ownership of a named apartment, not a fund share and not a classic residential key handover. Whole-building control: no community of owners to restrict short-stay or corporate rental. Published return is a net % of *valor público* (sale price only). Contractual floor: 4% net; if operations fall short, the developer pays the gap out of pocket. No *aval bancario* on the floor or on buyer advances. Uriel lives in Riba-roja, is the sole development investor, and remains the operator after sale.

## Operating Context

- Legal entity: EL FORTIN CONSTRUCCIONES Y PATRIMONIO S.L. (CIF B22792923). Founder/operator: Uriel Nabel.
- Address: Camino Valencia nº 31, 46190 Riba-roja de Túria, Valencia.
- Licence: Exp. 4497/2025/GEN, 10 dwellings, granted 20 Oct 2025. Architect: José Joaquín Pérez Redón. Constructor: NODHOUSES.
- Public numbers and disagreements live in `facts.md`. Workbook: `developer/sales-info.xlsx`.
- Current inventory: unit 10 sold (Alejandro Contenti y Daniela Hoffman); 9 available.
- Payment: 25% reservation · 25% at 40% construction · 25% at 80% (furniture included) · 25% at *escritura*. No mortgage required.
- Contact: WhatsApp +34 626 459 818 · [uriel.nabel@elfortincapital.com](mailto:uriel.nabel@elfortincapital.com) · [booking calendar](https://calendar.app.google/R9LJvZFYTPwuXNw7A).
- Campaign analytics: first-party (`assets/js/analytics.js`), privacy policy at `site/privacy-policy-en.html`.
- Prior delivered project: El Fortín de Puzol (August 2025), photos in `assets/brand/puzol/`.
- Open questions for Uriel: `open-questions.md`. Do not close them in marketing copy.

## Capabilities and Constraints

Confirmed:

- Lead form: Name, Email, Phone (required). On sniper: submit opens WhatsApp with those details. Future surfaces must include this form; conversion is the submit, not a WhatsApp tap alone.
- Unit types: ~47 m² 1-bed (units 5–8) and ~57 m² 2-bed (1–4, 9–10). Furniture packs €15,959.66 / €19,357.60. Parking stays with the developer.
- Entry used on campaign pages: all-in ≈ *valor público* × 1.12 + furniture; Type A lands near **€229,384**. Do not publish a hard all-in that fails that arithmetic.
- Target blended yield ~7% (workbook mix 6.94% on that sheet’s capital). Floor 4% net of *valor público*.
- Management fees of that month’s gross: 8% long-term · 10% mid-term/corporate · 15% tourism. Initial operating mix 5/5 short-stay / corporate, then market-adjusted.
- Personal use: up to 14 nights / year, **free space, not peak season**. Exact contractual terms still unwritten.
- Open-book financials planned via a personal owner portal — **out of this repo until it exists**. Do not design or imply it has shipped.
- Site is static HTML/CSS/JS under `site/` (`index.html`, `sniper.html`, `privacy-policy-en.html`).

Undecided / must not be invented:

- Tax: ITP vs IVA+AJD in the ~12% line; IRNR; Dutch Box 3 / DE / BE double-tax. Keep off the page unless counsel stands behind it (`open-questions.md`).
- ICU / VUT / tourist-use paperwork is claimed verbally; no file in `developer/`.
- Legal form of revenue pooling; owner opt-out; payout cadence; fuller opex vs “net after management fee”; parking rental from the developer.
- No *aval bancario* — do not imply buyer funds are bank-guaranteed during construction.

## Brand Commitments

- Name: **El Fortín**. This project: El Fortín Riba-Roja (second after El Fortín de Puzol).
- Campaign language: **English** until another language is explicitly added.
- Uriel Nabel is the named operator and the human on the page (on-site photography, not a faceless fund).
- Voice for buyers who value time: short, specific, present tense. State the deed, the floor, the date. Do not fluff. Do not add claims `facts.md` does not support.
- Binding assets: `assets/brand/` (renders, site photos, Uriel on site, Puzol before/after). Logo: `site/assets/logo.png` (and equivalents).
- Contact identity: `elfortincapital.com` email, the WhatsApp number above.

## Evidence on Hand

Real, with paths:

- `facts.md` — only source of public numbers; disagreeing figures stay sourced, never blended.
- `developer/` — licence PDF, visado plans, `sales-info.xlsx`, unit valuation image.
- `assets/brand/` — architectural renders, construction/progress photos, Uriel, Puzol.
- One real purchase: unit 10, Alejandro Contenti y Daniela Hoffman (visited in person; “love for Valencia”). Age mid-60s. Do not turn this into a testimonial they did not give.
- Uriel voice-note transcripts in `assets/brand/uriel-voice-notes/`.
- Return model code: `assets/js/calculator.js` (`EFConfig` / `EFMath`).

Must not fabricate: tourist-licence documents, bank guarantees, extra testimonials, occupancy or yield as proven history, tax advice, owner-portal screens, or a sold-out urgency beyond “9 units remain.”

## Product Principles

1. **Respect their time.** NL/BE/DE professionals in their 50s should see deed, floor, price band, date, and the form without hunting.
2. **Title is the product.** A specific apartment with an *escritura*, operated as one building — not a holiday listing and not a fund.
3. **Publish only what is on file.** `facts.md` wins; open questions stay open; absences stay absences.
4. **Uriel is the accountability.** He lives there, he stays the operator, the form talks to him.
5. **The form is the close.** Name, email, phone submitted is success. Other CTAs support that; they do not replace it.
