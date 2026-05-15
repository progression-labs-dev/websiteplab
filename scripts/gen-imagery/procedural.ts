#!/usr/bin/env bun
// Procedural Node-canvas renderer — same hero pixel-block + glowing-ASCII effect
// as the browser /tools/mosaic page, run from the command line.
//
// Usage:
//   bun run gen:imagery:proc <slug> [--palette <id>] [--cell-size N] [--ascii-density 0–1] [--ascii-opacity 0–1] [--no-outline]
//
// Examples:
//   bun run gen:imagery:proc phoenix --palette blue
//   bun run gen:imagery:proc phoenix --palette purple --cell-size 24
//   bun run gen:imagery:proc owl --palette blue --ascii-density 0.5
//
// Input:  scripts/gen-imagery/cache/{slug}-base.png (Pass A silhouette, already on disk)
// Output: public/blog/{slug}-{palette}-proc.png

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createCanvas, loadImage } from '@napi-rs/canvas';

import { DEFAULT_PARAMS, drawGrain, renderProcedural, type SourceBuffer } from './render-node';
import { PALETTES, SUBJECTS, type PaletteId } from './subjects';

const PROJECT_ROOT = join(import.meta.dir, '..', '..');
const CACHE_DIR = join(import.meta.dir, 'cache');
const PUBLIC_BLOG = join(PROJECT_ROOT, 'public', 'blog');

interface CliArgs {
  slug: string;
  palette: PaletteId;
  cellSize: number;
  asciiDensity: number;
  asciiOpacity: number;
  outline: boolean;
  source?: string;
  blurRadius: number;
  split: boolean;
  splitX: number;
  glow: boolean;
  silhouetteMin: number;
  silhouetteMax: number;
  spacing: number;
  grain: boolean;
  maskSource?: string;
  rectMask: boolean;
  rectY: number;
  rectHeight: number;
  rectX?: number;
  rectWidth?: number;
  bgColor: string;
  circleMask: boolean;
  circleX?: number;
  circleY?: number;
  circleRadius?: number;
  // Multiple circles, format: "x1,y1,r1;x2,y2,r2;..." (all 0-1 fractions of canvas).
  circles?: string;
}

