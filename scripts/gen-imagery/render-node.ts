// Node-canvas port of app/tools/mosaic/{utils/shapes,hooks/useMosaicRenderer}.
// Same algorithm — same outputs — just runs against @napi-rs/canvas instead of
// the browser Canvas2D and reads pixels from a Buffer instead of an ImageBitmap.

import { createCanvas, type SKRSContext2D } from '@napi-rs/canvas';
import { getBrightness, multiStopGradientColor, rgbString, type RGB } from './color-mapping';

// Hero-style charset (exact match: app/tools/mosaic/utils/shapes.ts:4)
export const ASCII_CHARSET = '0123456789@#$%&*+=?<>{}[]/\\|LABS';

function posHash(x: number, y: number): number {
  return ((x * 7919 + y * 104729) >>> 0) / 4294967296;
}

export interface SourceBuffer {
  data: Uint8ClampedArray; // RGBA
  width: number;
  height: number;
}

function sampleColorAt(buf: SourceBuffer, x: number, y: number): RGB {
  const px = Math.min(buf.width - 1, Math.max(0, Math.floor(x)));
  const py = Math.min(buf.height - 1, Math.max(0, Math.floor(y)));
  const i = (py * buf.width + px) * 4;
  return [buf.data[i], buf.data[i + 1], buf.data[i + 2]];
}

function drawPixelBlock(
  ctx: SKRSContext2D,
  x: number, y: number, size: number,
  r: number, g: number, b: number,
): void {
  ctx.fillStyle = rgbString(r, g, b);
  ctx.fillRect(x, y, size, size);
}

