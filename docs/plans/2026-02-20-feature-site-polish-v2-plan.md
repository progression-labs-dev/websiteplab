# Site Polish V2 — Plan

## Objective

Four enhancements to the Progression Labs site that elevate it from "template" to "premium agency-tier":

1. **Header blueprint framing** — Distyl.ai-inspired architectural lines around header text, grid on rest of page
2. **Mosaic tool: transparent subject export** — Enable subject isolation + transparent background in the Mosaic tool for pre-processing hero videos
3. **PixelVine overhaul** — Complete rewrite: starts from hero image, multi-color, dense ASCII blocks, slick connected look
4. **Text scramble animation** — Anduril-style cipher/decrypt effect on all major headings

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│ WU-1: Header Lines (CSS only)                   │ ← Independent
├─────────────────────────────────────────────────┤
│ WU-2: Mosaic Tool — Transparent Export           │ ← Independent (tool, not site)
├─────────────────────────────────────────────────┤
│ WU-3: PixelVine Overhaul (Canvas component)     │ ← Independent
├─────────────────────────────────────────────────┤
│ WU-4: Text Scramble (New React component + CSS) │ ← Independent
└─────────────────────────────────────────────────┘
```

All 4 work units are **independent** — no shared files, can execute in parallel.

---

## Work Breakdown

### WU-1: Header Blueprint Framing
**Files**: `app/globals.css`
**Depends on**: Nothing

**What**:
Currently the hero has a solid `--bg-warm` background with two subtle vertical rail lines. The user wants Distyl.ai-style framing:
- **Header area**: Thin architectural lines framing the text block (top, bottom, sides), NOT a full grid. Think like a technical drawing border around the heading text.
- **Rest of page**: Keep the existing 60px grid visible on sections where it works (services, case studies stats area, etc.)
- **Text-heavy areas**: No grid overlay (testimonials, blog cards, etc.) — clean backgrounds

**Implementation**:
1. Remove the current `::before`/`::after` rail lines from `.hero-fullscreen`
2. Add framing lines around `.hero-fullscreen-content` (the text column):
   - Top line: thin 1px horizontal line above the h1
   - Bottom line: thin 1px horizontal line below the CTA button
   - Left vertical line: continues from nav down past the text
   - Small corner brackets/markers at intersections (Distyl style)
3. Keep body background grid (60px, 6% opacity) but selectively hide it on text-heavy sections:
   - `.testimonial-section`, `.blog-section`, `.cta-section` → `background: var(--bg-warm)` to cover grid
   - `.grid-section` (services), `.stats-row`, `.team-section` → keep transparent so grid shows
4. Optionally add section-top horizontal divider lines at grid intersections

**Verification**: Screenshot hero — lines frame the text, grid visible on services, no grid on testimonials/blog

---

### WU-2: Mosaic Tool — Transparent Subject Export
**Files**: `app/tools/mosaic/hooks/useMosaicRenderer.ts`, `app/tools/mosaic/components/ControlPanel.tsx`
**Depends on**: Nothing

**What**:
The Mosaic tool already has subject mask (SAM), shape modes, and color palettes. We need to:
1. Add a new BgMode: `'grid'` — draws the blueprint grid pattern behind the subject instead of black/white/transparent
2. Ensure the `'transparent'` BgMode actually works for video export (currently may not clear canvas properly)
3. Add an "ASCII silhouette" render option: the subject is rendered as ASCII-styled mosaic blocks, the background is transparent or grid-patterned

**Implementation**:
1. In `useMosaicRenderer.ts`:
   - Add `'grid'` to BgMode type
   - In the render function, when bgMode is 'grid': draw the 60px grid pattern on canvas first, then render mosaic shapes only where subject mask is active
   - Ensure transparent mode clears canvas with `ctx.clearRect()` before drawing
2. In `ControlPanel.tsx`:
   - Add 'Grid' option to background mode selector
3. For video export: ensure canvas has alpha channel when exporting with transparent bg

**Verification**: Open Mosaic tool → load a video → select subject → set bg to 'Grid' → see ASCII/pixel subject on blueprint grid background

**NOTE**: This is a tool enhancement. The actual hero video processing (using the tool to create transparent subject videos) happens manually AFTER this WU is done. That's a separate step.

---

### WU-3: PixelVine Overhaul
**Files**: `app/components/PixelVine.tsx`
**Depends on**: Nothing

**What**:
Complete rewrite of PixelVine. Current problems:
- Blocks too small (8px), too spaced out, barely visible
- Only green colors
- No ASCII characters
- Starts from top of page, not from the hero image
- Doesn't look "connected" or "slick"

**New design**:

**Origin**: Blocks originate at the bottom of the hero image (`.hero-image` element). They emerge from the image's lower edge and flow downward.

**Block size**: 12px (matching Mosaic tool's default cellSize)

**Block types** (seeded random per position):
- 40% ASCII characters (white text with colored glow, `drawAsciiChar` style from mosaic shapes.ts)
- 40% Pixel blocks (beveled, like mosaic `drawPixelBlock`)
- 20% Convex circles (gradient-shaded, like mosaic `drawConvexCircle`)

**Color palette**: Multi-color based on vertical position on page, using the brand palette concept from the Mosaic tool:
- **Hero → Services**: Green gradient (`#1b4332` → `#52b788` → `#b7e4c7`)
- **Services → Case Studies**: Turquoise shift (`#1b4332` → `#2d9a8f` → `#95e0d9`)
- **Case Studies → Footer**: Warm shift (`#2c2416` → `#8a7a64` → `#d4c5a9`)

