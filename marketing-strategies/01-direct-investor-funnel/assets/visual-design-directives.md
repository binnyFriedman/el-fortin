# A2 Visual Design Directives — v2 (de-text the page)

**Why:** picture-superiority + processing-fluency: visuals flip beliefs faster than prose, and visual ease is itself a trust cue (psych doc P3/P4 applied to layout). The v1 page implements the copy faithfully but encodes nearly every belief in paragraphs. v2 rule: **one belief per viewport; every section shows before it tells.** Copy source (`landing-page-copy.md`) and claim rules (`approved-claims.md`) still govern all words and numbers.

## Build these SVGs (in priority order)

| # | Asset | Section | Belief it flips | Spec |
|---|---|---|---|---|
| 1 | **Metro Line 1 transit diagram** | Town (fear #0) | B4 "I understand where this is" | Official transit-map visual language: Riba-roja stop → airport → Valencia centre, minute counts on segments, station dot at the building marked "~500 m". Borrowed institutional credibility — infrastructure style, zero marketing styling. Data bullets become small captions |
| 2 | **Building inventory grid** | New section or Numbers | B7 credible scarcity + B4 human scale | Cross-section of the 10-unit building, seat-map style: unit 10 filled/"sold", 9 outlined/"available". Must always reflect the real count (P16) — update as units sell |
| 3 | **Floor-line yield chart** | Numbers | B5 bounded downside | Horizontal axis-free band chart: 4% floor as a bold line under everything, evidenced base band ≈4%, lighter target band to ~7% labeled "target, not a promise". Replaces most of the yield-card prose |
| 4 | **Fear-button icons** | CTA | Maximize answers | 4 simple line icons (coin/rent, crane/build, hollow-seal paper/floor, stamped folder/documents). Scannable in <1s; picking a picture is lower commitment than endorsing a sentence |
| 5 | **"What happens next" strip** | CTA, under send buttons | Kills "I'm entering a spam funnel" | 3 illustrated steps: you ask → one answer + one document → you decide. Tiny, quiet, monochrome |
| 6 | **Build-to-income timeline** | Numbers or own strip | B1/B5 construction risk is managed | License ✓ (Res. 3658/2025) → works in progress (pin real June 2026 photos) → handover 2027 → letting begins. Honest about when income starts |
| 7 | **Deed illustration + document thumbnails** | Hero or Candor | B4 "I own brick, not paper" | Stylized escritura with blank "your name" line; license shown as stamped-paper thumbnail instead of (or beside) the text codes. Shown documents beat cited numbers |

## Interaction upgrades

- **Puzol before/after slider** (drag handle) replacing the static pair — the visitor performs the transformation (micro-commitment / behavioral momentum). Assets exist: `assets/brand/puzol/before-compare.jpg`, `after-compare.jpg`.
- **Uriel's gaze → CTA**: when real photos arrive (U-Q13), prefer one where he looks slightly off-frame; place so the gaze vector points at the form (eye-tracking: visitors follow pictured gaze). Add to the photo request if a reshoot happens.

## Layout restructure (one belief per viewport)

1. Hero: full-bleed real photo (site/town with metro context) + H1 + one-line sub. Trust bar becomes document thumbnails (SVG #7). Cut the rest.
2. The man: photo + 2-sentence competence line + Puzol slider. Move the long bio paragraph into a collapsible "full background" or trim to 3 sentences.
3. The town: transit diagram (SVG #1) + one intro line + caption-sized data points.
4. Candor: keep as text cards — honesty should read like reading. No decoration here.
5. Numbers: floor chart (SVG #3) + slim price table + timeline (SVG #6). Yield cards shrink to labels on the chart.
6. Building: inventory grid (SVG #2) + floor plans (renders captioned as renders).
7. Letter: unchanged structure (his verbatim words when they arrive) — a letter *should* be text.
8. CTA: icons (SVG #4), then buttons, then next-steps strip (SVG #5), freedom line stays.

## Hard limits (unchanged)

- No stock lifestyle photography (P9 scam-pattern), no happy-couple imagery.
- Renders always captioned "render"/"illustrative" (P12).
- No invented dashboards/data visuals — every chart plots only deal-doc numbers.
- Aesthetic stays `plan/style-guide.md`: papery, restrained, annual-report — not proptech.
- All copy/number rules from `approved-claims.md` apply to text inside SVGs too.