function parseArgs(): CliArgs {
  const argv = process.argv.slice(2);
  let slug: string | undefined;
  let palette: PaletteId = 'blue';
  let cellSize = DEFAULT_PARAMS.cellSize;
  let asciiDensity = DEFAULT_PARAMS.asciiFillRate;
  let asciiOpacity = DEFAULT_PARAMS.asciiOpacity;
  let outline = true;
  let source: string | undefined;
  let blurRadius = 32;
  let split = false;
  let splitX = 0.5;
  let glow = false;
  let silhouetteMin = DEFAULT_PARAMS.silhouetteMin;
  let silhouetteMax = DEFAULT_PARAMS.silhouetteMax;
  let spacing = DEFAULT_PARAMS.spacing;
  let grain = false;
  let maskSource: string | undefined;
  let rectMask = false;
  let rectY = 0.5;
  let rectHeight = 0.25;
  let rectX: number | undefined;
  let rectWidth: number | undefined;
  let bgColor = DEFAULT_PARAMS.bgColor;
  let circleMask = false;
  let circleX: number | undefined;
  let circleY: number | undefined;
  let circleRadius: number | undefined;
  let circles: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--palette') palette = argv[++i] as PaletteId;
    else if (a === '--cell-size') cellSize = parseInt(argv[++i], 10);
    else if (a === '--ascii-density') asciiDensity = parseFloat(argv[++i]);
    else if (a === '--ascii-opacity') asciiOpacity = parseFloat(argv[++i]);
    else if (a === '--no-outline') outline = false;
    else if (a === '--source') source = argv[++i];
    else if (a === '--blur-radius') blurRadius = parseInt(argv[++i], 10);
    else if (a === '--split') split = true;
    else if (a === '--split-x') splitX = parseFloat(argv[++i]);
    else if (a === '--glow') glow = true;
    else if (a === '--silhouette-min') silhouetteMin = parseInt(argv[++i], 10);
    else if (a === '--silhouette-max') silhouetteMax = parseInt(argv[++i], 10);
    else if (a === '--spacing') spacing = parseInt(argv[++i], 10);
    else if (a === '--grain') grain = true;
    else if (a === '--mask-source') maskSource = argv[++i];
    else if (a === '--rect-mask') rectMask = true;
    else if (a === '--rect-y') rectY = parseFloat(argv[++i]);
    else if (a === '--rect-height') rectHeight = parseFloat(argv[++i]);
    else if (a === '--rect-x') rectX = parseFloat(argv[++i]);
    else if (a === '--rect-width') rectWidth = parseFloat(argv[++i]);
    else if (a === '--bg-color') bgColor = argv[++i];
    else if (a === '--circle-mask') circleMask = true;
    else if (a === '--circle-x') circleX = parseFloat(argv[++i]);
    else if (a === '--circle-y') circleY = parseFloat(argv[++i]);
    else if (a === '--circle-radius') circleRadius = parseFloat(argv[++i]);
    else if (a === '--circles') circles = argv[++i];
    else if (!a.startsWith('--')) slug = a;
  }

  if (!slug) {
    console.error('Usage: bun run gen:imagery:proc <slug> [--palette <id>] [--cell-size N] [--ascii-density 0–1] [--source <path>] [--blur-radius N] [--split] [--split-x 0–1]');
    console.error('Slugs:    ', SUBJECTS.map((s) => s.slug).join(', '));
    console.error('Palettes: ', Object.keys(PALETTES).join(', '));
    process.exit(1);
  }
  if (!PALETTES[palette]) {
    console.error(`Unknown palette "${palette}". Available:`, Object.keys(PALETTES).join(', '));
    process.exit(1);
  }
  if (!Number.isFinite(cellSize) || cellSize < 4) {
    console.error('--cell-size must be an integer ≥ 4');
    process.exit(1);
  }
  if (!Number.isFinite(blurRadius) || blurRadius < 0) {
    console.error('--blur-radius must be a non-negative integer (0 to disable)');
    process.exit(1);
  }
  if (!Number.isFinite(splitX) || splitX <= 0 || splitX >= 1) {
    console.error('--split-x must be a fraction strictly between 0 and 1');
    process.exit(1);
  }

  return { slug, palette, cellSize, asciiDensity, asciiOpacity, outline, source, blurRadius, split, splitX, glow, silhouetteMin, silhouetteMax, spacing, grain, maskSource, rectMask, rectY, rectHeight, rectX, rectWidth, bgColor, circleMask, circleX, circleY, circleRadius, circles };
}

// Find the leftmost / rightmost columns where the source has bright pixels —
// used to size the rect-mask to the subject's horizontal extent.
function findHorizontalBbox(buf: SourceBuffer, threshold: number): { left: number; right: number } {
  const { data, width, height } = buf;
  let left = width;
  let right = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (lum >= threshold) {
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }
  if (right < 0) return { left: 0, right: width - 1 };
  return { left, right };
}

// Find the full bbox (left, right, top, bottom) where the source has bright pixels.
function findBbox(buf: SourceBuffer, threshold: number): { left: number; right: number; top: number; bottom: number } {
  const { data, width, height } = buf;
  let left = width, right = -1, top = height, bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (lum >= threshold) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  if (right < 0) return { left: 0, right: width - 1, top: 0, bottom: height - 1 };
  return { left, right, top, bottom };
}

