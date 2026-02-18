import { adjustBrightness, rgbString, rgbToHsl, hslToRgb } from './colorMapping';

// Multiple character sets per density tier — picks pseudo-randomly per cell for variety.
// 5 tiers from sparse (bright) to dense (dark), each with several character options.
const ASCII_TIERS = [
  [' '],                         // tier 0: brightest — blank
  ['·', ':', '~', '-'],          // tier 1: light
  ['+', '×', '=', '*', '÷'],    // tier 2: mid-light
  ['#', '%', '$', '&', 'X'],    // tier 3: mid-dark
  ['@', 'W', 'M', '█', '■'],   // tier 4: darkest — heaviest
];


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
 * White text with dark outline + colored glow — visible on ANY background.
 */
export function drawAsciiChar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cellSize: number,
  brightness: number,
  opacity: number,
  fillR = 128, fillG = 128, fillB = 128
): void {
  // Pick density tier — skip tier 0 (blank), so every cell gets a character.
  // Remap brightness to tiers 1–4 only.
  const tierIdx = Math.min(
    ASCII_TIERS.length - 1,
    Math.max(1, Math.floor((1 - brightness / 255) * ASCII_TIERS.length))
  );
  const tier = ASCII_TIERS[tierIdx];

  // Pseudo-random pick within the tier based on cell position (deterministic, no flicker)
  const hash = ((cx * 7919) + (cy * 104729)) >>> 0;
  const char = tier[hash % tier.length];

  const fontSize = Math.max(8, cellSize * 1.6);
  ctx.font = `bold ${fontSize}px "SF Mono", "Fira Code", "Courier New", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Colored glow from the cell's own color
  const [glowR, glowG, glowB] = adjustBrightness(fillR, fillG, fillB, 1.8);
  ctx.shadowColor = `rgb(${glowR}, ${glowG}, ${glowB})`;
  ctx.shadowBlur = cellSize * 0.8;

  // White fill
  ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
  ctx.fillText(char, cx, cy);

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}
