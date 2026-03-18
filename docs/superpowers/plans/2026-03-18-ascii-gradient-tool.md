# ASCII Gradient Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new image tool that pixelates the subject of an image (frosted glass effect) and overlays glowing gradient ASCII characters on the subject.

**Architecture:** Canvas 2D rendering with SAM subject detection, reusing the mosaic tool's shared utilities. New rendering hook isolates subject pixels and draws glowing ASCII with configurable gradient modes (brightness, vertical, radial, diagonal). React page manages state and controls panel.

**Tech Stack:** Next.js 14 / React 18 / TypeScript / Canvas 2D / @huggingface/transformers (SAM)

---

### Task 1: Gradient Mode Utility Functions

**Files:**
- Create: `app/tools/ascii-gradient/utils/gradientModes.ts`

- [ ] **Step 1: Create the gradient modes file with all four position functions**

```typescript
// app/tools/ascii-gradient/utils/gradientModes.ts

import { getBrightness } from '../../mosaic/utils/imageProcessing';

export type GradientMode = 'brightness' | 'top-to-bottom' | 'radial' | 'diagonal';

/**
 * Computes the centroid (average x,y) of all foreground pixels in a mask.
 * Cache this when the mask changes — do not recompute per render.
 */
export function computeSubjectCentroid(
  mask: Uint8Array,
  maskW: number,
  maskH: number
): { cx: number; cy: number; maxDist: number } {
  let sumX = 0, sumY = 0, count = 0;

  for (let y = 0; y < maskH; y++) {
    for (let x = 0; x < maskW; x++) {
      if (mask[y * maskW + x] === 1) {
        sumX += x;
        sumY += y;
        count++;
      }
    }
  }

  if (count === 0) return { cx: 0, cy: 0, maxDist: 1 };

  const cx = sumX / count;
  const cy = sumY / count;

  // Find max distance from centroid to any mask pixel
  let maxDist = 0;
  for (let y = 0; y < maskH; y++) {
    for (let x = 0; x < maskW; x++) {
      if (mask[y * maskW + x] === 1) {
        const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (d > maxDist) maxDist = d;
      }
    }
  }

  return { cx, cy, maxDist: maxDist || 1 };
}

/**
 * Returns a 0-255 value representing the gradient position for a cell.
 * This value is passed directly to multiStopGradientColor().
 */
export function getGradientPosition(
  mode: GradientMode,
  cellX: number,
  cellY: number,
  imageWidth: number,
  imageHeight: number,
  r: number,
  g: number,
  b: number,
  centroid?: { cx: number; cy: number; maxDist: number },
  maskW?: number,
  maskH?: number
): number {
  switch (mode) {
    case 'brightness':
      return getBrightness(r, g, b); // already 0-255

    case 'top-to-bottom':
      return (cellY / imageHeight) * 255;

    case 'radial': {
      if (!centroid || !maskW || !maskH) return 128;
      // Convert cell coords to mask space
      const mx = cellX * maskW / imageWidth;
      const my = cellY * maskH / imageHeight;
      const dist = Math.sqrt((mx - centroid.cx) ** 2 + (my - centroid.cy) ** 2);
      return Math.min(255, (dist / centroid.maxDist) * 255);
    }

    case 'diagonal':
      return ((cellX / imageWidth + cellY / imageHeight) / 2) * 255;

    default:
      return 128;
  }
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `cd /Users/joeom/websiteplab && npx tsc --noEmit --strict app/tools/ascii-gradient/utils/gradientModes.ts 2>&1 || npx tsc --noEmit 2>&1 | grep ascii-gradient`
Expected: No errors for this file (project-wide errors may exist from other files)

- [ ] **Step 3: Commit**

```bash
git add app/tools/ascii-gradient/utils/gradientModes.ts
git commit -m "feat(ascii-gradient): add gradient mode utility functions"
```

---

### Task 2: Core Rendering Hook

**Files:**
- Create: `app/tools/ascii-gradient/hooks/useAsciiGradientRenderer.ts`
- Read: `app/tools/mosaic/hooks/useMosaicRenderer.ts` (reference pattern)
- Read: `app/tools/mosaic/utils/shapes.ts` (drawPixelBlock, drawAsciiChar reference)

- [ ] **Step 1: Create the renderer hook with types and params interface**

```typescript
// app/tools/ascii-gradient/hooks/useAsciiGradientRenderer.ts

