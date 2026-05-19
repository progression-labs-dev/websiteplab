import React, { useRef, useEffect } from 'react';
import { SHARED_START } from './sharedTime';

const vertexShaderSource = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;
  uniform vec2 u_resolution; // CSS pixels (DPR-independent, matches HeroGradientGL.uResolution)
  uniform float u_time;
  uniform float u_light_mode; // 0 = dark, 1 = light (parchment floor + wash)
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  // Smooth 2D value noise (same as hero)
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float ssmooth(float t) { return t * t * (3.0 - 2.0 * t); }

  // Brand palette — same 5 colors as HeroGradientGL
  vec3 brandColor(int i) {
    if (i == 0) return vec3(0.729, 0.333, 0.827); // Orchid
    if (i == 1) return vec3(1.000, 0.627, 0.478); // Salmon
    if (i == 2) return vec3(0.725, 0.914, 0.475); // Green
    if (i == 3) return vec3(0.251, 0.878, 0.816); // Turquoise
    return vec3(0.000, 0.000, 1.000);              // Blue
  }

  // Blue-centric cycle (matches HeroGradientGL) — 10 segments over 50s.
  // peakA stays royal blue; peakB cycles through turquoise, baby pink,
  // peach, periwinkle, and light orange accents.
  void cycleColors(float time, out vec3 peakA, out vec3 peakB) {
    vec3 cBlue        = vec3(0.000, 0.000, 1.000);
    vec3 cTurquoise   = vec3(0.251, 0.878, 0.816);
    vec3 cPeriwinkle  = vec3(0.749, 0.706, 0.863);
    vec3 cBabyPink    = vec3(1.000, 0.785, 0.866);
    vec3 cPeach       = vec3(1.000, 0.855, 0.725);
    vec3 cLightOrange = vec3(1.000, 0.627, 0.478);

    // +25s phase offset so the cycle lands at the peach+blue phase on first
    // paint (matches HeroGradientGL — keeps both gradients in sync).
    float progress = mod(time + 25.0, 50.0) / 50.0;
    float seg = progress * 10.0;
    int idx = int(floor(seg));
    float t = ssmooth(seg - floor(seg));

    vec3 fA, fB, tA, tB;
    if (idx == 0)       { fA = cBlue; fB = cBlue;         tA = cBlue; tB = cTurquoise;   }
    else if (idx == 1)  { fA = cBlue; fB = cTurquoise;    tA = cBlue; tB = cBlue;        }
    else if (idx == 2)  { fA = cBlue; fB = cBlue;         tA = cBlue; tB = cBabyPink;    }
    else if (idx == 3)  { fA = cBlue; fB = cBabyPink;     tA = cBlue; tB = cBlue;        }
    else if (idx == 4)  { fA = cBlue; fB = cBlue;         tA = cBlue; tB = cPeach;       }
    else if (idx == 5)  { fA = cBlue; fB = cPeach;        tA = cBlue; tB = cBlue;        }
    else if (idx == 6)  { fA = cBlue; fB = cBlue;         tA = cBlue; tB = cPeriwinkle;  }
    else if (idx == 7)  { fA = cBlue; fB = cPeriwinkle;   tA = cBlue; tB = cBlue;        }
    else if (idx == 8)  { fA = cBlue; fB = cBlue;         tA = cBlue; tB = cLightOrange; }
    else                { fA = cBlue; fB = cLightOrange;  tA = cBlue; tB = cBlue;        }

    peakA = mix(fA, tA, t);
    peakB = mix(fB, tB, t);
  }

  // Gradient with noise-driven color swirl — matches HeroGradientGL.computeGradient exactly
  vec3 computeGradient(vec2 uv, float time, vec3 peakA, vec3 peakB) {
    float gp = uv.y;

    // Color swirl between peakA and peakB — 3 octaves
    float n1 = vnoise(uv * 1.8 + vec2(time * 0.10, time * 0.07));
    float n2 = vnoise(uv * 3.5 + vec2(-time * 0.08, time * 0.12));
    float n3 = vnoise(uv * 6.0 + vec2(time * 0.15, -time * 0.06));
    float swirl = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;

    float verticalBias = smoothstep(0.05, 0.95, gp);
    float colorMix = clamp(verticalBias + (swirl - 0.5) * 1.0, 0.0, 1.0);
    // Dark mode: swirl-modulated blend of peakA and peakB (the dark ramp mutes
    // pure-peak regions so the swirl reads as subtle cloud variation).
    // Light mode: drop the peakA/peakB spatial split entirely — use peakA. The
    // wider light ramp keeps peak saturated through the middle of the canvas,
    // so the swirl-modulated peakA↔peakB boundary wobbles visibly as a "blob"
    // when the pair is hue-opposite (orchid+green, magenta+yellow). Single-peak
    // eliminates the boundary. Matches HeroGradientGL.
    vec3 peak = mix(mix(peakA, peakB, colorMix), peakA, u_light_mode);

    // Subtle luminance wave — bands aren't perfectly horizontal, bottom protected
    float wave = (vnoise(uv * 2.0 + vec2(time * 0.06, -time * 0.04)) - 0.5) * 0.06;
    float protection = smoothstep(0.0, 0.25, gp);
    gp = clamp(gp + wave * protection, 0.0, 1.0);

    // Light mode: hue-preserving deep companion at top → peak → tint →
    // parchment at bottom (matches HeroGradientGL). Yellow-shift fix prevents
    // muddy olive when the peak has R ≈ G.
    if (u_light_mode > 0.5) {
      vec3 parchment = vec3(1.0, 1.0, 1.0);

      float warmBias  = max(0.0, min(peak.r, peak.g) - peak.b);
      float yellowShift = warmBias * step(peak.g, peak.r);
      float greenShift  = warmBias * step(peak.r, peak.g) * (1.0 - step(peak.g, peak.r));
      vec3 hueShifted = vec3(
        peak.r * (1.0 - greenShift * 0.50),
        peak.g * (1.0 - yellowShift * 0.55),
        peak.b
      );

      vec3 darkened  = hueShifted * 0.45;
      float minCh    = min(min(darkened.r, darkened.g), darkened.b);
      vec3 deepPeak  = max(darkened - vec3(minCh * 0.55), vec3(0.0));

      // 5-zone ramp analogous to dark mode, inverted tonal direction
      // (parchment bottom → ultraDeep top). Transition widths copy dark mode
      // exactly so the gradient has continuous slope at every gp, making the
      // per-column y-offset mosaic visible across the full canvas. Matches
      // HeroGradientGL.
      vec3 wash      = mix(peak, parchment, 0.85);
      vec3 tint      = mix(peak, parchment, 0.55);
      vec3 ultraDeep = deepPeak * 0.65;

      float t1 = smoothstep(0.00, 0.10, gp);
      float t2 = smoothstep(0.06, 0.24, gp);
      float t3 = smoothstep(0.15, 0.55, gp);
      float t4 = smoothstep(0.45, 0.85, gp);
      float t5 = smoothstep(0.75, 1.00, gp);

      vec3 color = mix(parchment, wash, t1);
      color = mix(color, tint, t2);
      color = mix(color, peak, t3);
      color = mix(color, deepPeak, t4);
      color = mix(color, ultraDeep, t5);
      return color;
    }

    // Dark mode: original 5-zone ramp — UNCHANGED from the live site.
    vec3 deep = peak * 0.06;
    vec3 mid  = peak * 0.35;
    vec3 wash = mix(peak, vec3(1.0), 0.5);

    float t1 = smoothstep(0.00, 0.10, gp);
    float t2 = smoothstep(0.06, 0.24, gp);
    float t3 = smoothstep(0.15, 0.55, gp);
    float t4 = smoothstep(0.45, 0.85, gp);
    float t5 = smoothstep(0.75, 1.00, gp);

    vec3 color = mix(vec3(0.004), deep, t1);
    color = mix(color, mid, t2);
    color = mix(color, peak, t3);
    color = mix(color, wash, t4);
    color = mix(color, vec3(1.0), t5);
    return color;
  }

  void main() {
    vec2 uv = vUv;

    // === Mosaic Grid — 32 CSS px square blocks (UV-based, DPR-independent, matches hero) ===
    float blockPx = 32.0;
    vec2 grid = u_resolution / blockPx;
    vec2 cellId = floor(uv * grid);
    vec2 pixelUv = cellId / grid + vec2(0.5) / grid;

    // Per-column y-offset — matches hero (0.035). Same in both modes now that
    // the 5-zone light ramp provides continuous gradient slope.
    float colOffset = hash(vec2(cellId.x, 0.0)) * 0.035;
    pixelUv.y += colOffset;

    // === Color cycling (same 14-state 70s cycle as hero) ===
    vec3 peakA, peakB;
    cycleColors(u_time, peakA, peakB);

    // Smooth color (per-fragment — the clean gradient)
    vec3 smoothColor = computeGradient(uv, u_time, peakA, peakB);

    // Pixelated color (per-block — only revealed during shimmer)
    vec3 pixelColor = computeGradient(pixelUv, u_time, peakA, peakB);

    // === DIAGONAL SHIMMER — only mask, matches hero's no-mouse case ===
    float diag = (uv.x + 1.0 - uv.y) * 0.5;
    float shimmerSpeed = 0.25;
    float shimmerPos = fract(u_time * shimmerSpeed);
    float shimmerDist = abs(diag - shimmerPos);
    shimmerDist = min(shimmerDist, 1.0 - shimmerDist);
    float shimmerMask = exp(-shimmerDist * shimmerDist * 120.0) * 0.6;

    // Mix smooth gradient with pixel-quantized color along the shimmer band
    vec3 color = mix(smoothColor, pixelColor, shimmerMask);

    // === Alpha — solid at top, wavy fade toward bottom ===
    float y = pixelUv.y;

    // Wavy edge — deeper dips, organic living movement
    float wave = sin(pixelUv.x * 3.5 + 1.2 + u_time * 0.6) * 0.18
               + sin(pixelUv.x * 8.0 + 3.7 - u_time * 0.45) * 0.10
               + cos(pixelUv.x * 5.5 + 0.5 + u_time * 0.35) * 0.12
               + sin(pixelUv.x * 12.0 + u_time * 0.8) * 0.05;

    // Both sides extend further down — pixels reach the bottom
    float leftPush = (1.0 - smoothstep(0.0, 0.75, pixelUv.x)) * 0.85;
    float rightPush = (1.0 - smoothstep(0.4, 1.0, pixelUv.x)) * 0.25;
    float edgePush = leftPush + rightPush;

    // Dark mode keeps the wavy/pixelated alpha mask (atmospheric fade into black bg).
    // Light mode forces alpha=1.0 — the colour ramp already fades to parchment at
    // the bottom, so any blocky alpha variation just shows up as grey pixel
    // artefacts against the parchment page bg.
    float darkAlpha = smoothstep(-0.55, 0.50, y + wave + edgePush);
    float alpha = mix(darkAlpha, 1.0, u_light_mode);

    gl_FragColor = vec4(color, alpha);
  }
`;

interface PixelGradientCanvasProps {
  lightMode?: boolean;
}

export default function PixelGradientCanvas({ lightMode = false }: PixelGradientCanvasProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Ensure alpha is enabled so it fades seamlessly over your black background
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Compile Shaders
    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = gl.createProgram();
    if (!program || !vertexShader || !fragmentShader) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Setup Geometry (Full screen quad)
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const lightModeLoc = gl.getUniformLocation(program, 'u_light_mode');

    // Handle Resize — viewport in device px, but pass CSS px to shader so the grid
    // is DPR-independent (matches HeroGradientGL.uResolution semantics)
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolutionLoc, canvas.offsetWidth, canvas.offsetHeight);
    };
    window.addEventListener('resize', resize);
    resize();

    // Render Loop
    let animationFrameId: number;
    const render = () => {
      gl.uniform1f(timeLoc, performance.now() / 1000.0 - SHARED_START);
      gl.uniform1f(lightModeLoc, lightMode ? 1.0 : 0.0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [lightMode]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        zIndex: 0,
      }}
    />
  );
}
