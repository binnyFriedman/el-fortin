# A2 v3 — The Walk (journey & rhythm plan)

**What this is:** the plan that marries the v3 theater engine (`site/index-v3.html` — camera dolly,
gravity wells, one room per beat) to the **approved messages already living on `site/index-v2.html`**.
The engine stays; every word on its walls is replaced. Copy source remains `landing-page-copy.md`;
claim rules remain `approved-claims.md`; order remains the sequencing law (`psychology-source-of-truth.md` §4).

**The one goal:** get the right person through the door — request the document pack or book 15 minutes.
Everything else on the page exists to move that person one beat forward, or to let the wrong person
leave early. Both outcomes are wins.

**Why the theater format is the persuasion asset:** a scroll page lets the visitor set the tempo —
skim, jump, bounce. The walk does not. Gravity wells mean the visitor rests at **exactly one belief
at a time**, in **our order**, at **our pace**. That is the whole manipulation: we own the rhythm.
The claims themselves stay inside every red line — pacing is the lever, never inflation.

---

## 1. The beat map (8 rooms)

Sequencing law §4 order, copy lifted from index-v2 (already claims-checked):

| # | Room | Wall (monumental type) | Belief the room flips | Station copy (from v2) | Walk-in pace | Tone |
|---|---|---|---|---|---|---|
| 01 | **ARRIVE** | `YOURS.` over parchment; hero cutaway render ghosted into the wall (captioned "Render — illustrative") | "I know where this is and what it is" (P3/P4 anchor) | "Near Valencia. Yours. Rentals managed." · From €197k all-in at pre-sale · Ready in 2027 | Page opens already at the station — no walk, no splash | Light, warm |
| 02 | **BUILT** | `BUILT` | Competence before anything (P8) | Uriel Nabel. Puzol — finished August 2025. Riba-roja — licensed. NODHOUSES · Pérez Redón COACV 11.357. LinkedIn verify-link | Standard walk | Light |
| 03 | **HONEST** | **No giant word. Bare wall, no mesh.** | Candor after competence (P7/P8) | "A short record." 2026 — one completed renovation; Uriel left SAP in January; judge title, licence, contract, numbers with your own advisers | **Longest walk on the page** — a deliberate silence before the admission | Light, stripped of all decoration |
| 04 | **LINE 9** | `LINE 9` | Fear #0 — "where is this?" (F2) | A working town, connected to Valencia. Demand: 32–38 enquiries/listing · ~€16/m² · Idealista/Fotocasa links. "Asking-market data, not occupancy guarantees" stays | Standard | Map-paper, finest grid |
| 05 | **YOURS** | `YOURS` centered, terracotta wash | "I own brick, not paper" | Registered in your name at Spain's Property Registry. Sell when you choose. Floor plan, 40.4 m² useful | Standard | Light, warmest room |
| 06 | **THE DEAL** | **No monumental figure** — quiet wall (P17 red line: no oversized yield/floor/price) | Bounded downside; floor first, target labeled | €197k all-in · 4% contractual floor ("developer covenant, not bank-backed") · >7% blended target ("target, not a promise") · "Exact figures and assumptions" fine print | Slow, heavy dolly — the reading room | Linen |
| 07 | **REMAIN** | Dark navy pause. Count in **normal reading size**: "10 apartments. 1 sold. 9 available." | Credible scarcity — one real count, once (P16) | Nothing else. The room is a held breath | **Short** walk | The page's only dark beat |
| 08 | **DOCUMENTS** | `ASK.` | Low-commitment ask + freedom (P15) | "Documents first." Request the pack (primary) · Book 15 minutes · fear buttons + free text · "No mailing list…" · freedom line: "If the honest answer is 'this is not for you' — we will say so." | Short snap forward, warm light floods back | Light, warm — relief |

### Rhythm rules

- **Long–short alternation is the beat.** Long approach into HONEST (silence → admission lands harder),
  slow dolly through THE DEAL (numbers read at reading speed), short walks into REMAIN and DOCUMENTS
  (tension → release). The CTA is answered inside the emotional upswing the dark room creates.
