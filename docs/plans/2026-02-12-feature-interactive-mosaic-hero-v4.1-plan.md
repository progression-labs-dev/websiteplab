# Interactive Mosaic Hero v4.1 — Refinement Plan

## Objective

Refine the v4 interactive mosaic hero based on user feedback. The v4 base works (image sampling, mouse proximity, smoothstep) but needs these key fixes:

1. **Spotlight starts bottom-right** — not over the text area
2. **Copy stays clean on load** — mosaic only in "white space" gaps
3. **Film grain overlay** — currently missing entirely from v4
4. **RAF loop bug** — mosaic stops rendering after initial load
5. **Richer color gradient** — bottom-right shows bold salmon→red→blue→purple per reference
6. **Accent dots within gradient** — small individual colored squares scattered for texture

### Reference

- `public/v4-reference-gradient-detail.png` — Shows the desired gradient mosaic effect concentrated bottom-right with clean upper-left

## Architecture

The v4 base is solid — we're tuning behavior, not rewriting. Three files change:

```
MosaicCanvas.tsx  — Fix idle drift position, fix RAF bug, add accent dots
page.tsx          — Add grain overlay (SVG filter + overlay div)
globals.css       — Grain overlay styling
```

## Work Breakdown

### Unit 1: Fix MosaicCanvas — Spotlight, RAF Bug, Accent Dots

**File**: `app/components/MosaicCanvas.tsx` (MODIFY)

**1a. Initial spotlight → bottom-right corner**

Current idle drift center (line 339-342):
```typescript
targetMouseRef.current.x = cw * 0.5 + Math.sin(angle) * cw * 0.3
targetMouseRef.current.y = ch * 0.4 + Math.cos(angle * 0.7) * ch * 0.25
```

Change to orbit bottom-right:
```typescript
targetMouseRef.current.x = cw * 0.75 + Math.sin(angle) * cw * 0.15
targetMouseRef.current.y = ch * 0.7 + Math.cos(angle * 0.7) * ch * 0.15
```

Also change the initial mouse position (line 172):
```typescript
// From:
const targetMouseRef = useRef({ x: -9999, y: -9999 })
const currentMouseRef = useRef({ x: -9999, y: -9999 })

// To: Initialize to bottom-right (will be overridden once canvas mounts)
// Use a flag to set initial position after canvas size is known
```

Add initialization in `startAnimation()`:
```typescript
// On first frame, set initial position to bottom-right
if (currentMouseRef.current.x === -9999) {
  const cw = canvasSizeRef.current.w
  const ch = canvasSizeRef.current.h
  currentMouseRef.current = { x: cw * 0.75, y: ch * 0.7 }
  targetMouseRef.current = { x: cw * 0.75, y: ch * 0.7 }
  lastInteractionRef.current = 0  // trigger idle drift immediately
}
```

**1b. Fix RAF loop stopping**

Likely cause: The `destroyed` flag in the closure gets set when React re-renders and the cleanup runs. The `useCallback` dependency array triggers re-creation on prop changes, but `useEffect` re-runs and restarts the loop.

Potential issue: The `ctx` reference inside `loop()` may become stale if `sizeCanvas()` rescales the context. The loop captures `ctx` from `startAnimation()` but `sizeCanvas()` creates a new scaled context.

Fix: Get context fresh each frame instead of closing over it:
```typescript
function loop() {
  if (destroyed) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  // ... rest of loop
}
```

Also check: The `destroyed` variable scope — ensure cleanup from previous effect invocation doesn't poison the new one.

**1c. Accent dots within gradient**

The reference shows small individual colored squares at different sizes scattered within the gradient area. Add a "dot" layer:

In `buildGrid()`, for ~3-5% of cells that are accent cells, flag some as "dot" cells with smaller rendered size (e.g., 60% of blockSize) but same color, centered within their grid position. This creates the visual texture seen in the reference.

```typescript
// In CellData interface, add:
isDot: boolean
dotSize: number  // fraction of block size to render (0.4-0.7)

// In buildGrid():
const isDot = isAccent && deterministicRandom(col * 777 + row * 333) < 0.3
const dotSize = isDot ? 0.4 + deterministicRandom(col * 555 + row) * 0.3 : 1.0

// In draw(), when rendering a dot cell:
if (cell.isDot) {
  const ds = cell.w * cell.dotSize
  const offset = (cell.w - ds) / 2
  ctx.fillRect(cell.x + offset, cell.y + offset, ds, ds)
} else {
  ctx.fillRect(cell.x, cell.y, cell.w, cell.h)
}
```

**Verification**:
- TypeScript compiles
- Spotlight starts bottom-right on load
- RAF loop doesn't stop
- Small accent dots visible within gradient

### Unit 2: Add Film Grain Overlay

**File**: `app/page.tsx` (MODIFY) + `app/globals.css` (MODIFY)

**2a. SVG noise filter in layout or page**

Add an SVG filter definition (hidden) and a grain overlay div inside the hero section:

In `page.tsx`, inside the hero `<section>`:
```tsx
{/* Grain overlay */}
<svg className="grain-svg" aria-hidden="true">
  <filter id="grain-filter">
    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
    <feColorMatrix type="saturate" values="0" />
  </filter>
  <rect width="100%" height="100%" filter="url(#grain-filter)" />
</svg>
```

**2b. Grain CSS**

In `globals.css`:
```css
.grain-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0.08;
  mix-blend-mode: multiply;
  pointer-events: none;
}
```

Key considerations for light background:
- `multiply` blend mode works well on light backgrounds (darkens slightly)
- Low opacity (0.08-0.12) — subtle texture, not heavy
- z-index between canvas (0) and content (2)

**Verification**:
- Grain texture visible when zooming in
- Does not affect text readability
- Subtle film-like quality

### Unit 3: Visual Polish & Verify

**Files**: All (VERIFY)
**Dependencies**: Units 1-2

**Checks**:
- Playwright screenshot: spotlight concentrated bottom-right
- Text area clean on initial load
- Grain visible on zoom
- Mouse interaction moves spotlight
- TypeScript: `npx tsc --noEmit`
- Build: `npm run build`

## Tech Stack & Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Idle drift → bottom-right | `cw*0.75, ch*0.7` orbit | Keeps text clean, shows gradient colors |
| RAF fix | Fresh ctx each frame | Avoids stale context after resize/rescale |
| Accent dots | 30% of accent cells at 40-70% size | Matches reference's scattered dot texture |
| Grain via SVG filter | `feTurbulence` + multiply | Lightweight, no extra images, standard approach |
| Grain opacity 0.08 | Low on light bg | Subtle texture without hurting readability |

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Grain looks too heavy on light bg | Start at 0.08 opacity, easy to tune |
| RAF fix doesn't solve the stop bug | Add console.log guard to detect if destroyed flag is wrong |
| Dots look weird at small sizes | Minimum dot size 40% of block (16px at blockSize=40) |
| Bottom-right orbit feels static | Small orbit radius (15% of canvas) keeps it moving subtly |

## Verification Strategy

1. Playwright screenshot on load — bottom-right gradient, clean text area
2. Playwright mouse interaction — spotlight follows cursor
3. Zoom screenshot — grain texture visible
4. `npx tsc --noEmit` — TypeScript passes
5. `npm run build` — Production build passes
