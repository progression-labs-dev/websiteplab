import { adjustBrightness, rgbString, rgbToHsl, hslToRgb } from './colorMapping';

// ASCII density ramp: from lightest (bright areas) to densest (dark areas)
const ASCII_RAMP = ' .·:;=+*#%@';


/**
 * Draw a flat pixel block with optional inner bevel for a tactile retro feel.
 */
export function drawPixelBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  r: number, g: number, b: number,
  bevel = true
): void {
  ctx.fillStyle = rgbString(r, g, b);
  ctx.fillRect(x, y, size, size);

  if (bevel && size >= 6) {
    // Top-left highlight (lighter)
    const [hr, hg, hb] = adjustBrightness(r, g, b, 1.35);
    ctx.fillStyle = rgbString(hr, hg, hb, 0.45);
    ctx.fillRect(x, y, size, 1);
    ctx.fillRect(x, y, 1, size);

    // Bottom-right shadow (darker)
    const [sr, sg, sb] = adjustBrightness(r, g, b, 0.6);
    ctx.fillStyle = rgbString(sr, sg, sb, 0.45);
    ctx.fillRect(x, y + size - 1, size, 1);
    ctx.fillRect(x + size - 1, y, 1, size);
  }
}

/**
 * Draw a 3D convex-shaded circle using radial gradient.
 * Highlight top-left, shadow at edge → pillowy bubble effect.
 */
export function drawConvexCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  r: number, g: number, b: number
): void {
  // Highlight offset: 25% toward top-left
  const hlX = cx - radius * 0.25;
  const hlY = cy - radius * 0.25;
  const hlRadius = radius * 0.35;

  const grad = ctx.createRadialGradient(hlX, hlY, hlRadius, cx, cy, radius);

  // Highlight: brighter version of the color
  const [hr, hg, hb] = adjustBrightness(r, g, b, 1.6);
  // Shadow: darker at the edge
  const [sr, sg, sb] = adjustBrightness(r, g, b, 0.45);

  grad.addColorStop(0, rgbString(hr, hg, hb));
  grad.addColorStop(0.55, rgbString(r, g, b));
  grad.addColorStop(1, rgbString(sr, sg, sb));

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
}

/**
 * Draw an ASCII character centered on a cell, chosen by brightness.
 * Bright pixels → sparse chars, dark pixels → dense chars.
 */
export function drawAsciiChar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cellSize: number,
  brightness: number,
  opacity: number
): void {
  // Map brightness (0=dark, 255=bright) to ramp index
  // Invert: dark areas get dense characters, bright areas get sparse ones
  const idx = Math.floor((1 - brightness / 255) * (ASCII_RAMP.length - 1));
  const char = ASCII_RAMP[Math.min(idx, ASCII_RAMP.length - 1)];

  if (char === ' ') return; // skip blank

  const fontSize = Math.max(6, cellSize * 1.4);
  ctx.font = `bold ${fontSize}px "SF Mono", "Fira Code", "Courier New", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
  ctx.fillText(char, cx, cy);
}