import { useCallback, useRef } from 'react';
import { ImageBuffer, sampleColorAt, getBrightness } from '../../mosaic/utils/imageProcessing';
import { multiStopGradientColor, rgbString } from '../../mosaic/utils/colorMapping';
import { drawPixelBlock } from '../../mosaic/utils/shapes';
import { GradientStop } from '../../mosaic/hooks/useMosaicRenderer';
import { GradientMode, getGradientPosition, computeSubjectCentroid } from '../utils/gradientModes';

// Hero-style charset — same as mosaic tool
const ASCII_CHARSET = '0123456789@#$%&*+=?<>{}[]/\\|LABS';

function posHash(x: number, y: number): number {
  return ((x * 7919 + y * 104729) >>> 0) / 4294967296;
}

export interface AsciiGradientParams {
  cellSize: number;          // 8-60, default 20
  asciiDensity: number;      // 0.2-0.9, default 0.4
  gradientMode: GradientMode;
  gradientStops: GradientStop[];
}

export const DEFAULT_ASCII_GRADIENT_PARAMS: AsciiGradientParams = {
  cellSize: 20,
  asciiDensity: 0.4,
  gradientMode: 'brightness',
  gradientStops: [
    { color: [8, 8, 48], label: 'Shadow' },
    { color: [0, 0, 255], label: 'Blue' },
    { color: [245, 245, 245], label: 'White Smoke' },
  ],
};
```

- [ ] **Step 2: Add the drawGlowingAscii function**

```typescript
/**
 * Draw a glowing ASCII character with gradient color.
 * Uses 'screen' blend mode + colored shadowBlur for luminous glow effect.
 * Reduces opacity on bright pixels to prevent screen-mode washout.
 */
