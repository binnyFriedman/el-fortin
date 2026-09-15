---
target: site/index-d.html
total_score: 17
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 3
target_identity: "file:/Users/binnyfriedman/code/el-fortin/site/index-d.html"
target_fingerprint: "sha256:b8d341bf98ae07053102944c6521df9f7b86688113455822c129f169cf084565"
target_path: /Users/binnyfriedman/code/el-fortin/site/index-d.html
timestamp: 2026-09-10T10-53-03Z
slug: site-index-d-html
---
Method: dual-agent (A: 474b1d5c · B: c395c4fc)

#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Masthead occludes board tabs; long page has no position cue |
| 2 | Match System / Real World | 3 | Desk world is fluent until money chapters leak workbook language |
| 3 | User Control and Freedom | 2 | Form success is a WhatsApp popup; no desk receipt |
| 4 | Consistency and Standards | 2 | Listing and rate card had abandoned the desk for OTA/Excel |
| 5 | Error Prevention | 2 | 4% of price not all-in is easy to miss |
| 6 | Recognition Rather Than Recall | 2 | Fees and prices repeated in different shapes |
| 7 | Flexibility and Efficiency | n/a | Persuade landing |
| 8 | Aesthetic and Minimalist Design | 1 | Postage-stamp listing; hairline spreadsheet at the close |
| 9 | Error Recovery | 3 | Inline errors; popup-blocked fallback |
| 10 | Help and Documentation | n/a | Persuade; footnotes are not a help system |
| **Total** | | **17/32** | **Acceptable — poor in the money chapters** |

#### Design Specificity Verdict

**LLM assessment**: The top of the page is authored (walnut, brass, key rack, 4% plate). It collapsed at `#board` (OTA stub) and `#menu` (cream spreadsheet). Those two objects were category-interchangeable.

**Deterministic scan**: `impeccable detect` on `site/index-d.html` exited 0 with 0 findings.

**Visual overlays**: No user-visible overlay. Mutation preflight succeeded; `detect.js` was not injected (Python server on 8766 does not serve it).

#### Overall Impression

The desk is real until money appears. The listing was too small to be an anchor. The close was a workbook. Those two were the P1s.

#### What's Working

- Desk world at the top: drone, brass tags, one sold cubby.
- The 4% safe is the correct scale for a number.
- Voice when it is allowed to be short.

#### Priority Issues

**[P1] Listing was a 256px OTA stub** — could not carry “you never list it.” *Fix applied: poster-scale room, €113 as the guest’s price.*

**[P1] `#menu` was a hairline spreadsheet** — all-in buried, cents, repeated fee table. *Fix applied: cheque-first rooms, 25% plates, one fee sentence.*

**[P1] `#board` still stacks chart + flap + listing** — three genres. Listing is now the boss; flap remains.

**[P2] Form close competes** — email, WhatsApp, calendar, and form.

**[P2] Masthead can cover flap tabs** when the board is pinned under the solid bar.

#### Persona Red Flags

**Jordan**: Unlabeled keys; workbook words (`6.94%`, built/useful).
**Riley**: 4% of price vs all-in; WhatsApp popup; autofill on tel.
**Klaas**: Came to avoid a spreadsheet; the last deal screen was one.

#### Minor Observations

- Path floor label sits on bar 1.
- Partner logos unexplained.
- Hero CTA still goes to keys, not the form.

#### Questions to Consider

- Should the flap survive now that the listing is the occupancy board?
- Should `#guestbook` keep three outbound contacts beside the form?
