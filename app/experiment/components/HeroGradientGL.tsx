'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { SHARED_START } from './sharedTime'

interface HeroGradientGLProps {
  revealTrigger: boolean
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Single-pass fragment shader: smooth gradient + mouse-driven pixel reveal + page-load reveal
const fragmentShader = `
  precision highp float;

  uniform float uTime;           // elapsed seconds
  uniform float uRevealProgress; // 0 = dark grid, 1 = full gradient (page-load)
  uniform vec2 uResolution;      // container size in px
  uniform vec2 uMouse;           // damped mouse position in UV space (0-1)
  uniform float uMouseActive;    // 0 = not hovering, 1 = hovering (GSAP-animated)
  uniform float uLightMode;      // 0 = dark (black floor/white wash), 1 = light (peak*0.25 floor / parchment wash)

  varying vec2 vUv;

  // ─── Cubic smoothstep for organic keyframe easing ───
  float ssmooth(float t) {
    return t * t * (3.0 - 2.0 * t);
  }

  // ─── Per-cell deterministic random (for page-load reveal) ───
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  // ─── Smooth 2D value noise for organic color movement ───
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f); // smoothstep interpolation
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // ─── Organic dual-color gradient: colors swirl together, bottom stays dark ───
  vec3 computeGradient(vec2 uv, float time, vec3 peakA, vec3 peakB) {
    float gp = uv.y;

    // ── Color swirl: noise-driven blend between peakA and peakB ──
    // Three octaves: large slow clouds + medium detail + fine texture
    float n1 = vnoise(uv * 1.8 + vec2(time * 0.10, time * 0.07));
    float n2 = vnoise(uv * 3.5 + vec2(-time * 0.08, time * 0.12));
    float n3 = vnoise(uv * 6.0 + vec2(time * 0.15, -time * 0.06));
    float swirl = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;

    // Very wide vertical transition — colors can appear almost anywhere,
    // noise pushes the boundary so it's completely diffuse.
    float verticalBias = smoothstep(0.05, 0.95, gp);
    float colorMix = clamp(verticalBias + (swirl - 0.5) * 1.0, 0.0, 1.0);

    // Dark mode: peak is a swirl-modulated blend of peakA and peakB — the dark
    // ramp mutes pure-peak regions, so the swirl reads as subtle cloud shapes
    // within muted colors. Looks good.
    //
    // Light mode: drop the peakA/peakB spatial split entirely and use peakA
    // throughout. Reason: the new 5-zone light ramp keeps peak saturated
    // through gp 0.15-0.85 (most of the canvas), so the swirl-modulated
    // peakA↔peakB boundary wobbles visibly as a "blob" (e.g. green pushing
    // down into pink on orchid+green, segment 12). Even at very low swirl
    // strength the boundary position itself shifts ~7% of canvas height
    // when peakA and peakB are hue-opposite, which the user reads as a
    // visible blob moving around. Single-peak eliminates the boundary, so
    // the gradient becomes a smooth vertical ramp through one peak hue.
    // Each segment's character is preserved via peakA's per-state value
    // (cycles through the brand palette). The luminance wave below adds
    // subtle organic variation that doesn't depend on peakA/peakB contrast.
    vec3 peak = mix(mix(peakA, peakB, colorMix), peakA, uLightMode);

    // ── Subtle luminance wave: bands aren't perfectly horizontal ──
    // Protected at the bottom so the dark zone never shifts
    float wave = (vnoise(uv * 2.0 + vec2(time * 0.06, -time * 0.04)) - 0.5) * 0.06;
    float protection = smoothstep(0.0, 0.25, gp);
    gp = clamp(gp + wave * protection, 0.0, 1.0);

    // Light mode: deep, hue-preserving companion at the canvas top → vibrant
    // peak in the upper-mid → pastel tint in the lower-mid → parchment at the
    // bottom. The deepPeak formula is HUE-PRESERVING: for warm peaks where R
    // >= G AND there's yellow content (min(R,G) > B), we reduce G to shift the
    // hue toward red (so yellow → amber, not muddy olive). Cool/green/magenta
    // peaks are left in place because they don't suffer the yellow-olive
    // problem. After the hue shift we darken and slightly saturation-boost
    // (subtract a fraction of the min channel) so every cycle state has a
    // clean rich deep colour, never a grey/dirty mid-tone.
    if (uLightMode > 0.5) {
      vec3 parchment = vec3(0.949, 0.933, 0.890);   // #f2eee3

      // Hue-preserving shifts: warm-yellow peaks (R >= G) drop G toward red;
      // green peaks (G > R) drop R toward forest. Both prevent muddy olive when
      // the peak is yellow or yellow-green (brand cGreen).
      float warmBias  = max(0.0, min(peak.r, peak.g) - peak.b);
      float yellowShift = warmBias * step(peak.g, peak.r);        // R >= G
      float greenShift  = warmBias * step(peak.r, peak.g) * (1.0 - step(peak.g, peak.r));  // R < G strictly
      vec3 hueShifted = vec3(
        peak.r * (1.0 - greenShift * 0.50),
        peak.g * (1.0 - yellowShift * 0.55),
        peak.b
      );

      // Darken and saturation-boost (subtract part of min channel to keep hue rich)
      vec3 darkened  = hueShifted * 0.45;
      float minCh    = min(min(darkened.r, darkened.g), darkened.b);
      vec3 deepPeak  = max(darkened - vec3(minCh * 0.55), vec3(0.0));

      // 5-zone ramp analogous to dark mode (line 122-138), inverted tonal
      // direction (parchment bottom → deepest top). Transition widths copy
      // dark mode exactly so the gradient has continuous slope at every gp,
      // making the per-column y-offset mosaic visible across the full canvas.
      vec3 wash      = mix(peak, parchment, 0.85);   // barely-tinted parchment
      vec3 tint      = mix(peak, parchment, 0.55);   // clear pastel of peak hue
      vec3 ultraDeep = deepPeak * 0.65;              // darker than deepPeak

      float t1 = smoothstep(0.00, 0.10, gp);  // parchment → wash
      float t2 = smoothstep(0.06, 0.24, gp);  // wash → tint
      float t3 = smoothstep(0.15, 0.55, gp);  // tint → peak
      float t4 = smoothstep(0.45, 0.85, gp);  // peak → deepPeak
      float t5 = smoothstep(0.75, 1.00, gp);  // deepPeak → ultraDeep

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

    float t1 = smoothstep(0.00, 0.10, gp);  // black → deep
    float t2 = smoothstep(0.06, 0.24, gp);  // deep → mid
    float t3 = smoothstep(0.15, 0.55, gp);  // mid → peak
    float t4 = smoothstep(0.45, 0.85, gp);  // peak → wash
    float t5 = smoothstep(0.75, 1.00, gp);  // wash → white

    vec3 color = mix(vec3(0.004), deep, t1);
    color = mix(color, mid, t2);
    color = mix(color, peak, t3);
    color = mix(color, wash, t4);
    color = mix(color, vec3(1.0), t5);
    return color;
  }

  // ═══ 1. PURE COLOR GENERATION ═══
  // Blue-centric cycle: peakA is always royal blue. peakB cycles through
  // complementary accents (turquoise, baby pink, peach, periwinkle, light
  // orange) with the gradient returning to pure blue between each accent
  // so the overarching theme stays blue. 10 segments over a 50s cycle.
  vec3 getGradientColor(vec2 uv) {
    vec3 cBlue        = vec3(0.000, 0.000, 1.000); // #0000FF royal blue
    vec3 cTurquoise   = vec3(0.251, 0.878, 0.816); // #40E0D0 cool accent
    vec3 cPeriwinkle  = vec3(0.749, 0.706, 0.863); // #BFB4DC cool accent
    vec3 cBabyPink    = vec3(1.000, 0.785, 0.866); // #FFC8DD warm accent
    vec3 cPeach       = vec3(1.000, 0.855, 0.725); // #FFDAB9 warm accent
    vec3 cLightOrange = vec3(1.000, 0.627, 0.478); // #FFA07A warm accent

    float cycleSec = 50.0;
    float progress = mod(uTime, cycleSec) / cycleSec;
    float segProgress = progress * 10.0;
    int segIndex = int(floor(segProgress));
    float t = ssmooth(segProgress - floor(segProgress));

    // Each segment's to-pair matches the next segment's from-pair so the
    // transitions are continuous and the cycle loops cleanly.
    vec3 fromA, fromB, toA, toB;
    if (segIndex == 0)       { fromA = cBlue; fromB = cBlue;         toA = cBlue; toB = cTurquoise;   }
    else if (segIndex == 1)  { fromA = cBlue; fromB = cTurquoise;    toA = cBlue; toB = cBlue;        }
    else if (segIndex == 2)  { fromA = cBlue; fromB = cBlue;         toA = cBlue; toB = cBabyPink;    }
    else if (segIndex == 3)  { fromA = cBlue; fromB = cBabyPink;     toA = cBlue; toB = cBlue;        }
    else if (segIndex == 4)  { fromA = cBlue; fromB = cBlue;         toA = cBlue; toB = cPeach;       }
    else if (segIndex == 5)  { fromA = cBlue; fromB = cPeach;        toA = cBlue; toB = cBlue;        }
    else if (segIndex == 6)  { fromA = cBlue; fromB = cBlue;         toA = cBlue; toB = cPeriwinkle;  }
    else if (segIndex == 7)  { fromA = cBlue; fromB = cPeriwinkle;   toA = cBlue; toB = cBlue;        }
    else if (segIndex == 8)  { fromA = cBlue; fromB = cBlue;         toA = cBlue; toB = cLightOrange; }
    else                     { fromA = cBlue; fromB = cLightOrange;  toA = cBlue; toB = cBlue;        }

    vec3 peakA = mix(fromA, toA, t);
    vec3 peakB = mix(fromB, toB, t);
    return computeGradient(uv, uTime, peakA, peakB);
  }

  void main() {
    // ═══ 2. DUAL TEXTURES: smooth + pixelated ═══
    vec3 smoothColor = getGradientColor(vUv);

    float blockPx = 32.0; // ~32px square blocks
    vec2 grid = uResolution / blockPx;
    vec2 cellId = floor(vUv * grid);
    vec2 pixelUv = cellId / grid;
    // Per-COLUMN y-offset: each column samples a slightly different gradient position
    // Breaks horizontal banding while keeping vertical coherence within each column.
    float colOffset = hash(vec2(cellId.x, 0.0)) * 0.035;
    pixelUv.y += colOffset;
    vec3 pixelColor = getGradientColor(pixelUv);

    // ═══ 3. ORGANIC REVEAL MASK (Gaussian falloff) ═══
    float aspect = uResolution.x / uResolution.y;
    vec2 aspectVec = vec2(aspect, 1.0);
    float dist = distance(vUv * aspectVec, uMouse * aspectVec);
    float mouseMask = exp(-dist * dist * 18.0) * uMouseActive;

    // ─── Ambient diagonal shimmer (sweeps top-left → bottom-right) ───
    // Slow the sweep in light mode (0.18 vs 0.25 = ~5.5s vs 4s cycle) so the
    // band is more perceptible as moving across the canvas.
    float diag = (vUv.x + 1.0 - vUv.y) * 0.5;
    float shimmerSpeed = 0.25;
    float shimmerPos = fract(uTime * shimmerSpeed);
    float shimmerDist = abs(diag - shimmerPos);
    shimmerDist = min(shimmerDist, 1.0 - shimmerDist);
    float shimmerMask = exp(-shimmerDist * shimmerDist * 120.0) * 0.6;

    float mask = max(mouseMask, shimmerMask * (1.0 - uMouseActive));

    // ═══ 4. PURE COLOR BLENDING ═══
    vec3 finalColor = mix(smoothColor, pixelColor, mask);

    // ═══ 6. PAGE-LOAD PIXEL REVEAL ═══
    if (uRevealProgress < 1.0) {
      float cellCount = floor(uResolution.x / 20.0);
      vec2 revealGrid = vec2(cellCount, cellCount * uResolution.y / uResolution.x);
      vec2 cell = floor(vUv * revealGrid);
      float noise = hash(cell);
      float sweep = 1.0 - vUv.y;
      float threshold = noise * 0.3 + sweep * 0.7;
      // Reveal palette adapts to mode so the parchment page doesn't flash dark.
      vec3 baseColor = mix(vec3(0.004), vec3(0.949, 0.933, 0.890), uLightMode);
      vec3 dimColor  = mix(vec3(0.14),  vec3(0.85),                 uLightMode);

      if (uRevealProgress > threshold + 0.08) {
        // Fully revealed — show blended gradient
      } else if (uRevealProgress > threshold) {
        gl_FragColor = vec4(dimColor, 1.0);
        return;
      } else {
        gl_FragColor = vec4(baseColor, 1.0);
        return;
      }
    }

    gl_FragColor = vec4(finalColor, 1.0);
  }
`

export default function HeroGradientGL({ revealTrigger }: HeroGradientGLProps) {
  // Hero is locked to dark mode in the hybrid design — the page below
  // transitions to parchment, but the hero gradient itself stays dark.
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null)
  const rafRef = useRef<number>(0)
  const startRef = useRef(0)
  const mountedRef = useRef(true)
  const mouseTargetRef = useRef({ x: 0.5, y: 0.5 })