function drawGlowingAscii(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cellSize: number,
  density: number,
  gradR: number,
  gradG: number,
  gradB: number,
  underlyingBrightness: number
): void {
  // Density gate — skip cells for organic sparse look
  const fillGate = posHash(cx, cy);
  if (fillGate > density) return;

  // Position-seeded character selection
  const charIdx = ((cx * 7919 + cy * 104729) >>> 0) % ASCII_CHARSET.length;
  const char = ASCII_CHARSET[charIdx];

  const fontSize = Math.max(8, cellSize * 1.6);
  ctx.font = `500 ${fontSize}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Screen blend — lets gradient colors shine vividly on frosted pixels
  const prevComposite = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'screen';

  // Colored glow: shadowBlur scales with cellSize, capped 6-8px
  const blurSize = Math.min(8, Math.max(6, cellSize * 0.35));
  ctx.shadowColor = rgbString(gradR, gradG, gradB, 0.8);
  ctx.shadowBlur = blurSize;

  // Reduce opacity on bright underlying pixels to prevent washout
  const opacity = underlyingBrightness > 200 ? 0.7 : 1.0;
  ctx.fillStyle = rgbString(gradR, gradG, gradB, opacity);
  ctx.fillText(char, cx, cy);

  // Reset
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.globalCompositeOperation = prevComposite;
}
```

- [ ] **Step 3: Add the render function and hook export**

```typescript
export function useAsciiGradientRenderer() {
  const rafId = useRef<number>(0);
  // Cache centroid between renders — recompute only when mask changes
  const centroidCacheRef = useRef<{
    mask: Uint8Array | null;
    result: { cx: number; cy: number; maxDist: number } | null;
  }>({ mask: null, result: null });

  const render = useCallback((
    canvas: HTMLCanvasElement,
    buffer: ImageBuffer,
    params: AsciiGradientParams,
    subjectMask?: Uint8Array | null
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = buffer;
    canvas.width = width;
    canvas.height = height;

    const { cellSize, asciiDensity, gradientMode, gradientStops } = params;

    // Compute mask lookup dimensions (handles resolution mismatch)
    let maskW = width, maskH = height;
    if (subjectMask && subjectMask.length !== width * height) {
      maskH = Math.round(Math.sqrt(subjectMask.length * height / width));
      maskW = Math.round(subjectMask.length / maskH);
      if (maskW * maskH !== subjectMask.length) {
        maskH = Math.round(subjectMask.length / maskW);
      }
    }

    // Cache centroid computation — only recompute when mask reference changes
    let centroid: { cx: number; cy: number; maxDist: number } | undefined;
    if (subjectMask && gradientMode === 'radial') {
      if (centroidCacheRef.current.mask !== subjectMask) {
        centroidCacheRef.current = {
          mask: subjectMask,
          result: computeSubjectCentroid(subjectMask, maskW, maskH),
        };
      }
      centroid = centroidCacheRef.current.result ?? undefined;
    }

    // Layer 1: Draw original image as base layer
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d')!;
    const imgData = new ImageData(
      new Uint8ClampedArray(buffer.data),
      width,
      height
    );
    offCtx.putImageData(imgData, 0, 0);
    ctx.drawImage(offscreen, 0, 0);

    // No mask? Just show the original image (user hasn't clicked yet)
    if (!subjectMask) return;

    // Grid iteration
    const step = cellSize * 2;
    const cols = Math.ceil(width / step);
    const rows = Math.ceil(height / step);

    const stopColors = gradientStops.map(s => s.color);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cellX = col * step + cellSize;
        const cellY = row * step + cellSize;

        if (cellX >= width || cellY >= height) continue;

        // Subject mask check — skip background cells
        const mx = Math.round(cellX * maskW / width);
        const my = Math.round(cellY * maskH / height);
        const maskIdx = my * maskW + mx;
        if (maskIdx < 0 || maskIdx >= subjectMask.length || subjectMask[maskIdx] === 0) continue;

        // Sample underlying color
        const [r, g, b] = sampleColorAt(buffer, cellX, cellY);
        const brightness = getBrightness(r, g, b);

        // Layer 2: Frosted glass pixel — flat color from original image
        drawPixelBlock(ctx, cellX - cellSize, cellY - cellSize, cellSize * 2, r, g, b);

        // Layer 3: Glowing gradient ASCII
        const gradPos = getGradientPosition(
          gradientMode, cellX, cellY, width, height,
          r, g, b, centroid, maskW, maskH
        );
        const [gradR, gradG, gradB] = multiStopGradientColor(gradPos, stopColors);

        drawGlowingAscii(ctx, cellX, cellY, cellSize, asciiDensity, gradR, gradG, gradB, brightness);
      }
    }
  }, []);

  const renderAnimated = useCallback((
    canvas: HTMLCanvasElement,
    buffer: ImageBuffer,
    params: AsciiGradientParams,
    subjectMask?: Uint8Array | null
  ) => {
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      render(canvas, buffer, params, subjectMask);
    });
  }, [render]);

  const cleanup = useCallback(() => {
    cancelAnimationFrame(rafId.current);
  }, []);

  return { render, renderAnimated, cleanup };
}
```

- [ ] **Step 4: Verify the hook compiles**

Run: `cd /Users/joeom/websiteplab && npx tsc --noEmit 2>&1 | grep ascii-gradient`
Expected: No errors for ascii-gradient files

- [ ] **Step 5: Commit**

```bash
git add app/tools/ascii-gradient/hooks/useAsciiGradientRenderer.ts
git commit -m "feat(ascii-gradient): add core rendering hook with glowing ASCII"
```

---

### Task 3: Canvas Component

**Files:**
- Create: `app/tools/ascii-gradient/components/AsciiGradientCanvas.tsx`
- Read: `app/tools/mosaic/components/MosaicCanvas.tsx` (reference pattern)

- [ ] **Step 1: Create the canvas component**

```typescript
// app/tools/ascii-gradient/components/AsciiGradientCanvas.tsx

'use client';

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle, MouseEvent } from 'react';
import { ImageBuffer } from '../../mosaic/utils/imageProcessing';
import { AsciiGradientParams } from '../hooks/useAsciiGradientRenderer';
import { useAsciiGradientRenderer } from '../hooks/useAsciiGradientRenderer';

interface ClickPoint {
  x: number;
  y: number;
  label: 0 | 1;
}

interface AsciiGradientCanvasProps {
  buffer: ImageBuffer | null;
  params: AsciiGradientParams;
  subjectMask?: Uint8Array | null;
  onCanvasClick?: (x: number, y: number, label: 0 | 1) => void;
  clickPoints?: ClickPoint[];
}

export interface AsciiGradientCanvasHandle {
  exportPNG: () => void;
}

const AsciiGradientCanvas = forwardRef<AsciiGradientCanvasHandle, AsciiGradientCanvasProps>(
  function AsciiGradientCanvas({ buffer, params, subjectMask, onCanvasClick, clickPoints }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { render, cleanup } = useAsciiGradientRenderer();

    // Re-render when params, buffer, or mask change
    useEffect(() => {
      if (!buffer || !canvasRef.current) return;
      render(canvasRef.current, buffer, params, subjectMask);
    }, [buffer, params, subjectMask, render]);

    useEffect(() => cleanup, [cleanup]);

    // Convert CSS click coordinates to image-space coordinates
    const cssToImageCoords = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const canvasAspect = canvas.width / canvas.height;
      const elemAspect = rect.width / rect.height;

      let renderW: number, renderH: number, offsetX: number, offsetY: number;
      if (canvasAspect > elemAspect) {
        renderW = rect.width;
        renderH = rect.width / canvasAspect;
        offsetX = 0;
        offsetY = (rect.height - renderH) / 2;
      } else {
        renderH = rect.height;
        renderW = rect.height * canvasAspect;
        offsetX = (rect.width - renderW) / 2;
        offsetY = 0;
      }

      const cssX = e.clientX - rect.left - offsetX;
      const cssY = e.clientY - rect.top - offsetY;

      if (cssX < 0 || cssX > renderW || cssY < 0 || cssY > renderH) return null;

      const imageX = Math.round((cssX / renderW) * canvas.width);
      const imageY = Math.round((cssY / renderH) * canvas.height);

      return { imageX, imageY, renderW, renderH, offsetX, offsetY };
    }, []);

    // Left-click = foreground (include in subject)
    const handleClick = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
      if (!onCanvasClick) return;
      const coords = cssToImageCoords(e);
      if (!coords) return;
      onCanvasClick(coords.imageX, coords.imageY, 1);
    }, [onCanvasClick, cssToImageCoords]);

    // Right-click = background (exclude from subject)
    const handleContextMenu = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
      if (!onCanvasClick) return;
      e.preventDefault();
      const coords = cssToImageCoords(e);
      if (!coords) return;
      onCanvasClick(coords.imageX, coords.imageY, 0);
    }, [onCanvasClick, cssToImageCoords]);

    // PNG export at full resolution
    const exportPNG = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `ascii-gradient-${Date.now()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    }, []);

    useImperativeHandle(ref, () => ({ exportPNG }), [exportPNG]);

    // Compute dot positions for click point overlay
    const dotPositions = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas || !buffer || !clickPoints?.length) return [];

      const rect = canvas.getBoundingClientRect();
      const canvasAspect = canvas.width / canvas.height;
      const elemAspect = rect.width / rect.height;
      let renderW: number, renderH: number, offsetX: number, offsetY: number;
      if (canvasAspect > elemAspect) {
        renderW = rect.width;
        renderH = rect.width / canvasAspect;
        offsetX = 0;
        offsetY = (rect.height - renderH) / 2;
      } else {
        renderH = rect.height;
        renderW = rect.height * canvasAspect;
        offsetX = (rect.width - renderW) / 2;
        offsetY = 0;
      }

      return clickPoints.map(pt => ({
        left: offsetX + (pt.x / canvas.width) * renderW,
        top: offsetY + (pt.y / canvas.height) * renderH,
        label: pt.label,
      }));
    }, [buffer, clickPoints]);

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            cursor: 'crosshair',
          }}
        />
        {/* Click point indicators */}
        {clickPoints && clickPoints.length > 0 && dotPositions().map((dot, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: dot.left - 5,
              top: dot.top - 5,
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: dot.label === 1 ? 'rgba(0,200,0,0.8)' : 'rgba(255,0,0,0.8)',
              border: '2px solid white',
              pointerEvents: 'none',
            }}
          />
        ))}
      </div>
    );
  }
);

