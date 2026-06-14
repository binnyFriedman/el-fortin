# Executive Briefing — Icon Outsource Brief

**Page:** `flex-living-valencia-executive-briefing.html`  
**Audience:** €200k+ international investors  
**Class target:** Boutique private equity / Swiss private bank — not SaaS, not consumer travel, not “startup UI kit.”

---

## Global icon system (how)

| Rule | Spec |
|------|------|
| **Library baseline** | [Feather Icons](https://feathericons.com/) — 24×24 grid, 2px stroke, no fill. Chosen over Lucide/Material because stroke weight reads institutional and matches serif + data typography. |
| **Upgrade path** | Custom 10-icon set from a brand designer (Figma → optimized SVG). Match Feather geometry: 24px artboard, 2px stroke, round caps, no fills, no gradients. |
| **Delivery format** | Individual SVGs in `assets/icons/briefing/` + optional sprite `briefing-icons.svg`. Every path must use `stroke="currentColor"` and `fill="none"` so CSS controls navy vs terracotta. |
| **Size on page** | Hero/intake: 20–22px. Workflow (boxed): 22px inside 44px frame. Never scale above 24px — icons are punctuation, not illustration. |
| **Color** | Hero + intake: `--p1-terracotta` (#765754). Workflow boxes: `--p1-navy` (#293f5b). Brand marks: official logo colors only. |
| **Do not use** | Filled Material icons, emoji, 3D renders, AI-generated icon sets, duotone gradients, cartoon planes/keys/sun. |

---

## Icon inventory (what + why)

### §1 Hero badges — replace paragraphs with one visual cue each

| File | Concept | How | Why |
|------|---------|-----|-----|
| `hero-deeded.svg` | Registered title | Feather `file-text` | Reads as legal instrument / registry record — not a generic “document” blob. Supports “100% Deeded” without explaining Land Registry in prose. |
| `hero-floor.svg` | Contractual floor | Feather `shield` | Guarantee language in PE/debt markets uses shield metaphors. Communicates downside protection for the 4% floor without a footnote. |
| `hero-proximity.svg` | Airport access | Feather `map-pin` | **Not a plane.** Investors care about logistics (12 min to VLC), not vacation. Pin = location certainty, same language as institutional offering memos. |

### §2 Hands-off model — three nodes, no body copy

| File | Concept | How | Why |
|------|---------|-----|-----|
| `workflow-preservation.svg` | Title in your name | Feather `key` | Single-owner asset control. Key = custody/title — clearer than a house icon (which implies property management, not ownership). |
| `workflow-yield.svg` | Operator-run yield | Feather `trending-up` | Standard capital-markets signal for optimized returns. Pairs with “Turn-key · El Fortín ops” tag. |
| `workflow-lifestyle.svg` | Personal use window | Feather `sun` | Only lifestyle metaphor on the page — ties directly to headline (“Spanish sun”) without resorting to beach/palm clichés. |

### §5 Intake deliverables — data room contents at a glance

| File | Concept | How | Why |
|------|---------|-----|-----|
| `intake-term-sheet.svg` | Term sheet | Feather `file-text` | Same legal-doc language as hero deeded — consistent system. |
| `intake-financial-model.svg` | Financial model | Feather `bar-chart-2` | Reads as model/forecast, not a generic “chart line” tick — appropriate for LP data rooms. |
| `intake-licenses.svg` | Licenses & permits | Feather `check-circle` | Regulatory clearance / approved status — clearer than a badge or shield duplicate. |
| `intake-plans.svg` | Certified plans | Feather `layout` | Architectural plan / drawing surface — not a ruler or clipboard (too generic). |

### Brand marks (not in icon set — separate assets)

| Asset | How | Why |
|-------|-----|-----|
| **Airbnb** | Inline SVG Bélo mark, `#FF5A5F`, 72×22 display, CSS strikethrough | Must read instantly as “independent STR model” then be crossed out. Do **not** replace with `<img>` — inline SVG preserves `currentColor` + strike alignment. |
| **SAP / Siemens** | Simple Icons wordmarks in `assets/brand/logos/` | Former employer credibility — logos, not invented icons. Grayscale treatment in CSS. |

---

## Vendor handoff checklist

- [ ] Replace Feather baseline with custom set (optional) — same grid, stroke, naming
- [ ] Founder headshot — replace `founder-placeholder.jpg`
- [ ] Confirm trademark use for Airbnb, SAP, Siemens in marketing context
- [ ] Export @2x PNG only if needed for email/PDF — web stays SVG

**HTML hook:** inline sprite at top of `<body>`; each slot uses `<svg class="briefing-icon"><use href="#hero-deeded"/></svg>`. Individual source files live in `assets/icons/briefing/` for vendor handoff.
