import { useCallback, useRef } from 'react';
import { ImageBuffer, sampleColorAt, getBrightness } from '../utils/imageProcessing';
import { multiStopGradientColor } from '../utils/colorMapping';
import { drawPixelBlock, drawConvexCircle, drawAsciiChar } from '../utils/shapes';

export type ShapeMode = 'pixel' | 'circle';
export type ColorMode = 'original' | 'gradient';
export type BgMode = 'black' | 'white' | 'transparent';
export type MaskMode = 'none' | 'split' | 'subject' | 'auto';

export interface GradientStop {
  color: [number, number, number];
  label: string;
}

export interface MosaicParams {
  shapeMode: ShapeMode;
  cellSize: number;
  spacing: number;
  threshold: number;
  invertThreshold: boolean;
  colorMode: ColorMode;
  gradientStops: GradientStop[];
  bgMode: BgMode;
  asciiEnabled: boolean;
  asciiOpacity: number; // 0-1
  // Mask mode: 'none' = full effect, 'split' = geometric split, 'subject' = AI mask, 'auto' = brightness-based
  maskMode: MaskMode;
  // Split params (used when maskMode='split')
  splitEnabled: boolean;
  splitPosition: number;
  splitAngle: number;
  // Auto brightness mask params (used when maskMode='auto')
  autoBrightnessCutoff: number; // 0-255, pixels above this get the mosaic effect
  invertAutoMask: boolean;
}

// ── Brand Color Palettes ──
// Each palette maps image brightness (dark → light) to curated brand colors.
// 3-stop gradients: shadow color → accent → highlight.

export interface BrandPalette {
  id: string;
  label: string;
  stops: GradientStop[];
}

export const BRAND_PALETTES: BrandPalette[] = [
  {
    id: 'blue',
    label: 'Blue',
    stops: [
      { color: [8, 8, 48], label: 'Shadow' },
      { color: [0, 0, 255], label: 'Blue' },
      { color: [245, 245, 245], label: 'White Smoke' },
    ],
  },
  {
    id: 'purple',
    label: 'Purple',
    stops: [
      { color: [40, 12, 52], label: 'Shadow' },
      { color: [186, 85, 211], label: 'Orchid' },
      { color: [245, 245, 245], label: 'White Smoke' },
    ],
  },
  {
    id: 'green',
    label: 'Green',
    stops: [
      { color: [20, 38, 12], label: 'Shadow' },
      { color: [185, 233, 121], label: 'Green' },
      { color: [245, 245, 245], label: 'White Smoke' },
    ],
  },
  {
    id: 'turquoise',
    label: 'Turquoise',
    stops: [
      { color: [8, 32, 30], label: 'Shadow' },
      { color: [64, 224, 208], label: 'Turquoise' },
      { color: [245, 245, 245], label: 'White Smoke' },
    ],
  },
  {
    id: 'salmon',
    label: 'Salmon',
    stops: [
      { color: [52, 22, 16], label: 'Shadow' },
      { color: [255, 160, 122], label: 'Salmon' },
      { color: [245, 245, 245], label: 'White Smoke' },
    ],
  },
  {
    id: 'ocean',
    label: 'Ocean',
    stops: [
      { color: [8, 8, 48], label: 'Deep Navy' },
      { color: [0, 0, 255], label: 'Blue' },
      { color: [64, 224, 208], label: 'Turquoise' },
    ],
  },
  {
    id: 'sunset',
    label: 'Sunset',
    stops: [
      { color: [40, 12, 52], label: 'Deep Purple' },
      { color: [186, 85, 211], label: 'Orchid' },
      { color: [255, 160, 122], label: 'Salmon' },
    ],
  },
  {
    id: 'forest',
    label: 'Forest',
    stops: [
      { color: [8, 20, 18], label: 'Deep Teal' },
      { color: [64, 224, 208], label: 'Turquoise' },
      { color: [185, 233, 121], label: 'Green' },
    ],
  },
];

export const DEFAULT_GRADIENT_STOPS: GradientStop[] = BRAND_PALETTES[0].stops;

export const DEFAULT_PARAMS: MosaicParams = {
  shapeMode: 'circle',
  cellSize: 12,
  spacing: 0,
  threshold: 0,
  invertThreshold: false,
  colorMode: 'original',
  gradientStops: DEFAULT_GRADIENT_STOPS,
  bgMode: 'black',
  asciiEnabled: true,
  asciiOpacity: 0.85,
  maskMode: 'split',
  splitEnabled: true,
  splitPosition: 0.5,
  splitAngle: 45,
  autoBrightnessCutoff: 128,
  invertAutoMask: false,
};

/**
 * Determines if a point is on the "effect" side of the split line.
 * Simple half-plane test — works at any angle, no polygon needed.
 */
function isOnEffectSide(
  x: number, y: number,
  width: number, height: number,
  position: number, angleDeg: number
): boolean {
  const rad = (angleDeg * Math.PI) / 180;
  const nx = Math.cos(rad);
  const ny = Math.sin(rad);
  const cx = position * width;
  const cy = position * height;
  const dot = (x - cx) * nx + (y - cy) * ny;
  return dot >= 0;
}

