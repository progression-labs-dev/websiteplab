import { adjustBrightness, rgbString, rgbToHsl, hslToRgb } from './colorMapping';

// Hero-style charset — position-seeded random pick (no brightness tiers)
const ASCII_CHARSET = '0123456789@#$%&*+=?<>{}[]/\\|LABS';

// Deterministic hash for position-seeded character selection + fill gating
function posHash(x: number, y: number): number {
  return ((x * 7919 + y * 104729) >>> 0) / 4294967296; // 0-1 float
}

/**
 * Draw a flat pixel block — clean, modern, no bevel.
 */
export function drawPixelBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  r: number, g: number, b: number,
  _bevel = true
): void {
  ctx.fillStyle = rgbString(r, g, b);
  ctx.fillRect(x, y, size, size);
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
 * Draw a hero-style ASCII character: sparse fill, overlay blend, Inter font.
 * ~40% of cells get a character; the rest are skipped for organic gaps.
 * Uses globalCompositeOperation 'overlay' so text absorbs the background color.
 */
export function drawAsciiChar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cellSize: number,
  _brightness: number,
  opacity: number,
  _fillR = 128, _fillG = 128, _fillB = 128
): void {
  // 40% fill rate — skip ~60% of cells for sparse organic look
  const fillGate = posHash(cx, cy);
  if (fillGate > 0.4) return;

  // Position-seeded character from the full charset (no brightness tiers)
  const charIdx = ((cx * 7919 + cy * 104729) >>> 0) % ASCII_CHARSET.length;
  const char = ASCII_CHARSET[charIdx];

  const fontSize = Math.max(8, cellSize * 1.6);
  ctx.font = `500 ${fontSize}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Overlay blend — text absorbs the image colors underneath
  const prevComposite = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'overlay';

  // White glow (subtle, fixed 4px blur)
  ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
  ctx.shadowBlur = 4;

  // White fill
  ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
  ctx.fillText(char, cx, cy);

  // Reset
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.globalCompositeOperation = prevComposite;
}
