# Design system — extracted from Pacaso

Visual reference pulled from [pacaso.com](https://www.pacaso.com/) on 2026-09-07 (desktop 1440×900 and mobile ~714×925). Tokens are the site’s own CSS custom properties unless noted as computed.

Quiet luxury. Cream field, olive action, charcoal type, full-bleed photography, square corners. Editorial serif for feeling; geometric sans for everything that has to work.

---

## 1. Brand posture

Pacaso sells co-ownership of a second home as a decision, not a dream. The interface never looks like a proptech dashboard. It looks like a gallery with a concierge.

Rules that hold across the homepage, How it works, and chrome:

- Photography carries emotion. Type is short. UI is almost invisible.
- One primary action on screen: **Inquire**. Search and menu are icons.
- Surfaces are bone, charcoal, or olive. Almost no other colour in the product chrome.
- Corners on brand buttons and cards are **0px**. Roundness is reserved for the chat widget, avatars, and pagination dots.
- Labels that are UI (buttons, eyebrows, nav) are **uppercase sans** with tracking. Headlines that are feeling are **sentence-case serif**.

Copy register (from the live site): short, intimate, present tense. “Own a share, get the whole feeling.” “It’s not a dream. It’s a decision you have not yet made.” “A place that feels like you.” “Find your place.”

---

## 2. Colour

### Brand (use these)

| Token | Hex | RGB | Role |
| --- | --- | --- | --- |
| `--brand-bone` / `--bone` | `#f1ece3` | 241, 236, 227 | Page field, light buttons, text on olive/charcoal |
| `--brand-bone-hover` | `#ebe5d6` | | Bone hover |
| `--brand-bone-active` | `#e3dbc8` | | Bone pressed |
| `--brand-olive` | `#5e6650` | 94, 102, 80 | Primary CTA (Inquire), closing band |
| `--brand-olive-hover` | `#6e7860` | | Olive hover |
| `--brand-olive-active` | `#78836a` | | Olive pressed |
| `--brand-charcoal` | `#424242` | 66, 66, 66 | Body on bone, dark hero fallback, cookie/sign-up fills |
| `--brand-charcoal-hover` | `#5e5e5e` | | Charcoal hover |
| `--brand-charcoal-active` | `#2a2a2a` | | Charcoal pressed |
| `--brand-secondary` | `#6f6a6a` | 111, 106, 106 | Eyebrows, captions, muted body |
| `--text-on-dark` | `#f1ece3` | | Type on olive / charcoal / photo |
| `--border-subtle` | `#d4cdc0` | 212, 205, 192 | Hairline on bone |
| `--white` / `--background-surface` | `#fff` | | Chat pane, inputs |
| `--black` | `#000` | | Absolute |

Computed on the live page (not always named):

| Use | Value |
| --- | --- |
| Nav / footer ink (slightly cooler than charcoal) | `#251e35` / `rgb(37, 30, 53)` |
| Section divider | `#dad6da` / `rgb(218, 214, 218)` |
| Bone at 80% over photography (header wash) | `rgba(241, 237, 228, 0.8)` |
| Carousel chevron plate | `rgba(66, 66, 66, 0.85)` |
| Chat header | charcoal / near `#1e1e1e` at 90% |

### Palette map (do not lead with these)

The stylesheet also ships blue, green, tan, purple, red, orange, and gray ramps (legacy / product / MDC). They are not the marketing surface. Keep them off landing pages except:

- `--color-cta-danger` / `--red-450` `#ef4444` — unread chat dot
- `--green-550` `#417658` — Cookiebot “Consent” links (third-party)
- `--color-mdc-error` `#b15141` — form error

### Pairing

| Surface | Background | Type | CTA |
| --- | --- | --- | --- |
| Default page | Bone `#f1ece3` | Charcoal `#424242` | Olive fill, bone type |
| Full-bleed hero | Photograph (charcoal fallback) | Bone `#f1ece3` | Bone fill, charcoal type |
| Closing band | Olive `#5e6650` | Bone | Bone fill, charcoal type |
| Quote tile | Charcoal `#424242` | White / bone | — |
| Cookie / secondary solid | Charcoal | Bone | — |
| Chat | White + bone bubbles | Charcoal | Olive send |

---

## 3. Typography

### Families

| Role | Face | Source | Weights in use |
| --- | --- | --- | --- |
| Display / editorial | **Freight Display Pro** (`freight-display-pro`) | Adobe Fonts kit `der5lzw` — roman + italic, 400 only | 400 |
| UI / body / page titles | **Plus Jakarta Sans** | [Google Fonts](https://fonts.google.com/specimen/Plus+Jakarta+Sans), 200–800 variable | 300, 400, 500, 600, 700 |
| Wordmark | Pacaso SVG, serif (Freight-class) | Contentful `Pacaso_wordmark_charcoal.svg`, 110×~24 | — |

CSS:

```css
--font-family-heading: "freight-display-pro", serif;
--font-family-heading-title: "Plus Jakarta Sans", sans-serif;
--font-family-body: "Plus Jakarta Sans", sans-serif;
```

Freight is licensed. Open substitutes if the kit cannot be used: **Freight Text / Recoleta / Canela / DM Serif Display**. Do not substitute Plus Jakarta Sans — it is free.

### Scale (design tokens)

| Token | Size | Line height | Tracking |
| --- | --- | --- | --- |
| `--font-size-display-xl` | 6rem / 96px | 6.25rem | `--letter-spacing-tight` −0.5px |
| `--font-size-display-l` | 4.5rem / 72px | 4.75rem | −0.5px |
| `--font-size-display-m` | 3.375rem / 54px | 3.625rem | −0.5px |
| `--font-size-display-s` | 2.25rem / 36px | 2.5rem | −0.5px |
| `--font-size-display-xs` | 1.625rem / 26px | 1.875rem | −0.5px |
| `--font-size-h1` | 3rem / 48px | 3.5rem | −0.5px |
| `--font-size-h2` | 2.5rem / 40px | 3rem | −0.5px |
| `--font-size-h3` | 1.875rem / 30px | 2.375rem | |
| `--font-size-h4` / `--font-size-large` | 1.25rem / 20px | 1.75rem / 1.625rem | |
| `--font-size-quote` | 1.625rem / 26px | 1.875rem | |
| `--font-size-body` | 1rem / 16px | 1.375rem / 22px | `--letter-spacing-body` 0.5px |
| `--font-size-small` / `--font-size-button` | 0.875rem / 14px | 1.25rem | |
| `--font-size-label-button` / extra-small | 0.75rem / 12px | 0.875rem | `--letter-spacing-button-label` 2px |
| `--font-size-eyebrow` | 0.625rem / 10px | 0.875rem | `--letter-spacing-eyebrow` 3px |

Weights: `--font-weight-light` 300 · `--font-weight-normal` 400 · `--font-weight-semibold` 500 · `--font-weight-bold` 600 · `--font-weight-extra-bold` 700.

### Roles as they actually render

**Homepage (desktop 1440)**

| Role | Face | Size / leading | Weight | Tracking | Case | Colour |
| --- | --- | --- | --- | --- | --- | --- |
| Hero H1 | Freight | 90 / 90 | 400 | −0.5px | sentence | bone on photo |
| Hero CTA | Jakarta | 12 / 12 | 600 | 2px | UPPER | charcoal on bone, 50px tall, 8×30 pad |
| Interstitial line (“It’s not a dream…”) | Freight | 26 / 30 | 400 | −0.5px | sentence | charcoal |
| Section eyebrow (“OUR COLLECTION”) | Jakarta | 10 / 14 | 700 | 3px | UPPER | secondary `#6f6a6a` |
| Section H2 (“A place that feels like you”) | Freight | 54 / 58 | 400 | −0.5px | sentence | charcoal |
| Card overline (home name) | Jakarta | 10–12 / 14 | 600–700 | 2–3px | UPPER | secondary |
| Card title (city) | Freight | 36 / 40 | 400 | −0.5px | sentence | charcoal |
| Card caption | Jakarta | 14 / 20 | 400 | 0.5px | sentence | secondary |
| Testimonial H2 | Jakarta | 40 / 48 | 300 | −0.5px | sentence | `#251e35` |
| Quote | Jakarta | 20 / 28 | 300 | 0 | sentence | white on charcoal |
| How-it-works H2 | Freight | 54 / 58 | 400 | −0.5px | sentence | charcoal |
| Step numeral + title (`01/` Discover) | Freight | 36 / 40 | 400 | −0.5px | sentence | charcoal |
| Step body | Jakarta | 16 / 24 | 300 | 0 | sentence | secondary |
| Olive band headline | Freight | 36 / 40 | 400 | −0.5px | sentence | bone |
| Olive band body | Jakarta | 16 / 24 | 300 | 0 | sentence | bone |
| Inquire (header) | Jakarta | 12 / 20 | 500–600 | 2px | UPPER | bone on olive, 40px, 8×20, 150px wide |
| Sign up (footer) | Jakarta | 10 / — | 600 | 3px | UPPER | bone on charcoal, 50px, 0×20 |
| Footer newsletter title | Freight | 26 / 30 | 400 | −0.5px | sentence | `#251e35` |
| Footer links | Jakarta | 14 / 20 | 400 | 0.5px | sentence | `#251e35` |

**Inner page (How it works) — titles switch to sans**

| Role | Face | Size / leading | Weight |
| --- | --- | --- | --- |
| Page eyebrow | Jakarta 10 / 700 / 3px / UPPER | | |
| Page H1 | Jakarta 48 / 56 / 300 / −0.5px | not Freight | |
| Lead paragraph | Jakarta 16 / 24 / 300 | centered, ~40–48ch | |
| Section H2 | Jakarta 40 / 48 / 300 | | |
| Feature H3 | Jakarta 16 / 24 / 500 | | |
| FAQ H2 | Jakarta 40 | | |

Rule: **marketing display (homepage hero, collection, how-it-works steps, olive band) = Freight.** **Utility page titles (How it works H1, FAQ, feature grids) = Jakarta Light 300.**

Body on bone is 16 / 24 Jakarta 300–400, colour charcoal or `#251e35`. Captions and helper text drop to secondary `#6f6a6a`.

---

## 4. Layout

### Breakpoints (from stylesheets)

| Name | Min-width | Notes |
| --- | --- | --- |
| base | 0 | Mobile chrome: 4.25rem nav, hamburger only |
| `sm` | 640px | Menu label appears; section padding steps up |
| `md` | 768px | |
| `lg` | 1024px | Split how-it-works, chat margins |
| `xl` | 1280px | Chat inset `2rem 6rem` |
| `2xl` | 1920px | Rare |
| custom | 1090 / 1408 | Cookiebot / HubSpot only |

### Shell

| Measure | Value |
| --- | --- |
| `--navbar-height` token | 6.25rem |
| Nav computed | **85px** desktop, fixed, transparent over hero then bone |
| `--navbar-mobile-height` | 4.25rem |
| Page max width | **1440px** (`max-width` on root) |
| Hero | **100vh**, `bg-brand-charcoal` under the photograph |
| Testimonials vertical pad | **102px 0** (`py-3-1/2 sm:py-6-3/8`) |
| Footer pad | `0 0 128px` (desktop), `pb-8 lg:pb-3-1/2` |

### Header

Three columns, full width:

1. Left — hamburger + “MENU” (Jakarta, 16, 400). Icon is thin stroke.
2. Center — Pacaso wordmark, charcoal SVG, ~110px wide.
3. Right — search (thin magnifying glass) + **INQUIRE**.

No drop shadow. No bottom border on the hero. Interior pages sit the same bar on bone.

### Page rhythm (homepage)

1. **Full-bleed photo hero** — H1 + bone CTA + down-chevron. Photo is the product.
2. **Interstitial** — one Freight sentence on bone. No image. ~313px.
3. **Collection** — eyebrow + Freight H2 + horizontal home cards (peek left/right). Hairline `border-b`.
4. **Testimonials** — Jakarta H2 + charcoal quote tile + arrows + two dots.
5. **How it works** — eyebrow + Freight H2 + repeating **photo | 01/ title + body** rows (image left, type right; later rows may invert).
6. **Olive closer** — “Find your place.” + one line + bone CTA. ~201px.
7. **Footer** — four accordion columns on mobile; newsletter; legal microcopy.

### Inner-page hero (How it works)

Bone field, **centered** stack: 10px eyebrow → Jakarta Light H1 → 16/24 lead. Then a full-width lifestyle photograph. No overlay type on that photo. Then feature grids and FAQ.

### Imagery

- Architectural / interior photography, warm golden-hour, no people in the hero (people appear in owner quotes and the concierge avatar).
- Homes are shown as large stills, not grids of thumbnails.
- “Photos enhanced to highlight key features” is disclosed in the footer.
- Do not put UI chrome on the photograph except: heart/follow, carousel chevrons, bone CTA.

---

## 5. Components

### Buttons

All brand buttons: **0 radius, no shadow, no border, uppercase Jakarta**.

| Variant | Fill | Type | Size | Tracking | Use |
| --- | --- | --- | --- | --- | --- |
| Primary | Olive `#5e6650` | Bone 12 / 600 / 2px | 40×150, pad 8×20 | Inquire in header |
| Inverse / on-photo | Bone `#f1ece3` | Charcoal 12 / 600 / 2px | 50px tall, pad 8×30 | Hero “Explore the collection” |
| Inverse / on-olive | Bone | Charcoal 12 / 600 / 2px | 50px, pad 0×30 | “Explore ownership” |
| Dark | Charcoal `#424242` | Bone 10 / 600 / 3px | 50px, pad 0×20 | Footer Sign up, cookie Accept/Decline |
| Text / learn more | Transparent | `#251e35` 16 / 400 | — | Inner-page “Learn more” |

Hover: olive → `#6e7860`, charcoal → `#5e5e5e`, bone → `#ebe5d6`. Do not add underline to solid buttons.

### Eyebrow

10px Jakarta Extra Bold (700), uppercase, 3px tracking, colour `--brand-secondary`. Sits above Freight or Jakarta Light titles. Examples: OUR COLLECTION · THE EASY WAY TO OWN YOUR HOMES · HOW PACASO WORKS.

### Home card (collection)

- Full-bleed photo, square-ish crop, heart (follow) top-right in a white circle.
- Under the photo, left-aligned:
  1. Overline — home name, uppercase sans, secondary
  2. Title — destination, Freight 36/40
  3. Caption — one sensory line, Jakarta 14/20 secondary
- Carousel peeks the next/previous card. Chevron plates are 0-radius charcoal at 85%.

### Quote / testimonial

- Centered charcoal rectangle, 0 radius, white Jakarta Light ~20/28.
- Attribution in smaller sans, still on the tile or just under.
- Pagination: two dots, one filled charcoal, one outline. Thin line arrows at the viewport edges.

### How-it-works step

```
[ photograph, tall ]     01/          Freight 36
                         Discover     Freight 36
                         Body copy    Jakarta 16/24/300 secondary
```

Numeral includes the slash. The whole row is a link.

### Olive band (page closer)

Full-width olive. Bone Freight headline. Bone Jakarta Light supporting line. Bone-fill CTA. This is the only place olive is used as a surface, not a button.

### Forms

- Underline / borderless fields on bone (footer email). Jakarta ~15/400, charcoal.
- Chat input: white field, olive square send with paper-plane.
- Inquire panel (slide-over): stacked Full name / Email / Phone; charcoal **SUBMIT** uppercase; disabled until valid.
- Checkbox + legal microcopy in 12–14 Jakarta.

### Chat (Digital Concierge)

This is the one rounded system. Do not copy its radii onto marketing buttons.

- Launcher: 3.75rem circle, avatar, shadow `0 12px 28px rgb(0 0 0 / 0.2), 0 2px 4px rgb(0 0 0 / 0.1)`
- Panel: white, large radius (~16–32px), charcoal header, bone message bubble
- Unread: 4–6px red dot on Chat
- z-index 61, above page, below cookie modal

### Cookie modal (Ontrust/Cookiebot)

Bone card, 0 radius, large padding. Two full-width charcoal buttons, bone uppercase labels, stacked. Treat as a third-party overlay; match it if you ship a consent bar.

### Footer

Bone. Accordion headings uppercase. Links 14/20 Jakarta. Newsletter: Freight 26 headline + charcoal Sign up. Legal line in small sans. Equal-housing lockup. Social icons as simple glyphs.

---

## 6. Shape, line, motion

| Token | Value |
| --- | --- |
| Brand radius | **0px** (buttons, cards, quote tile, inquire, olive band) |
| Chat / FAB | 9999px, 32px, 15px, 10px (widget only) |
| Hairline | 1px `--border-subtle` `#d4cdc0` or divider `#dad6da` |
| Shadow | None on marketing surfaces. Chat only. |
| Icons | 1–1.5px stroke, charcoal or bone |
| Motion | CSS `transition: all` on links/buttons — short, no bounce, no parallax chrome |

Hero has a down-chevron for “there is more.” Collection and testimonials are drag/click carousels, not autoplay-first.

---

## 7. Voice on the surface

How type is *written*, not just set:

- Headlines are one breath. Line-break for rhythm (`Own a share,` / `get the whole feeling`).
- Subheads are complete sentences, not slogans in title case.
- Home names are all-caps overlines; places are title-case serif; flavour is lowercase sans (“Morning tea, London at the door”).
- Steps are numbered `01/` not `1.`
- CTAs are verbs of visiting, not buying: Explore the collection · Explore ownership · Inquire.

Do not: gradients, pill buttons, heavy cards, stock-sky blues, Inter/Roboto as the face of the brand, drop shadows under photographs, badge-ladden hero.

---

## 8. CSS tokens (copy-paste)

```css
:root {
  --brand-bone: #f1ece3;
  --brand-bone-hover: #ebe5d6;
  --brand-bone-active: #e3dbc8;
  --brand-olive: #5e6650;
  --brand-olive-hover: #6e7860;
  --brand-olive-active: #78836a;
  --brand-charcoal: #424242;
  --brand-charcoal-hover: #5e5e5e;
  --brand-charcoal-active: #2a2a2a;
  --brand-secondary: #6f6a6a;
  --text-on-dark: #f1ece3;
  --border-subtle: #d4cdc0;
  --ink-cool: #251e35; /* computed nav/footer ink */

  --font-family-heading: "freight-display-pro", "DM Serif Display", serif;
  --font-family-body: "Plus Jakarta Sans", sans-serif;

  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-semibold: 500;
  --font-weight-bold: 600;
  --font-weight-extra-bold: 700;

  --letter-spacing-tight: -0.03125rem;
  --letter-spacing-body: 0.03125rem;
  --letter-spacing-button-label: 0.125rem;
  --letter-spacing-eyebrow: 0.1875rem;

  --radius-none: 0;
  --nav-height: 85px;
  --page-max: 1440px;
  --gutter: clamp(24px, 4vw, 72px);
  --section-y: 102px;
}

body {
  font-family: var(--font-family-body);
  font-size: 16px;
  line-height: 1.5;
  font-weight: 300;
  color: var(--brand-charcoal);
  background: var(--brand-bone);
}

.eyebrow {
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: var(--letter-spacing-eyebrow);
  text-transform: uppercase;
  color: var(--brand-secondary);
}

.display {
  font-family: var(--font-family-heading);
  font-weight: 400;
  letter-spacing: var(--letter-spacing-tight);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  padding: 8px 30px;
  border: 0;
  border-radius: var(--radius-none);
  font-family: var(--font-family-body);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: var(--letter-spacing-button-label);
  text-transform: uppercase;
  text-decoration: none;
}

.btn-olive {
  background: var(--brand-olive);
  color: var(--text-on-dark);
}
.btn-olive:hover { background: var(--brand-olive-hover); }

.btn-bone {
  background: var(--brand-bone);
  color: var(--brand-charcoal);
}
.btn-bone:hover { background: var(--brand-bone-hover); }
```

Fonts to load:

```html
<link rel="stylesheet" href="https://use.typekit.net/der5lzw.css" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap" rel="stylesheet" />
```

If Typekit is unavailable, swap `--font-family-heading` to `"DM Serif Display", serif` (already used on the current sniper page) and keep Jakarta for UI.

---

## 9. What this is not

Pacaso’s product app (calendars, owner dashboard, FullCalendar, MDC greens) uses a wider, older palette. This file is the **marketing design system** only: homepage, how-it-works, collection, inquire, footer.

Source: live computed styles and CSS variables on pacaso.com, Adobe Fonts kit `der5lzw` (Freight Display Pro roman + italic 400), Plus Jakarta Sans from Google Fonts.
