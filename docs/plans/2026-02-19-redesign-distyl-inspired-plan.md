# Progression Labs — Distyl.ai-Inspired Redesign Plan

## Objective

Redesign the Progression Labs landing page with a **Distyl.ai-inspired grid line/blueprint aesthetic** and a **warm beige color palette throughout** — including the intro animation and hero. The P-logo intro becomes **black on beige** instead of white on black. The result should feel like precision engineering on architectural paper — clean, spacious, professional.

## Design Reference (Distyl.ai Key Patterns)

| Pattern | Distyl Implementation | Our Adaptation |
|---------|----------------------|----------------|
| **Background** | `#f3f2f1` warm beige | Same — entire page beige, including hero |
| **Grid lines** | 1px vertical + horizontal rules framing content | Subtle `rgba(0,0,0,0.06)` lines, vertical rails + section separators |
| **Hero** | Dark hero → beige body | **All beige** — hero is beige, intro logo is black |
| **Feature rows** | Horizontal-ruled rows: big heading left, description right | Replace service cards with ruled feature rows |
| **Case study cards** | 3-col with images + bold metric numbers | Keep our metrics grid, enhance styling |
| **Typography** | Very large headings, generous whitespace | Increase heading size, more padding |
| **Nav** | Clean top bar, adapts bg per section | Beige nav with dark text from the start |
| **Footer** | Dark purple with simple columns | Dark charcoal footer |

## Architecture Overview

**Files modified:**
- `app/globals.css` — Major color palette + layout overhaul + grid line system
- `app/page.tsx` — Restructure sections for new layout patterns
- `app/components/IntroAnimation.tsx` — Flip colors: beige canvas bg, black logo, dark dither blocks

**Files preserved as-is:**
- VideoCarousel, DitherBackground, DitherEffectGL, AsciiImage, GlitchFlower, GlowingParticles
- All public assets (logos, videos, images)
- `app/layout.tsx`

## Work Breakdown

### Unit 1: IntroAnimation Color Inversion (`IntroAnimation.tsx`)
**Files:** `app/components/IntroAnimation.tsx`
**Dependencies:** None (can work in parallel with Unit 2)
**Effort:** Medium

The IntroAnimation is a ~1000-line canvas-based component that renders the P-logo with dither effects. Changes needed to flip from dark-theme to light-theme:

1. **Canvas background** — Change fill from `#000000` to `#f3f2f1` (beige)
   - Find all `fillStyle = '#000000'` or `fillStyle = 'black'` in the canvas rendering
   - Replace with `#f3f2f1`

2. **Logo circles** — Change from white to black/charcoal
   - Circle fill: `#FFFFFF` → `#1a1a1a`
   - Circle stroke: `rgba(255,255,255,...)` → `rgba(26,26,26,...)`

3. **P-shape squares** — Keep brand accent colors (salmon, orchid, blue) — these pop on both dark and light
   - May need slight saturation/opacity adjustments for beige contrast

4. **Cutout circles** — Currently black holes; reverse to beige (`#f3f2f1`) to match background

5. **Dither blocks** — Currently blue-to-cyan on black:
   - Shift gradient to darker tones: `#0000FF` → `#1a1a1a` to `#555555` (charcoal gradient)
   - Or keep blue but increase opacity for beige contrast
   - ASCII characters: ensure they read on beige

6. **Grid line animation** (the intro grid lines that slide in):
   - Change from white/light to dark/charcoal (`rgba(26,26,26,0.1)`)

7. **Convergence/expansion phases** — Colors in these phases reference the same palette, update to match

**Verification:** Run intro animation, confirm P-logo appears as black on beige, dither blocks are visible

---

### Unit 2: CSS Design System Overhaul (`globals.css`)
**Files:** `app/globals.css`
**Dependencies:** None (can work in parallel with Unit 1)
**Effort:** Large

Changes:
1. **Color palette** — New CSS custom properties:
   - `--bg-warm: #f3f2f1` (main background, hero included)
   - `--bg-cream: #eae8e6` (subtle card/section differentiation)
   - `--charcoal: #1a1a1a` (dark text, replaces pure black)
   - `--grid-line: rgba(0, 0, 0, 0.06)` (blueprint lines)
   - `--grid-line-dark: rgba(255, 255, 255, 0.08)` (lines on dark footer)
   - Keep salmon, orchid, blue accents

2. **Body/base** — `background-color: var(--bg-warm)`

3. **Grid line system** — New utility classes:
   - `.grid-container` — Adds vertical rail lines (left + right of content area)
   - `.grid-section` — Adds top/bottom horizontal rules at section boundaries
   - `.grid-divider` — Standalone horizontal rule between content blocks
   - Lines are `1px solid var(--grid-line)`, positioned via `::before`/`::after` pseudo-elements

4. **Navigation** — New `.nav-warm` variant:
   - Beige background from start: `rgba(243, 242, 241, 0.9)` with backdrop-blur
   - Dark charcoal text
   - Subtle bottom border matching grid lines
   - Logo uses `logo-black.png` instead of `logo-white.png`