export default AsciiGradientCanvas;
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /Users/joeom/websiteplab && npx tsc --noEmit 2>&1 | grep ascii-gradient`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/tools/ascii-gradient/components/AsciiGradientCanvas.tsx
git commit -m "feat(ascii-gradient): add canvas component with SAM click handling"
```

---

### Task 4: Page Component with Controls

**Files:**
- Create: `app/tools/ascii-gradient/page.tsx`
- Create: `app/tools/ascii-gradient/ascii-gradient.css`
- Read: `app/tools/mosaic/page.tsx` (reference pattern)
- Read: `app/tools/mosaic/mosaic.css` (reference styling)

- [ ] **Step 1: Create the CSS file**

Create `app/tools/ascii-gradient/ascii-gradient.css` reusing the mosaic tool's dark panel aesthetic. Include styles for:
- `.ag-container` — flex layout: canvas left, controls right
- `.ag-canvas-area` — flexible canvas container
- `.ag-controls` — right panel with dark background, scrollable
- `.ag-upload-zone` — drag-and-drop upload area
- `.ag-section` — control group container
- `.ag-section-title` — section headers
- `.ag-slider-row` — label + slider + value display
- `.ag-palette-grid` — preset palette swatch grid
- `.ag-palette-swatch` — individual palette swatch with gradient preview
- `.ag-mode-select` — gradient mode dropdown
- `.ag-export-btn` — export button
- `.ag-status-bar` — SAM loading/encoding status indicator

