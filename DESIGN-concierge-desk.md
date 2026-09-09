---
name: El Fortín Riba-roja — The Concierge Desk
description: Walnut desk and ledger paper; brass for every action; one hotel-green field for the guarantee.
colors:
  walnut: "#2a1f18"
  walnut-deep: "#1c130e"
  walnut-grain: "#35281f"
  brass: "#b08d57"
  brass-light: "#d4b57a"
  brass-dark: "#7a5c2e"
  ledger: "#efe6d2"
  ledger-rule: "rgba(42, 31, 24, 0.14)"
  ink: "#1e1611"
  ink-soft: "#6b5744"
  paper-on-walnut: "#c9ad7f"
  green: "#1f4a3c"
  error-border: "#d68a6a"
  error-text: "#e6a68c"
typography:
  display:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.25rem, 4.9vw, 4.75rem)"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.02em"
    fontVariation: "wdth 96"
  headline:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2rem, 3.6vw, 3.25rem)"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.01em"
    fontVariation: "wdth 100"
  title:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.375rem, 2.2vw, 1.75rem)"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  figure:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(3rem, 6vw, 4.5rem)"
    fontWeight: 500
    lineHeight: 0.9
    fontVariation: "wdth 85"
    fontFeature: "tnum"
  body:
    fontFamily: "Libre Caslon Text, Georgia, Times New Roman, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  data:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 500
    lineHeight: 1.15
    fontFeature: "tnum"
  label:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.12em"
    fontVariation: "wdth 108"
  caption:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.03em"
rounded:
  none: "0"
  hardware: "50%"
spacing:
  hairline: "1px"
  rule: "2rem"
  row: "10px"
  stack-xs: "8px"
  stack-sm: "16px"
  stack: "28px"
  stack-lg: "48px"
  gutter: "clamp(20px, 5vw, 96px)"
  chapter-gap: "clamp(32px, 5vw, 80px)"
  chapter-pad: "clamp(72px, 11vh, 140px)"
  field-pad: "clamp(80px, 12vh, 150px)"
components:
  plate:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.walnut-deep}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 28px"
    height: "48px"
  plate-hover:
    backgroundColor: "{colors.brass-light}"
    textColor: "{colors.walnut-deep}"
  plate-lg:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.walnut-deep}"
    rounded: "{rounded.none}"
    padding: "0 36px"
    height: "56px"
  arrow:
    backgroundColor: "transparent"
    textColor: "{colors.brass-light}"
    rounded: "{rounded.none}"
    size: "48px"
  arrow-hover:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.walnut-deep}"
  masthead-link:
    backgroundColor: "transparent"
    textColor: "{colors.brass-light}"
    typography: "{typography.label}"
    padding: "10px 0"
  masthead-link-hover:
    textColor: "{colors.ledger}"
  tab:
    backgroundColor: "transparent"
    textColor: "{colors.paper-on-walnut}"
    typography: "{typography.label}"
    padding: "10px 6px 12px"
  tab-selected:
    textColor: "{colors.ledger}"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.ledger}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "12px 0"
  input-label:
    textColor: "{colors.paper-on-walnut}"
    typography: "{typography.label}"
  case:
    backgroundColor: "{colors.walnut-deep}"
    textColor: "{colors.ledger}"
    rounded: "{rounded.none}"
    padding: "22px 24px 18px"
  ledger-card:
    backgroundColor: "{colors.ledger}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "22px 24px 24px"
  plaque:
    backgroundColor: "{colors.walnut}"
    textColor: "{colors.ledger}"
    rounded: "{rounded.none}"
    padding: "18px 20px 20px"
  sold-chip:
    backgroundColor: "transparent"
    textColor: "{colors.paper-on-walnut}"
    typography: "{typography.caption}"
    rounded: "{rounded.none}"
    padding: "6px 8px"
---

# Design System: El Fortín Riba-roja — The Concierge Desk

> **Scope.** This record describes the shipped candidate landing `site/index-d.html` (Option D, "The Concierge Desk") with its own stylesheet `site/assets/desk.css` and script `site/assets/desk.js`. It does **not** describe the live site (`site/index.html`, `index-a/b/c.html`, `versions.html`), which follows the Pacaso-derived system in `DESIGN.md`. If Option D is chosen to replace the live site, this file is promoted to `DESIGN.md` and its sidecar `.impeccable/design-concierge-desk.json` to `.impeccable/design.json`. Until then both systems coexist and neither governs the other's pages.
>
> Every token and rule below is evidenced by `desk.css` as built on 2026-09-09, not by the direction contract. Where the two diverge, the build wins and the divergence is noted.

