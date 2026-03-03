# Isidor Layout Match — Plan

## Objective
Make the Method and Services grid sections on `/experiment` visually match the Isidor.ai enterprise section layout. The reference shows: edge-to-edge grid, flush left gradient column, borderless right cards with icon-only corner brackets, blue card numbers, uppercase monospace titles.

## Architecture Overview
This is a CSS + component refactor touching 3 files. No new dependencies. No structural HTML changes to the grid — just visual treatment of the existing `.exp-12-grid--half` sections.

## Files to Modify

| File | Changes |
|------|---------|
| `app/experiment/experiment.css` | Grid edge-to-edge, card de-bordering, icon bracket area, typography, spacing |
| `app/experiment/components/MethodSection.tsx` | Move `<PanelCorners>` from card to icon area |
| `app/experiment/components/ServicesSection.tsx` | Same — move `<PanelCorners>` from card to icon area |

## Work Breakdown

### Unit 1: Edge-to-Edge Grid Layout (CSS)
**Files:** `experiment.css`
**Changes:**
- `.exp-12-grid--half`: Remove `max-width: var(--exp-container)` and side `padding`. Set `padding: var(--exp-section-pad) 0`. This makes the grid span the full viewport width.
- `.exp-12-grid--half .exp-col-label`: Add `padding-left: max(32px, calc((100vw - 1280px) / 2))` so the text content aligns with the rest of the site, but the gradient background bleeds to the edge.
- Keep the right column within readable bounds using padding-right on `.exp-12-grid--half .exp-col-content`.
**Verification:** Left gradient flush to viewport left edge, right content stays readable.

### Unit 2: Borderless Right Cards (CSS)
**Files:** `experiment.css`
**Changes:**
- `.exp-12-grid--half .exp-panel`: Remove `border`, `background`, and hover border/bg effects. Cards become transparent with no border.
- Increase `.exp-col-content` gap from `20px` to `48px` for more vertical breathing room between cards (matching Isidor spacing).
- Remove `.exp-panel:hover` border/bg changes for the `--half` variant.
**Verification:** Cards have no visible border or background, clean open layout.

### Unit 3: Icon-Only Corner Brackets (CSS + Components)
**Files:** `experiment.css`, `MethodSection.tsx`, `ServicesSection.tsx`
**Changes:**
- In both components: Move `<PanelCorners />` from inside `<div className="exp-panel">` to inside `<div className="exp-panel-icon">` (wrapping the `<CardIcon>` component).
- Make `.exp-panel-icon` `position: relative` so the absolute-positioned corners attach to it.
- Adjust `.exp-panel-icon` border: add `border: 1px solid rgba(255,255,255,0.08)` to give the icon area a subtle container.
**Verification:** L-bracket corners appear only around the icon area, not the full card.

### Unit 4: Blue Card Numbers + Uppercase Monospace Titles (CSS)
**Files:** `experiment.css`
**Changes:**
- `.exp-12-grid--half .exp-panel-id`: Change color to `var(--exp-navy)` (the blue `#0943A0`). Slightly larger font.
- `.exp-12-grid--half .exp-panel-title`: Add `text-transform: uppercase`, `font-family: var(--exp-mono)`, `letter-spacing: 0.12em`, `font-weight: 500`.
**Verification:** Numbers are blue, titles read like "DISCOVER", "EVALUATION" in monospace.

### Unit 5: Blueprint Grid Full-Width (CSS)
**Files:** `experiment.css`
**Changes:**
- The `.exp-12-grid` already has a blueprint grid background, but it's constrained by `max-width`. For the `--half` variant (which is now full-width), the grid automatically extends.
- No additional change needed — this is solved by Unit 1.
**Verification:** Blueprint grid lines visible across the full viewport width.

## Tech Stack & Decisions
- **Pure CSS + minor JSX moves** — no new deps, no new components
- **Scoped to `--half` variant** — normal `.exp-12-grid` (if used elsewhere) is unaffected
- **Why scope to `--half`?** Only Method and Services use the half-split layout. Other sections (testimonials, team, CTA) should NOT get this treatment.

## Risks & Mitigations
| Risk | Mitigation |
|------|-----------|
| Edge-to-edge breaks mobile layout | The existing `@media (max-width: 1024px)` already collapses to single column — `--half` overrides only apply at desktop |
| Removing card borders makes cards hard to distinguish | The icon bracket area + generous 48px gap + the monospace title create clear card boundaries |
| Sticky label affected by grid width change | Sticky positioning is relative to scroll viewport, not container — verified with `overflow-x: clip` |

## Verification Strategy
1. `npm run build` — no TypeScript errors
2. Playwright screenshots at 1440px:
   - Left gradient flush to left edge
   - Cards borderless with icon-only brackets
   - Blue numbers, uppercase monospace titles
   - Sticky label still works when scrolling
3. Responsive check at 768px — single column fallback still works