export function useMosaicRenderer() {
  const rafId = useRef<number>(0);

  const render = useCallback((
    canvas: HTMLCanvasElement,
    buffer: ImageBuffer,
    params: MosaicParams,
    subjectMask?: Uint8Array | null
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = buffer;
    canvas.width = width;
    canvas.height = height;

    const {
      shapeMode, cellSize, spacing, threshold, invertThreshold,
      colorMode, gradientStops, bgMode, asciiEnabled, asciiOpacity,
      maskMode, splitPosition, splitAngle,
      autoBrightnessCutoff, invertAutoMask,
    } = params;

    // Derive effective mask modes
    const useSplit = maskMode === 'split';
    const useSubject = maskMode === 'subject' && !!subjectMask;
    const useAuto = maskMode === 'auto';

    // Compute mask lookup dimensions — handles resolution mismatch during video playback.
    // The mask may have been computed at full resolution while the buffer is at preview scale.
    let maskW = width, maskH = height;
    if (subjectMask && subjectMask.length !== width * height) {
      maskH = Math.round(Math.sqrt(subjectMask.length * height / width));
      maskW = Math.round(subjectMask.length / maskH);
      // Guard against rounding drift
      if (maskW * maskH !== subjectMask.length) {
        maskH = Math.round(subjectMask.length / maskW);
      }
    }

    // Step 1: Draw original image as the base layer
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

    // Step 2: Render mosaic cells
    const step = cellSize * 2 + spacing;
    const cols = Math.ceil(width / step);
    const rows = Math.ceil(height / step);

    // For 'none' mode, fill background over entire canvas
    // For 'subject'/'auto' modes, keep the original image — only overlay mosaic on masked cells
    if (!useSplit && !useSubject && !useAuto) {
      if (bgMode !== 'transparent') {
        ctx.fillStyle = bgMode === 'black' ? '#000' : '#fff';
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    }

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cellX = col * step + cellSize;
        const cellY = row * step + cellSize;

        if (cellX >= width || cellY >= height) continue;

        // Mask checks — each mode has its own skip logic
        if (useSplit && !isOnEffectSide(cellX, cellY, width, height, splitPosition, splitAngle)) {
          continue;
        }

        if (useSubject) {
          const mx = Math.round(cellX * maskW / width);
          const my = Math.round(cellY * maskH / height);
          const maskIdx = my * maskW + mx;
          if (maskIdx < 0 || maskIdx >= subjectMask.length || subjectMask[maskIdx] === 0) continue;
        }

        const [r, g, b] = sampleColorAt(buffer, cellX, cellY);
        const brightness = getBrightness(r, g, b);

        // Auto brightness mask: only mosaic bright/light areas, keep dark areas as original
        // If a subject mask is present (user clicked to refine), also require it
        if (useAuto) {
          const passesBrightness = invertAutoMask
            ? brightness <= autoBrightnessCutoff
            : brightness >= autoBrightnessCutoff;
          if (!passesBrightness) continue;

          // Subject mask refinement: further filter auto-selected cells
          if (subjectMask) {
            const mx = Math.round(cellX * maskW / width);
            const my = Math.round(cellY * maskH / height);
            const maskIdx = my * maskW + mx;
            if (maskIdx >= 0 && maskIdx < subjectMask.length && subjectMask[maskIdx] === 0) continue;
          }
        }

        // Threshold check
        const passesThreshold = invertThreshold
          ? brightness <= threshold
          : brightness >= threshold;

        if (!passesThreshold && threshold > 0) {
          continue;
        }

        // Determine fill color
        let fillR = r, fillG = g, fillB = b;
        if (colorMode === 'gradient') {
          [fillR, fillG, fillB] = multiStopGradientColor(brightness, gradientStops.map(s => s.color));
        }

        // Draw background behind this cell (in split, subject, or auto mode — per-cell, not full canvas)
        if (useSplit || useSubject || useAuto) {
          if (bgMode !== 'transparent') {
            ctx.fillStyle = bgMode === 'black' ? '#000' : '#fff';
            ctx.fillRect(cellX - cellSize - spacing / 2, cellY - cellSize - spacing / 2, cellSize * 2 + spacing, cellSize * 2 + spacing);
          }
        }

        // Draw shape
        if (shapeMode === 'pixel') {
          drawPixelBlock(ctx, cellX - cellSize, cellY - cellSize, cellSize * 2, fillR, fillG, fillB);
        } else {
          drawConvexCircle(ctx, cellX, cellY, cellSize, fillR, fillG, fillB);
        }

        // ASCII overlay
        if (asciiEnabled) {
          drawAsciiChar(ctx, cellX, cellY, cellSize, brightness, asciiOpacity, fillR, fillG, fillB);
        }
      }
    }
  }, []);

  const renderAnimated = useCallback((
    canvas: HTMLCanvasElement,
    buffer: ImageBuffer,
    params: MosaicParams,
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