## Overview

**Creative North Star: "The Concierge Desk"**

Someone else runs the desk; you receive the statement. The page is a hotel front desk seen from the guest's side: a dark walnut counter, ledger paper laid on it, brass hardware for everything you can touch, and one green safe for the promise. The reader is a Northern-European professional in their fifties reading on a laptop in the evening. Nothing on the surface asks them to hurry, calculate, or scroll a dashboard. Chapters alternate between walnut (the desk) and ledger paper (the reading), so the eye rests on one of two grounds at any moment and is never asked to parse a third.

Density is editorial, not dense: one headline per chapter, prose at a 62-character measure, and numbers pulled out into brass numerals that read as engraved rather than charted. Motion is physical and short: a tag lifts off its hook, a split-flap cell turns, a settling tag swings like a pendulum. Nothing fades in for its own sake.

Confirmed visual rejections (from the direction contract, held in the build): no cream-serif-olive development-site look, no yield dashboard, no cards floating on drop shadows, no rounded corners, no colour other than brass on an action.

**Key Characteristics:**
- Two grounds only: walnut desk chapters and ruled ledger-paper chapters, alternating.
- Brass is the single action colour and the single money-numeral colour.
- One hotel-green field, used exactly once, for the guarantee.
- Archivo (variable width 62–125) for plates, labels, controls, captions, and every number; Libre Caslon Text for prose.
- Zero radius everywhere; circles only for hardware (hooks, tag holes).
- Depth is engraved (inset highlight top, inset shadow bottom), never floated.
- Motion is physical, under half a second, and fully removed under `prefers-reduced-motion`.

## Colors

A walnut-and-brass palette with one paper tone and one green, all warm (OKLCH hue 50–87) except the green.

### Primary
- **Brass** (`brass`): the only colour an action wears. Plate buttons, tag faces, tab underlines, input baselines, focus outlines (light), arrow borders, brass hairlines between plaques and under the masthead. Also the underline colour of every text link.
- **Brass Light** (`brass-light`): the lifted state of brass (plate hover, checked radio dot, input focus baseline) and the colour of every large money or unit numeral on walnut (unit number, return-path percentages, guarantee sub-line, final plaque value). Focus ring colour.
- **Brass Dark** (`brass-dark`): brass on paper. Link underlines and the letter's team rules on ledger chapters; the scrollbar thumb.

### Secondary
- **Hotel Green** (`green`): the safe. One full-bleed field for the 4% guarantee chapter, warmed by a radial brass wash at top-right. Nowhere else.

### Neutral
- **Walnut** (`walnut`): the desk. Body ground and every "desk" chapter; plaque fill.
- **Walnut Deep** (`walnut-deep`): the shadowed desk. Hero base, key-rack top gradient, cases (rack, split-flap board), guest book, colophon, solid masthead at 94%. Text colour on brass.
- **Walnut Grain** (`walnut-grain`): the key-rack cabinet behind the cubbies.
- **Ledger** (`ledger`): paper. Reading-chapter ground and the listing card; primary text colour on walnut.
- **Ledger Rule** (`ledger-rule`): the ruled line drawn every 2rem across every ledger chapter, and the hairline between data rows on paper.
- **Ink** (`ink`): text on ledger; the 2px rules under rate-card titles.
- **Ink Soft** (`ink-soft`): secondary text on ledger: facts, captions, data-row labels, struck-through sold units.
- **Paper on Walnut** (`paper-on-walnut`): secondary text on walnut: sub-heads, captions, labels, tab rest state, input labels and placeholders (85%), colophon.
- **Error Border / Error Text** (`error-border`, `error-text`): the only state colours outside the palette. Invalid field baseline and its message. Terracotta, not red, so it stays in the desk's temperature.

### Named Rules
**The Brass Is Action Rule.** Brass appears on exactly two kinds of element: things you can press (plates, tags, tabs, arrows, input baselines, links) and money or unit numerals. A decorative element in brass is a violation; a clickable element in any other colour is a violation.

**The One Green Rule.** Hotel green is the guarantee chapter and nothing else. A second green field would make it a theme colour; its rarity is what makes it a safe.

