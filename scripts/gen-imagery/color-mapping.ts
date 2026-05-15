// Pure-JS port of app/tools/mosaic/utils/colorMapping.ts so it runs in Node.
// Logic is identical — only the import path changes.

export type RGB = [number, number, number];

function rgbToHsl(r: number, g: number, b: number): RGB {
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

function hslToRgb(h: number, s: number, l: number): RGB {
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

function interpolateColor(c1: RGB, c2: RGB, t: number): RGB {
  const [h1, s1, l1] = rgbToHsl(...c1);
  const [h2, s2, l2] = rgbToHsl(...c2);
  let dh = h2 - h1;
  if (dh > 0.5) dh -= 1;
  if (dh < -0.5) dh += 1;
  const h = h1 + dh * t;
  const s = s1 + (s2 - s1) * t;
  const l = l1 + (l2 - l1) * t;
  return hslToRgb(h < 0 ? h + 1 : h, s, l);
}

export function multiStopGradientColor(brightness: number, stops: RGB[]): RGB {
  if (stops.length === 0) return [0, 0, 0];
  if (stops.length === 1) return stops[0];
  const t = brightness / 255;
  const segments = stops.length - 1;
  const segIndex = Math.min(Math.floor(t * segments), segments - 1);
  const segT = (t * segments) - segIndex;
  return interpolateColor(stops[segIndex], stops[segIndex + 1], segT);
}

export function rgbString(r: number, g: number, b: number, a = 1): string {
  return a === 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`;
}

export function getBrightness(r: number, g: number, b: number): number {
  // Same luminance weights as the browser renderer.
  return 0.299 * r + 0.587 * g + 0.114 * b;
}
