# Mosaic Effect Tool — Implementation Plan

## Objective

Build a browser-based mosaic image/video effect tool as a new route (`/tools/mosaic`) within the Progressionlabs Next.js app. The tool supports **two shape modes** — **Pixel (block) mosaic** and **Circle (3D sphere) mosaic** — toggled via the control panel so the user can compare both styles on the same image. Both modes share the same split masking, brightness threshold, and color mapping systems. Users control shape mode, cell size, spacing, brightness threshold, color gradient mapping, and split position/angle — all in real-time via a dark-themed sidebar control panel.

## Architecture Overview

```
app/tools/mosaic/
├── page.tsx                    # Route entry — layout: canvas + sidebar
├── mosaic.css                  # Tool-specific dark-themed styles
├── components/
│   ├── MosaicCanvas.tsx        # Main canvas component (renders shapes + split)
│   ├── ControlPanel.tsx        # Sidebar with all sliders/toggles/pickers
│   └── SplitOverlay.tsx        # Draggable split line + angle indicator
├── hooks/
│   ├── useMosaicRenderer.ts    # Core grid rendering — supports both pixel + circle modes
│   ├── useWebGLRenderer.ts     # WebGL fallback renderer (video perf)
│   ├── useVideoPlayer.ts       # Video upload, frame extraction, play/pause
│   └── useSplitMask.ts         # Split line position/angle/drag state
└── utils/
    ├── colorMapping.ts         # Gradient interpolation, brightness → color
    ├── imageProcessing.ts      # Image loading, pixel sampling, brightness calc
    └── shapes.ts               # Shape draw functions: drawPixelBlock(), drawConvexCircle()
```

### Shape Modes

The tool supports two interchangeable shape modes via a toggle:

| Mode | Draw Function | Visual Style |
|------|--------------|--------------|
| **Pixel** | `fillRect()` with optional 1px inner bevel | Flat color blocks like the flower reference images. Sharp, graphic, retro. |
| **Circle** | `arc()` + radial gradient | 3D convex-shaded spheres with top-left highlight + bottom-right shadow. Pillowy, tactile, bubble-wrap. |

Both modes share: grid generation, color sampling, brightness threshold, split masking, color mapping. Only the per-cell draw call differs — extracted into `shapes.ts` for clean separation.

### Rendering Pipeline

```
Image/Video Frame
       ↓
  getImageData() → pixel buffer
       ↓
  Grid generation (row × col based on cellSize + spacing)
       ↓
  Per-cell: sample color at center → apply brightness threshold
       ↓
  If threshold passes → check shapeMode:
    "pixel"  → drawPixelBlock(ctx, x, y, size, color)     // flat rect + subtle bevel
    "circle" → drawConvexCircle(ctx, x, y, radius, color) // radial gradient 3D sphere
  If threshold fails: leave transparent (show original image beneath)
       ↓
  Split mask: clip original image on one side, mosaic on the other
       ↓
  Composite to visible canvas
```

### Rendering Strategy

- **Images (Pixel mode)**: Canvas 2D `fillRect()` — extremely fast, ~19K rects at 10px on 1080p renders in <5ms.
- **Images (Circle mode)**: Canvas 2D with radial gradients per circle — slightly heavier than pixel mode due to gradient creation, but still <16ms for 19K circles.
- **Video (either mode)**: WebGL2 fallback with instanced rendering. Fragment shader handles both pixel and circle shapes + radial gradient math. Targets 30fps at 1080p.
- **Split masking**: Use `ctx.clip()` with a polygon path defined by the split line angle. Render original image layer first, then clip and render mosaic layer on top.

## Work Breakdown

### Unit 1: Route Setup & Layout Shell
**Files**: `app/tools/mosaic/page.tsx`, `app/tools/mosaic/mosaic.css`
**Dependencies**: None
**Verification**: Route loads at `localhost:3000/tools/mosaic`, shows dark canvas area + sidebar skeleton

- Create `app/tools/mosaic/` directory structure
- `page.tsx`: Client component with flexbox layout — left: canvas area (flex-grow), right: sidebar (320px fixed)
- `mosaic.css`: Dark theme foundation (slate/navy bg, purple/magenta accents)
- Canvas container with proper aspect ratio handling and resize observer
- Placeholder sidebar with section headers for controls

### Unit 2: Image Upload & Canvas Foundation
**Files**: `app/tools/mosaic/components/MosaicCanvas.tsx`, `app/tools/mosaic/utils/imageProcessing.ts`
**Dependencies**: Unit 1
**Verification**: Upload an image → appears on canvas at proper scale, pixel data accessible

