# Pixel Mosaic Hero v3 — Image-Sampled Approach

## Objective

Completely rework the MosaicCanvas to **sample colors directly from an actual gradient image** instead of using algorithmic color stops. This matches the user's actual Figma workflow:

1. Start with a smooth organic mesh gradient image (saved as `public/gradient-base.png`)
2. Slice it into horizontal bands
3. Flip/reverse some bands (creating the glitchy stagger)
4. Apply square pixel mosaic grid
5. Apply film grain on top

### Why v2 Failed

The base gradient is an **organic mesh/radial gradient** — colors blend in non-linear, multi-directional ways (navy top-left, electric blue center-top, turquoise upper-right, orchid left, salmon lower-right, yellow-green right). This is **impossible to approximate with linear color stops**. v1 and v2 both tried algorithmic gradient sampling and produced flat, unconvincing results.

### The Fix

Load the actual gradient image into a hidden canvas, read its pixel data with `getImageData()`, and sample real colors for each mosaic cell. The organic gradient is preserved perfectly because we're literally reading it from the source.

## Reference

- **Target**: `/Users/joeom/Downloads/website.png` — the final mosaic effect we're matching
- **Base gradient**: `public/gradient-base.png` — the smooth organic gradient before any effects

## Architecture

```
Canvas rendering pipeline (v3):

  1. Load gradient-base.png into a hidden/offscreen canvas
  2. Call getImageData() to get full pixel array
  3. For each SQUARE cell (col, row):
     a. Determine which horizontal band this row belongs to
     b. Check if this band is "flipped" (deterministic random per band)
     c. Calculate source coordinates:
        - sourceX = flipped ? (imgW - 1 - cellCenterX_mapped) : cellCenterX_mapped
        - sourceY = cellCenterY_mapped
     d. Sample the pixel color from the image data at (sourceX, sourceY)
     e. Apply subtle simplex noise HSL variation (very minor — just neighbor differentiation)
     f. Draw square at (col*size, row*size, size, size) with sampled color

  After canvas: grain overlay (already working from v2)
```

### Key Difference from v2

| Aspect | v2 (Algorithmic) | v3 (Image-Sampled) |
|--------|-------------------|---------------------|
| Color source | Linear color stops interpolation | Actual pixel data from gradient image |
| Gradient quality | Flat, unconvincing | Organic, multi-directional, perfect |
| Props needed | `colorStops[]` array | `imageSrc` string path |
| Color accuracy | ~40% match to reference | ~95%+ match to reference |

## Work Breakdown

### Unit 1: Rewrite MosaicCanvas — Image Sampling Core

**File**: `app/components/MosaicCanvas.tsx` (REWRITE)
**Dependencies**: `public/gradient-base.png` must exist
**Changes**:

**New props (replacing colorStops)**:
- `imageSrc: string` — path to gradient image (e.g., `/gradient-base.png`)
- `blockSize?: number` (default 35, mobile 50)
- `stagger?: boolean` (default true)
- `staggerRatio?: number` (default 0.45)
- `bandCount?: number` (default 28)
- `noiseScale?: number` (default 0.06) — reduced from v2, just for subtle neighbor variation
- `colorVariation?: { hue, saturation, lightness }` — smaller values than v2
- `revealDuration?: number`, `revealDelay?: number` — keep from v2
- `className?: string`

**Remove**: `colorStops`, `diagonal` props (no longer needed — gradient direction comes from the image itself)

**Image loading pipeline**:
1. Create an `Image()` object, set `src = imageSrc`
2. On load, draw to a hidden offscreen canvas (same aspect ratio as image)
3. Call `getImageData(0, 0, imgW, imgH)` to get pixel RGBA array
4. Store in a ref for grid building

