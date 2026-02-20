# Pixel Mosaic Hero v2 — Plan

## Objective

Rework the MosaicCanvas component to match the reference image (`/Users/joeom/Downloads/website.png`) accurately. The reference shows a **diagonal gradient, sliced into horizontal rows with some rows flipped**, overlaid with a **square pixel mosaic grid**, topped with **heavy film grain**. Fix the broken grain, desaturate colors, and achieve the "glitchy stagger" displacement effect.

## Reference Analysis

The reference image has these layers (bottom to top):
1. **Diagonal gradient base**: Color flows from top-left (blue/teal) to bottom-right (salmon/orchid)
2. **Horizontal row slicing**: The gradient is divided into ~25-35 horizontal bands
3. **Row displacement/flip**: ~40-50% of rows are horizontally flipped, causing blue to appear on the right side in some rows and warm tones to appear on the left — creating the glitchy stagger
4. **Square pixel grid**: ~30-40px squares with subtle HSL color variation between neighbors
5. **Film grain**: Heavy grain texture visible across the entire image

The colors are **muted/desaturated** compared to pure brand hex values.

## Architecture

```
Canvas rendering pipeline:

  For each SQUARE cell (col, row):
    1. Determine which horizontal band this row belongs to
    2. Check if this band is "flipped" (deterministic random per band)
    3. Sample diagonal gradient at position:
       - Normal band: t = (col/cols + row/rows) / 2  (diagonal)
       - Flipped band: t = ((cols-col)/cols + row/rows) / 2  (horizontally mirrored)
    4. Apply muted color palette (desaturated brand colors)
    5. Apply simplex noise HSL variation (subtle)
    6. Draw square at (col*size, row*size, size, size)

  After canvas: grain overlay (fixed div, z-index 9998)
```

## Work Breakdown

### Unit 1: Rework MosaicCanvas — Diagonal + Stagger + Squares
**File**: `app/components/MosaicCanvas.tsx` (REWRITE)
**Dependencies**: None
**Changes**:
- Add new prop `diagonal: boolean` (default true) — sample gradient diagonally instead of vertically
- Add new prop `stagger: boolean` (default true) — enable row flipping
- Add new prop `staggerRatio: number` (default 0.45) — fraction of rows that get flipped
- Add new prop `bandCount: number` (default 28) — number of horizontal bands
- Change default `blockWidth` and `blockHeight` to both be `35` (SQUARES)
- **Diagonal sampling**: `t = (col/cols * 0.6 + row/rows * 0.4)` normalized to 0-1 — gives a diagonal flow biased slightly more horizontal
- **Band assignment**: Each row maps to a band index (`Math.floor(row / rowsPerBand)`)
- **Flip logic**: Use a seeded deterministic random per band to decide flip (seed from band index). ~45% of bands flip. When flipped, mirror the column index: `effectiveCol = cols - 1 - col`
- **Square blocks**: blockWidth = blockHeight = 35 (or responsive: 50 on mobile)
- Remove `blockHeight` distinction — use single `blockSize` prop

### Unit 2: Muted Color Palette
**File**: `app/page.tsx` (MODIFY)
**Dependencies**: None
**Changes**:
- Update hero gradient color stops to use **muted/desaturated** versions of brand colors:
  - Blue: `#2233BB` (muted from #0000FF — less aggressive, more indigo)
  - Teal: `#4AAFB8` (muted from #40E0D0 — slightly grayed)
  - Green: `#A8C87A` (muted from #B9E979 — more olive)
  - Salmon: `#D4977A` (muted from #FFA07A — more dusty)
  - Orchid: `#A865B0` (muted from #BA55D3 — more mauve)
- Pass new props: `diagonal={true}`, `stagger={true}`, `blockSize={35}`
- Update CTA gradient stops similarly (reversed, muted)

### Unit 3: Fix Grain Overlay
**File**: `app/globals.css` (MODIFY)
**Dependencies**: None
**Changes**:
- The grain overlay uses `mix-blend-mode: overlay` which becomes invisible on saturated canvas colors
- **Fix**: Change to `mix-blend-mode: soft-light` which works better across color ranges
- Increase grain opacity from `0.22` to `0.30` for more visible texture
- Verify the grain `z-index: 9998` is above the canvas `z-index: 0`
- Also fix the grain pulse animation in page.tsx — update target opacity from `0.28` to `0.38`

### Unit 4: Visual Polish + Verify
**Files**: All (VERIFY)
**Dependencies**: Units 1-3
**Changes**:
- Take Playwright screenshots, compare to reference
- Verify grain is visible on both hero and CTA
- Verify stagger effect creates the glitchy displacement
- Verify squares (not rectangles)
- Verify muted color tone
- TypeScript check: `npx tsc --noEmit`

## Tech Stack & Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Diagonal gradient | t = (col*0.6 + row*0.4) | Creates diagonal flow; 60/40 bias matches reference (more horizontal than 45°) |
| Row flip ratio | ~45% | Reference shows roughly half the rows displaced; too many = chaotic, too few = no stagger |
| Deterministic random | Seeded from band index | Consistent across redraws/resizes; same bands always flip |
| Square size | 35px (50px mobile) | Matches reference pixel density; smaller than v1 rectangles |
| Muted colors | HSL-shifted brand palette | Reference is clearly desaturated compared to pure hex values |
| Grain blend mode | soft-light | Works on all color ranges; overlay fails on saturated colors |

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Stagger effect looks too random/chaotic | Use deterministic seed, control flip ratio, test visually |
| Muted colors too dull | Start with moderate desaturation, can push back toward brand if needed |
| Grain still invisible | Test soft-light, multiply, and normal blend modes; can also render grain directly on canvas |
| Performance with smaller squares (more cells) | 35px squares at 1440x900 = ~1100 cells, still fast for canvas fillRect |

## Verification Strategy

1. Playwright screenshots vs reference image
2. Grain visibility check (zoom into hero)
3. Square block shape confirmation
4. Stagger/flip effect visible (blue on right in some rows)
5. TypeScript: `npx tsc --noEmit`
6. Build: `npm run build`