- Image upload button (accept: jpg, png, webp, gif)
- Load image to hidden `<img>` element → draw to offscreen canvas → `getImageData()`
- Fit image to canvas area maintaining aspect ratio
- Device pixel ratio scaling for sharp rendering
- Store pixel buffer in ref for sampling during render loop
- `imageProcessing.ts`: Helper functions — `sampleColorAt(x, y)`, `getBrightness(r, g, b)`, `loadImageToBuffer(file)`

### Unit 3: Core Mosaic Grid Renderer (Canvas 2D) — Pixel + Circle Modes
**Files**: `app/tools/mosaic/hooks/useMosaicRenderer.ts`, `app/tools/mosaic/utils/shapes.ts`
**Dependencies**: Unit 2
**Verification**: Upload image → toggle between pixel blocks and 3D circles, both sampling image colors correctly

- **`shapes.ts`** — Two pure draw functions:
  - `drawPixelBlock(ctx, x, y, size, color, bevel?)`: Fills a rect. Optional subtle 1px inner bevel (lighter top/left edge, darker bottom/right) for a tactile retro feel. Fast — single `fillRect` + 2 thin strokes.
  - `drawConvexCircle(ctx, x, y, radius, color)`: Draws `arc()` filled with radial gradient. Highlight: lighter color at offset (25%, 25%) from center. Base: sampled color at center. Shadow: darker color at edge. Creates the pillowy 3D bubble effect.
- **`useMosaicRenderer.ts`** — Core rendering hook:
  - Generate grid: `cols = floor(width / (cellSize * 2 + spacing))`, same for rows
  - For each grid cell: sample pixel color at cell center from the image buffer
  - Call `drawPixelBlock()` or `drawConvexCircle()` based on current `shapeMode`
  - **Shape mode toggle**: `"pixel" | "circle"` — switching re-renders instantly
  - Cell size slider (2px–40px) — re-renders grid on change
  - Spacing slider (0px–20px) — controls gap between shapes
  - Background fill behind shapes: configurable (black default)
  - Use `requestAnimationFrame` for smooth slider interactions
  - Smart rendering: only re-render when parameters change (not continuous RAF)

### Unit 4: Split Line Masking System
**Files**: `app/tools/mosaic/hooks/useSplitMask.ts`, `app/tools/mosaic/components/SplitOverlay.tsx`
**Dependencies**: Unit 3
**Verification**: Drag split line → left side shows original photo, right side shows circles. Angle adjustable.

- Split state: `{ position: 0-1, angle: number (degrees), isDragging: boolean }`
- `SplitOverlay.tsx`: Visual line rendered as an absolutely-positioned SVG/div overlay the user can grab and drag
- Drag interaction: mousedown on line → track mousemove → update position → mouseup
- Touch support for mobile
- Split rendering approach:
  1. Clear canvas
  2. Draw original image (full canvas)
  3. Calculate clip polygon from split position + angle
  4. `ctx.save()` → `ctx.beginPath()` → define polygon → `ctx.clip()`
  5. Clear clipped region → draw circle grid in clipped region
  6. `ctx.restore()`
- Angle modes: Diagonal (45°), Horizontal (0°), Vertical (90°), Free angle slider
- Smooth CSS transition on split line position for non-drag updates
- Split position slider in control panel as alternative to dragging

### Unit 5: Brightness Threshold & Color Mapping
**Files**: `app/tools/mosaic/utils/colorMapping.ts`, updates to `useCircleRenderer.ts`
**Dependencies**: Unit 3
**Verification**: Threshold slider → only bright areas get circles. Custom gradient → circles recolor from dark-to-light.

- `colorMapping.ts`:
  - `interpolateColor(color1, color2, t)` — linear interpolation in HSL space
  - `brightnessToGradientColor(brightness, darkColor, lightColor)` — maps 0-255 to gradient
  - `adjustBrightness(color, factor)` — for 3D highlight/shadow on gradient colors
- Brightness threshold (0–255): below threshold → skip circle (show original)
- Invert toggle: flip which areas get the effect
- Color mode toggle:
  - "Original Colors": circle fill = sampled image color
  - "Custom Gradient": circle fill = `brightnessToGradientColor(sampleBrightness, darkPicker, lightPicker)`
- Dark color picker (default: deep blue `#0a1628`)
- Light color picker (default: cyan `#00d4ff`)
- Real-time preview as sliders move

### Unit 6: Control Panel UI
**Files**: `app/tools/mosaic/components/ControlPanel.tsx`, updates to `mosaic.css`
**Dependencies**: Units 3, 4, 5
**Verification**: All controls render, are interactive, and update canvas in real-time