Follow the mosaic tool's color scheme: `#13141a` background, `#1e2028` panels, `#c4c7d0` labels, blue accents.

- [ ] **Step 2: Create the page component**

```typescript
// app/tools/ascii-gradient/page.tsx

'use client';

import { useState, useRef, useCallback, useEffect, DragEvent } from 'react';
import './ascii-gradient.css';
import AsciiGradientCanvas, { AsciiGradientCanvasHandle } from './components/AsciiGradientCanvas';
import {
  AsciiGradientParams,
  DEFAULT_ASCII_GRADIENT_PARAMS,
} from './hooks/useAsciiGradientRenderer';
import { BRAND_PALETTES, GradientStop } from '../../mosaic/hooks/useMosaicRenderer';
import { ImageBuffer, loadImageToBuffer } from '../../mosaic/utils/imageProcessing';
import { hexToRgb, rgbToHex } from '../../mosaic/utils/colorMapping';
import { useSubjectMask } from '../../mosaic/hooks/useSubjectMask';
import type { GradientMode } from './utils/gradientModes';

export default function AsciiGradientToolPage() {
  const [params, setParams] = useState<AsciiGradientParams>(DEFAULT_ASCII_GRADIENT_PARAMS);
  const [buffer, setBuffer] = useState<ImageBuffer | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const canvasRef = useRef<AsciiGradientCanvasHandle>(null);

  // Custom color state
  const [customColorStart, setCustomColorStart] = useState('#0000ff');
  const [customColorEnd, setCustomColorEnd] = useState('#ffffff');
  const [isCustomPalette, setIsCustomPalette] = useState(false);

  // Subject mask hook
  const {
    mask, points, isLoading, isEncoding, isDecoding, loadProgress,
    initModel, encodeImage, addPoint, removeLastPoint, clearMask,
  } = useSubjectMask();

  const modelInitedRef = useRef(false);

  // Init SAM model + encode when image is loaded
  useEffect(() => {
    if (!buffer) return;
    const setup = async () => {
      if (!modelInitedRef.current) {
        await initModel();
        modelInitedRef.current = true;
      }
      await encodeImage(buffer);
    };
    setup().catch(err => console.error('SAM setup failed:', err));
  }, [buffer, initModel, encodeImage]);

  const handleParamChange = useCallback((partial: Partial<AsciiGradientParams>) => {
    setParams(prev => ({ ...prev, ...partial }));
  }, []);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      clearMask();
      const imgBuffer = await loadImageToBuffer(file);
      setBuffer(imgBuffer);
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Failed to load image. Please try a different file.');
    }
  }, [clearMask]);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const handleCanvasClick = useCallback((x: number, y: number, label: 0 | 1) => {
    addPoint(x, y, label);
  }, [addPoint]);

  const handleExport = useCallback(() => {
    setIsExporting(true);
    // Small delay to let the button state update visually
    requestAnimationFrame(() => {
      canvasRef.current?.exportPNG();
      setIsExporting(false);
    });
  }, []);

  const handlePaletteSelect = useCallback((stops: GradientStop[]) => {
    setIsCustomPalette(false);
    handleParamChange({ gradientStops: stops });
  }, [handleParamChange]);

  const handleCustomColors = useCallback(() => {
    setIsCustomPalette(true);
    const start = hexToRgb(customColorStart);
    const end = hexToRgb(customColorEnd);
    handleParamChange({
      gradientStops: [
        { color: start, label: 'Custom Start' },
        { color: end, label: 'Custom End' },
      ],
    });
  }, [customColorStart, customColorEnd, handleParamChange]);

  // Update custom gradient when color pickers change
  useEffect(() => {
    if (!isCustomPalette) return;
    const start = hexToRgb(customColorStart);
    const end = hexToRgb(customColorEnd);
    handleParamChange({
      gradientStops: [
        { color: start, label: 'Custom Start' },
        { color: end, label: 'Custom End' },
      ],
    });
  }, [customColorStart, customColorEnd, isCustomPalette, handleParamChange]);

  // Status text
  let statusText = '';
  if (isLoading) statusText = `Loading AI model... ${loadProgress}%`;
  else if (isEncoding) statusText = 'Analyzing image...';
  else if (isDecoding) statusText = 'Processing...';
  else if (buffer && !mask) statusText = 'Click on the subject to select it';

  return (
    <div className="ag-container">
      {/* Canvas Area */}
      <div
        className="ag-canvas-area"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {!buffer ? (
          <label className="ag-upload-zone">
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />
            <div className="ag-upload-content">
              <span className="ag-upload-icon">+</span>
              <span>Drop image here or click to upload</span>
            </div>
          </label>
        ) : (
          <AsciiGradientCanvas
            ref={canvasRef}
            buffer={buffer}
            params={params}
            subjectMask={mask}
            onCanvasClick={handleCanvasClick}
            clickPoints={points}
          />
        )}

        {/* Status bar */}
        {statusText && (
          <div className="ag-status-bar">{statusText}</div>
        )}
      </div>

      {/* Controls Panel */}
      <div className="ag-controls">
        <div className="ag-section">
          <div className="ag-section-title">Cell Size</div>
          <div className="ag-slider-row">
            <input
              type="range"
              min={8}
              max={60}
              value={params.cellSize}
              onChange={(e) => handleParamChange({ cellSize: Number(e.target.value) })}
            />
            <span>{params.cellSize}px</span>
          </div>
        </div>

        <div className="ag-section">
          <div className="ag-section-title">ASCII Density</div>
          <div className="ag-slider-row">
            <input
              type="range"
              min={20}
              max={90}
              value={Math.round(params.asciiDensity * 100)}
              onChange={(e) => handleParamChange({ asciiDensity: Number(e.target.value) / 100 })}
            />
            <span>{Math.round(params.asciiDensity * 100)}%</span>
          </div>
        </div>

        <div className="ag-section">
          <div className="ag-section-title">Gradient Mode</div>
          <select
            className="ag-mode-select"
            value={params.gradientMode}
            onChange={(e) => handleParamChange({ gradientMode: e.target.value as GradientMode })}
          >
            <option value="brightness">Brightness-mapped</option>
            <option value="top-to-bottom">Top to Bottom</option>
            <option value="radial">Radial from Center</option>
            <option value="diagonal">Diagonal</option>
          </select>
        </div>

        <div className="ag-section">
          <div className="ag-section-title">Color Palette</div>
          <div className="ag-palette-grid">
            {BRAND_PALETTES.map((palette) => {
              const isActive = !isCustomPalette &&
                params.gradientStops.length === palette.stops.length &&
                palette.stops.every((s, i) =>
                  s.color[0] === params.gradientStops[i]?.color[0] &&
                  s.color[1] === params.gradientStops[i]?.color[1] &&
                  s.color[2] === params.gradientStops[i]?.color[2]
                );
              const gradientCSS = `linear-gradient(135deg, ${palette.stops
                .map((s, i) => `rgb(${s.color.join(',')}) ${Math.round((i / (palette.stops.length - 1)) * 100)}%`)
                .join(', ')})`;
              return (
                <button
                  key={palette.id}
                  className={`ag-palette-swatch ${isActive ? 'active' : ''}`}
                  onClick={() => handlePaletteSelect(palette.stops)}
                  title={palette.label}
                >
                  <div className="ag-palette-preview" style={{ background: gradientCSS }} />
                  <span className="ag-palette-label">{palette.label}</span>
                </button>
              );
            })}

            {/* Custom palette button */}
            <button
              className={`ag-palette-swatch ${isCustomPalette ? 'active' : ''}`}
              onClick={handleCustomColors}
              title="Custom"
            >
              <div className="ag-palette-preview" style={{
                background: `linear-gradient(135deg, ${customColorStart}, ${customColorEnd})`
              }} />
              <span className="ag-palette-label">Custom</span>
            </button>
          </div>

          {/* Custom color pickers — visible when custom is selected */}
          {isCustomPalette && (
            <div className="ag-custom-colors">
              <div className="ag-color-row">
                <label>Start</label>
                <input
                  type="color"
                  value={customColorStart}
                  onChange={(e) => setCustomColorStart(e.target.value)}
                />
              </div>
              <div className="ag-color-row">
                <label>End</label>
                <input
                  type="color"
                  value={customColorEnd}
                  onChange={(e) => setCustomColorEnd(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Mask controls */}
        {mask && (
          <div className="ag-section">
            <div className="ag-section-title">Subject Mask</div>
            <div className="ag-mask-buttons">
              <button onClick={removeLastPoint} disabled={points.length === 0}>
                Undo Click
              </button>
              <button onClick={clearMask}>
                Clear Mask
              </button>
            </div>
          </div>
        )}

        {/* Export */}
        <div className="ag-section">
          <button
            className="ag-export-btn"
            onClick={handleExport}
            disabled={!buffer || !mask || isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export PNG'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify page compiles**

Run: `cd /Users/joeom/websiteplab && npx tsc --noEmit 2>&1 | grep ascii-gradient`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add app/tools/ascii-gradient/
git commit -m "feat(ascii-gradient): add page component with controls panel and CSS"
```