- **One dark beat only.** REMAIN. Light returning in DOCUMENTS makes the ask feel like arrival, not pressure.
- **HONEST refuses spectacle.** No wall word, no mesh, no lean-in reward. The visual directive already
  says it: honesty should read like reading. The bareness of this room is what makes rooms 1–2 and 4–6
  believable (P7 two-sided messaging).

---

## 2. The manipulation levers (all inside the red lines)

1. **Tempo ownership.** Gravity wells force one belief per attention unit. Nobody skims past candor
   or arrives at the yield number before the floor.
2. **Micro-commitments.** Every wheel gesture is behavioral momentum. The close-up zone becomes a
   *lean-in* mechanic: pushing past the station reveals a reward —
   - BUILT: Puzol *before* crossfades to *after* (the visitor performs the transformation — directive's slider idea, adapted).
   - LINE 9: the map draws itself from Colón out to the building.
   - THE DEAL: the assumptions/stress-case fine print resolves into focus (leaning in = literally "looking closer at the numbers" — the exact behavior a serious buyer self-identifies with).
3. **Completion drive.** The room index ("Room 03 — Honest · 03/08") stays visible. An unfinished
   walk itches (Zeigarnik); eight is finishable.
4. **Self-selection as a feature.** Floor-first numbers and the HONEST room are the filter: yield-chasers
   (F1) leave at room 3 or 6 — cheaply, before a call wastes anyone's time. The conservative
   capital-preserver reads the same rooms as proof of seriousness. "The right person through the door"
   is mostly *the wrong person out the side exit*.
5. **The exit that converts.** From room 02 onward, a small fixed corner link: **"Skip the walk — documents →"**
   (camera jumps to room 08). Skipping is not a loss; it is the hottest signal on the page. Tracked.
6. **Freedom paradox.** The explicit right to refuse (freedom line) roughly doubles compliance (P15).
   It closes the page, verbatim from v2.

## 3. What the current v3 prototype copy must lose (violations)

- "Nine residences behind a single wall / fortress hill" — wrong facts, wrong count framing.
- "When they are taken, this page comes down" — manufactured urgency, direct P16 violation.
- "Demand on the hill has never waited for marketing" — unverifiable claim (P12).
- "Twenty minutes from Valencia… the sea" — not in the evidence ledger.
- Giant `NINE` wall — oversized scarcity claim, P17 red line. Scarcity becomes room 07's quiet count.
- "Choose your walls / nine floor plans finished to your taste" — undocumented product claim.

Every replacement string is copied **verbatim from index-v2.html**, which already passed the
approved-claims card. No new claims are written for v3.

## 4. Engineering plan

- **Keep the engine** (frames, dolly, gravity, lighting rig, dev panel behind `d`). Re-skin the 8 frames
  per the beat map; per-room `--walk` override (long/short beats) is the one engine extension needed,
  plus per-room lean-in layers at close-up depths.
- **Input:** wheel + keyboard exist. Add pointer/touch drag → dolly target. Without it the page is
  dead on every phone.
- **Fallbacks:** `prefers-reduced-motion` and no-JS get the linear DOM as a plain scroll page — the
  frames are `<section>`s already in sequencing-law order, so the fallback *is* a valid v2-style page.
- **Map:** reuse the Leaflet Line 9 asset inside room 04; lazy-init when the camera approaches room 03.
- **Analytics (KPI unchanged — cost per named fear):** `room_entered` (deepest room = funnel depth),
  `lean_in` per room, `skip_to_documents`, `fear_named`, `book_call_clicked`.
- **Pre-launch:** strip the dev panel; carry over the v2 publish-checklist comment block wholesale
  (all ⏳ U-Q gates still apply); keep `noindex` until it clears.

## 5. Build order

1. Re-skin rooms 01–08 with v2 copy + wall words per beat map (engine untouched).
2. Per-room walk lengths + the HONEST bare-wall treatment + REMAIN dark beat.
3. Lean-in layers (Puzol crossfade, map draw, deal fine print).
4. Room 08 conversion block ported from v2 (fear buttons, mailto/WhatsApp CONFIG, tracking).
5. Touch input + reduced-motion/no-JS fallback.
6. Analytics events; publish-checklist audit against `approved-claims.md`.