Colors interpolate smoothly based on block's Y position.

**Density**: Much denser than current:
- Vertical spacing: 8px (was 12px)
- Horizontal spread: 10px spacing (was 14px)
- Extra dither blocks every 2nd position (was every 4th/5th)

**4 Segments** (scroll-driven):

| Segment | pathT | Behavior |
|---------|-------|----------|
| 1: Gather | 0.00–0.05 | Blocks emerge from hero image bottom edge, form at center |
| 2: Drop | 0.05–0.15 | Vertical line drops from gather point to services section |
| 3: Spread | 0.15–0.60 | Horizontal line spreads from center to both edges at services top |
| 4: Cascade | 0.60–1.00 | Two streams flow down left/right page edges to footer |

**Scroll progress**: Element-based using `getBoundingClientRect()`:
- Trigger start: hero image bottom enters top 70% of viewport
- Trigger end: past case studies section
- Linear progress between triggers (no smootherstep on raw progress)
- Per-block easing still uses smootherstep

**ASCII rendering** (from mosaic shapes.ts):
- 5 density tiers: `[' ']`, `['·',':','~','-']`, `['+','×','=','*','÷']`, `['#','%','$','&','X']`, `['@','W','M','█','■']`
- Font: `bold ${fontSize}px "SF Mono", "Fira Code", "Courier New", monospace`
- White text with colored glow (`ctx.shadowColor`, `ctx.shadowBlur = cellSize * 0.8`)
- Tier selected by block's brightness/alpha value

**Verification**: Screenshots at scroll 0 (vine not yet started), scroll 300 (blocks emerging from image), scroll 600 (vertical drop + spread beginning), scroll 2000 (border streams flowing)

---

### WU-4: Text Scramble Animation
**Files**: `app/components/TextScramble.tsx` (NEW), `app/page.tsx`, `app/globals.css`
**Depends on**: Nothing

**What**:
Anduril-style cipher/decrypt text effect:
- Characters cycle through random glyphs (military/code aesthetic)
- Resolves letter-by-letter from left to right
- Gives a "high-security encrypted transmission being decoded" vibe

**Character set for scramble**: `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*+-=<>[]{}|/\`

**Algorithm**:
1. Start with all characters scrambled (random from charset)
2. Every ~30ms, cycle remaining scrambled characters to new random values
3. Resolve characters one-by-one from left to right, with slight randomization
4. Resolution speed: ~3-4 characters per frame tick (50-80ms per character)
5. Total animation duration: ~1.5-2s for hero heading, ~0.8-1.2s for section headings

**Component API**:
```tsx
<TextScramble
  text="Turn your company a leader in the age of AI"
  trigger="load" | "inView"     // when to start
  delay={500}                    // ms delay before starting
  duration={1800}                // total animation time
  className="hero-dark-title"
/>
```

**Integration points**:
- `app/page.tsx`: Replace static `<h1>` with `<TextScramble trigger="load" />`
- Section headings (Services, Case Studies, Team, Blog): Replace with `<TextScramble trigger="inView" />`
- Use Intersection Observer for "inView" trigger (fires once when element enters viewport)

**Styling**:
- During scramble: use monospace font temporarily for even character spacing
- Transition back to the heading's normal font as characters resolve
- Optional: slight green/cyan tint on scrambled characters (matrix vibe)
- CSS: `.text-scramble-active` class for monospace override during animation

**Verification**: Record screen or take timed screenshots showing text in scrambled → resolved states

---

## Tech Stack & Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Header lines | CSS `::before`/`::after` + borders | No JS needed, pure CSS, performant |
| Mosaic bg mode | Canvas grid pattern | Leverages existing render pipeline |
| PixelVine blocks | Canvas 2D (same approach) | Already proven, DPR-aware, viewport culled |
| PixelVine colors | Position-based gradient interpolation | Smooth color transitions, brand-consistent |
| Text scramble | React component + requestAnimationFrame | Reusable, composable, no library needed |
| InView detection | Intersection Observer API | Native, performant, fires once per element |
| Block rendering | Import from mosaic shapes.ts | Code reuse, consistent look across site |

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| ASCII glow performance (ctx.shadowBlur per block) | Limit glow to blocks currently in viewport, cap at ~200 visible blocks |
| Text scramble on slow devices | Use `requestAnimationFrame` with time-based progress, gracefully degrades |
| Mosaic tool grid bg might look different than site grid | Use same CSS variables (60px, same color) for consistency |
| PixelVine origin detection (hero-image rect) | Fallback to fixed offset if element not found |
| Font flash during text scramble (monospace → heading font) | Pre-load monospace font, use CSS `font-display: swap` |

## Verification Strategy

1. **TypeScript**: `npx tsc --noEmit` (zero errors)
2. **Production build**: `npm run build` (clean)
3. **Visual verification via Playwright**:
   - Hero: Lines frame text, no full grid on header
   - Services: Blueprint grid visible through section
   - PixelVine: Dense, colorful blocks flowing from hero image
   - Text scramble: Headings decrypt on scroll
   - Mosaic tool: Grid background mode works with subject mask
4. **Performance**: No frame drops in vine animation (check devtools FPS)
