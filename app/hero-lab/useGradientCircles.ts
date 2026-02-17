import { useEffect, useRef, useCallback } from 'react';

// --- Blob definitions matching CSS gradient layer ---
interface GradientBlob {
  x: number; y: number; radius: number;
  r: number; g: number; b: number; baseAlpha: number;
  drift: { ax: number; ay: number; freq: number; phase: number };
  breathe: { min: number; max: number; freq: number; phase: number };
  hueShift: { range: number; freq: number; phase: number };
}

const BLOBS: GradientBlob[] = [
  { x: 1.08, y: -0.15, radius: 0.55, r: 186, g: 85, b: 211, baseAlpha: 0.90,
    drift: { ax: 50, ay: 35, freq: 0.05, phase: 0 }, breathe: { min: 0.5, max: 1.0, freq: 0.07, phase: 0 }, hueShift: { range: 18, freq: 0.028, phase: 0 } },
  { x: -0.05, y: 0.0, radius: 0.50, r: 255, g: 140, b: 90, baseAlpha: 0.92,
    drift: { ax: 40, ay: 45, freq: 0.045, phase: 1.5 }, breathe: { min: 0.55, max: 1.0, freq: 0.063, phase: 0.8 }, hueShift: { range: 20, freq: 0.025, phase: 1 } },
  { x: 0.35, y: -0.05, radius: 0.42, r: 255, g: 165, b: 60, baseAlpha: 0.85,
    drift: { ax: 50, ay: 40, freq: 0.055, phase: 0.7 }, breathe: { min: 0.5, max: 1.0, freq: 0.083, phase: 2.2 }, hueShift: { range: 15, freq: 0.026, phase: 0.5 } },
  { x: -0.08, y: -0.22, radius: 0.38, r: 0, g: 0, b: 255, baseAlpha: 0.45,
    drift: { ax: 45, ay: 35, freq: 0.042, phase: 2 }, breathe: { min: 0.4, max: 1.0, freq: 0.067, phase: 1.2 }, hueShift: { range: 25, freq: 0.024, phase: 2.5 } },
  { x: 0.10, y: 1.18, radius: 0.52, r: 64, g: 224, b: 208, baseAlpha: 0.85,
    drift: { ax: 35, ay: 45, freq: 0.055, phase: 0.5 }, breathe: { min: 0.6, max: 1.0, freq: 0.077, phase: 0.3 }, hueShift: { range: 18, freq: 0.033, phase: 1.8 } },
  { x: 1.0, y: 1.05, radius: 0.45, r: 185, g: 233, b: 121, baseAlpha: 0.78,
    drift: { ax: 40, ay: 50, freq: 0.05, phase: 3 }, breathe: { min: 0.45, max: 1.0, freq: 0.056, phase: 2.5 }, hueShift: { range: 25, freq: 0.021, phase: 0.8 } },
  { x: 0.85, y: 0.30, radius: 0.32, r: 186, g: 85, b: 211, baseAlpha: 0.55,
    drift: { ax: 45, ay: 30, freq: 0.038, phase: 1.8 }, breathe: { min: 0.35, max: 0.9, freq: 0.066, phase: 1.5 }, hueShift: { range: 0, freq: 0, phase: 0 } },
  { x: 0.30, y: 0.90, radius: 0.30, r: 255, g: 140, b: 90, baseAlpha: 0.55,
    drift: { ax: 40, ay: 40, freq: 0.045, phase: 2.5 }, breathe: { min: 0.45, max: 1.0, freq: 0.059, phase: 0.5 }, hueShift: { range: 0, freq: 0, phase: 0 } },
  { x: 0.65, y: 0.85, radius: 0.28, r: 255, g: 165, b: 60, baseAlpha: 0.48,
    drift: { ax: 35, ay: 35, freq: 0.036, phase: 1.2 }, breathe: { min: 0.4, max: 1.0, freq: 0.071, phase: 1.8 }, hueShift: { range: 0, freq: 0, phase: 0 } },
  { x: 0.45, y: 0.30, radius: 0.28, r: 64, g: 224, b: 208, baseAlpha: 0.40,
    drift: { ax: 35, ay: 30, freq: 0.033, phase: 0.8 }, breathe: { min: 0.65, max: 1.0, freq: 0.053, phase: 2 }, hueShift: { range: 0, freq: 0, phase: 0 } },
  { x: 0.75, y: 0.80, radius: 0.26, r: 185, g: 233, b: 121, baseAlpha: 0.42,
    drift: { ax: 30, ay: 35, freq: 0.042, phase: 2 }, breathe: { min: 0.4, max: 1.0, freq: 0.05, phase: 3 }, hueShift: { range: 0, freq: 0, phase: 0 } },
];

const CELL_SIZE = 34;
const CIRCLE_RADIUS = 17; // exactly half cell — touching, not overlapping
const RIPPLE_DURATION = 2000;

// Background color for "no color" reference
const BG_R = 250, BG_G = 250, BG_B = 250;

