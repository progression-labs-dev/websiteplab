'use client'

import { useRef, useEffect } from 'react'
import { SHARED_START } from './sharedTime'
import { useTheme } from './ThemeProvider'

const vertexShaderSource = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

// Atmospheric gradient that fades UP from the bottom — same shader machinery as
// HeroGradientGL/PixelGradientCanvas, with the Y axis flipped so brightness sits
// at the bottom of the canvas (footer atmosphere).
const fragmentShaderSource = `
  precision highp float;
  uniform vec2 u_resolution; // CSS px (DPR-independent, matches HeroGradientGL.uResolution)
  uniform float u_time;
  uniform float u_light_mode; // 0 = dark, 1 = light (parchment floor + wash)
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
  }

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

  vec3 brandColor(int i) {
    if (i == 0) return vec3(0.729, 0.333, 0.827);
    if (i == 1) return vec3(1.000, 0.627, 0.478);
    if (i == 2) return vec3(0.725, 0.914, 0.475);
    if (i == 3) return vec3(0.251, 0.878, 0.816);
    return vec3(0.000, 0.000, 1.000);
  }

  // 14-state color cycle over 70s — matching HeroGradientGL exactly
  void cycleColors(float time, out vec3 peakA, out vec3 peakB) {
    vec3 cO = brandColor(0); vec3 cS = brandColor(1);
    vec3 cG = brandColor(2); vec3 cT = brandColor(3); vec3 cB = brandColor(4);

    // Extended palette — peak pairs for 5 additional themed states
    vec3 cGold        = vec3(0.722, 0.671, 0.220); // #B8AB38
    vec3 cVanilla     = vec3(0.878, 0.843, 0.580); // #E0D794
    vec3 cWine        = vec3(0.435, 0.114, 0.106); // #6F1D1B
    vec3 cAshGrey     = vec3(0.678, 0.741, 0.671); // #ADBDAB
    vec3 cBurntPeach  = vec3(0.886, 0.447, 0.357); // #E2725B
    vec3 cSoftApricot = vec3(1.000, 0.855, 0.725); // #FFDAB9
    vec3 cInferno     = vec3(0.667, 0.000, 0.012); // #AA0003
    vec3 cPeriwinkle  = vec3(0.749, 0.706, 0.863); // #BFB4DC
    vec3 cMagenta     = vec3(1.000, 0.000, 1.000); // #FF00FF
    vec3 cYellow      = vec3(1.000, 1.000, 0.000); // #FFFF00

    float progress = mod(time, 70.0) / 70.0;
    float seg = progress * 14.0;
    int idx = int(floor(seg));
    float t = ssmooth(seg - floor(seg));

    vec3 fA, fB, tA, tB;
    if (idx == 0)       { fA = cO;          fB = cO;           tA = cB;          tB = cS;           }
    else if (idx == 1)  { fA = cB;          fB = cS;           tA = cG;          tB = cG;           }
    else if (idx == 2)  { fA = cG;          fB = cG;           tA = cGold;       tB = cVanilla;     } // → Ancient Gild
    else if (idx == 3)  { fA = cGold;       fB = cVanilla;     tA = cO;          tB = cT;           } // bridge
    else if (idx == 4)  { fA = cO;          fB = cT;           tA = cS;          tB = cS;           }
    else if (idx == 5)  { fA = cS;          fB = cS;           tA = cBurntPeach; tB = cSoftApricot; } // → Terracotta Sunset
    else if (idx == 6)  { fA = cBurntPeach; fB = cSoftApricot; tA = cWine;       tB = cAshGrey;     } // → Vintage Hearth
    else if (idx == 7)  { fA = cWine;       fB = cAshGrey;     tA = cB;          tB = cT;           } // bridge
    else if (idx == 8)  { fA = cB;          fB = cT;           tA = cB;          tB = cB;           }
    else if (idx == 9)  { fA = cB;          fB = cB;           tA = cInferno;    tB = cPeriwinkle;  } // → Scarlet Glacier
    else if (idx == 10) { fA = cInferno;    fB = cPeriwinkle;  tA = cMagenta;    tB = cYellow;      } // → Retro Future
    else if (idx == 11) { fA = cMagenta;    fB = cYellow;      tA = cO;          tB = cG;           } // bridge
    else if (idx == 12) { fA = cO;          fB = cG;           tA = cT;          tB = cT;           }
    else                { fA = cT;          fB = cT;           tA = cO;          tB = cO;           }

    peakA = mix(fA, tA, t);
    peakB = mix(fB, tB, t);
  }

  // Gradient with noise-driven color swirl — matches HeroGradientGL.computeGradient.
  // Pass uv with Y already flipped to make brightness rise from the bottom.
  vec3 computeGradient(vec2 uv, float time, vec3 peakA, vec3 peakB) {
    float gp = uv.y;

    float n1 = vnoise(uv * 1.8 + vec2(time * 0.10, time * 0.07));
    float n2 = vnoise(uv * 3.5 + vec2(-time * 0.08, time * 0.12));
    float n3 = vnoise(uv * 6.0 + vec2(time * 0.15, -time * 0.06));
    float swirl = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;

    float verticalBias = smoothstep(0.05, 0.95, gp);
    float colorMix = clamp(verticalBias + (swirl - 0.5) * 1.0, 0.0, 1.0);
    vec3 peak = mix(peakA, peakB, colorMix);

    float wave = (vnoise(uv * 2.0 + vec2(time * 0.06, -time * 0.04)) - 0.5) * 0.06;
    float protection = smoothstep(0.0, 0.25, gp);
    gp = clamp(gp + wave * protection, 0.0, 1.0);

    // Light mode: hue-preserving deep companion (matches HeroGradientGL) →
    // peak → tint → parchment. gp=0 at canvas top, gp=1 at canvas bottom.
    if (u_light_mode > 0.5) {
      vec3 parchment = vec3(0.957, 0.945, 0.918);
      vec3 tint      = mix(peak, parchment, 0.6);

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

      // Footer: gp=0 at canvas top → gp=1 at canvas bottom. Wide peak→tint
      // transition so the pixel-mosaic has continuous colour variation across
      // the full canvas (matching Hero/FYF).
      float t1 = smoothstep(0.00, 0.12, gp);   // deepPeak → peak (thin top strip)
      float t2 = smoothstep(0.10, 0.92, gp);   // peak → tint (wide continuous transition)
      float t3 = smoothstep(0.92, 1.00, gp);   // tint → parchment (thin bottom band)

      vec3 color = mix(deepPeak, peak, t1);
      color = mix(color, tint, t2);
      color = mix(color, parchment, t3);
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
    // Footer is brightest at bottom — flip Y so gp=1 sits at the bottom edge
    vec2 uv = vec2(vUv.x, 1.0 - vUv.y);

    // === Mosaic Grid — 32 CSS px square blocks (UV-based, DPR-independent, matches hero) ===
    float blockPx = 32.0;
    vec2 grid = u_resolution / blockPx;
    vec2 cellId = floor(uv * grid);
    vec2 pixelUv = cellId / grid + vec2(0.5) / grid;

    // Footer note: uv has already been Y-flipped at top of main(), so adding
    // to pixelUv.y here samples a point further along the gradient (toward
    // gp=1 = parchment bottom in light, white wash in dark). Light mode
    // amplifies 3x so neighbouring blocks separate across the wide peak-to-tint
    // transition. Direction is consistent with Hero/FYF because we're working
    // in the same flipped uv space - gp grows in the same direction in all
    // three shaders.
    float colOffset = hash(vec2(cellId.x, 0.0)) * 0.035;
    float actualOffset = mix(colOffset, colOffset * 3.0, u_light_mode);
    pixelUv.y += actualOffset;

    vec3 peakA, peakB;
    cycleColors(u_time, peakA, peakB);

    vec3 smoothColor = computeGradient(uv, u_time, peakA, peakB);
    vec3 pixelColor = computeGradient(pixelUv, u_time, peakA, peakB);

    // Light mode: mix each block toward a saturated deepPeak reference. In the
    // footer the uv has been Y-flipped at top of main(), so deepPeak lives at
    // LOW gp (0.02..0.10) — the opposite of Hero/FYF where it's at HIGH gp.
    // This guarantees per-block dark/light contrast across the bright tint
    // area where the smooth gradient is otherwise too uniform for the mosaic
    // to read against parchment.
    if (u_light_mode > 0.5) {
      float blockHash = hash(cellId);
      vec2 satUv = vec2(pixelUv.x, mix(0.02, 0.10, blockHash));
      vec3 satRef = computeGradient(satUv, u_time, peakA, peakB);
      pixelColor = mix(pixelColor, satRef, 0.30 + 0.35 * blockHash);
    }

    // Diagonal shimmer — only mask, matches hero's no-mouse case
    float diag = (uv.x + 1.0 - uv.y) * 0.5;
    float shimmerSpeed = mix(0.25, 0.18, u_light_mode);
    float shimmerPos = fract(u_time * shimmerSpeed);
    float shimmerDist = abs(diag - shimmerPos);
    shimmerDist = min(shimmerDist, 1.0 - shimmerDist);
    float shimmerMask = exp(-shimmerDist * shimmerDist * 120.0) * 0.6;

    vec3 color = mix(smoothColor, pixelColor, shimmerMask);

    // Alpha — dark mode keeps the wavy mask that fades UP from a solid bottom
    // (atmospheric rise into black page bg).
    // Light mode forces alpha = 1.0; the colour ramp already fades to parchment
    // at the bottom of the canvas, so any blocky alpha variation just shows up
    // as grey pixel artefacts against the parchment page bg.
    float y = pixelUv.y;

    float wave = sin(pixelUv.x * 3.5 + 1.2 + u_time * 0.6) * 0.10
               + sin(pixelUv.x * 8.0 + 3.7 - u_time * 0.45) * 0.06
               + cos(pixelUv.x * 5.5 + 0.5 + u_time * 0.35) * 0.07
               + sin(pixelUv.x * 12.0 + u_time * 0.8) * 0.03;

    float rightPush = (smoothstep(0.4, 1.0, pixelUv.x)) * 0.15;
    float leftPush = (1.0 - smoothstep(0.0, 0.5, pixelUv.x)) * 0.08;
    float edgePush = leftPush + rightPush;

    float darkAlpha = smoothstep(-0.25, 0.55, y + wave + edgePush);
    float alpha = mix(darkAlpha, 1.0, u_light_mode);

    gl_FragColor = vec4(color, alpha);
  }
`