**The Two Grounds Rule.** Every chapter sits on walnut or on ruled ledger paper. Text on walnut is ledger (primary) or paper-on-walnut (secondary); text on ledger is ink (primary) or ink-soft (secondary). No third ground, no white.

## Typography

**Display / Label Font:** Archivo (variable, width 62–125, weight 100–900; self-hosted `assets/fonts/archivo-variable-latin.woff2`), with Helvetica Neue and Arial fallback.
**Body Font:** Libre Caslon Text 400 and 700 (self-hosted `libre-caslon-text-{400,700}-latin.woff2`), with Georgia fallback.

**Character:** Engraved plates and a bound guest book. Archivo does the desk's work: headlines, labels, controls, captions, every number. Libre Caslon Text carries only what a person would read as prose. The pairing is set by the width axis, not by weight: everything Archivo is weight 500 or 600, and hierarchy comes from how wide or narrow the letters are set.

### Hierarchy
- **Display** (Archivo 500, `clamp(2.25rem, 4.9vw, 4.75rem)`, line-height 1.02, tracking −0.02em, width 96): the hero promise only. Set in warm white (`#fbf6ea`) with a soft 28px text-shadow over the photograph; two lines at ≥900px, the line-break is dropped below.
- **Headline** (Archivo 500, `clamp(2rem, 3.6vw, 3.25rem)`, line-height 1.05, tracking −0.01em, width 100, `text-wrap: balance`): one per chapter, followed by 28px before the prose.
- **Title** (Archivo 500, `clamp(1.375rem, 2.2vw, 1.75rem)`, line-height 1.05): sub-titles within a chapter (statement head, unit type). Rate-card room titles run larger (2rem) with a 2px ink rule under them.
- **Figure** (Archivo 500, `clamp(3rem, 6vw, 4.5rem)` up to `clamp(4rem, 8vw, 6rem)` on the guarantee plate, line-height 0.9, width 84–85, tabular numerals): the engraved numeral. Unit numbers, the 4% plate. Tag numerals use the same voice smaller (`clamp(1.125rem, 2.4vw, 1.75rem)`, 600, width 90).
- **Body** (Libre Caslon Text 400, 1.125rem, line-height 1.6, measure 62ch): all prose. The manager's letter runs 1.1875rem. Bold prose is 600.
- **Data** (Archivo 500–600, 0.9375rem, tabular numerals): every `dt`/`dd` row on board, rate card, team list, and fee table; values 600 and right-aligned on paper, 500 on walnut.
- **Label** (Archivo 600, 0.8125–0.875rem, tracking 0.10–0.14em, uppercase, width 108–112): plate text, masthead, tabs, form labels, plaque keys, the "Sold" chip, the letter's signature.
- **Caption** (Archivo 400, 0.75–0.8125rem, tracking 0.02–0.03em): figure captions, notes under boards, the hero provenance note, the colophon.

### Named Rules
**The Plates-and-Book Rule.** If it is a label, a control, a caption, or a number, it is Archivo. If a person would read it as a sentence, it is Libre Caslon Text. A number set in Caslon or a paragraph set in Archivo is a violation.

**The Width-Not-Weight Rule.** Archivo hierarchy is carried on the width axis. Numerals are narrow (84–92), headlines are near-normal (96–100), plates and labels are wide (108–112). Weight stays at 500 for anything large and 600 for anything small and uppercase; nothing goes bolder.

**The Tabular Money Rule.** Every euro amount, percentage, and area figure is `font-variant-numeric: tabular-nums` so columns of money line up on the ledger.

## Layout

One fluid gutter (`clamp(20px, 5vw, 96px)`) frames every chapter; there is no max-width container, so chapters run edge to edge and the gutter does the framing. Prose is held to a 62ch measure. Chapters are two-column grids at ≥900px on a shared 12-column base, split 6/6 (front desk, board), 5/7 (letter, guest book), 4/8 (the safe), or 7/5 with named areas (the return statement); below 900px they stack to one column with the figure below the text (the letter puts its photo first). Column gap is `clamp(32px, 5vw, 80px)`; vertical chapter padding is `clamp(72px, 11vh, 140px)`, and the two full-field chapters (safe, guest book) run `clamp(80px, 12vh, 150px)`.

