# Puzol before / after assets

## Compare images (slider)

| File | Content | Verified |
|------|---------|----------|
| `before-compare.jpg` | Mid-renovation — drywall, cement, exposed wiring | Yes |
| `after-compare.jpg` | Finished entryway — wood floor, sconces, white door | Yes |

**Filenames are correct.** Do not rename these files.

## Slider HTML wiring

The `ba-slider` component is not filename-literal:

- **Base `<img>`** (full layer) = visible on the **right** of the handle → use **`after-compare.jpg`**
- **`ba-slider__after-wrap` `<img>`** (clipped layer) = visible on the **left** of the handle → use **`before-compare.jpg`**

Bottom labels: **Before** (left) · **After** (right).

## Galleries

- `before/` — exterior and pre-works photos
- `after/` — completed interior photos
