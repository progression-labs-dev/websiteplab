# Mosaic Pixel Reveal Animation — Plan

## Objective

Add a progressive mosaic reveal entrance animation to the MosaicCanvas component that recreates the user's reference GIF behavior: the hero starts heavily pixelated with large blocks, refines through non-linear steps with scout pixel bursts and accent glitches, then transitions smoothly into the existing mouse-reactive spotlight mode.

## Architecture Overview

### Current State
- MosaicCanvas builds ONE grid at fixed 40px blockSize
- `draw()` only renders cells within spotlight radius (smoothstep falloff)
- No entrance animation — spotlight appears instantly at idle position (88%, 68%)

### Target State
- On page load, MosaicCanvas runs a **~2s intro sequence** before transitioning to spotlight mode
- Intro uses a **keyframe timeline** with pre-built grids at multiple block sizes
- **Scout pixels** scatter into empty regions during the dramatic middle phase
- **Accent pixels** (white/cyan) flash in the warm core
- **Color temperature** shifts from cool/desaturated → warm/saturated
- After intro completes, non-spotlight cells **fade out** over ~500ms → normal interactive behavior

### Key Architectural Choice: Pre-built Multi-Resolution Grids

Instead of rebuilding the grid dynamically each frame during intro (expensive), we **pre-build grids at all needed block sizes** during the image load phase. The intro timeline simply selects which grid to render at each moment.

This is the right approach because:
1. `buildGrid()` is O(cols × rows) — too expensive to run every frame
2. Pre-built grids can be computed once in ~5ms during image load
3. The RAF loop stays lightweight — just picks the right grid and renders

## Work Breakdown

### Unit 1: Intro Timeline Data Structure
**Files:** `app/components/MosaicCanvas.tsx`
**Dependencies:** None

Define a keyframe-based timeline that maps elapsed time to animation state:

```typescript
interface IntroKeyframe {
  time: number           // ms from start
  blockSize: number      // grid resolution at this keyframe
  holdDuration: number   // how long to hold this frame (ms)
  saturation: number     // 0-1, color temperature (0=cool/desat, 1=full)
  scouts: ScoutPixel[]   // isolated pixels to show
  accents: AccentPixel[] // glitch highlight pixels
  scanLine?: boolean     // brief vertical flash
}
```

Keyframe table (mapped from GIF breakdown):

| Phase | Time (ms) | BlockSize | Hold | Saturation | Effects |
|-------|-----------|-----------|------|------------|---------|
| Opening | 0 | 80px | 130ms | 0.4 | Navy strip (fades) |
| Opening | 130 | 70px | 60ms | 0.5 | — |
| Opening | 190 | 65px | 60ms | 0.55 | — |
| Opening | 250 | 60px | 60ms | 0.6 | Clean bg established |
| Refinement | 310 | 45px | 70ms | 0.65 | First accent pixel |
| Refinement | 380 | 42px | 60ms | 0.7 | Accent persists |
| Refinement | 440 | 40px | 60ms | 0.72 | Grid settles |
| Scout Burst | 500 | 38px | 60ms | 0.75 | 1 blue scout appears |
| Scout Burst | 560 | 36px | 70ms | 0.78 | Scout vanishes |
| Scout Burst | 630 | 32px | 180ms | 0.8 | **3 red + 1 blue scouts** (hold!) |
| Resolution Jump | 810 | 20px | 130ms | 0.85 | Scouts absorbed |
| Resolution Jump | 940 | 12px | 60ms | 0.9 | Rich detail |
| Hot Core | 1000 | 14px | 130ms | 0.93 | White accent in red core |
| Hot Core | 1130 | 12px | 120ms | 0.95 | Accent persists |
| Smoothing | 1250 | 10px | 60ms | 0.96 | — |
| Smoothing | 1310 | 9px | 70ms | 0.97 | Dual accent pair |
| Smoothing | 1380 | 8px | 60ms | 0.98 | Scan line flash |
| Smoothing | 1440 | 7px | 60ms | 0.99 | — |
| Smoothing | 1500 | 7px | 70ms | 1.0 | — |
| Final | 1570 | 6px | 60ms | 1.0 | Most resolved state |
| Transition | 1630 | 40px | 500ms | 1.0 | Fade to spotlight mode |

**Verification:** TypeScript compiles, keyframe array is well-typed, total timeline ~2.1s.