  // Init Three.js immediately (hero is always visible)
  useEffect(() => {
    mountedRef.current = true
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 300
    const height = container.clientHeight || 300

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10)
    camera.position.z = 1
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({
      alpha: false,
      antialias: false,
      powerPreference: 'low-power',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uRevealProgress: { value: 0 },
        uResolution: { value: new THREE.Vector2(width, height) },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uMouseActive: { value: 0 },
        uLightMode: { value: 0 },
      },
    })
    materialRef.current = material

    const geometry = new THREE.PlaneGeometry(1, 1)
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    startRef.current = SHARED_START

    // Continuous render loop — uTime + damped mouse tracking
    const dampingSpeed = 0.08
    const tick = () => {
      if (!mountedRef.current) return
      const now = performance.now() / 1000
      material.uniforms.uTime.value = now - SHARED_START

      // Lerp uMouse toward mouseTarget for fluid trailing
      const mouse = material.uniforms.uMouse.value
      const target = mouseTargetRef.current
      mouse.x += (target.x - mouse.x) * dampingSpeed
      mouse.y += (target.y - mouse.y) * dampingSpeed

      renderer.render(scene, camera)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    // ─── Mouse interaction ───
    // Listen on window because the canvas sits behind overlay layers
    let mouseActiveTween: { kill: () => void } | null = null
    let isInsideHero = false
    let gsapModule: { default: { to: Function } } | null = null

    const loadGsap = async () => {
      if (!gsapModule) gsapModule = await import('gsap')
      return gsapModule.default
    }

    const onWindowMouseMove = async (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      const inside =
        rect.width > 0 &&
        rect.height > 0 &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom

      if (inside) {
        // Update mouse target (damped in render loop)
        const x = (e.clientX - rect.left) / rect.width
        const y = 1.0 - (e.clientY - rect.top) / rect.height
        mouseTargetRef.current.x = x
        mouseTargetRef.current.y = y

        // Fade in uMouseActive if just entered
        if (!isInsideHero) {
          isInsideHero = true
          const gsap = await loadGsap()
          mouseActiveTween?.kill()
          mouseActiveTween = gsap.to(material.uniforms.uMouseActive, {
            value: 1,
            duration: 0.3,
            ease: 'power2.out',
          })
        }
      } else if (isInsideHero) {
        // Mouse left — fade out
        isInsideHero = false
        const gsap = await loadGsap()
        mouseActiveTween?.kill()
        mouseActiveTween = gsap.to(material.uniforms.uMouseActive, {
          value: 0,
          duration: 0.3,
          ease: 'power2.in',
        })
      }
    }

    window.addEventListener('mousemove', onWindowMouseMove)

    // ResizeObserver
    const ro = new ResizeObserver((entries) => {
      const { width: w, height: h } = entries[0].contentRect
      if (w > 0 && h > 0 && rendererRef.current) {
        rendererRef.current.setSize(w, h)
        if (materialRef.current) {
          materialRef.current.uniforms.uResolution.value.set(w, h)
        }
      }
    })
    ro.observe(container)

    return () => {
      mountedRef.current = false
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      mouseActiveTween?.kill()

      window.removeEventListener('mousemove', onWindowMouseMove)

      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          if (obj.material instanceof THREE.ShaderMaterial) {
            obj.material.dispose()
          }
        }
      })
    }
  }, [])

  // Trigger page-load reveal animation via GSAP
  useEffect(() => {
    if (!revealTrigger || !materialRef.current) return

    let ctx: { revert: () => void } | null = null

    const animate = async () => {
      const { default: gsap } = await import('gsap')
      ctx = gsap.context(() => {
        gsap.to(materialRef.current!.uniforms.uRevealProgress, {
          value: 1,
          duration: 1.8,
          ease: 'power2.inOut',
        })
      })
    }

    animate()

    return () => {
      ctx?.revert()
    }
  }, [revealTrigger])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  )
}
