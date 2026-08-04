# Landing Page Build — Handoff Brief

**Mission:** build the A2 landing page for the El Fortín Riba-Roja direct-investor funnel. This brief contains everything needed; read the listed docs before writing any code or copy.

---

## 1. Read in this order (all paths from repo root)

1. `marketing-strategies/approved-claims.md` — the ONLY permitted numbers/phrasings. Overrides everything below.
2. `marketing-strategies/01-direct-investor-funnel/assets/landing-page-copy.md` — **the copy source. The page implements this doc, section by section, in its exact order.** Includes the publish checklist.
2b. `marketing-strategies/01-direct-investor-funnel/assets/visual-design-directives.md` — **v2 visual layer: the SVG asset list, interaction upgrades, and one-belief-per-viewport layout rules.** The v1 page at `site/index.html` exists; v2 de-texts it per these directives.
3. `marketing-strategies/psychology-source-of-truth.md` — §4 sequencing law (why the order is fixed) and §5 red lines.
4. `b2b/pitch-source-of-truth.md` — deal facts with ✅/🟡/⏳ tags; every number on the page traces here.
5. `marketing-strategies/01-direct-investor-funnel/README.md` — funnel context (belief ladder, CTA logic, metrics).
6. `plan/style-guide.md` — visual identity: Fortín Navy `#1B2A4A` / Slate / Parchment `#F7F4EF` backgrounds, Terracotta `#C2703E` accents (~70/30 institutional/Mediterranean), serif headings + sans-serif data/body. Atmosphere: "Swiss private bank", not proptech.
7. `marketing-strategies/field-data-log.md` — F2 (the location objection = fear #0), F18–F21 (why claim discipline is existential).

## 2. ⚠️ Landmine

`plan/brief.md` is a **pre-greenfield developer brief and is NOT authoritative.** It contains banned claims ("4% Minimum Yield Guarantee", "Target Net Yield >10%", "Unmatched Security"). Use it only for background flavor and the 3-page architecture idea (ignored for now — we ship ONE page). When it conflicts with `approved-claims.md` or `landing-page-copy.md` — and it does — they win, always. Same for `plan/current-ref.html`, `plan/content-strategy.md`: visual/structural reference only, never copy.

## 3. Tech decision

- **Single static page** (HTML/CSS/minimal JS), self-contained, mobile-first, fast. Repo precedent: `b2b/investment-teaser-one-pager.html`, `data-room/index.html`. Build at `site/index.html` (new folder).
- English only for v1. (Multilingual later; don't scaffold it now.)
- Will eventually live at **elfortincapital.com** (currently down, Binny restoring). Build domain-agnostic.

## 4. Available assets (`assets/brand/`)

- `El-fortin_logo-1.png` — logo
- `puzol/before/*, after/*, before-compare.jpg, after-compare.jpg` — Puzol track-record photos (✅ real, usable; the before/after pair is the competence block's proof)
- `on-going-construction/*.jpeg` — real Riba-Roja site photos (June 2026)
- `riba-roja-progress/placeholder-0*.jpg` — placeholders, replace when weekly clips (A5) start
- `founder-placeholder.jpg` — TEMP until Uriel's real photos arrive (U-Q13)
- `partners/` — enlaza, enlaza-arquitectura, nodhouses, sofia-martin logos (Uriel emailing 4–5 confirmed collaborator logos + blurbs)
- `interior-*.jpg`, `exterior-1.jpg`, `El-fortin_A/B.jpg`, `3d illustartion.jpg`, `pool-illustration.jpg`, `garage.jpg` — **treat as renders/illustrations and caption them as such** ("render", "illustrative") unless verified as photos — candor rule (P12): never present a render as a built reality.

## 5. Open placeholders (keep visible in the built page)

The copy doc has `[⏳ U-Q#]` markers keyed to `uriel-call-questions.md`. Build them as clearly-styled TODO blocks (e.g., dashed amber outline) so the page is reviewable but visibly unshippable until each resolves. Currently open: story verbatim (Q1 — voice notes pending; never a suggested narrative, F22), years-in-Spain (Q2), family line (Q3), Uriel photos (Q13), calendar link (Q14). Closed since the copy doc was drafted: Q8 floor sentence (Binny drafts within `approved-claims.md`, Uriel signs — F22) and Q15 lead endpoint (Binny holds Uriel's email + phone — get values from Binny at build time). Everything else in the copy doc is verified and final.

## 6. Integrations

- Fear buttons + free-text → for v1, a `mailto:`/WhatsApp deep link is acceptable behind a small JS handler; final endpoint is U-Q15. Fire a JS event (`fear_named`) on click — this becomes the Google Ads conversion.
- Secondary CTA "Book 15 minutes with Uriel" → placeholder link until U-Q14.
- Add a GA4 snippet stub (measurement ID TODO) — cost-per-named-fear is the funnel's primary KPI.

## 7. Definition of done

- Implements `landing-page-copy.md` fully, in order, with zero deviations from `approved-claims.md` (grep the built page for banned words: guaranteed, risk-free, exclusive, revolutionize).
- Renders cleanly at 375px and 1440px; loads fast (optimize/resize images it uses).
- All ⏳ items present as styled TODO blocks, none silently dropped.
- The publish checklist at the bottom of the copy doc is reproduced as an HTML comment at the top of the file.
- Do NOT deploy anywhere — repo file only; Binny reviews first.