// Synthesise a binary mask buffer that's white inside one or more circles
// (union) and black elsewhere. Pure TypeScript — no AI involvement; only the
// underlying photograph is AI-generated.
interface Circle { x: number; y: number; r: number }
function buildCircleMask(w: number, h: number, circles: Circle[]): SourceBuffer {
  const data = new Uint8ClampedArray(w * h * 4);
  for (const c of circles) {
    const r2 = c.r * c.r;
    const x0 = Math.max(0, Math.floor(c.x - c.r));
    const x1 = Math.min(w, Math.ceil(c.x + c.r));
    const y0 = Math.max(0, Math.floor(c.y - c.r));
    const y1 = Math.min(h, Math.ceil(c.y + c.r));
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const dx = x - c.x, dy = y - c.y;
        if (dx * dx + dy * dy <= r2) {
          const i = (y * w + x) * 4;
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
          data[i + 3] = 255;
        }
      }
    }
  }
  return { data, width: w, height: h };
}

// Parse `"x1,y1,r1;x2,y2,r2;..."` (all 0..1 fractions of canvas) into Circle list.
function parseCirclesArg(s: string, w: number, h: number): Circle[] {
  return s.split(';').filter(Boolean).map((triplet) => {
    const [xs, ys, rs] = triplet.split(',').map((v) => parseFloat(v.trim()));
    return { x: xs * w, y: ys * h, r: rs * w };
  });
}

// Synthesise a binary mask buffer that's white inside the rect and black elsewhere.
function buildRectMask(w: number, h: number, rx: number, ry: number, rw: number, rh: number): SourceBuffer {
  const data = new Uint8ClampedArray(w * h * 4);
  const x0 = Math.max(0, Math.floor(rx));
  const y0 = Math.max(0, Math.floor(ry));
  const x1 = Math.min(w, Math.floor(rx + rw));
  const y1 = Math.min(h, Math.floor(ry + rh));
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * w + x) * 4;
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }
  }
  return { data, width: w, height: h };
}

