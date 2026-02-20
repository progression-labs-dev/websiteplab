# Gradient Radial Hero — Plan

## Objective

Create a stunning hero section for the Progressionlabs website featuring:
1. A soft, Japanese-inspired gradient background using all brand colors (no black)
2. A Vasarely-style radial circle grid overlay with 3D-shaded uniform circles
3. A smooth radial reveal animation on page load

This will be built as a **standalone prototype page** first (`/hero-lab`), on a **new feature branch** off `dev/nextjs`.

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│  Full-viewport Hero Section (100vh)         │
│                                             │
│  ┌─ Layer 1: CSS Gradient Background ─────┐ │
│  │  Multiple radial-gradient blobs         │ │
│  │  Very soft (8-15% opacity)              │ │
│  │  Brand colors on white base             │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│  ┌─ Layer 2: Canvas Circle Grid ──────────┐ │
│  │  Uniform circle grid (dot matrix)       │ │
│  │  Each circle colored by radial distance │ │
│  │  3D convex shading per circle           │ │
│  │  Samples gradient beneath for color     │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│  ┌─ Layer 3: Reveal Animation ────────────┐ │
│  │  Circles fade in from center outward    │ │
│  │  Staggered radial timing               │ │
│  │  ~1.5s total duration                   │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│  ┌─ Layer 4: Content (future) ────────────┐ │
│  │  Hero text, CTAs overlaid              │ │
│  │  (not in prototype — just the effect)   │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## Brand Color Palette (for gradient)

| Name | Hex | Usage in gradient |
|------|-----|-------------------|
| White Smoke | `#F5F5F5` | Base canvas background |
| Medium Orchid | `#BA55D3` | Purple blob (top-right area) |
| Light Salmon | `#FFA07A` | Warm coral blob (center-left) |
| Progression Green | `#B9E979` | Green blob (bottom-right) |
| Turquoise | `#40E0D0` | Teal blob (bottom-left) |
| Blue | `#0000FF` | Deep blue accent (top-left, very subtle) |

**Principle**: All colors rendered at very low opacity (8-15%) so the overall feeling is light, airy, predominantly white — like the Nucleate reference.

---

## Work Breakdown

### Unit 1: Branch Setup & Scaffold
**Files**: git operations, `app/hero-lab/page.tsx`, `app/hero-lab/hero-lab.css`
**Dependencies**: None
**What**:
- Create branch `feature/gradient-radial-hero` off `dev/nextjs`
- Create `/hero-lab` route with basic full-viewport page
- Minimal HTML structure: full-screen container with gradient div + canvas element
**Verification**: Dev server runs, `/hero-lab` shows blank page at full viewport

### Unit 2: Soft Japanese Gradient Background (CSS)
**Files**: `app/hero-lab/page.tsx`, `app/hero-lab/hero-lab.css`
**Dependencies**: Unit 1
**What**:
- Create multiple overlapping `radial-gradient` blobs positioned across the viewport
- Each blob uses one brand color at very low opacity (8-15%)
- Blobs positioned asymmetrically for organic feel (not centered/symmetrical)
- Large blur radius (300-500px equivalent) for soft, dreamy transitions
- Predominantly white/whitesmoke base showing through
- Subtle CSS animation: very slow drift/pulse on blob positions (20-30s cycle) for living feel
**Color mapping**:
  - Top-left: Blue `#0000FF` at ~8% opacity
  - Top-right: Orchid `#BA55D3` at ~12% opacity
  - Center: Salmon `#FFA07A` at ~10% opacity
  - Bottom-left: Turquoise `#40E0D0` at ~12% opacity
  - Bottom-right: Progression Green `#B9E979` at ~10% opacity
**Verification**: Screenshot shows soft, ethereal gradient matching reference aesthetic