export default function FooterGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { isDark } = useTheme()
  const lightModeRef = useRef(isDark ? 0 : 1)

  // Keep ref in sync with current theme so render loop reads the latest value
  useEffect(() => {
    lightModeRef.current = isDark ? 0 : 1
  }, [isDark])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false })
    if (!gl) return

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return shader
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource)
    const program = gl.createProgram()
    if (!program || !vertexShader || !fragmentShader) return

    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    gl.useProgram(program)

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1])
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const positionLoc = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

    const resolutionLoc = gl.getUniformLocation(program, 'u_resolution')
    const timeLoc = gl.getUniformLocation(program, 'u_time')
    const lightModeLoc = gl.getUniformLocation(program, 'u_light_mode')

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(resolutionLoc, canvas.offsetWidth, canvas.offsetHeight)
    }
    window.addEventListener('resize', resize)
    resize()

    let animationFrameId: number
    const render = () => {
      gl.uniform1f(timeLoc, performance.now() / 1000.0 - SHARED_START)
      gl.uniform1f(lightModeLoc, lightModeRef.current)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      animationFrameId = requestAnimationFrame(render)
    }
    render()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 80,
        width: 'calc(100% - 160px)',
        height: '100%',
        display: 'block',
        zIndex: 0,
      }}
    />
  )
}
