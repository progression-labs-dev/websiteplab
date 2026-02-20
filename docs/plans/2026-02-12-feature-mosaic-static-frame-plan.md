# Mosaic Static Frame — Plan

## Objective

Modify MosaicCanvas to render a **static, full-canvas mosaic grid** that matches the user's reference image. Every cell renders as a solid colored rectangle at full opacity — no spotlight, no mouse interaction, no animation. Grain overlay visible on top.

This is **Frame 1** — the foundation. Future work will add animation on top of this, but getting one frame visually correct comes first.

## Reference Image Analysis

The target (`public/reference-frame-target.png`) shows:
- **Full grid of solid blocks** (~40px) covering the entire canvas — no gaps, no transparency
- **Left side**: icy blue-white, very pale (#D0E8F4 range)
- **Center-right**: warm coral/salmon/pink mass with concentric warmth gradations
- **Bottom-right**: vivid red focal point (#F44152 range)
- **Far right**: periwinkle/lavender zone (#ABC1F9 range)
- **Accent pixels**: 1-2 bright cyan/white blocks in the warm zone, small orange scout near top-center
- **Grain texture**: subtle film noise visible across the entire surface

## Architecture Overview

### Current State (v4.2 baseline)
- MosaicCanvas loads `gradient-base.png` → offscreen canvas → pixel sampling
- `buildGrid()` creates cells with noise-varied colors — **this is good, keep it**
- `draw()` only renders cells within spotlight radius (smoothstep falloff) — **this must change**
- `isDot` system creates small squares within cells — **this causes the "outlined boxes" bug, remove it**
- Mouse tracking, idle drift, RAF loop — **all unnecessary for static frame**
- Props `baseOpacity=0`, `accentOpacity=0` make cells invisible without spotlight — **remove these**

### Target State
- `buildGrid()` still samples gradient + applies simplex noise variation (unchanged)
- `draw()` renders ALL cells as solid `fillRect` at full opacity
- No mouse tracking, no RAF loop — just draw once on load + redraw on resize
- No `isDot`, no `dotSize`, no accent density system
- Component is purely a static visual

### Key Principle: Minimal Changes
The existing `buildGrid()` color sampling + simplex noise logic is exactly what we need. We're **removing** complexity (spotlight, mouse, animation, dots), not adding it.

## Work Breakdown

### Unit 1: Strip Mouse & Animation Logic
**File:** `app/components/MosaicCanvas.tsx`
**Dependencies:** None

Remove:
- `targetMouseRef`, `currentMouseRef`, `lastInteractionRef`, `driftAngleRef`, `canvasSizeRef`
- `smoothstep()` function
- `startAnimation()` function and RAF loop
- `handleMouseMove()`, `handleTouchMove()` event listeners
- All `spotlightRadius` references
- Props: `spotlightRadius`, `baseOpacity`, `accentOpacity`, `accentDensity`

Keep:
- `canvasRef`, `cellsRef`, `imageDataRef`, `observerRef`
- `setupCanvas()` structure (image loading, resize handling)
- `buildGrid()` (to be modified in Unit 2)
- `draw()` (to be rewritten in Unit 3)

**Verification:** TypeScript compiles. Component renders without errors (even if visually blank at this stage).

---

### Unit 2: Simplify buildGrid()
**File:** `app/components/MosaicCanvas.tsx`
**Dependencies:** Unit 1

Modify `buildGrid()`:
- Remove `isDot` and `dotSize` from `CellData` interface
- Remove `accentDensity` noise logic and `deterministicRandom` accent checks
- Remove `baseAlpha` field (all cells render at full opacity)
- Keep: gradient pixel sampling, simplex noise HSL variation, cell position calculation

Simplified `CellData`:
```typescript
interface CellData {
  x: number
  y: number
  w: number
  h: number
  r: number
  g: number
  b: number
}
```

Remove unused fields: `col`, `row`, `centerX`, `centerY`, `baseAlpha`, `isDot`, `dotSize`.

**Verification:** Grid builds correctly. Log cell count to confirm (e.g., ~1200 cells for 1920×800 at 40px blocks).

---

### Unit 3: Rewrite draw() as Static Full-Canvas Render
**File:** `app/components/MosaicCanvas.tsx`
**Dependencies:** Unit 2

Replace the spotlight-based `draw()` with a simple full-canvas render:

```typescript
function draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h)
  const cells = cellsRef.current
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i]
    ctx.fillStyle = `rgb(${cell.r},${cell.g},${cell.b})`
    ctx.fillRect(cell.x, cell.y, cell.w, cell.h)
  }
}
```

This renders every cell as a solid colored rectangle. No opacity calculations, no distance checks, no dot sizing.

**Draw once on load, redraw on resize** — no RAF loop needed:
- In `img.onload`: call `sizeCanvas()` which calls `buildGrid()` + `draw()`
- In `ResizeObserver` callback: call `sizeCanvas()`

**Verification:** Visual — all blocks render as solid colors filling the entire hero. No transparent gaps. Screenshot comparison against reference.

---

### Unit 4: Grain Overlay Visibility
**Files:** `app/globals.css`
**Dependencies:** None (parallel with Units 1-3)

Current grain is at `opacity: 0.22` with `mix-blend-mode: soft-light`. The user said the grain effect was not visible enough.

Changes:
- Increase `.grain-overlay` opacity from `0.22` to `0.35`
- Keep `mix-blend-mode: soft-light` (this is the correct blend mode for subtle grain)

**Verification:** Visual — grain texture is visible across the mosaic surface. Not overpowering, but clearly present.

---

### Unit 5: Page Integration
**File:** `app/page.tsx`
**Dependencies:** Units 1-3

Update MosaicCanvas usage in the hero section:
- Remove `spotlightRadius={450}` prop (no longer exists)
- Keep `imageSrc="/gradient-base.png"`, `blockSize={40}`, `className="mosaic-canvas-hero"`

No other page changes needed at this stage.

**Verification:** Page loads without errors. MosaicCanvas renders in the hero. `npm run build` succeeds.

---

### Unit 6: Visual Comparison & Tuning
**Files:** `app/components/MosaicCanvas.tsx` (potentially)
**Dependencies:** Units 1-5

Take a Playwright screenshot and compare against `reference-frame-target.png`:

1. **Color distribution** — Does the warm mass appear center-right/bottom-right? If gradient-base.png doesn't produce this distribution, we may need to adjust noise parameters or consider a new gradient image.
2. **Block edges** — Are blocks rendering as clean solid rectangles with no gaps?
3. **Grain visibility** — Is the film texture clearly present?
4. **Overall feel** — Does it look like the reference?

Potential tuning:
- `noiseScale` (currently 0.06) may need adjustment for more/less color variation
- `colorVariation` HSL values may need tweaking
- Block size may need adjustment (currently 40px)

**Verification:** Side-by-side screenshot comparison. User approval.

## Tech Stack & Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Remove RAF loop | Draw once + resize redraw | Static frame doesn't need 60fps animation loop. Saves battery/CPU |
| Remove isDot system | All cells are solid rectangles | isDot created "weird white boxes with outlines" bug |
| Keep simplex noise | Organic color variation | Creates natural-looking block-to-block variation instead of mechanical grid |
| Keep buildGrid() structure | Minimal change surface | The color sampling logic is solid — we only need to simplify it |
| Grain at 0.35 opacity | More visible than 0.22 | User explicitly asked for visible grain effect |

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| gradient-base.png colors don't match reference | Medium | Compare after rendering. May need new gradient image or color mapping adjustments |
| Blocks have visible gaps from subpixel rendering | Low | Use `Math.round()` on positions, or add 0.5px overlap |
| Grain too strong at 0.35 | Low | Easy to tune — just adjust the opacity value |
| Build breaks from removed props | Low | Update page.tsx in same pass |

## Verification Strategy

1. **TypeScript:** `npx tsc --noEmit` — no type errors
2. **Build:** `npm run build` — production build succeeds
3. **Visual (Playwright):** Screenshot the hero at full width
4. **Comparison:** Side-by-side with `reference-frame-target.png`
5. **Grain:** Verify film texture is visible in screenshot
6. **Mobile:** Quick check at 768px and 375px widths — blocks should be larger (50px per existing logic)

## Estimated Scope

~3 files changed, ~150 lines removed, ~20 lines added. Net reduction in complexity.
This is a simplification task, not a feature addition.
