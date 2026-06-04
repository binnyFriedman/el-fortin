# El Fortín Capital — Visual Style Guide & UI Component Strategy

## Color Palette

The palette splits into two families — **Institutional Foundation** and **Mediterranean Accent** — used at roughly a 70/30 ratio.

### Institutional Foundation (primary)

- **Fortín Navy** `#1B2A4A` — primary text, nav bar, hero overlays. The anchor of the entire identity.
- **Slate** `#3D4F5F` — secondary text, captions, metadata labels.
- **Ash** `#6B7B8D` — tertiary text, disabled states, subtle dividers.
- **Parchment** `#F7F4EF` — primary background. Warm off-white, not sterile. Feels like heavy paper stock.
- **White Stone** `#FDFCFA` — card backgrounds, elevated surfaces.

### Mediterranean Accent (secondary)

- **Terracotta** `#C2703E` — primary accent. CTAs, active states, key data highlights (ROI figures, price callouts). Warm, earthy, Valencian.
- **Sandstone** `#D4B896` — secondary accent. Borders, progress bars, section dividers, tag backgrounds.
- **Warm Linen** `#EDE4D3` — accent backgrounds for callout sections, alternating row tints in tables.

### Functional

- **Success** `#3A7D5C` — verification badges, "secured" indicators, positive deltas.
- **Alert** `#B84D30` — validation errors only. Never used for marketing emphasis.
- **Focus Ring** `#C2703E` at 40% opacity — accessibility focus indicator, consistent with brand.

---

## Typography

### Heading: DM Serif Display

Alternatively *Playfair Display*. Elegant, high-contrast serif. Commands authority without feeling stuffy. Used for section headings, hero statements, and key financial figures when displayed large.

- Weights: Regular 400 only. Let size and color do the work.

### Body & Data: Inter

Engineered for screens, extremely legible at small sizes, excellent tabular figures for financial data. Corporate and precise without being cold.

- Weights: 400 (body), 500 (labels/emphasis), 600 (semi-bold for data callouts), 700 (bold for sub-headings).

### Type Scale (desktop / mobile)

- Hero heading: 56px / 36px — `line-height: 1.1`
- Section heading (H2): 40px / 28px — `line-height: 1.2`
- Sub-heading (H3): 24px / 20px — `line-height: 1.3`
- Body: 17px / 16px — `line-height: 1.6`
- Caption/metadata: 13px / 12px — `line-height: 1.4`, `letter-spacing: 0.04em`, uppercase Inter 500

---

## Spacing Philosophy

An **8px base grid** with generous whitespace. The site should breathe — density signals confidence, not cramming.

- Component internal padding: `24px` (compact), `32px` (default), `48px` (spacious/cards)
- Section vertical padding: `96px` desktop / `64px` mobile
- Max content width: `1200px`, centered
- Gutters: `32px` (desktop grid), `16px` (mobile)
- Between heading and content: `16px`
- Between content blocks within a section: `48px`

The generous spacing reinforces "institutional calm." Nothing feels rushed or crowded.

---

## UI Components

### Buttons

**Primary CTA**
- `background: #C2703E`, `color: #FDFCFA`
- `padding: 16px 32px`, `border-radius: 4px` (barely rounded — solid, not playful)
- `font: Inter 600, 15px, letter-spacing: 0.02em`, uppercase
- Hover: darken to `#A85E32`, `transition: 300ms ease`
- No shadows — flat and grounded

**Secondary**
- `background: transparent`, `border: 1.5px solid #1B2A4A`, `color: #1B2A4A`
- Hover: fill `#1B2A4A`, text flips to `#FDFCFA`

**Ghost / Tertiary**
- Text-only with underline on hover. Used for inline navigation links.

### Cards (Property / Investment)

- `background: #FDFCFA`, `border: 1px solid #EDE4D3`, `border-radius: 6px`, `padding: 32px`
- No drop shadow at rest
- On hover: `box-shadow: 0 8px 32px rgba(27,42,74,0.06)` — subtle lift, `transition: 400ms ease`
- Key numbers (price, ROI, m²) displayed in DM Serif Display at 32px in Fortín Navy
- Labels in Inter 500, 13px, uppercase, Ash color

