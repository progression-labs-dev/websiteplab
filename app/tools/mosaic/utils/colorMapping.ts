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