### Unit 3: Circle Grid Renderer (Canvas 2D)
**Files**: `app/hero-lab/useRadialCircles.ts` (new hook)
**Dependencies**: Unit 1
**What**:
- Canvas 2D rendering hook (similar pattern to existing `useMosaicRenderer`)
- Grid calculation: uniform circles tightly packed (configurable cell size, ~16-20px default)
- For each circle: calculate distance from canvas center
- Map distance to color using radial gradient (center = most saturated brand colors, edges = near-white)
- **Reuse** `drawConvexCircle()` from existing `app/tools/mosaic/utils/shapes.ts` for 3D sphere shading
- **Reuse** color interpolation from `app/tools/mosaic/utils/colorMapping.ts`
- The radial color bands (center → edge):
  1. **Core** (0-15% radius): Deep orchid/blue blend — most saturated
  2. **Inner ring** (15-35%): Orchid → salmon transition
  3. **Mid ring** (35-55%): Salmon → turquoise/green transition
  4. **Outer ring** (55-80%): Light pastels, very desaturated
  5. **Edge** (80-100%): Near-white, barely tinted
- Circle size: uniform throughout (no halftone size variation)
- Each circle gets 3D convex shading (highlight top-left, shadow bottom-right)
**Verification**: Static render shows the Vasarely-style radial circle grid with brand colors

### Unit 4: Radial Reveal Animation
**Files**: `app/hero-lab/useRadialCircles.ts` (extend), `app/hero-lab/page.tsx`
**Dependencies**: Unit 3
**What**:
- On mount, circles start fully transparent
- Animation radiates from center outward
- Each circle's reveal timing = `baseDelay + (distanceFromCenter / maxDistance) * spreadDuration`
- Individual circle animation: scale from 0 → 1 + opacity 0 → 1 (ease-out)
- Total animation duration: ~1.5-2 seconds
- Uses `requestAnimationFrame` for smooth 60fps
- After animation completes: static render (no ongoing RAF cost)
**Verification**: Page load shows smooth radial reveal, circles pop in from center outward

### Unit 5: Gradient Sampling Mode (Optional Enhancement)
**Files**: `app/hero-lab/useRadialCircles.ts`, `app/hero-lab/page.tsx`
**Dependencies**: Unit 2, Unit 3
**What**:
- Alternative mode: instead of hardcoded radial color bands, circles sample the CSS gradient beneath them
- Render the gradient to an offscreen canvas, then sample pixel colors
- Each circle's color = sampled gradient color at that position
- This creates perfect harmony between gradient background and circle overlay
- Toggle between "radial bands" and "gradient sample" modes for comparison
**Verification**: Circle colors match the gradient beneath them seamlessly

### Unit 6: Polish & Responsiveness
**Files**: `app/hero-lab/page.tsx`, `app/hero-lab/hero-lab.css`
**Dependencies**: Units 2-5
**What**:
- Handle window resize: recalculate canvas dimensions + re-render
- Mobile: slightly larger circles on smaller screens (better visual density)
- Performance: ensure no jank on resize/scroll
- Add subtle mouse parallax: gradient blobs shift slightly with cursor position
- Pixel density: handle devicePixelRatio for crisp circles on retina displays
**Verification**: Resize browser, check mobile viewport, verify smooth performance

---

## Tech Stack & Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Rendering | Canvas 2D | Already proven in mosaic tool, `drawConvexCircle` exists, no WebGL overhead needed for static circles |
| Gradient background | CSS radial-gradients | GPU-accelerated, no canvas needed for background, easy to animate with CSS |
| Animation | requestAnimationFrame | Smooth, cancelable, proven in existing codebase |
| New page route | `/hero-lab` | Isolated prototype, doesn't touch existing landing page |
| Branch | `feature/gradient-radial-hero` | Clean separation from dev/nextjs work |
| Code reuse | Import from `tools/mosaic/utils/` | `drawConvexCircle`, `interpolateColor`, `hslToRgb`, `rgbToHsl` all exist |

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Performance with many circles | Medium | Cap grid to reasonable cell size (16px min). Profile FPS. Static render after animation = zero ongoing cost. |
| Colors don't look right at low opacity | Medium | Iterative tuning. Multiple gradient variations to compare. |
| Canvas resolution on retina | Low | Use `devicePixelRatio` scaling (standard pattern) |
| Existing util imports across route boundaries | Low | Next.js handles cross-route imports fine in app directory |

---

## Verification Strategy

1. **Visual**: Playwright screenshot of `/hero-lab` at 1440x900
2. **Animation**: Screen recording or manual check of reveal animation
3. **Performance**: Chrome DevTools FPS counter during animation
4. **Responsive**: Playwright screenshots at 768x1024 and 375x812
5. **Build**: `npm run build` passes with no errors