### Data Tables

- Header row: `background: #1B2A4A`, `color: #FDFCFA`, Inter 600
- Alternating rows: White Stone / Warm Linen
- Numbers right-aligned, Inter 500 with `font-variant-numeric: tabular-nums`
- Row hover: left border `3px solid #C2703E`, `transition: 200ms`

### Progress / Timeline Component (Construction Updates)

- Horizontal stepped timeline
- Completed steps: filled circles in Terracotta with Sandstone connecting line
- Future steps: outlined in Ash
- Each step opens a card on click with a framed construction photo, date stamp, and one-line description

### Navigation

- Fixed top bar, `background: #1B2A4A`, height `72px`
- Logo left, links center (Inter 500, 14px, uppercase, `letter-spacing: 0.06em`, White Stone color), CTA button right
- On scroll past hero: `backdrop-filter: blur(8px)` with 95% opacity — feels heavy and present

### Section Dividers

- No harsh horizontal rules
- Use a `1px` Sandstone line with `64px` margin above/below, or rely on background color alternation (Parchment ↔ White Stone)

---

## Micro-interactions & Motion

All transitions: `ease` or `ease-out`, minimum `300ms`, maximum `600ms`. Nothing snaps; everything glides.

- **Scroll reveals**: Content fades in + translates up `20px` with `500ms` stagger between elements. Triggered once, no repeat.
- **Number counters**: Key financial figures (ROI %, price, m²) count up from 0 when scrolled into view, `600ms ease-out`. Makes data feel alive without being flashy.
- **Image parallax**: Hero and lifestyle images shift at `0.85x` scroll speed — subtle depth, not disorienting.
- **Hover states**: Color shifts and shadow lifts at `300ms`. No scale transforms on cards (avoids feeling "bouncy").
- **Page transitions**: Full-page crossfade at `400ms` if SPA, or instant with skeleton loading states tinted in Warm Linen.

---

## Visual Scroll Journey (Homepage)

### Viewport 1 — Hero

Full-bleed photorealistic render of the completed project — golden-hour light, pool reflection, landscaped courtyard. Overlay: Fortín Navy at 40% opacity from bottom. DM Serif Display headline in white: *"Institutional-Grade Real Estate. Mediterranean Soul."* A single Terracotta CTA: "View the Investment." No clutter. One image, one line, one button.

### Viewport 2 — The Thesis

Parchment background. Three-column layout with large numbers as heroes — projected ROI, price per m², handover date — each in DM Serif at 48px, Fortín Navy, with a one-line Inter caption beneath. Clean, data-first. Below, a single paragraph (3–4 lines max) positioning the investment thesis.

### Viewport 3–4 — The Project

Alternating cards — render on left / specs on right, then flipped. Each card shows a unit type with key specs in a mini data table. Background alternates Parchment / White Stone. Imagery warm and inviting; data crisp and clinical.

### Viewport 5 — Trust & Transparency

Light Warm Linen background. A timeline component showing project milestones — permits, groundbreaking, structure, handover — with real construction photos framed in a Sandstone border. Below: founder portrait (professional, not casual) with a brief credential summary. SAP, Siemens logos shown small in Ash tone — not bragging, just establishing pedigree.

### Viewport 6 — The Numbers

Fortín Navy full-background section. White text. A financial breakdown table with clean rows, Terracotta accent on key totals. ROI projections in a simple, architectural line chart — no 3D, no gradients, just clean SVG lines in Sandstone/Terracotta on navy.

### Viewport 7 — Next Steps

Back to Parchment. Two-column layout: left side explains the process (3 numbered steps, Inter body text), right side is a minimal contact form with Fortín Navy inputs, Sandstone borders, Terracotta submit button. Headline in DM Serif: *"Begin Your Due Diligence."* — not "Buy Now," not "Invest Today." Measured, professional.

### Footer

Fortín Navy background. Minimal — logo, legal disclaimers in Ash 13px, key links, and a small line: *"El Fortín Capital · Riba-Roja, Valencia"*.
