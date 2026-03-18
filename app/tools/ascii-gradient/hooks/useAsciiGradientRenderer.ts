import { useCallback, useRef } from 'react';
import { ImageBuffer, sampleColorAt, getBrightness } from '../../mosaic/utils/imageProcessing';
import { multiStopGradientColor, rgbString } from '../../mosaic/utils/colorMapping';
import { drawPixelBlock } from '../../mosaic/utils/shapes';
import { GradientStop } from '../../mosaic/hooks/useMosaicRenderer';
import { GradientMode, getGradientPosition, computeSubjectCentroid, Centroid } from '../utils/gradientModes';

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

/**
 * Draw a single ASCII character with a colored glow effect.
 * Uses `screen` composite to additively blend the glow onto the image.
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
  brightness: number
): void {
  // Density gate — skip if hash exceeds density threshold
  const fillGate = posHash(cx, cy);
  if (fillGate > density) return;

  // Position-seeded character from ASCII_CHARSET
  const charIdx = ((cx * 7919 + cy * 104729) >>> 0) % ASCII_CHARSET.length;
  const char = ASCII_CHARSET[charIdx];

  const fontSize = Math.max(8, cellSize * 1.6);
  ctx.font = `500 ${fontSize}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Screen blend — additively blends glow onto background
  const prevComposite = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'screen';

  // Glow shadow
  ctx.shadowBlur = Math.min(8, Math.max(6, cellSize * 0.35));
  ctx.shadowColor = rgbString(gradR, gradG, gradB, 0.8);

  // Fill color: reduce opacity on bright areas to prevent screen-mode washout
  const fillOpacity = brightness > 200 ? 0.7 : 1;
  ctx.fillStyle = rgbString(gradR, gradG, gradB, fillOpacity);
  ctx.fillText(char, cx, cy);

  // Reset composite and shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.globalCompositeOperation = prevComposite;
}

export function useAsciiGradientRenderer() {
  const rafId = useRef<number>(0);
  const centroidRef = useRef<Centroid | null>(null);
  const lastMaskRef = useRef<Uint8Array | null>(null);

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

    // Cache centroid — only recompute when mask reference changes
    const maskRef = subjectMask ?? null;
    if (gradientMode === 'radial' && maskRef && maskRef !== lastMaskRef.current) {
      centroidRef.current = computeSubjectCentroid(maskRef, maskW, maskH);
      lastMaskRef.current = maskRef;
    } else if (!maskRef) {
      centroidRef.current = null;
      lastMaskRef.current = null;
    }
    const centroid = centroidRef.current ?? undefined;

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

    // If no mask, return early — just show original image
    if (!subjectMask) return;

    // Layer 2 + 3: Grid iteration — frosted pixel blocks with glowing ASCII
    const step = cellSize * 2;
    const stopColors = gradientStops.map(s => s.color);

    for (let cellY = cellSize; cellY < height; cellY += step) {
      for (let cellX = cellSize; cellX < width; cellX += step) {
        // Subject mask check: convert cell coords to mask space, skip if not in mask
        const mx = Math.round(cellX * maskW / width);
        const my = Math.round(cellY * maskH / height);
        const idx = my * maskW + mx;
        if (idx < 0 || idx >= subjectMask.length || subjectMask[idx] === 0) continue;

        // Sample color at cell center
        const [r, g, b] = sampleColorAt(buffer, cellX, cellY);
        const brightness = getBrightness(r, g, b);

        // Layer 2: Frosted glass pixel block
        drawPixelBlock(ctx, cellX - cellSize, cellY - cellSize, cellSize * 2, r, g, b);

        // Compute gradient position and map to color
        const gradPos = getGradientPosition(
          gradientMode, cellX, cellY, width, height,
          r, g, b, centroid, maskW, maskH
        );
        const [gradR, gradG, gradB] = multiStopGradientColor(gradPos, stopColors);

        // Layer 3: Glowing ASCII character
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