---

### Unit 2: Multi-Resolution Grid Pre-Building
**Files:** `app/components/MosaicCanvas.tsx`
**Dependencies:** Unit 1

On image load, pre-build grids at each unique blockSize in the keyframe table:

- Extract unique block sizes: [80, 70, 65, 60, 45, 42, 40, 38, 36, 32, 20, 14, 12, 10, 9, 8, 7, 6]
- Call existing `buildGrid(w, h)` for each size (modify to accept blockSize param)
- Store in a `Map<number, CellData[]>` ref (`introGridsRef`)
- The final 40px grid is the same one used for spotlight mode (reuse)

**Modification to `buildGrid()`**: Accept `overrideBlockSize` parameter instead of always using the component prop. This is a minimal change — just use the override if provided, else fall back to `getBlockSize()`.

**Performance:** 18 unique sizes × ~200-2000 cells each = pre-built in <20ms total. One-time cost on image load.

**Verification:** Log grid sizes and cell counts. Confirm all 18 grids built correctly. Measure time.

---

### Unit 3: Intro Draw Logic (Full-Canvas Rendering)
**Files:** `app/components/MosaicCanvas.tsx`
**Dependencies:** Units 1, 2

Add an `introPhaseRef` tracking:
- `active: boolean` — is intro running?
- `startTime: number` — performance.now() when intro began
- `currentKeyframeIndex: number` — which keyframe we're on

Modify the RAF loop:
```
if (introPhaseRef.current.active) {
  drawIntro(ctx, w, h, elapsed)  // Full-canvas render with current keyframe's grid
} else {
  draw(ctx, w, h)                // Existing spotlight render
}
```

`drawIntro()` logic:
1. Compute elapsed time since intro start
2. Find current keyframe (binary search or linear scan — only 21 entries)
3. Get the pre-built grid for that keyframe's blockSize
4. Render ALL cells at the keyframe's saturation level (apply desaturation via HSL shift)
5. Apply global opacity ramp (0 → 1 over first 200ms for smooth fade-in)

**Color temperature:** Multiply each cell's saturation by the keyframe's `saturation` value. Early frames appear washed-out/cool, later frames are rich/warm.

**Implementation:** Modify `r, g, b` on-the-fly using the existing `rgbToHsl` / `hslToRgb` utilities — reduce saturation and shift lightness upward for early frames.

**Verification:** Visual — mosaic fills entire hero, blocks visibly step down. Chrome DevTools Performance tab shows <16ms per frame.

---

### Unit 4: Scout Pixel System
**Files:** `app/components/MosaicCanvas.tsx`
**Dependencies:** Unit 3

Scout pixels are isolated colored blocks that appear in "empty" (cool/white) regions of the canvas for 1-3 keyframes.

**Pre-computation on image load:**
1. Analyze the gradient image to identify "cool zones" — pixels where lightness > 80% and saturation < 20%
2. Pick 6-8 candidate positions in these zones (deterministic via seeded hash)
3. Store as `scoutPositions: { x, y, color }[]`

**Scout definition per keyframe:**
```typescript
interface ScoutPixel {
  positionIndex: number  // index into scoutPositions
  color: [number, number, number]  // RGB override
  opacity: number        // 0-1
}
```

**Rendering:** After drawing the main grid for a keyframe, overlay scout pixels as additional `fillRect` calls at their positions. Use the keyframe's blockSize for the scout's size.

