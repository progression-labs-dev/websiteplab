import React, { useRef, useEffect } from 'react';

const vertexShaderSource = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;

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

  // 9-state color cycle over 45s — matching HeroGradientGL exactly
  void cycleColors(float time, out vec3 peakA, out vec3 peakB) {
    vec3 cO = brandColor(0); vec3 cS = brandColor(1);
    vec3 cG = brandColor(2); vec3 cT = brandColor(3); vec3 cB = brandColor(4);

    float progress = mod(time, 45.0) / 45.0;
    float seg = progress * 9.0;
    int idx = int(floor(seg));
    float t = ssmooth(seg - floor(seg));

    vec3 fA, fB, tA, tB;
    if (idx == 0)      { fA = cO; fB = cO; tA = cB; tB = cS; }
    else if (idx == 1) { fA = cB; fB = cS; tA = cG; tB = cG; }
    else if (idx == 2) { fA = cG; fB = cG; tA = cO; tB = cT; }
    else if (idx == 3) { fA = cO; fB = cT; tA = cS; tB = cS; }
    else if (idx == 4) { fA = cS; fB = cS; tA = cB; tB = cT; }
    else if (idx == 5) { fA = cB; fB = cT; tA = cB; tB = cB; }
    else if (idx == 6) { fA = cB; fB = cB; tA = cO; tB = cG; }
    else if (idx == 7) { fA = cO; fB = cG; tA = cT; tB = cT; }
    else               { fA = cT; fB = cT; tA = cO; tB = cO; }

    peakA = mix(fA, tA, t);
    peakB = mix(fB, tB, t);
  }

  // Gradient with noise-driven color swirl (same technique as hero)
  vec3 computeGradient(vec2 uv, float time, vec3 peakA, vec3 peakB) {
    float gp = uv.y;

    // Color swirl between peakA and peakB
    float n1 = vnoise(uv * 1.8 + vec2(time * 0.10, time * 0.07));
    float n2 = vnoise(uv * 3.5 + vec2(-time * 0.08, time * 0.12));
    float swirl = n1 * 0.6 + n2 * 0.4;

    float verticalBias = smoothstep(0.05, 0.95, gp);
    float colorMix = clamp(verticalBias + (swirl - 0.5) * 1.0, 0.0, 1.0);
    vec3 peak = mix(peakA, peakB, colorMix);

    // Luminance ramp: extends further down but doesn't wash out the top
    vec3 deep = peak * 0.08;
    vec3 mid  = peak * 0.35;

    float t1 = smoothstep(0.00, 0.10, gp);
    float t2 = smoothstep(0.05, 0.25, gp);
    float t3 = smoothstep(0.15, 0.55, gp);

    vec3 color = mix(vec3(0.004), deep, t1);
    color = mix(color, mid, t2);
    color = mix(color, peak * 0.8, t3);
    return color;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    // === Mosaic Grid — 45px blocks (same as hero) ===
    float blockPx = 45.0;
    vec2 grid = u_resolution / blockPx;
    vec2 cellId = floor(uv * grid);
    vec2 pixelUv = (cellId + 0.5) / grid;

    // Per-column offset
    float colOffset = hash(vec2(cellId.x, 0.0)) * 0.025;
    pixelUv.y += colOffset;

    // === Color cycling (same 9-state 45s cycle as hero) ===
    vec3 peakA, peakB;
    cycleColors(u_time, peakA, peakB);

    // Smooth color (per-fragment — the clean gradient)
    vec3 smoothColor = computeGradient(uv, u_time, peakA, peakB);

    // Pixelated color (per-block — frosted glass)
    vec3 pixelColor = computeGradient(pixelUv, u_time, peakA, peakB);
    pixelColor += (hash(cellId) - 0.5) * 0.035;

    // === EDGE MASK — narrow pixel fringe at edges only ===
    float edgeL = smoothstep(0.0, 0.10, uv.x);
    float edgeR = smoothstep(1.0, 0.90, uv.x);
    float edgeT = smoothstep(1.0, 0.92, uv.y);
    float edgeB = smoothstep(0.0, 0.15, uv.y);
    float interior = edgeL * edgeR * edgeT * edgeB;

    // === DIAGONAL SHIMMER — same as hero (lines 150-157 of HeroGradientGL) ===
    float diag = (uv.x + 1.0 - uv.y) * 0.5;
    float shimmerPos = fract(u_time * 0.25);
    float shimmerDist = abs(diag - shimmerPos);
    shimmerDist = min(shimmerDist, 1.0 - shimmerDist);
    float shimmerMask = exp(-shimmerDist * shimmerDist * 120.0) * 0.6;

    // Combine: default smooth, edges + shimmer show pixel blocks
    float pixelAmount = max(1.0 - interior, shimmerMask);

    // The pixel color IS the "ASCII" — flat blocky colors vs smooth gradient
    vec3 color = mix(smoothColor, pixelColor, pixelAmount);

    // === GRAIN — baked into shader so it only appears where gradient has alpha ===
    float grain = (hash(gl_FragCoord.xy + u_time * 0.3) - 0.5) * 0.06;
    color += grain;

    // === Alpha — solid at top, wavy fade toward bottom ===
    float y = pixelUv.y;

    // Wavy edge — visible movement but tighter amplitude
    float wave = sin(pixelUv.x * 3.5 + 1.2 + u_time * 0.25) * 0.06
               + sin(pixelUv.x * 7.0 + 3.7 - u_time * 0.18) * 0.03
               + cos(pixelUv.x * 5.0 + 0.5 + u_time * 0.20) * 0.04;

    // Left side extends much further down, right side a bit
    float leftPush = (1.0 - smoothstep(0.0, 0.5, pixelUv.x)) * 0.25;
    float rightPush = (1.0 - smoothstep(0.6, 1.0, pixelUv.x)) * 0.10;
    float edgePush = leftPush + rightPush;

    float alpha = smoothstep(-0.35, 0.65, y + wave + edgePush);

    gl_FragColor = vec4(color, alpha);
  }
`;

export default function PixelGradientCanvas() {
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

    // Handle Resize
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
    };
    window.addEventListener('resize', resize);
    resize();

    // Render Loop
    let animationFrameId: number;
    const startTime = Date.now();
    const render = () => {
      gl.uniform1f(timeLoc, (Date.now() - startTime) / 1000.0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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
