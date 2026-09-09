# Design & Development Brief: El Fortín Landing Page

## 1. Project Overview
**Project:** El Fortín — Riba-Roja
**Product:** A turnkey, fully managed 10-unit residential building in Valencia, Spain.
**Offer:** Deeded ownership of a specific apartment (~€236k all-in) with a blended target yield of 7% and a contractually guaranteed 4% net floor.
**Goal of the Page:** Convert high-net-worth traffic into qualified leads via WhatsApp or Investor Deck downloads. 

## 2. Design Aesthetic & "Vibe"
The aesthetic must communicate **"Quiet Luxury + Engineering Precision."** 
It should look like a boutique architectural firm or a high-end private equity asset, *not* a mass-market proptech app or a cheap holiday rental site.

*   **Restraint:** Use ample whitespace to let the content breathe. Do not clutter the screen.
*   **Tactile & Grounded:** Avoid stark, pure whites (`#FFFFFF`) and pure blacks (`#000000`). Use warm, off-white backgrounds (e.g., "Bone" or "Plaster") to make the digital space feel physical and warm.
*   **Sharpness:** Use `0px` border radii (square corners) on all buttons, cards, and image frames. Avoid bubbly, rounded tech UI elements. 
*   **Photography First:** Let the high-resolution architectural renders and construction photos provide the color and emotion. The UI chrome should be nearly invisible.

## 3. Typography System
The typography must balance emotional luxury with data-driven clarity.

*   **Headlines (Emotion):** Use an elegant, editorial Serif font (e.g., `DM Serif Display`, `Freight Display Pro`, or similar). Use sentence case.
*   **Body & Data (Logic):** Use a clean, geometric Sans-Serif (e.g., `Plus Jakarta Sans`, `Inter`). 
*   **Eyebrows / Labels:** Use tiny, uppercase Sans-Serif with wide tracking (e.g., 10px, 3px letter-spacing) for section labels (e.g., "THE MODEL", "THE NUMBERS").
*   **Buttons:** Uppercase Sans-Serif, wide tracking, bold weight.

## 4. Color Palette Guidelines
*   **Field/Background:** Warm "Bone" or "Plaster" (e.g., `#f1ece3` or `#f3eee4`).
*   **Primary Text:** Deep Charcoal (e.g., `#424242` or `#2c3236`).
*   **Accent/Action:** Terracotta/Clay (e.g., `#b44a2a`) or Olive (e.g., `#5c6640`). Use accents sparingly—only for primary CTAs or specific data highlights.
*   **Secondary Text:** Muted gray/charcoal for captions and supporting copy.

## 5. Required Page Structure & Content Flow
The page must follow this exact narrative flow. (Refer to the provided `marketing-messages.md` for the exact copy to use in each section).

1.  **The Hero (The Hook):**
    *   Full-bleed, edge-to-edge architectural render.
    *   Clear, bold headline stating the deeded ownership and the 4% net floor.
    *   Primary CTA button.
2.  **The Data Bar (The Math):**
    *   A clean, horizontal, typographic section immediately below the hero.
    *   Must clearly display the 4 core metrics: Entry Price (≈ €229,000), Target Yield (~7%), Net Floor (4%), and Owner Use (14 Nights).
3.  **The "Moat" (Legal Security):**
    *   A section explaining that because the developer owns the whole block, there are no community bans on short-term rentals.
4.  **The Operator (Human Trust):**
    *   Must feature a photo of the developer (Uriel Nabel) on the construction site.
    *   Copy must highlight his corporate background (SAP/BCG) and previous delivered project (El Fortín de Puzol) to prove engineering rigor and track record.
5.  **The Financial Transparency (The Guarantee):**
    *   Explanation of how the 4% net floor works (developer covers the gap).
    *   Pair with a high-end interior render.
6.  **The Product Gallery:**
    *   A clean grid or carousel of the interior renders and construction progress.
7.  **The Financial Breakdown:**
    *   A tabular or grid layout showing the exact math: Unit price, furniture package, closing costs, and the 25/25/25/25 payment schedule.
8.  **Frequently Asked Questions:**
    *   A clean accordion layout addressing operational details (management fees, payouts, construction milestones).
9.  **The Final Close:**
    *   A final push to contact via WhatsApp or download the deck, noting that only 9 units remain.

## 6. Interaction & Motion
*   **Transitions:** Keep hover states and transitions short, sharp, and professional (no bouncing or heavy parallax). 
*   **Hover States:** Buttons should have subtle color shifts (e.g., Olive to Darker Olive). 
*   **Carousels/Galleries:** Should be user-controlled (drag/click) rather than fast-moving autoplay.

## 7. Assets Provided to the Designer
*   `marketing-messages.md`: The exact approved copy for every section.
*   `facts.md`: The source of truth for all project data.
*   `assets/brand/`: High-resolution renders, site photography, and founder portraits.