---

### Task 5: CSS Styling

**Files:**
- Create: `app/tools/ascii-gradient/ascii-gradient.css`

- [ ] **Step 1: Create the stylesheet**

Build the CSS following the mosaic tool's dark theme. Reference `app/tools/mosaic/mosaic.css` for exact color values and spacing patterns. Key classes:

- `.ag-container`: `display: flex; height: 100vh; background: #13141a;`
- `.ag-canvas-area`: `flex: 1; display: flex; align-items: center; justify-content: center; position: relative;`
- `.ag-controls`: `width: 280px; background: #1e2028; overflow-y: auto; padding: 16px; border-left: 1px solid #2a2d38;`
- `.ag-upload-zone`: drag-and-drop area with dashed border
- `.ag-section`: `margin-bottom: 20px;`
- `.ag-section-title`: `font-size: 13px; color: #c4c7d0; margin-bottom: 8px;`
- `.ag-slider-row`: flex row with range input + value label
- `.ag-palette-grid`: grid of palette swatches (4 columns)
- `.ag-palette-swatch`: clickable swatch with gradient preview and label
- `.ag-mode-select`: dark dropdown matching panel style
- `.ag-export-btn`: full-width blue accent button
- `.ag-status-bar`: absolute bottom overlay with semi-transparent background
- `.ag-custom-colors`: color picker row layout
- `.ag-mask-buttons`: button group for undo/clear mask

