export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return [h, s, l];
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

export function interpolateColor(
  color1: [number, number, number],
  color2: [number, number, number],
  t: number
): [number, number, number] {
  const [h1, s1, l1] = rgbToHsl(...color1);
  const [h2, s2, l2] = rgbToHsl(...color2);

  // Shortest-path hue interpolation
  let dh = h2 - h1;
  if (dh > 0.5) dh -= 1;
  if (dh < -0.5) dh += 1;

  const h = h1 + dh * t;
  const s = s1 + (s2 - s1) * t;
  const l = l1 + (l2 - l1) * t;

  return hslToRgb(h < 0 ? h + 1 : h, s, l);
}

export function brightnessToGradientColor(
  brightness: number,
  darkColor: [number, number, number],
  lightColor: [number, number, number]
): [number, number, number] {
  const t = brightness / 255;
  return interpolateColor(darkColor, lightColor, t);
}

/**
 * Multi-stop gradient: maps brightness (0–255) across N evenly-spaced color stops.
 * E.g., 5 stops at brightness 0, 63.75, 127.5, 191.25, 255
 */
export function multiStopGradientColor(
  brightness: number,
  stops: [number, number, number][]
): [number, number, number] {
  if (stops.length === 0) return [0, 0, 0];
  if (stops.length === 1) return stops[0];

  const t = brightness / 255;
  const segments = stops.length - 1;
  const segIndex = Math.min(Math.floor(t * segments), segments - 1);
  const segT = (t * segments) - segIndex;

  return interpolateColor(stops[segIndex], stops[segIndex + 1], segT);
}

export function adjustBrightness(
  r: number, g: number, b: number,
  factor: number
): [number, number, number] {
  const [h, s, l] = rgbToHsl(r, g, b);
  const newL = Math.min(1, Math.max(0, l * factor));
  return hslToRgb(h, s, newL);
}

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

export function rgbString(r: number, g: number, b: number, a = 1): string {
  return a === 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`;
}

// ── Hero Gradient (ported from GLSL hero shader) ──

/** Cubic smoothstep easing: 0→0, 0.5→0.5, 1→1 with smooth acceleration/deceleration */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/** Linear RGB interpolation (matches GLSL mix) */
function mixRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

// 5 brand colors cycling over 30 seconds
const HERO_BRAND_COLORS: [number, number, number][] = [
  [186, 85, 211],   // Orchid
  [255, 160, 122],  // Salmon
  [185, 233, 121],  // Green
  [64, 224, 208],   // Turquoise
  [0, 0, 255],      // Blue
];

const HERO_CYCLE_DURATION = 30; // seconds

/**
 * Returns the current brand color from a 30-second cycle.
 * 5 segments (6s each), cubic smoothstep easing between colors.
 */
export function getHeroPeakColor(timeSec: number): [number, number, number] {
  const t = (timeSec % HERO_CYCLE_DURATION) / HERO_CYCLE_DURATION; // 0–1
  const segments = HERO_BRAND_COLORS.length;
  const segIndex = Math.min(Math.floor(t * segments), segments - 1);
  const segT = smoothstep((t * segments) - segIndex);
  const nextIndex = (segIndex + 1) % segments;
  return mixRgb(HERO_BRAND_COLORS[segIndex], HERO_BRAND_COLORS[nextIndex], segT);
}

/**
 * Maps brightness (0–255) through the hero 5-zone ramp using the given peak color.
 * Port of GLSL computeGradient(gp, peak):
 *   0.00–0.04: near-black → deep (peak * 0.06)
 *   0.04–0.18: deep → mid (peak * 0.35)
 *   0.18–0.45: mid → hot (peak * 1.0)
 *   0.45–0.72: hot → wash (50% toward white)
 *   0.72–1.00: wash → white
 */
export function heroGradientColor(
  brightness: number,
  peakColor: [number, number, number]
): [number, number, number] {
  const gp = brightness / 255; // normalized 0–1
  const black: [number, number, number] = [0, 0, 0];
  const deep: [number, number, number] = [peakColor[0] * 0.06, peakColor[1] * 0.06, peakColor[2] * 0.06];
  const mid: [number, number, number] = [peakColor[0] * 0.35, peakColor[1] * 0.35, peakColor[2] * 0.35];
  const hot: [number, number, number] = peakColor;
  const wash: [number, number, number] = mixRgb(peakColor, [255, 255, 255], 0.5);
  const white: [number, number, number] = [255, 255, 255];

  if (gp < 0.04) {
    return mixRgb(black, deep, smoothstep(gp / 0.04));
  } else if (gp < 0.18) {
    return mixRgb(deep, mid, smoothstep((gp - 0.04) / 0.14));
  } else if (gp < 0.45) {
    return mixRgb(mid, hot, smoothstep((gp - 0.18) / 0.27));
  } else if (gp < 0.72) {
    return mixRgb(hot, wash, smoothstep((gp - 0.45) / 0.27));
  } else {
    return mixRgb(wash, white, smoothstep((gp - 0.72) / 0.28));
  }
}