Inside a chapter the rhythm is 28px between headline and prose and between prose and a pulled fact, 1.1em between paragraphs, 10px vertical padding per data row with a hairline under it, 16px between stacked elements in a room card, 48px between rate-card columns and under the rate-card headline. Ledger chapters draw a rule every 2rem; body line-height (1.6 × 1.125rem = 1.8rem) is not locked to the rule, so the paper reads as ruled rather than as a grid the type sits on. Figures on the right of a 6/6 chapter bleed into the right gutter at ≥900px.

Breakpoints, as used: 560px (listing card stacks; tab labels compress), 640px (form goes single-column), 720px (plaques become a 3-up strip; masthead subtitle appears once solid), 900px (two-column chapters; key rack goes from 5 to 10 columns; carousel slide basis changes from `min(78vw, 560px)` to `min(34vw, 460px)`).

The masthead is fixed, transparent over the hero, and becomes 94% walnut-deep with a brass hairline once the hero has scrolled 72px past.

## Elevation & Depth

Depth is physical, not atmospheric. Brass surfaces are engraved: a one-pixel warm highlight on the top edge (`rgba(255,244,214,.55–.65)`), a one- or two-pixel dark bevel on the bottom (`rgba(60,40,12,.45)`), and a tight, low drop shadow that shortens on press. Wooden cases (the key rack, the split-flap board) are recessed: a one-pixel inset brass ring at 35–40%, a faint inset top highlight, and a large soft shadow under the whole case. Cubbies are carved deeper still with a 6px inset top shadow. Paper is flat: ledger chapters, room cards, and data rows carry no shadow at all. Photographs and the listing card get one ambient drop shadow so they read as objects lying on the desk. The masthead's only elevation is a brass hairline.

### Shadow Vocabulary
- **Engraved plate** (`inset 0 1px 0 rgba(255,244,214,.55), inset 0 -2px 0 rgba(60,40,12,.45), 0 10px 24px -12px rgba(0,0,0,.6)`): plate buttons at rest. On press the highlight inverts to `inset 0 2px 0 rgba(60,40,12,.45)` and the drop shrinks to `0 4px 12px -8px`.
- **Brass tag** (`inset 0 1px 0 rgba(255,244,214,.65), inset 0 -1px 0 rgba(60,40,12,.45), 0 10px 18px -8px rgba(0,0,0,.85)`): key tags at rest; lifted to `0 22px 26px -10px rgba(0,0,0,.9)` on hover/focus. The guarantee plate uses the same stack with a `0 30px 50px -28px` drop.
- **Case** (`inset 0 2px 0 rgba(255,244,214,.05–.06), inset 0 0 0 1px rgba(176,141,87,.35–.4), 0 24px 48px -24px/-28px rgba(0,0,0,.8–.9)`): the key-rack cabinet and the split-flap board.
- **Cubby recess** (`inset 0 6px 14px -6px rgba(0,0,0,.9), inset 0 -1px 0 rgba(176,141,87,.18)`): each key cubby.
- **Object on desk** (`0 30px 60px -30px rgba(0,0,0,.7–.8)`; carousel `0 24px 48px -28px rgba(0,0,0,.9)`): photographs, the listing card, carousel slides.
- **Masthead hairline** (`0 1px 0 rgba(176,141,87,.35)`): the solid masthead.

### Named Rules
**The Engraved Rule.** Only brass lifts. A brass surface always carries the top highlight and bottom bevel; a wooden case is always recessed with an inset brass ring; paper never has a shadow. A floated card on a ledger chapter is a violation.

**The Press Rule.** Pressing a plate moves it 1px down and shortens its shadow; hovering moves it 1px up and lightens it. Nothing scales.

## Shapes

Zero radius everywhere: buttons, tags, cases, cards, inputs, tabs, chips, images. The only circles are hardware — the 6px brass hook in each cubby and the tag's punched hole (22% of tag width) — both `border-radius: 50%`. Borders are hairlines (1px) in brass at 30–50% opacity on walnut, or in ledger-rule on paper; structural rules are 2px in brass (plate top of return-path bars, tab underline, the 4% floor in ledger) or in ink (rate-card room titles, the statement rule). Tags are tall rectangles at 5:9, cubbies at 3:4, carousel slides at 4:5, the letter portrait at 3:4, room renders at 16:10. Inputs are a single brass baseline with no box. Radios are 18px squares with an 8px brass-light square that scales in when checked. Floor plans are `mix-blend-mode: multiply` so their grey paper sinks into the ledger instead of sitting on it as a card.