- [ ] **Step 2: Verify the page renders**

Run: `cd /Users/joeom/websiteplab && npm run dev &` then navigate to `http://localhost:3000/tools/ascii-gradient`
Expected: Dark themed page loads with upload zone visible, controls panel on right

- [ ] **Step 3: Commit**

```bash
git add app/tools/ascii-gradient/ascii-gradient.css
git commit -m "feat(ascii-gradient): add dark theme styling matching mosaic tool"
```

---

### Task 6: Integration Testing and Polish

**Files:**
- Modify: `app/tools/ascii-gradient/hooks/useAsciiGradientRenderer.ts` (if bugs found)
- Modify: `app/tools/ascii-gradient/page.tsx` (if bugs found)

- [ ] **Step 1: Test image upload and SAM mask creation**

1. Open `http://localhost:3000/tools/ascii-gradient`
2. Upload a portrait or product image
3. Wait for SAM model to load (progress indicator should appear)
4. Click on the subject — frosted pixel effect should appear on subject only
5. Right-click to exclude areas — mask should update
6. Verify background remains untouched

- [ ] **Step 2: Test gradient modes**

1. Switch between all four gradient modes in the dropdown
2. **Brightness-mapped**: ASCII colors should follow the image's light/dark areas
3. **Top-to-bottom**: ASCII should transition from palette start (top) to end (bottom)
4. **Radial**: ASCII should glow from center of subject outward
5. **Diagonal**: ASCII should sweep diagonally

- [ ] **Step 3: Test controls**

1. Cell size slider: pixels should get larger/smaller, ASCII scales with them
2. Density slider: more/fewer ASCII characters visible
3. Palette presets: each should change the ASCII color gradient
4. Custom colors: pick two colors, ASCII gradient should reflect them

- [ ] **Step 4: Test PNG export**

1. Click Export PNG
2. File should download as `ascii-gradient-TIMESTAMP.png`
3. Open exported PNG — should match canvas at full resolution

- [ ] **Step 5: Fix any bugs found during testing**

Address issues and re-test.

- [ ] **Step 6: Commit final state**

```bash
git add -A
git commit -m "feat(ascii-gradient): integration testing and polish"
```

---

### Task Summary

| Task | Description | Files | Dependencies |
|------|-------------|-------|-------------|
| 1 | Gradient mode utilities | `gradientModes.ts` | None |
| 2 | Core rendering hook | `useAsciiGradientRenderer.ts` | Task 1 |
| 3 | Canvas component | `AsciiGradientCanvas.tsx` | Task 2 |
| 4 | Page + controls | `page.tsx` | Tasks 2, 3 |
| 5 | CSS styling | `ascii-gradient.css` | Task 4 |
| 6 | Integration test | All files | Tasks 1-5 |
