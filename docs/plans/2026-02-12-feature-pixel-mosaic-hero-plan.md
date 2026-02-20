# Pixel Mosaic Hero — Plan

## Objective

Replace the smooth CSS linear-gradient hero background with a canvas-rendered pixelated mosaic grid matching the reference image (`/Users/joeom/Downloads/website.png`). Each block is a colored rectangle with slight color variation from neighbors, creating a tessellated mosaic effect. Add a smooth load animation where pixels reveal via a radial wave. Apply the same treatment to the CTA section.

## Reference

- **Target visual**: `/Users/joeom/Downloads/website.png` — horizontal banded mosaic, blocks ~60-120px wide × ~20-40px tall, color shifts between adjacent blocks
- **Brand palette**: Blue (#0000FF), Turquoise (#40E0D0), Progression Green (#B9E979), Light Salmon (#FFA07A), Medium Orchid (#BA55D3), White Smoke (#F5F5F5), Black (#000000)
- **Gradient flow (hero)**: Blue (top) → Turquoise → Green → Salmon → Orchid (bottom)
- **Gradient flow (CTA)**: White Smoke → Salmon → Green → Blue (bottom)

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│  layout.tsx  (SVG grain filter + overlay divs)  │  ← no changes
├─────────────────────────────────────────────────┤
│  page.tsx                                       │
│  ┌───────────────────────────────────────────┐  │
│  │  <MosaicCanvas>  (hero)                   │  │  ← new component
│  │  - Canvas element, absolute positioned    │  │
│  │  - Draws grid of colored rectangles       │  │
│  │  - GSAP-driven radial reveal animation    │  │
│  │  - ResizeObserver for responsive          │  │
│  └───────────────────────────────────────────┘  │
│  ... content sections ...                       │
│  ┌───────────────────────────────────────────┐  │
│  │  <MosaicCanvas>  (CTA, reversed palette)  │  │  ← reuse component
│  └───────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│  globals.css                                    │
│  - Remove 40-stop CSS gradient from .hero       │
│  - Position canvas behind hero content          │
│  - Update CTA gradient → canvas                 │
└─────────────────────────────────────────────────┘
```

**Key architectural decision**: Single reusable `<MosaicCanvas>` component that accepts gradient color stops and direction as props. Two instances — hero and CTA.

## Work Breakdown

### Unit 1: MosaicCanvas Component
**Files**: `app/components/MosaicCanvas.tsx` (NEW)
**Dependencies**: None
**Description**:
- Create a React component that renders an HTML5 canvas
- Accept props: `colorStops` (array of {position, color}), `blockWidth` (~80px), `blockHeight` (~30px), `noiseScale` (0.08), `colorVariation` ({hue: 5, saturation: 12, lightness: 8}), `revealDuration` (1.5s), `revealDelay` (0.3s), `className`
- On mount:
  1. Size canvas to container (devicePixelRatio-aware)
  2. Generate grid: for each cell, sample base color from gradient at row position, apply HSL noise variation using simplex noise
  3. Store grid data in ref (array of {x, y, w, h, color, distanceFromCenter})
  4. Start GSAP animation: animate `revealProgress` from 0→1
  5. requestAnimationFrame loop: draw each cell with opacity based on `revealProgress - (distance * staggerFactor)`
- ResizeObserver: on resize, regenerate grid and redraw
- Cleanup: cancel RAF, kill GSAP, disconnect observer
- Use inline simplex noise implementation (avoid npm dependency) — ~30 lines

**Verification**: Component renders a mosaic grid matching the reference image aesthetic when given the brand color stops

### Unit 2: Integrate Hero Canvas
**Files**: `app/page.tsx` (MODIFY), `app/globals.css` (MODIFY)
**Dependencies**: Unit 1
**Description**:
- Import MosaicCanvas into page.tsx
- Add `<MosaicCanvas>` inside the hero section, positioned absolutely behind content
- Pass hero gradient stops: Blue → Turquoise → Green → Salmon → Orchid
- Remove the 40-stop CSS `linear-gradient` from `.hero` in globals.css
- Set `.hero { background: transparent; }` and position the canvas with `position: absolute; inset: 0; z-index: 0;`
- Ensure hero content stays above canvas with `z-index: 2` (already set)
- Keep the `::after` fade-out overlay at the bottom of hero
- Coordinate reveal animation timing with existing GSAP hero timeline (text fades in after mosaic reveal starts)

**Verification**: Hero shows pixelated mosaic instead of smooth gradient, text still readable, grain overlay still visible on top

### Unit 3: Integrate CTA Canvas
**Files**: `app/page.tsx` (MODIFY), `app/globals.css` (MODIFY)
**Dependencies**: Unit 1
**Description**:
- Add second `<MosaicCanvas>` inside CTA section
- Pass reversed gradient stops: White Smoke → Salmon → Green → Blue
- Remove CSS gradient from `.cta-section` in globals.css
- Position canvas absolutely behind CTA content
- Use slightly smaller blocks for variety (blockWidth: 60, blockHeight: 24)
- Longer reveal delay (trigger on scroll-into-view or set delay: 0.5s)

**Verification**: CTA section shows pixelated mosaic with reversed color flow

### Unit 4: Animation Polish + Responsive
**Files**: `app/components/MosaicCanvas.tsx` (MODIFY), `app/globals.css` (MODIFY)
**Dependencies**: Units 2, 3
**Description**:
- Fine-tune reveal animation easing and timing
- Mobile responsive: larger blocks on small screens (fewer cells = better perf)
- Reduce grain overlay opacity on mosaic sections if needed for clarity
- Ensure the nav scroll detection still works correctly
- Test on different viewport sizes

**Verification**: Smooth 60fps animation, looks good at 320px, 768px, 1024px, 1440px widths

## Tech Stack & Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Rendering | HTML5 Canvas | Hundreds of rectangles need GPU-friendly rendering; DOM nodes would be slow |
| Color variation | HSL shifts + simplex noise | HSL produces natural-looking variations; simplex noise ensures smooth transitions between neighbors |
| Animation engine | GSAP (already loaded) | Already in the project, handles easing/timing well |
| Animation loop | requestAnimationFrame | Canvas requires manual redraw; RAF ensures 60fps sync |
| Noise function | Inline simplex 2D | Avoids npm dependency for ~30 lines of code |
| Component pattern | Reusable with props | One component, two instances (hero + CTA) |
| Responsive | ResizeObserver | More efficient than window.resize, batches updates |

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Canvas performance on mobile | Choppy animation | Use larger blocks on mobile (fewer cells), skip animation on low-end |
| Color mismatch with brand | Looks wrong | Test exact brand hex values in gradient sampling |
| Canvas vs grain overlay z-index conflict | Grain invisible | Test layering carefully: canvas → content → grain (fixed) |
| Reveal animation timing clash with GSAP hero text | Ugly overlap | Coordinate timelines: mosaic starts at 0s, text at 0.4s |
| SSR hydration issues | Error on load | Canvas logic in useEffect only (client-side), canvas renders empty on server |

## Verification Strategy

1. **Visual**: Playwright screenshots comparing to reference image
2. **Performance**: Chrome DevTools → Performance tab, verify 60fps during animation
3. **Responsive**: Resize browser to mobile/tablet/desktop widths
4. **TypeScript**: `npx tsc --noEmit` passes
5. **Build**: `npm run build` succeeds
6. **Integration**: Grain overlay, mouse glow, nav scroll all still work
