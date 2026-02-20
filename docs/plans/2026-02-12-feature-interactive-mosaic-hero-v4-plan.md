# Interactive Mosaic Hero v4 — Mouse-Reactive Pixel Grid

## Objective

Replace the heavy full-coverage mosaic with a **light, clean hero background** featuring an **interactive pixel mosaic** that reveals on mouse proximity. The hero has a soft icy blue background with **sparse, sporadic color pixel accents** (salmon, blue, purple, turquoise). As the user's cursor moves, nearby mosaic cells "light up" — creating an organic, interactive spotlight effect.

This solves the readability issue from v3 (heavy mosaic competing with text) while adding a distinctive interactive visual signature.

## Reference Analysis

### Static Reference (`public/v4-reference-static.png`)
- **Background**: Very light icy blue/white (~`#E8F0F8`)
- **Sparse pixel accents**: Clusters of salmon/red, pink, light blue, purple blocks scattered on the background
- **Most cells invisible**: ~85-90% of the grid is transparent/barely visible
- **Accent distribution**: Clustered loosely, with some lone "outlier" blocks scattered away
- **Cell colors range**: Bold saturated (red/salmon) to very faint (ghostly blue, light pink)

### Interactive Reference (`public/v4-reference-interactive.gif`)
- **Mouse proximity reveal**: Colored pixel blocks appear/brighten near the cursor
- **Spotlight radius**: ~150-250px from cursor
- **Smooth falloff**: Cells closer to cursor are more opaque, fading to transparent with distance
- **Same light background** with color pops appearing around the cursor
- **Colors**: salmon/red dominant, with blue, purple, turquoise, pink

## Architecture

```
Rendering pipeline:

  1. Load gradient-base.png into hidden canvas (reuse from v3)
  2. Extract pixel data via getImageData()
  3. For each SQUARE cell (col, row):
     a. Sample color from gradient image (same as v3)
     b. Compute "accent score" — deterministic random whether this cell
        is a visible accent (10-15% of cells) with base opacity 0.05-0.20
     c. Store: position, sampled color, accent flag, base opacity

  On each animation frame:
  4. Get current mouse position (from mousemove listener)
  5. For each cell:
     a. Compute distance from cell center to mouse position
     b. Calculate proximity opacity: smoothstep falloff from 0 to ~200px radius
     c. Final opacity = max(baseOpacity, proximityOpacity)
     d. Draw cell with fillStyle + globalAlpha

  Result: Light background, sparse color pops, interactive mouse spotlight
```

### Key Differences from v3

| Aspect | v3 (Full Mosaic) | v4 (Interactive) |
|--------|-------------------|-------------------|
| Background | Dark, fully covered | Light icy blue, mostly visible |
| Cell visibility | All cells 100% opaque | Most cells ~0-5% opacity |
| Interaction | None (static after reveal) | Mouse proximity reveals cells |
| Text readability | Poor (heavy background) | Excellent (light background) |
| Animation | One-time radial reveal | Continuous mouse tracking |
| Feel | Bold, heavy | Subtle, elegant, interactive |

## Work Breakdown

### Unit 1: Rewrite MosaicCanvas — Interactive Proximity Mode

**File**: `app/components/MosaicCanvas.tsx` (MAJOR REWRITE)
**Dependencies**: `public/gradient-base.png`

**New props interface:**
```typescript
interface MosaicCanvasProps {
  imageSrc: string
  blockSize?: number         // default 40 (slightly larger for lighter feel)
  accentDensity?: number     // default 0.12 — fraction of cells that are visible accents
  spotlightRadius?: number   // default 200 — mouse proximity radius in px
  baseOpacity?: number       // default 0.03 — opacity for non-accent cells (ghostly)
  accentOpacity?: number     // default 0.15 — base opacity for accent cells
  noiseScale?: number        // default 0.06
  colorVariation?: { hue: number; saturation: number; lightness: number }
  className?: string
}
```

**Remove from v3:**
- `stagger`, `staggerRatio`, `bandCount` props — no band flipping needed
- `revealDuration`, `revealDelay` — no GSAP reveal animation
- GSAP dependency entirely — animation is now pure RAF + mouse tracking
- `generateBands()`, `getBandIndex()`, `isBandFlipped()` — band logic removed

**Keep from v3:**
- Image loading pipeline (Image → offscreen canvas → getImageData)
- Simplex noise + HSL color utilities
- CellData interface (add `accentScore` and `baseAlpha` fields)
- ResizeObserver for responsive
- RAF draw loop