**The Square Hardware Rule.** If it is not a hook or a hole, it has no radius. Do not round a button, chip, image, or input "a little".

## Components

### Plate (primary button)
Engraved brass plate; the only button style.
- **Shape:** square (0 radius), 48px tall, `0 28px` padding; large variant 56px tall, `0 36px`, 0.9375rem.
- **Colour:** brass ground, walnut-deep text, Archivo 600 at 0.875rem, 0.14em tracking, uppercase, width 108.
- **Shadow:** engraved plate stack (see Elevation).
- **Hover:** brass-light ground, `translateY(-1px)`, 220ms ease-out. **Active:** `translateY(1px)`, inverted bevel. **Focus:** 2px brass-light outline offset 3px.
- **Placement:** one plate in the hero ("About the project"), one at the end of the guest-book form ("Send to Uriel"). No secondary button variant exists; secondary actions are text links (masthead "Talk to Uriel") or the arrow control.

### Arrow (carousel control)
Square 48px outline button: 1px brass border, transparent, brass-light chevron drawn as a 20px stroked SVG (1.75 stroke, square caps). Hover fills brass with walnut-deep glyph, 200ms.

### Masthead link
Archivo 600, 0.8125rem, 0.14em tracking, uppercase, brass-light, `10px 0` padding, 1px brass bottom border; hover turns the text ledger. Site name is Archivo 600, width 112, 0.08em tracking, uppercase; its subtitle (400, paper-on-walnut) appears only on the solid masthead at ≥720px.

### Tabs (split-flap board)
Text-only tabs on a brass hairline: paper-on-walnut at rest, ledger when selected or hovered, with a 2px brass underline that scales in from 0 to 1 over 260ms. Archivo 600, 0.8125rem, 0.12em tracking, uppercase; compressed to 0.75rem / 0.04em below 560px. Roving tabindex, arrow/Home/End keys. Switching panels re-runs the flip on every `[data-flip]` value with a 60ms stagger.

### Inputs / Fields
- **Style:** no box. Transparent ground, a 1px brass baseline, `12px 0` padding, Libre Caslon Text 1.125rem in ledger; placeholder in paper-on-walnut at 85%. Label above in the Label style (paper-on-walnut), 8px gap.
- **Focus:** baseline turns brass-light and doubles via `0 1px 0 brass-light`; no outline.
- **Error:** baseline turns terracotta (`error-border`), message in `error-text` at Archivo 0.8125rem, `aria-invalid` set; clears on input.
- **Choice (radio):** 18px square brass outline, 8px brass-light square scales in on check (180ms). Option text is Caslon 1.0625rem, ledger.
- **Grid:** two columns with `22px 24px` gap; textarea, actions, and status span both; one column below 640px.

### Cases (key rack, split-flap board)
Recessed walnut-deep or walnut-grain boxes with the Case shadow stack. Padding 14px (rack) or `22px 24px 18px` (board). Data rows inside are `1fr / 1.2fr` grids with 10px vertical padding and a brass hairline at 18% between them.

### Ledger card (sample listing)
A ledger-paper card lying on a walnut chapter: `2fr / 3fr` image-and-body grid, body padding `22px 24px 24px`, title Archivo 600 1.125rem, meta Archivo 0.875rem ink-soft, price Archivo 600 1.75rem tabular. Object-on-desk shadow. Stacks with a 4:3 image below 560px.

### Plaques
A 3-up strip of walnut cells separated by 1px brass hairlines at 35% (grid gap on a brass background). Key in Label style (paper-on-walnut, 0.75rem, 0.12em), value Archivo 500 1.125rem tabular in ledger; the last plaque's value is brass-light at 1.5rem.

### Sold chip
The empty cubby's marker: Archivo 600, 0.75rem, 0.14em, uppercase, paper-on-walnut, 1px brass border at 50%, `6px 8px` padding, square.

### Signature: the key rack
Ten 3:4 cubbies on a walnut-grain cabinet (5 columns, 10 at ≥900px), each with a 6px brass hook and a 5:9 brass tag hanging from it. Tags are `<button aria-pressed>` elements. Hover or focus lifts a tag 8% and rotates it −4° over 480ms; pressed lifts it 14%, rotates +3°, and brightens 12%. A tag returned to its hook runs the 900ms `settle` pendulum. The selected unit is announced in a live region below the rack as a Figure numeral (brass-light, width 85) beside its type and tabular facts, fading in over 420ms.

