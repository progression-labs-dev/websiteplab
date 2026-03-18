# ASCII Gradient Tool — Design Spec

## Overview

A new image editing tool that applies a pixelated mosaic effect **only to the detected subject** of an uploaded image. The pixel blocks mirror the underlying image colors (frosted glass effect) with no gradient applied to them. Vibrant, glowing ASCII characters are rendered inside each pixel cell with a user-configurable gradient.

## User Flow

1. User uploads an image
2. User clicks on the subject to create SAM mask (same as mosaic tool)
3. Subject area becomes pixelated with glowing gradient ASCII overlay
4. User adjusts controls (cell size, density, gradient mode, colors)
5. User exports as PNG

## Rendering Pipeline

### Layer 1: Original Image Base
Draw the full original image as the base layer. This remains visible in all non-subject areas.

### Layer 2: Frosted Glass Pixels (Subject Only)
Iterate through a grid of cells across the image. For each cell:
- Check subject mask — **skip if background** (original image shows through untouched)
- Sample the underlying image color at cell center via `sampleColorAt()`
- Draw a flat pixel block with that sampled color using `drawPixelBlock()`
- This creates a pixelated/frosted look that reflects the image underneath

### Layer 3: Glowing ASCII (Subject Only)
For each subject cell (respecting density gate):
- Compute gradient position based on active gradient mode (see below)
- Map position (0-1) to brightness (0-255) by multiplying by 255, then pass to `multiStopGradientColor(brightness, stops)` which internally normalizes back to 0-1
- Draw ASCII character with:
  - `screen` blend mode (lets gradient colors shine through vividly)
  - `shadowBlur`: `Math.max(6, cellSize * 0.35)` capped at 8px, using the gradient color at 80% opacity as shadowColor
  - On bright underlying pixels (brightness > 200), reduce ASCII fill opacity to `0.7` to prevent washout from `screen` blending
  - Font: 500-weight Inter, size = `max(8, cellSize * 1.6)`
  - Character selected via position-seeded hash (deterministic)
  - Charset: `'0123456789@#$%&*+=?<>{}[]/\|LABS'`

## Gradient Modes

All modes produce a normalized value (0-1) per cell. Convert to 0-255 range before passing to `multiStopGradientColor()` (which expects brightness in 0-255 and internally divides by 255).

| Mode | Calculation | Visual Effect |
|------|-------------|---------------|
| **Brightness-mapped** | `getBrightness(r, g, b)` (already 0-255) | Follows image lighting — highlights glow end-color, shadows glow start-color |
| **Top-to-bottom** | `(cellY / imageHeight) * 255` | Uniform vertical sweep |
| **Radial from center** | `(distance(cell, subjectCentroid) / maxMaskDistance) * 255` | Spotlight glow from subject center outward |
| **Diagonal** | `((cellX/imageWidth + cellY/imageHeight) / 2) * 255` | Diagonal sweep matching deck shimmer aesthetic |

### Radial Mode Definitions
- **`subjectCentroid`**: Average (x, y) of all mask=1 pixels — `{ x: sum(maskX)/count, y: sum(maskY)/count }`
- **`maxMaskDistance`**: Maximum distance from centroid to any mask=1 pixel — ensures the gradient spans the full subject extent

## User Controls

| Control | Type | Range | Default |
|---------|------|-------|---------|
| Cell size | Slider | 8px – 60px | 20px |
| ASCII density | Slider | 20% – 90% | 40% |
| Gradient mode | Select dropdown | brightness / top-to-bottom / radial / diagonal | brightness |
| Color palette | Preset buttons | 8 brand presets (see below) + Custom | Blue |
| Custom color start | Color picker | Any hex | Hidden until "Custom" selected |
| Custom color end | Color picker | Any hex | Hidden until "Custom" selected |
| Subject mask | Click on image | SAM point prompts (foreground/background) | — |

## UI States

| State | What to show |
|-------|-------------|
| **Empty** | Upload prompt with drag-and-drop zone (match mosaic tool pattern) |
| **Image loaded, no mask** | Image displayed, instruction overlay: "Click on the subject to select it" |
| **SAM downloading** | Progress bar overlay with percentage (model is ~25MB, cached in IndexedDB after first load) |
| **SAM encoding** | Spinner overlay with "Analyzing image..." (1-2s) |
| **SAM decoding** | Brief spinner on click (~50ms, may not need visible indicator) |
| **Mask active** | Full rendering with controls enabled |
| **Exporting** | Button disabled with "Exporting..." label |
| **SAM load error** | Error banner: "Subject detection failed to load. Try refreshing." with retry button |

## File Structure

```
app/tools/ascii-gradient/
├── page.tsx                          # State, upload, controls UI
├── components/
│   └── AsciiGradientCanvas.tsx       # Canvas display, SAM click handling
├── hooks/
│   └── useAsciiGradientRenderer.ts   # Core rendering engine
└── utils/
    └── gradientModes.ts              # Gradient mode position calculations
```