**New features:**
- **Mouse tracking**: Add `mousemove` listener on the canvas (or parent). Track `mouseX`, `mouseY` in a ref. Use smooth interpolation (lerp) for fluid movement.
- **Touch support**: On touch devices, use `touchmove`. On no-interaction (idle), slowly drift the spotlight in a subtle circular pattern.
- **Proximity calculation**: For each cell in `draw()`, compute distance from cell center to cursor. Apply smoothstep falloff: `opacity = smoothstep(spotlightRadius, 0, distance)`.
- **Accent cells**: During `buildGrid()`, use `deterministicRandom(col * 1000 + row)` to determine if a cell is an "accent" (probability = `accentDensity`). Accent cells get `baseAlpha = accentOpacity`. Non-accent cells get `baseAlpha = baseOpacity`.
- **Final alpha**: `cellAlpha = max(cell.baseAlpha, proximityAlpha * 0.8)`. This means accent cells are always slightly visible, and ALL cells glow when the mouse is near.

**Smoothstep function:**
```typescript
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}
```

### Unit 2: Update page.tsx — Add Interactive Canvas to Hero

**File**: `app/page.tsx` (MODIFY)
**Dependencies**: Unit 1

**Changes:**
- Re-import MosaicCanvas
- Add `<MosaicCanvas>` back into hero section, positioned absolutely behind content:
```tsx
<section className="hero section" id="hero">
  <MosaicCanvas
    imageSrc="/gradient-base.png"
    blockSize={40}
    accentDensity={0.12}
    spotlightRadius={200}
    className="mosaic-canvas-hero"
  />
  <div className="container">
    ...
  </div>
</section>
```
- Remove the old mouse glow logic from page.tsx (lines ~219-252) — the canvas now handles its own mouse interactivity
- Keep grain overlay and nav scroll logic

### Unit 3: CSS — Light Hero Background

**File**: `app/globals.css` (MODIFY)
**Dependencies**: None

**Changes:**
- Set `.hero` background to light icy blue: `background: #E8F0F8;` (or similar)
- Ensure `.mosaic-canvas-hero` positioning: `position: absolute; inset: 0; z-index: 0;`
- Hero content z-index: `z-index: 2` (stays above canvas)
- Adjust grain overlay for light background — may need different blend mode or lower opacity
- Ensure text color works on light background (dark text, or keep white with text-shadow)
- Adjust nav styling for light hero (currently assumes dark background)

**Important**: Text color on the hero needs to switch from white to dark, OR add a subtle backdrop behind the text for contrast. The reference shows dark text on the light background.

### Unit 4: Visual Polish + Verify

**Files**: All (VERIFY)
**Dependencies**: Units 1-3

**Changes:**
- Playwright screenshot comparison with reference images
- Test mouse interaction (move cursor around hero, verify spotlight)
- Test mobile (touch interaction or idle drift animation)
- Verify text readability on light background
- TypeScript check: `npx tsc --noEmit`
- Build check: `npm run build`
- Test grain overlay visibility on light background

## Tech Stack & Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| No GSAP | Pure RAF + mouse tracking | No one-time reveal needed; continuous animation is simpler without GSAP |
| Smoothstep falloff | Custom function | 3 lines, produces natural-looking fade; better than linear |
| Accent density 12% | Deterministic random | Matches reference — mostly empty with sporadic clusters |
| Spotlight radius 200px | Prop-configurable | Reference shows ~150-250px of visible area around cursor |
| Light background | #E8F0F8 | Matches reference icy blue; great text contrast |
| No band flipping | Removed entirely | v4 concept doesn't need horizontal band stagger |
| Image sampling kept | Same getImageData approach | Still need real gradient colors for the accent cells |

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Performance: computing distance for every cell every frame | Cache cell centers, use squared distance (avoid sqrt), skip cells far from cursor |
| Text readability on light bg | Test with dark text; add subtle backdrop-filter if needed |
| Grain overlay looks wrong on light bg | Test soft-light/multiply modes; may need opacity reduction |
| Mouse tracking lag | Use lerped position (smooth follow) not raw mousemove |
| Touch devices have no cursor | Implement idle drift animation (slow circular path) |
| Accent distribution looks random/ugly | Use simplex noise-based thresholding for organic clustering |

## Verification Strategy

1. Playwright screenshots of hero — light background with sporadic accents
2. Manual mouse interaction test — spotlight reveals cells
3. Compare with `public/v4-reference-static.png` for accent distribution
4. Text readability check — hero text clearly legible
5. Mobile test — idle drift or touch interaction works
6. TypeScript: `npx tsc --noEmit`
7. Build: `npm run build`