**The dramatic Frame 9 moment:** 3 red scouts (#F44152) + 1 blue scout (#1E2070) scattered in the upper-left and upper-center. This keyframe has 180ms hold — the longest in the sequence.

**Verification:** Visual — scouts appear as isolated colored blocks in white space, disappear within 2-3 keyframes.

---

### Unit 5: Accent / Glitch Pixel System
**Files:** `app/components/MosaicCanvas.tsx`
**Dependencies:** Unit 3

Accent pixels are bright white or cyan blocks that appear in the "warm core" (red/salmon zone) of the gradient.

**Pre-computation:** Identify the warmest region of the gradient (highest red channel, lowest blue). Place 2-3 accent positions in this zone.

```typescript
interface AccentPixel {
  positionIndex: number
  color: [number, number, number]  // [255, 255, 255] or [112, 224, 240]
  opacity: number
}
```

**Scan line effect (Frame 18 equivalent):** A single vertical column of pixels briefly brightened to white at 50% opacity. Rendered as a single `fillRect` spanning the full canvas height, 1 block wide.

**Verification:** Visual — white/cyan sparkles flash in the warm gradient zone. Scan line appears and disappears within one keyframe.

---

### Unit 6: Intro → Spotlight Transition
**Files:** `app/components/MosaicCanvas.tsx`
**Dependencies:** Units 3, 4, 5

After the last intro keyframe, transition smoothly to spotlight mode:

1. **Grid swap:** Switch from intro's fine grid (6px) to the spotlight grid (40px)
2. **Fade-out:** Over 500ms, non-spotlight cells fade from visible → invisible
   - Use a `transitionProgress` value (0 → 1 over 500ms)
   - For each cell: `alpha = introAlpha * (1 - transitionProgress) + spotlightAlpha * transitionProgress`
   - This blends full-canvas visibility → spotlight-only visibility
3. **Idle drift starts:** Initialize spotlight position at center of the warm zone (not abruptly at 88%, 68%)
4. **Set `introPhaseRef.current.active = false`** when transition completes

**Verification:** Visual — seamless blend from full mosaic to spotlight. No jarring pop. Spotlight drift begins naturally.

---

### Unit 7: Page Integration & GSAP Coordination
**Files:** `app/page.tsx`, `app/globals.css`
**Dependencies:** Units 1-6

**GSAP timing:** The hero text animations currently start at `delay: 0.2`. Adjust to `delay: 0.8` so text fades in during the middle of the intro (when the mosaic is partially refined), not before it.

**Grain overlay:** Currently at `opacity: 0.22`. Boost to `0.35` and verify visibility. The grain should be more pronounced during the intro when the canvas is fully visible.

**Optional CSS polish:**
- Add a subtle `backdrop-filter: blur(0.5px)` on `.hero-content` to help text readability during intro when pixels are everywhere
- Ensure `.gradient-bar` animation still works as before

**Verification:** Visual check via Playwright:
1. Page loads → mosaic starts filling entire hero with large blocks
2. ~0.8s in, hero text starts fading in
3. ~1.6s, mosaic is fully refined
4. ~2.1s, transition to spotlight mode complete
5. Mouse interaction works normally

---

## Tech Stack & Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Animation driver | Native RAF + `performance.now()` | Already in use, no new deps needed. GSAP overkill for canvas pixel animation |
| Grid strategy | Pre-built multi-resolution | Avoids per-frame grid rebuilds (~5ms each). One-time <20ms cost on load |
| Color temperature | HSL manipulation at render time | Existing `rgbToHsl`/`hslToRgb` utilities already in component. No new deps |
| Scout positioning | Pre-computed from gradient analysis | Deterministic, no randomness between page loads |
| Transition | Alpha blending over 500ms | Smooth crossfade, no abrupt state change |

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| 18 pre-built grids use too much memory | Low | Largest grid (6px blocks) on 1920×1080 = 57,600 cells × ~60 bytes = 3.4MB. Total all grids ≈ 8MB. Acceptable. |
| Intro drops below 60fps | Low | Full-canvas render at 80px blocks = ~700 cells. Even at 6px = ~57K cells, fillRect is GPU-accelerated. Profile and skip if needed. |
| Mobile performance | Medium | Mobile uses 50px min block size. Intro can use fewer keyframes (skip every other). Add a `prefersReducedMotion` check to skip intro entirely. |
| Text unreadable during intro | Low | Text is z-index: 2 above canvas. GSAP delay means text appears after blocks have partially refined. Optional blur backdrop if needed. |
| Transition feels jarring | Medium | 500ms alpha blend + smooth spotlight position initialization should handle this. Tune duration if needed. |

## Verification Strategy

1. **TypeScript:** `npx tsc --noEmit` — no type errors
2. **Build:** `npm run build` — production build succeeds
3. **Visual (Playwright):** Screenshot at t=0, t=0.5s, t=1s, t=1.6s, t=2.5s to verify each phase
4. **Performance:** Chrome DevTools Performance recording — confirm <16ms per frame during intro
5. **Mobile:** Test responsive behavior — larger blocks, reduced motion support
6. **Interaction:** After intro, mouse spotlight works normally, idle drift works
7. **Grain:** Visible film grain texture throughout