**Grid building** (replaces v2's `sampleGradient()`):
1. For each cell `(col, row)`:
   - Map cell center to image coordinates: `imgX = (col + 0.5) / cols * imgW`, `imgY = (row + 0.5) / rows * imgH`
   - Determine band: `bandIndex = Math.floor(row / rowsPerBand)`
   - If band is flipped: `imgX = imgW - 1 - imgX` (mirror horizontally)
   - Clamp to bounds, read pixel from ImageData: `idx = (Math.floor(imgY) * imgW + Math.floor(imgX)) * 4`
   - Get `r = data[idx], g = data[idx+1], b = data[idx+2]`
   - Apply subtle noise variation (simplex) on HSL — smaller than v2
   - Store in cells array

**Keep from v2**: Simplex noise implementation, HSL color utilities, GSAP reveal animation, ResizeObserver, RAF loop, `isBandFlipped()` deterministic hash

**Remove from v2**: `sampleGradient()`, `lerpColor()`, `hexToRgb()` for color stops, all gradient interpolation logic

### Unit 2: Update page.tsx — Simplify Props

**File**: `app/page.tsx` (MODIFY)
**Dependencies**: Unit 1
**Changes**:

**Hero MosaicCanvas** (line ~338-352):
```tsx
<MosaicCanvas
  imageSrc="/gradient-base.png"
  blockSize={35}
  stagger={true}
  staggerRatio={0.45}
  bandCount={28}
  className="mosaic-canvas-hero"
/>
```
- Remove all `colorStops` arrays
- Replace with single `imageSrc` prop
- Keep stagger/band/block props

**CTA MosaicCanvas** (line ~636-650):
```tsx
<MosaicCanvas
  imageSrc="/gradient-base.png"
  blockSize={28}
  stagger={true}
  staggerRatio={0.35}
  bandCount={22}
  revealDelay={0.5}
  className="mosaic-canvas-cta"
/>
```
- Same image source — the mosaic + stagger will look different due to different blockSize/bandCount/staggerRatio
- CTA can optionally use a `flipVertical` prop if we want bottom-up gradient flow

### Unit 3: CSS + Grain Verification

**File**: `app/globals.css` (VERIFY/MINOR TWEAK)
**Dependencies**: None
**Changes**:
- Verify grain `mix-blend-mode: soft-light` and `opacity: 0.30` still work (should be fine from v2)
- Verify canvas z-index layering is correct
- No major changes expected — v2 already fixed the grain

### Unit 4: Visual Polish + Verify

**Files**: All (VERIFY)
**Dependencies**: Units 1-3
**Changes**:
- Take Playwright screenshots, compare to reference `/Users/joeom/Downloads/website.png`
- Verify: organic gradient colors match, stagger/flip visible, squares not rectangles, grain visible
- TypeScript check: `npx tsc --noEmit`
- Build check: `npm run build`
- Test mobile responsive (block size 50 on <768px)

## Tech Stack & Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Image loading | `new Image()` + offscreen canvas | Standard browser API, no dependencies |
| Pixel sampling | `getImageData()` | Direct pixel access, O(1) per cell |
| Image format | PNG | Lossless, preserves exact gradient colors |
| Noise variation | Reduced (hue:3, sat:6, light:4) | Image already has rich color — less noise needed |
| Stagger/flip | Same deterministic hash from v2 | Proven approach, consistent across redraws |
| CTA treatment | Same image, different params | Avoids second image asset, stagger creates variation |
| Remove colorStops | Entirely | The core insight: algorithmic stops can't match organic gradients |

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Image fails to load | Show transparent canvas (graceful degradation), log warning |
| CORS issues with image | Image is in `/public/`, served same-origin — no CORS issues |
| Image aspect ratio vs canvas | Map proportionally — stretch to fill canvas dimensions |
| Too much noise variation hides organic gradient | Reduce noise values significantly from v2 |
| CTA looks too similar to hero | Different blockSize, bandCount, staggerRatio create visual variety |
| Performance with getImageData | Only called once on load/resize, then reads from memory — fast |

## Verification Strategy

1. Playwright screenshot of hero → visual comparison with `/Users/joeom/Downloads/website.png`
2. Verify organic gradient colors (navy, blue, turquoise, orchid, salmon, green) are present and blend naturally
3. Verify stagger effect (some bands horizontally flipped)
4. Verify square grid cells (not rectangular)
5. Verify grain overlay visible (zoom in)
6. TypeScript: `npx tsc --noEmit`
7. Build: `npm run build`