### Signature: the split-flap board
Three rental modes as tabs over a recessed board; each value cell flips in on `rotateX(-90deg → 8deg → 0)` over 420ms with 60ms stagger. Paired below with the return-path chart: four bars on one 160px scale, brass gradient fills with a 2px brass top (dashed for outlook bars), and the contractual 4% floor drawn as a 2px ledger line through them.

## Do's and Don'ts

### Do:
- **Do** put every action in brass and every money numeral in brass-light; keep both off everything else (The Brass Is Action Rule).
- **Do** alternate walnut and ruled ledger chapters and pair text colour to ground: ledger/paper-on-walnut on walnut, ink/ink-soft on ledger (The Two Grounds Rule).
- **Do** set labels, controls, captions, and numbers in Archivo and prose in Libre Caslon Text; carry Archivo hierarchy on the width axis, narrow for numerals (84–92) and wide for plates (108–112) (The Plates-and-Book, Width-Not-Weight Rules).
- **Do** set every euro, percentage, and m² figure in tabular numerals and hold prose to 62ch.
- **Do** engrave brass (top highlight, bottom bevel, short drop) and recess cases (inset brass ring); leave paper flat (The Engraved Rule).
- **Do** keep motion physical and under 500ms on `cubic-bezier(0.16, 1, 0.3, 1)`, and remove all of it under `prefers-reduced-motion: reduce`.
- **Do** frame with the single fluid gutter and a 12-column chapter grid at ≥900px; stack below.

### Don't:
- **Don't** add a radius to anything that is not a hook or a hole (The Square Hardware Rule).
- **Don't** use hotel green anywhere but the guarantee chapter (The One Green Rule).
- **Don't** introduce a third ground (white, grey, a second paper tone) or float a card on a shadow over ledger paper.
- **Don't** add a secondary or outlined button style; secondary actions are text links or the 48px arrow control.
- **Don't** use a red for errors; the field error is terracotta (`error-border` / `error-text`) so it stays in the desk's temperature.
- **Don't** set a number in Caslon or a paragraph in Archivo, and don't push Archivo above weight 600.
- **Don't** add eyebrows or kickers above headlines; the build has none. Sub-lines sit under the headline in Title or paper-on-walnut body.

## Open / next runs

Recorded honestly; none of these is canonised above as a system rule.

- **Brass is a CSS gradient, not brass.** Tags, the guarantee plate, and plate buttons are `linear-gradient(160deg, #d9bc84, brass 45%, #a3844f)` plus the engraved shadow stack. The world calls for engraved-brass raster assets; the user scoped this run to the skeleton. A later asset pass can replace the gradients; the shadow stack and geometry stay.
- **Hero aerial is generated.** `assets/hero-riba-roja-drone.webp` (and the `-alt` variant) are Higgsfield nano_banana_pro renders with provenance sidecars (`.webp.json`); the page labels it "illustrative aerial, generated". A real drone shot replaces the file and removes the note; `object-position: center 40%` and the top/bottom walnut wash should be re-checked against the real frame.
- **Construction carousel has 7 photographs; the brief wants 10.** Three more from `assets/brand/on-going-construction/` when available.
- **Form handoff channel undecided.** `desk.js` `HANDOFF.mode` is `"whatsapp"` today with a `"mailto"` alternative; hint and status copy switch with it. The decision is Uriel's. Nothing is stored server-side.
- **Analytics not hooked**, by user decision. `assets/analytics.js` exists for the live site; nothing on `index-d.html` calls it.
- **The "€113 / night" listing price is derived**, not sourced: €2,200 ÷ (30 × 0.65) from the workbook's short-stay gross, labelled "illustrative" in the card.
- **Libre Caslon Text italic is not shipped.** No italic is used on the page; if the letter or a caption needs one, the 400-italic face must be added to `assets/fonts/` and `@font-face`.
- **Two declared tokens are unused:** `--ledger-deep` (`#e3d6b8`) and `--green-deep` (`#173a2f`) are defined on `:root` but never applied. They are left out of the frontmatter; drop them or use them.
- **One-off values kept out of the token set:** hero headline warm white `#fbf6ea` and its text-shadow; safe prose `#e7e0cf`; `.listing__price` colour via `!important`. Each is a single use; promote only if reused.