// Mirrors shapes.ts:drawAsciiChar, plus a second halo pass that emulates the
// hero's CSS `filter: drop-shadow(0 0 4px rgba(255,255,255,0.4))` (which we
// can't apply at PNG-render time). Hashes use the cell-index pair (col,row)
// instead of pixel coordinates so the charset distribution doesn't collapse
// when cellSize divides evenly into the modulus.
function drawAsciiChar(
  ctx: SKRSContext2D,
  col: number, row: number,
  cx: number, cy: number,
  cellSize: number,
  opacity: number,
  fillRate: number,
): void {
  if (posHash(col, row) > fillRate) return;

  const charIdx = ((col * 7919 + row * 104729) >>> 0) % ASCII_CHARSET.length;
  const char = ASCII_CHARSET[charIdx];

  // Per-glyph brightness jitter, mirrors AsciiOverlay.tsx (Math.random()*0.5+0.5)
  // but seeded from (col,row) so re-runs are deterministic.
  const brightness = 0.5 + posHash(col + 911, row + 1373) * 0.5;

  // Bumped above the hero's 0.375 ratio so glyphs read more prominently —
  // the user explicitly wants the ASCII to be louder rather than a faint
  // sparkle field.
  const fontSize = Math.max(8, cellSize * 0.95);
  ctx.font = `500 ${fontSize}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const prevComposite = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'overlay';

  // Outer halo — wide soft bloom that bleeds well beyond the glyph cell.
  ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
  ctx.shadowBlur = 22;
  ctx.fillStyle = `rgba(255, 255, 255, ${opacity * brightness * 0.35})`;
  ctx.fillText(char, cx, cy);

  // Inner halo — bakes the live site's CSS drop-shadow layer into pixels.
  ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
  ctx.shadowBlur = 12;
  ctx.fillStyle = `rgba(255, 255, 255, ${opacity * brightness * 0.6})`;
  ctx.fillText(char, cx, cy);

  // Crisp pass — sharp glyph with a tight shadow.
  ctx.shadowColor = 'rgba(255, 255, 255, 0.85)';
  ctx.shadowBlur = 6;
  ctx.fillStyle = `rgba(255, 255, 255, ${opacity * brightness})`;
  ctx.fillText(char, cx, cy);

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.globalCompositeOperation = prevComposite;
}

export interface RenderParams {
  cellSize: number;             // half-block; full block = cellSize * 2
  spacing: number;              // gap between blocks
  bgColor: string;              // background fill ('#000' for our use case)
  paletteStops: RGB[];          // 3 stops (shadow / mid / highlight)
  silhouetteMin: number;        // brightness >= this counts as "inside"
  silhouetteMax: number;        // brightness <= this counts as "inside" (filters out white-wall mockups)
  asciiOpacity: number;         // 0–1
  asciiFillRate: number;        // 0–1, what fraction of cells get a glyph
  outlineWidth: number;         // px, 0 to disable
  outlineColor: RGB;            // typically the highlight palette stop
  blockGlow?: boolean;          // when true, each block bakes a brightness-modulated shadow halo in its own colour (LED-screen look)
  skipBackground?: boolean;     // when true, don't fill the canvas with bgColor — caller is expected to have drawn something (e.g. the source photo) underneath
}

export const DEFAULT_PARAMS: Omit<RenderParams, 'paletteStops'> = {
  cellSize: 32,                 // → 64px full block; on a 2048-px source ~32 cells across (matches the phoenix-v3 reference density)
  spacing: 0,
  bgColor: '#000000',
  silhouetteMin: 8,             // low enough to retain deep-shadow plum pixels (~brightness 18) inside the silhouette
  silhouetteMax: 254,           // only excludes pure-white background (Gemini "poster on wall"); keeps near-white ASCII glyphs in v3-source renders
  asciiOpacity: 0.85,
  asciiFillRate: 0.4,
  outlineWidth: 3,
  outlineColor: [245, 245, 245],
};

// Build a binary mask (1 = inside silhouette, 0 = background).
function buildMask(src: SourceBuffer, minB: number, maxB: number): Uint8Array {
  const mask = new Uint8Array(src.width * src.height);
  for (let i = 0, p = 0; i < src.data.length; i += 4, p++) {
    const b = getBrightness(src.data[i], src.data[i + 1], src.data[i + 2]);
    mask[p] = (b >= minB && b <= maxB) ? 1 : 0;
  }
  return mask;
}

function maskAt(mask: Uint8Array, x: number, y: number, w: number, h: number): number {
  if (x < 0 || y < 0 || x >= w || y >= h) return 0;
  return mask[y * w + x];
}

export function renderProcedural(
  ctx: SKRSContext2D,
  source: SourceBuffer,
  params: RenderParams,
  colorSource?: SourceBuffer,
  maskSource?: SourceBuffer,
): void {
  const { width, height } = source;
  // Silhouette comes from the unblurred source (sharp edges); colours come from
  // the optional pre-blurred copy (smooth tile transitions). Fall back to the
  // single source for both when no separate colour buffer is supplied.
  const colorBuf = colorSource ?? source;

  // Background (skipped when the caller has already drawn a photo underneath
  // — used by split-mode to preserve photographic atmosphere outside the
  // silhouette).
  if (!params.skipBackground) {
    ctx.fillStyle = params.bgColor;
    ctx.fillRect(0, 0, width, height);
  }

  // Silhouette mask source priority:
  //   1. Explicit `maskSource` (e.g. a separate Gemini-generated binary mask of
  //      a complex scene where brightness-only masking on the colour source
  //      can't isolate the subject — e.g. a spotted jaguar in dappled jungle).
  //   2. Pre-blurred colour buffer (when distinct from `source`) — smooths
  //      small interior shadow patches into the silhouette for simple subjects.
  //   3. Unblurred source — default.
  const maskSrc = maskSource ?? (colorSource && colorSource !== source ? colorSource : source);
  const mask = buildMask(maskSrc, params.silhouetteMin, params.silhouetteMax);

  const fullBlock = params.cellSize * 2;
  const step = fullBlock + params.spacing;
  const cols = Math.ceil(width / step);
  const rows = Math.ceil(height / step);

  // PASS 1 — coloured pixel blocks inside the silhouette
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cellX = col * step + params.cellSize;
      const cellY = row * step + params.cellSize;
      if (cellX >= width || cellY >= height) continue;

      // Mask test at cell centre
      if (!maskAt(mask, Math.floor(cellX), Math.floor(cellY), width, height)) continue;

      // Same per-column y-offset as the browser renderer
      const colHash = Math.abs((Math.sin(col * 127.1) * 43758.5453123) % 1);
      const sampleY = Math.min(cellY + colHash * 0.035 * params.cellSize, height - 1);

      const [sr, sg, sb] = sampleColorAt(colorBuf, cellX, sampleY);
      const brightness = getBrightness(sr, sg, sb);
      const [fr, fg, fb] = multiStopGradientColor(brightness, params.paletteStops);

      // LED-screen glow: bake a brightness-modulated shadow in the block's own
      // colour so highlight cells bloom and shadow cells stay anchored. Two
      // fills compound the shadow stamp for a louder/blown-out bloom.
      if (params.blockGlow) {
        const blur = params.cellSize * 1.8 * (brightness / 255);
        if (blur > 0.5) {
          ctx.shadowColor = rgbString(fr, fg, fb);
          ctx.shadowBlur = blur;
        }
      }

      drawPixelBlock(
        ctx,
        cellX - params.cellSize, cellY - params.cellSize,
        fullBlock,
        fr, fg, fb,
      );

      if (params.blockGlow) {
        // Second fill — the shadow stamps again, doubling halo intensity. This
        // is what pushes bright cells into the overexposed-LED look from the
        // aespa reference rather than just a soft drop-shadow.
        drawPixelBlock(
          ctx,
          cellX - params.cellSize, cellY - params.cellSize,
          fullBlock,
          fr, fg, fb,
        );
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Per-block dark stroke recovers visible pixel-grid structure in
        // uniform-colour interior regions where overlapping glow halos would
        // otherwise wash out block boundaries. Always visible regardless of
        // underlying cell colour because alpha is low and tone is darker than
        // any palette stop.
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.20)';
        ctx.lineWidth = 1;
        ctx.strokeRect(
          cellX - params.cellSize, cellY - params.cellSize,
          fullBlock, fullBlock,
        );
      }
    }
  }

  // PASS 1.5 — hero MosaicOverlay (8px white grid at 3% alpha). Scaled up to
  // 16px / 8% for our 2048-px output so the screen-door texture survives the
  // downscale onto a blog card.
  drawMosaicGrid(ctx, mask, width, height);

  // PASS 2 — sparse glowing ASCII overlay, identical to hero
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cellX = col * step + params.cellSize;
      const cellY = row * step + params.cellSize;
      if (cellX >= width || cellY >= height) continue;
      if (!maskAt(mask, Math.floor(cellX), Math.floor(cellY), width, height)) continue;
      drawAsciiChar(ctx, col, row, cellX, cellY, params.cellSize, params.asciiOpacity, params.asciiFillRate);
    }
  }

  // PASS 3 — silhouette outline. Stroke the boundary in highlight colour.
  if (params.outlineWidth > 0) {
    drawOutline(ctx, mask, width, height, params);
  }
}

// Approximation of the hero's SVG feTurbulence grain (experiment.css:296-305 —
// baseFrequency 0.65, 3 octaves, fractalNoise, opacity 0.4, mix-blend-mode
// overlay). At the viewing distance for blog cards, per-pixel random grayscale
// noise reads visually identical to multi-octave fractalNoise. Implements as a
// one-shot offscreen-canvas + drawImage with composite 'overlay' so it works
// in @napi-rs/canvas without SVG filter support.
export function drawGrain(
  ctx: SKRSContext2D,
  w: number, h: number,
  alpha = 0.4,
): void {
  const noise = createCanvas(w, h);
  const noiseCtx = noise.getContext('2d');
  const img = noiseCtx.createImageData(w, h);
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 255;
  }
  noiseCtx.putImageData(img, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = alpha;
  ctx.drawImage(noise, 0, 0);
  ctx.restore();
}

// Mirrors app/experiment/components/MosaicOverlay.tsx — the 8-px fine grid the
// hero stacks between the WebGL gradient and the ASCII overlay. We only paint
// cells that fall inside the silhouette mask, otherwise we'd dust the entire
// black background with white speckle.
function drawMosaicGrid(
  ctx: SKRSContext2D,
  mask: Uint8Array,
  w: number, h: number,
): void {
  // Ratio-matched to the hero MosaicOverlay (8 px / 3% on ~1400 px viewport).
  // 8/1400 = 0.57% of viewport width → 0.57% of our 2048-px canvas ≈ 12 px.
  const cell = 12;
  const alpha = 0.03;
  const gap = 1;
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
  for (let y = 0; y < h; y += cell) {
    for (let x = 0; x < w; x += cell) {
      const cx = Math.min(w - 1, x + (cell >> 1));
      const cy = Math.min(h - 1, y + (cell >> 1));
      if (!maskAt(mask, cx, cy, w, h)) continue;
      ctx.fillRect(x, y, cell - gap, cell - gap);
    }
  }
}

function drawOutline(
  ctx: SKRSContext2D,
  mask: Uint8Array,
  w: number, h: number,
  params: RenderParams,
): void {
  const [or, og, ob] = params.outlineColor;
  ctx.fillStyle = rgbString(or, og, ob);

  // Sample the mask at the cell-block resolution so the outline aligns with
  // the pixel-block edges rather than with the original photo's edge.
  const step = params.cellSize * 2 + params.spacing;
  const lw = params.outlineWidth;

  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const cx = Math.min(w - 1, x + params.cellSize);
      const cy = Math.min(h - 1, y + params.cellSize);
      const inside = maskAt(mask, cx, cy, w, h);
      if (!inside) continue;

      // Test 4 neighbours at cell-block stride
      const left   = maskAt(mask, cx - step, cy, w, h);
      const right  = maskAt(mask, cx + step, cy, w, h);
      const up     = maskAt(mask, cx, cy - step, w, h);
      const down   = maskAt(mask, cx, cy + step, w, h);

      const px = x;
      const py = y;
      const size = params.cellSize * 2;

      if (!left)  ctx.fillRect(px,                py,                lw,    size);
      if (!right) ctx.fillRect(px + size - lw,    py,                lw,    size);
      if (!up)    ctx.fillRect(px,                py,                size,  lw);
      if (!down)  ctx.fillRect(px,                py + size - lw,    size,  lw);
    }
  }
}