function rotateHue(r: number, g: number, b: number, degrees: number): [number, number, number] {
  const rad = (degrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return [
    Math.max(0, Math.min(255, Math.round(r * (0.213 + 0.787 * cos - 0.213 * sin) + g * (0.715 - 0.715 * cos - 0.715 * sin) + b * (0.072 - 0.072 * cos + 0.928 * sin)))),
    Math.max(0, Math.min(255, Math.round(r * (0.213 - 0.213 * cos + 0.143 * sin) + g * (0.715 + 0.285 * cos + 0.140 * sin) + b * (0.072 - 0.072 * cos - 0.283 * sin)))),
    Math.max(0, Math.min(255, Math.round(r * (0.213 - 0.213 * cos - 0.787 * sin) + g * (0.715 - 0.715 * cos + 0.715 * sin) + b * (0.072 + 0.928 * cos + 0.072 * sin)))),
  ];
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Cookie-cutter circle with slight dome shading.
 * Single radial gradient: sampled color at center → 5% darker at edge.
 * 100% opacity, sharp edges, no blur, no white overlay.
 */
function drawLensCircle(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, radius: number,
  r: number, g: number, b: number,
): void {
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  // Edge: 5% darker
  const er = Math.round(r * 0.95);
  const eg = Math.round(g * 0.95);
  const eb = Math.round(b * 0.95);
  grad.addColorStop(0, `rgb(${r},${g},${b})`);
  grad.addColorStop(1, `rgb(${er},${eg},${eb})`);

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
}

export function useGradientCircles(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);

  const render = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;
    const timeSec = timestamp / 1000;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // --- Offscreen gradient canvas (lower res for perf) ---
    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement('canvas');
    }
    const offscreen = offscreenRef.current;
    const sampleScale = 0.25;
    const sw = Math.ceil(w * sampleScale);
    const sh = Math.ceil(h * sampleScale);
    if (offscreen.width !== sw || offscreen.height !== sh) {
      offscreen.width = sw;
      offscreen.height = sh;
    }
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;

    // --- Draw gradient blobs to offscreen ---
    offCtx.fillStyle = `rgb(${BG_R},${BG_G},${BG_B})`;
    offCtx.fillRect(0, 0, sw, sh);

    for (const blob of BLOBS) {
      const { drift, breathe, hueShift } = blob;
      const driftX = Math.sin(timeSec * drift.freq + drift.phase) * drift.ax;
      const driftY = Math.cos(timeSec * drift.freq * 0.7 + drift.phase + 1) * drift.ay;
      const bx = (blob.x * w + driftX) * sampleScale;
      const by = (blob.y * h + driftY) * sampleScale;
      const br = blob.radius * Math.sqrt(w * w + h * h) * sampleScale;

      const breatheT = (Math.sin(timeSec * breathe.freq + breathe.phase) + 1) / 2;
      const opacity = breathe.min + (breathe.max - breathe.min) * breatheT;
      const alpha = blob.baseAlpha * opacity;

      let [cr, cg, cb] = [blob.r, blob.g, blob.b];
      if (hueShift.range > 0) {
        const hueDeg = Math.sin(timeSec * hueShift.freq + hueShift.phase) * hueShift.range;
        [cr, cg, cb] = rotateHue(cr, cg, cb, hueDeg);
      }

      const grad = offCtx.createRadialGradient(bx, by, 0, bx, by, br);
      grad.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha})`);
      grad.addColorStop(0.25, `rgba(${cr},${cg},${cb},${alpha * 0.55})`);
      grad.addColorStop(0.50, `rgba(${cr},${cg},${cb},${alpha * 0.15})`);
      grad.addColorStop(0.68, `rgba(${cr},${cg},${cb},0)`);
      offCtx.fillStyle = grad;
      offCtx.fillRect(0, 0, sw, sh);
    }

    const imageData = offCtx.getImageData(0, 0, sw, sh);
    const pixels = imageData.data;

    // --- Background: gradient 8% darker in diamond gaps ---
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(offscreen, 0, 0, sw, sh, 0, 0, w, h);
    ctx.fillStyle = `rgba(0,0,0,0.08)`;
    ctx.fillRect(0, 0, w, h);

    const cols = Math.ceil(w / CELL_SIZE) + 1;
    const rows = Math.ceil(h / CELL_SIZE) + 1;
    const centerX = w / 2;
    const centerY = h / 2;
    const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cx = col * CELL_SIZE + CELL_SIZE / 2;
        const cy = row * CELL_SIZE + CELL_SIZE / 2;

        // Ripple animation
        const dist = Math.sqrt((cx - centerX) ** 2 + (cy - centerY) ** 2);
        const normalizedDist = dist / maxDist;
        const circleDelay = normalizedDist * RIPPLE_DURATION * 0.8;
        const circleElapsed = elapsed - circleDelay;

        if (circleElapsed < 0) continue;

        const revealProgress = Math.min(1, circleElapsed / 400);
        const easedProgress = easeOutCubic(revealProgress);

        if (easedProgress < 0.01) continue;

        // Sample color from offscreen gradient
        const sx = Math.min(sw - 1, Math.max(0, Math.floor(cx * sampleScale)));
        const sy = Math.min(sh - 1, Math.max(0, Math.floor(cy * sampleScale)));
        const si = (sy * sw + sx) * 4;
        const sr = pixels[si];
        const sg = pixels[si + 1];
        const sb = pixels[si + 2];

        // Draw cookie-cutter circle
        ctx.globalAlpha = easedProgress;
        const r = CIRCLE_RADIUS * easedProgress;
        if (r > 0.5) {
          drawLensCircle(ctx, cx, cy, r, sr, sg, sb);
        }
      }
    }

    ctx.globalAlpha = 1;
    rafRef.current = requestAnimationFrame(render);
  }, [canvasRef]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [render]);
}