5. **Hero section** — Full beige treatment:
   - `.hero-fullscreen` background: `#f3f2f1` instead of `#000000`
   - `.hero-dark-title` color: `var(--charcoal)` instead of white
   - `.hero-dark-subtitle` color: `var(--text-secondary)` instead of `rgba(255,255,255,0.6)`
   - `.btn-white` → `.btn-dark` (dark button on beige)
   - Remove `.hero-vignette` (no longer needed on beige)

6. **Feature rows** (replaces service cards for services section):
   - `.feature-row` — 2-column grid: large heading (left), description + link (right)
   - Separated by `1px solid var(--grid-line)` horizontal rules
   - Numbered with subtle counter (01, 02, 03...)
   - Generous padding (80px vertical)

7. **Case Studies section** — Switch from dark to beige:
   - Background: `var(--bg-warm)` instead of black
   - Metric values: `var(--charcoal)` instead of white
   - Testimonial text: dark on beige

8. **Section spacing** — Increase `--section-padding` to `140px` (from 120px)

9. **Typography adjustments:**
   - h2 size bump: `clamp(32px, 4vw, 60px)` (from 52px max)
   - Label style: lighter weight, wider letter-spacing for blueprint feel
   - All text colors reference `var(--charcoal)` / `var(--text-secondary)`

10. **Buttons:**
    - `.btn-primary` stays salmon (works on beige)
    - `.btn-ghost` border adapts to beige context

11. **Footer** — Keep dark: `#1a1a1a` charcoal (only dark section on the page)

12. **Responsive** — Grid lines hide on mobile (`< 768px`), feature rows stack

**Verification:** Dev server hot-reload, visual inspection via Playwright

---

### Unit 3: Page Layout Restructure (`page.tsx`)
**Files:** `app/page.tsx`
**Dependencies:** Units 1 + 2 (CSS classes and IntroAnimation must be updated)
**Effort:** Large

Changes:
1. **Navigation** — Switch from `nav-black` to `nav-warm`:
   - Use `logo-black.png` instead of `logo-white.png`
   - Dark text links on beige

2. **Hero section** — Beige treatment:
   - Remove `hero-vignette` div
   - Update heading/subtitle classes for dark-on-beige text
   - Change CTA button from `btn-white` to `btn-dark`
   - VideoCarousel stays (videos will pop against beige)

3. **Services section** — Complete restructure:
   - Remove 3-column service card grid
   - Replace with numbered feature rows (Distyl pattern):
     ```
     ─────────────────────────────────────
     01  Digital Transformation     [description text + arrow link]
         Advisory
     ─────────────────────────────────────
     02  Business Intelligence      [description text + arrow link]
         & Analytics
     ─────────────────────────────────────
     03  Strategic AI               [description text + arrow link]
         Roadmapping
     ─────────────────────────────────────
     ```
   - Section wrapped in grid-container for vertical rail lines

4. **Case Studies section** — Switch to beige:
   - Remove `section-dark` class
   - Update metric/testimonial text colors for dark-on-beige
   - Add grid line separators between metrics and testimonials

5. **Team section** — Add grid lines, keep 2-column layout

6. **Blog section** — Keep resource cards, add grid-line separators

7. **CTA section** — Beige background, dark text

8. **Footer** — Only dark section remaining (charcoal bg, light text)

9. **Grid line wrapper** — Add a persistent vertical-rail container wrapping all sections

10. **GSAP animation refinements:**
    - Bouncier easing: `back.out(1.2)` for fade-up elements
    - `elastic.out(1, 0.5)` for metric count-up
    - Feature row stagger: `0.15s` (from 0.12s)
    - Grid lines fade in on viewport entry

**Verification:** Full-page screenshot comparison via Playwright

## Tech Stack & Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| No new dependencies | Reuse GSAP, existing components | Minimal diff, faster execution |
| CSS-only grid lines | Pseudo-elements, not DOM elements | Zero performance cost, clean markup |
| **All-beige page** | Hero, sections, CTA — all beige | User requested, matches Distyl aesthetic |
| **Dark logo intro** | Black P-logo on beige canvas | Inverts the current white-on-black scheme |
| Feature rows over cards | Matches Distyl's engineering aesthetic | Cleaner, more spacious, blueprint feel |
| Dark footer only | Charcoal footer as single dark element | Grounds the page, provides visual anchor |

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| IntroAnimation color inversion breaks timing/effects | Test each phase independently; logo pattern is data-driven, only colors change |
| Videos look washed out on beige | Videos have their own contrast; test and adjust container if needed |
| Grid lines feel too heavy | Start with `rgba(0,0,0,0.06)` (barely visible), iterate |
| All-beige page feels flat without dark hero contrast | Grid lines + feature rows + generous whitespace add visual structure |
| Case studies metrics less impactful without dark bg | Use bold weight + larger size to compensate; consider accent-colored numbers |
| Dither blocks illegible on beige | Shift to charcoal gradient or increase opacity |
| Mobile grid lines clutter | Disable grid lines below 768px |

## Verification Strategy

1. **Visual comparison:** Playwright screenshots at each unit completion
2. **Intro animation check:** Confirm P-logo renders black on beige, all phases work
3. **Responsive check:** Screenshots at 1200px, 768px, 375px widths
4. **Animation check:** Manual scroll-through confirming GSAP triggers feel bouncy
5. **Contrast check:** Ensure all text meets WCAG AA on beige backgrounds
6. **Build check:** `npm run build` passes without errors