- Section groupings with subtle dividers:
  - **Image/Video** — Upload image button, Upload video button
  - **Shape Mode** — Toggle: Pixel ↔ Circle (prominent, top of controls so user sees it immediately)
  - **Mosaic Grid** — Cell size slider, Spacing slider, Background selector (black/white/transparent/blur)
  - **Split Effect** — Position slider, Angle selector (presets + free), Enable/disable toggle
  - **Brightness Threshold** — Threshold slider (0–255), Invert toggle
  - **Color Mapping** — Mode toggle (Original/Custom), Dark color picker, Light color picker
  - **Export** — Save PNG button
- Slider component: custom-styled range inputs with purple/magenta track + thumb
- Color pickers: native `<input type="color">` with hex display
- Toggle switches: CSS-only toggle (no dependency needed)
- Scrollable sidebar if controls exceed viewport height
- Responsive: on mobile, controls collapse to bottom sheet or overlay

### Unit 7: Video Support
**Files**: `app/tools/mosaic/hooks/useVideoPlayer.ts`, `app/tools/mosaic/hooks/useWebGLRenderer.ts`
**Dependencies**: Units 3, 4, 5
**Verification**: Upload MP4 → video plays with circle effect at ~30fps. Play/pause works. Export captures current frame.

- `useVideoPlayer.ts`:
  - Video upload (accept: mp4, webm)
  - Hidden `<video>` element for playback
  - Play/pause toggle, seek slider
  - Frame extraction: draw video frame to offscreen canvas → getImageData()
  - RAF loop: extract frame → render circles → repeat at video framerate
- `useWebGLRenderer.ts` (performance fallback):
  - WebGL2 context on the main canvas
  - Instanced circle rendering: one circle mesh, instanced with position + color + size
  - Fragment shader: radial gradient math for 3D convex shading
  - Texture upload: video frame → WebGL texture each frame
  - Brightness threshold + color mapping in shader
  - Split mask via stencil buffer or discard in fragment shader
- Auto-detect: if Canvas 2D drops below 20fps on video, prompt to switch to WebGL
- Video controls: play/pause button, timeline scrubber, current time display

### Unit 8: Export & Final Polish
**Files**: Updates across all files
**Dependencies**: Units 1–7
**Verification**: Export works, performance is good, edge cases handled

- PNG export: `canvas.toDataURL('image/png')` → download link
- Export at full resolution (not display resolution)
- Performance:
  - Debounce slider changes (16ms = 60fps cap)
  - Cache circle grid positions when only color params change
  - Use offscreen canvas for image sampling (avoid main canvas reads)
- Edge cases:
  - Very large images (>4K): auto-downscale to 2048px max dimension
  - Transparent PNGs: handle alpha channel in sampling
  - GIFs: treat as static image (first frame)
  - Portrait vs landscape orientation
- Loading states for image/video processing
- Keyboard shortcuts: Space = play/pause, E = export, R = reset

## Tech Stack & Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Location | `/tools/mosaic` route | Lives in existing Next.js app, shares layout/fonts, easy future integration into hero |
| Shape modes | Pixel + Circle toggle | User can A/B compare both styles on the same image. Shared grid logic, only draw call differs. |
| Primary renderer | Canvas 2D | Simpler, sufficient for images, easier to debug. Pixel mode is trivially fast. |
| Video renderer | WebGL2 fallback | Instanced rendering handles 19K+ shapes at 30fps for both modes |
| 3D circle shading | Radial gradients | Natural Canvas API, no texture atlas needed, colors remain dynamic |
| Pixel bevel | 1px inner strokes | Subtle depth cue without performance cost, optional toggle |
| State management | React useState + useRef | No external state lib needed, refs for performance-critical values |
| Styling | Dedicated CSS file | Matches project pattern (globals.css), no Tailwind in this project |
| Color interpolation | HSL space | More perceptually uniform than RGB, better gradient results |

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Canvas 2D too slow for video | Video <20fps | WebGL fallback renderer (Unit 7) |
| Radial gradients per circle = perf bottleneck | Choppy slider interaction | Debounce + render only dirty regions + cache grid positions |
| Split line clipping artifacts at edges | Visual glitch | Anti-alias clip path with 1px feather |
| Large image memory pressure | Browser tab crash | Auto-downscale >4K images, limit video to 1080p |
| Color picker cross-browser inconsistency | Different appearance | Use native `<input type="color">` which works well in all modern browsers |

## Verification Strategy

1. **Per-unit**: Each unit has its own verification (see above)
2. **Visual comparison**: Screenshot tool output vs reference images provided by user
3. **Performance benchmark**: Console.time the render loop — target <16ms for images, <33ms for video frames
4. **TypeScript**: `npx tsc --noEmit` after each unit
5. **Build check**: `npm run build` passes
6. **Browser test**: Use Playwright MCP to screenshot `localhost:3000/tools/mosaic` with a test image
7. **Cross-reference**: Compare circle rendering quality against boss's "Progression Animation" tool screenshots