async function main() {
  const args = parseArgs();
  const inputPath = args.source
    ? (args.source.startsWith('/') ? args.source : join(PROJECT_ROOT, args.source))
    : join(CACHE_DIR, `${args.slug}-base.png`);
  if (!existsSync(inputPath)) {
    console.error(`Missing input silhouette: ${inputPath}`);
    if (!args.source) {
      console.error(`Run 'bun run gen:imagery ${args.slug} --pass-a-only' first to generate it, or pass --source <path>.`);
    }
    process.exit(1);
  }

  console.log(`→ loading silhouette: ${inputPath.replace(PROJECT_ROOT + '/', '')}`);
  const img = await loadImage(inputPath);
  const width = img.width;
  const height = img.height;

  // Extract source pixels via an offscreen canvas
  const srcCanvas = createCanvas(width, height);
  const srcCtx = srcCanvas.getContext('2d');
  srcCtx.drawImage(img, 0, 0);
  const imgData = srcCtx.getImageData(0, 0, width, height);
  const source: SourceBuffer = {
    data: imgData.data as unknown as Uint8ClampedArray,
    width,
    height,
  };

  // Optional explicit mask source — used when the colour source's brightness
  // pattern can't isolate the subject (e.g. spotted jaguar in dappled jungle).
  // Expected to be a clean binary-ish image where the subject reads bright on
  // a near-black background.
  let maskSourceBuf: SourceBuffer | undefined;
  if (args.maskSource) {
    const maskPath = args.maskSource.startsWith('/')
      ? args.maskSource
      : join(PROJECT_ROOT, args.maskSource);
    if (!existsSync(maskPath)) {
      console.error(`Missing mask source: ${maskPath}`);
      process.exit(1);
    }
    const maskImg = await loadImage(maskPath);
    const mc = createCanvas(width, height);
    const mctx = mc.getContext('2d');
    // Stretch to match the canvas if dims differ; assumes mask and photo share
    // composition (Gemini renders both from same scene description).
    mctx.drawImage(maskImg, 0, 0, width, height);
    const mData = mctx.getImageData(0, 0, width, height);
    maskSourceBuf = {
      data: mData.data as unknown as Uint8ClampedArray,
      width,
      height,
    };
    console.log(`→ loading mask source: ${maskPath.replace(PROJECT_ROOT + '/', '')}`);
  }

  // Pre-blurred copy used only for colour sampling — matches the hero's smooth
  // gradient-driven block-to-block coherence. The mask still uses the sharp
  // unblurred source so wing-tip edges stay crisp.
  let colorSource: SourceBuffer | undefined;
  if (args.blurRadius > 0) {
    const blurCanvas = createCanvas(width, height);
    const blurCtx = blurCanvas.getContext('2d');
    blurCtx.filter = `blur(${args.blurRadius}px)`;
    blurCtx.drawImage(srcCanvas, 0, 0);
    const blurData = blurCtx.getImageData(0, 0, width, height);
    colorSource = {
      data: blurData.data as unknown as Uint8ClampedArray,
      width,
      height,
    };
  }

  // Render to the output canvas
  const out = createCanvas(width, height);
  const ctx = out.getContext('2d');

  const paletteStops = PALETTES[args.palette].map((s) => s.color);
  const outlineColor = paletteStops[paletteStops.length - 1]; // highlight stop

  const splitPx = args.split ? Math.floor(width * args.splitX) : 0;
  console.log(
    `→ rendering ${args.slug} · palette=${args.palette} · ${width}×${height} · cell=${args.cellSize}px · blur=${args.blurRadius}px${args.split ? ` · split@x=${splitPx}` : ''}`,
  );

  const renderParams = {
    ...DEFAULT_PARAMS,
    cellSize: args.cellSize,
    spacing: args.spacing,
    silhouetteMin: args.silhouetteMin,
    silhouetteMax: args.silhouetteMax,
    bgColor: args.bgColor,
    paletteStops,
    outlineColor,
    asciiOpacity: args.asciiOpacity,
    asciiFillRate: args.asciiDensity,
    outlineWidth: args.outline ? DEFAULT_PARAMS.outlineWidth : 0,
    blockGlow: args.glow,
  };

  if (args.circleMask) {
    // Flora poster variant — one or more circles overlaid on the photo. Each
    // circle becomes a pocket of pixel-ASCII. Pure TS: no AI for mask, the
    // user (or a default heuristic) provides circle coords.
    ctx.drawImage(srcCanvas, 0, 0);
    let circleList: Circle[];
    if (args.circles) {
      // Explicit multi-circle list: "x1,y1,r1;x2,y2,r2;..."
      circleList = parseCirclesArg(args.circles, width, height);
    } else {
      // Single-circle defaults. If a mask source exists, anchor to its bbox;
      // otherwise default to canvas centre.
      let cxDefault = width / 2;
      let cyDefault = height / 2;
      let rDefault = width * 0.2;
      if (maskSourceBuf) {
        const bbox = findBbox(maskSourceBuf, 128);
        cxDefault = (bbox.left + bbox.right) / 2;
        cyDefault = (bbox.top + bbox.bottom) / 2;
        rDefault = (bbox.right - bbox.left) * 0.4;
      }
      const cx = args.circleX !== undefined ? args.circleX * width : cxDefault;
      const cy = args.circleY !== undefined ? args.circleY * height : cyDefault;
      const r = args.circleRadius !== undefined ? args.circleRadius * width : rDefault;
      circleList = [{ x: cx, y: cy, r }];
    }
    console.log(`→ circle-mask: ${circleList.length} circle(s) — ${circleList.map((c) => `(${c.x.toFixed(0)},${c.y.toFixed(0)},${c.r.toFixed(0)})`).join(' ')}`);
    const synthMask = buildCircleMask(width, height, circleList);
    renderProcedural(ctx, source, { ...renderParams, skipBackground: true, silhouetteMin: 1, silhouetteMax: 255 }, colorSource, synthMask);
  } else if (args.rectMask) {
    // Flora-poster composition: photo across the entire canvas, then a horizontal
    // rectangle band of pixel-ASCII slicing across the subject. Width is either
    // a manual --rect-x/--rect-width override OR auto-derived from the Gemini
    // mask bbox. Height comes from --rect-height. Outside the rect the photo
    // stays untouched.
    ctx.drawImage(srcCanvas, 0, 0);
    const rectHpx = Math.floor(args.rectHeight * height);
    const rectTop = Math.floor(args.rectY * height - rectHpx / 2);
    let rectLeft: number;
    let rectW: number;
    if (args.rectX !== undefined && args.rectWidth !== undefined) {
      rectLeft = Math.floor(args.rectX * width);
      rectW = Math.floor(args.rectWidth * width);
    } else {
      if (!maskSourceBuf) {
        console.error('--rect-mask without --rect-x/--rect-width requires --mask-source (used to find the subject bbox)');
        process.exit(1);
      }
      const bbox = findHorizontalBbox(maskSourceBuf, 128);
      rectLeft = bbox.left;
      rectW = bbox.right - bbox.left;
    }
    console.log(`→ rect-mask: x=${rectLeft} y=${rectTop} w=${rectW} h=${rectHpx}`);
    const synthMask = buildRectMask(width, height, rectLeft, rectTop, rectW, rectHpx);
    renderProcedural(ctx, source, { ...renderParams, skipBackground: true, silhouetteMin: 1, silhouetteMax: 255 }, colorSource, synthMask);
  } else if (args.split) {
    // Left half: the photo itself, including any atmospheric background. We
    // draw across the FULL canvas first so the right half also retains the
    // photo background — the procedural pixel-ASCII then paints over the
    // silhouette only, leaving the atmospheric backdrop visible.
    ctx.drawImage(srcCanvas, 0, 0);
    // Clip to right half so procedural passes can't leak into the photo half.
    ctx.save();
    ctx.beginPath();
    ctx.rect(splitPx, 0, width - splitPx, height);
    ctx.clip();
    // Skip the bg fill so the photo we just drew stays visible outside the mask.
    renderProcedural(ctx, source, { ...renderParams, skipBackground: true }, colorSource, maskSourceBuf);
    ctx.restore();
  } else {
    renderProcedural(ctx, source, renderParams, colorSource, maskSourceBuf);
  }

  // Grain overlay matching the hero's feTurbulence layer (40% overlay) — applied
  // last and OUTSIDE the split clip so it unifies both photo half and procedural
  // half, exactly like the hero's ::after grain covers the entire frame.
  if (args.grain) {
    drawGrain(ctx, width, height, 0.2);
  }

  // Filename rules:
  //   --split          → {slug}-{palette}-split.png  (curated composition)
  //   --source (no split) → {slug}-{palette}.png     (curated recolour)
  //   neither          → {slug}-{palette}-proc.png   (cache-fed experiments)
  //   --glow           appends `-glow` before the extension (preserves the non-glow render alongside)
  let outName: string;
  let outDir = PUBLIC_BLOG;
  if (args.circleMask) {
    outName = `${args.slug}-circle.png`;
    outDir = join(PUBLIC_BLOG, 'flora');
  } else if (args.rectMask) {
    outName = `${args.slug}.png`;
    outDir = join(PUBLIC_BLOG, 'flora');
  } else if (args.split) {
    outName = `${args.slug}-${args.palette}-split.png`;
  } else if (args.source) {
    outName = `${args.slug}-${args.palette}.png`;
  } else {
    outName = `${args.slug}-${args.palette}-proc.png`;
  }
  if (args.glow && !args.rectMask && !args.circleMask) outName = outName.replace(/\.png$/, '-glow.png');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, outName);
  const buffer = await out.encode('png');
  writeFileSync(outPath, buffer);
  const kb = (buffer.byteLength / 1024).toFixed(0);
  console.log(`✓ wrote ${outPath.replace(PROJECT_ROOT + '/', '')} (${kb} KB)`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