### Shared Imports (from mosaic tool)

- `../mosaic/utils/imageProcessing.ts` — `loadImageToBuffer`, `sampleColorAt`, `getBrightness`, `ImageBuffer`
- `../mosaic/utils/colorMapping.ts` — `multiStopGradientColor`, `hexToRgb`, `rgbString`, `interpolateColor`
- `../mosaic/utils/shapes.ts` — `drawPixelBlock` (ASCII drawing will be custom for glow effect)
- `../mosaic/hooks/useSubjectMask.ts` — SAM mask management
- `../mosaic/utils/samSegmenter.ts` — SAM model integration
- `../mosaic/hooks/useMosaicRenderer.ts` — `BRAND_PALETTES`, `GradientStop`, `BrandPalette` type exports

### New Code

- `useAsciiGradientRenderer.ts` — rendering loop: base image, subject-only pixel blocks, glowing ASCII with gradient
- `gradientModes.ts` — pure functions: `brightnessPosition()`, `topToBottomPosition()`, `radialPosition()`, `diagonalPosition()`, `computeSubjectCentroid()`
- `page.tsx` — state management for all controls, image upload, PNG export
- `AsciiGradientCanvas.tsx` — canvas wrapper with click-to-mask SAM interaction

## Glow Rendering Detail

The ASCII glow effect differs from the existing mosaic ASCII rendering:

```
Existing (mosaic shapes.ts):
  - blend mode: overlay
  - fill: white
  - shadowBlur: 4px, shadowColor: rgba(0,0,0,0.3)
  - Result: subtle text that absorbs background color

New (ascii-gradient):
  - blend mode: screen
  - fill: gradient-mapped color (e.g., bright blue or white)
  - shadowBlur: max(6, cellSize * 0.35) capped at 8, shadowColor: gradient color at 80% opacity
  - On bright pixels (brightness > 200): reduce fill opacity to 0.7 to avoid screen-mode washout
  - Result: luminous colored text that glows on top of frosted pixels
```

## Color Palettes

Reuse `BRAND_PALETTES` from `../mosaic/hooks/useMosaicRenderer.ts`. Each palette is a 3-stop gradient (shadow → accent → highlight). For this tool, we use all 3 stops to map across the ASCII gradient — the same `multiStopGradientColor()` call works directly.

| Preset | Shadow | Accent | Highlight |
|--------|--------|--------|-----------|
| Blue | `rgb(8, 8, 48)` | `rgb(0, 0, 255)` | `rgb(245, 245, 245)` |
| Purple | `rgb(40, 12, 52)` | `rgb(186, 85, 211)` | `rgb(245, 245, 245)` |
| Green | `rgb(20, 38, 12)` | `rgb(185, 233, 121)` | `rgb(245, 245, 245)` |
| Turquoise | `rgb(8, 32, 30)` | `rgb(64, 224, 208)` | `rgb(245, 245, 245)` |
| Salmon | `rgb(52, 22, 16)` | `rgb(255, 160, 122)` | `rgb(245, 245, 245)` |
| Ocean | `rgb(8, 8, 48)` | `rgb(0, 0, 255)` | `rgb(64, 224, 208)` |
| Sunset | `rgb(40, 12, 52)` | `rgb(186, 85, 211)` | `rgb(255, 160, 122)` |
| Forest | `rgb(8, 20, 18)` | `rgb(64, 224, 208)` | `rgb(185, 233, 121)` |
| Custom | User color picker A | — | User color picker B |

For "Custom" mode, create a 2-stop gradient from the user's two picked colors. Use `interpolateColor()` directly (simpler for 2 stops) or wrap as a 2-element stops array for `multiStopGradientColor()`.

## PNG Export

Export uses `canvas.toBlob('image/png')` followed by a download link creation (`URL.createObjectURL` + programmatic `<a>` click). The export renders at full image buffer resolution (up to 2048px max dimension, matching `loadImageToBuffer`'s resize limit), not the display-scaled canvas size. Pattern matches the mosaic tool's `exportPNG` approach.

## Responsive Behavior

- Desktop: controls panel on the right, canvas on the left (match mosaic tool layout)
- Mobile: out of scope for v1 (SAM click-to-mask requires precision pointing)
- Minimum viewport: 1024px width recommended

## Out of Scope (v1)

- Video support (image only)
- Split mask mode
- Auto-brightness mask mode
- Film grain overlay
- Export formats beyond PNG
- Animated gradient effects
- Mobile/touch optimization

## Success Criteria

1. User can upload an image and click to select subject via SAM
2. Subject area shows pixelated frosted glass effect (pixels match underlying colors)
3. Background remains untouched (original image visible)
4. ASCII characters on subject display gradient colors that glow
5. All four gradient modes work and are switchable
6. All 8 presets + custom colors work
7. Cell size and density sliders adjust rendering in real-time
8. PNG export captures the rendered result at full image resolution
9. SAM loading/encoding/error states are visible to the user
