'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

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
    // noise pushes ±0.5 so the boundary is completely diffuse
    float verticalBias = smoothstep(0.05, 0.95, gp);
    float colorMix = clamp(verticalBias + (swirl - 0.5) * 1.0, 0.0, 1.0);
    vec3 peak = mix(peakA, peakB, colorMix);

    // ── Subtle luminance wave: bands aren't perfectly horizontal ──
    // Protected at the bottom so the dark zone never shifts
    float wave = (vnoise(uv * 2.0 + vec2(time * 0.06, -time * 0.04)) - 0.5) * 0.06;
    float protection = smoothstep(0.0, 0.25, gp);
    gp = clamp(gp + wave * protection, 0.0, 1.0);

    // ── Smooth luminance ramp: overlapping smoothsteps eliminate visible seams ──
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
  // Self-contained: takes any UV, returns the gradient color at that point
  // including time-based brand color cycling with dual-color pairings.
  vec3 getGradientColor(vec2 uv) {
    // Progression Labs brand palette
    vec3 cOrchid    = vec3(0.729, 0.333, 0.827); // #BA55D3
    vec3 cSalmon    = vec3(1.000, 0.627, 0.478); // #FFA07A
    vec3 cGreen     = vec3(0.725, 0.914, 0.475); // #B9E979
    vec3 cTurquoise = vec3(0.251, 0.878, 0.816); // #40E0D0
    vec3 cBlue      = vec3(0.000, 0.000, 1.000); // #0000FF

    // 9 states over 45s cycle — singles and dual-color pairings
    // Each state is a [bottom, top] pair; singles have both the same.
    float cycleSec = 45.0;
    float progress = mod(uTime, cycleSec) / cycleSec;
    float segProgress = progress * 9.0;
    int segIndex = int(floor(segProgress));
    float t = ssmooth(segProgress - floor(segProgress));

    // Current state pair [fromA, fromB] → next state pair [toA, toB]
    vec3 fromA, fromB, toA, toB;
    if (segIndex == 0)      { fromA = cOrchid;    fromB = cOrchid;    toA = cBlue;      toB = cSalmon;    } // orchid → blue+salmon
    else if (segIndex == 1) { fromA = cBlue;      fromB = cSalmon;    toA = cGreen;     toB = cGreen;     } // blue+salmon → green
    else if (segIndex == 2) { fromA = cGreen;     fromB = cGreen;     toA = cOrchid;    toB = cTurquoise; } // green → orchid+turquoise
    else if (segIndex == 3) { fromA = cOrchid;    fromB = cTurquoise; toA = cSalmon;    toB = cSalmon;    } // orchid+turquoise → salmon
    else if (segIndex == 4) { fromA = cSalmon;    fromB = cSalmon;    toA = cBlue;      toB = cTurquoise; } // salmon → blue+turquoise
    else if (segIndex == 5) { fromA = cBlue;      fromB = cTurquoise; toA = cBlue;      toB = cBlue;      } // blue+turquoise → blue
    else if (segIndex == 6) { fromA = cBlue;      fromB = cBlue;      toA = cOrchid;    toB = cGreen;     } // blue → orchid+green
    else if (segIndex == 7) { fromA = cOrchid;    fromB = cGreen;     toA = cTurquoise; toB = cTurquoise; } // orchid+green → turquoise
    else                    { fromA = cTurquoise; fromB = cTurquoise; toA = cOrchid;    toB = cOrchid;    } // turquoise → orchid (loop)

    vec3 peakA = mix(fromA, toA, t);
    vec3 peakB = mix(fromB, toB, t);
    return computeGradient(uv, uTime, peakA, peakB);
  }

  void main() {
    // ═══ 2. DUAL TEXTURES: smooth + pixelated ═══
    vec3 smoothColor = getGradientColor(vUv);

    float blockPx = 45.0; // ~45px square blocks
    vec2 grid = uResolution / blockPx;
    vec2 cellId = floor(vUv * grid);
    vec2 pixelUv = cellId / grid;
    // Per-COLUMN y-offset: each column samples a slightly different gradient position
    // Breaks horizontal banding while keeping vertical coherence within each column
    float colOffset = hash(vec2(cellId.x, 0.0)) * 0.035;
    pixelUv.y += colOffset;
    vec3 pixelColor = getGradientColor(pixelUv);

    // ═══ 3. ORGANIC REVEAL MASK (Gaussian falloff) ═══
    float aspect = uResolution.x / uResolution.y;
    vec2 aspectVec = vec2(aspect, 1.0);
    float dist = distance(vUv * aspectVec, uMouse * aspectVec);
    float mouseMask = exp(-dist * dist * 18.0) * uMouseActive;

    // ─── Ambient diagonal shimmer (sweeps top-left → bottom-right) ───
    float diag = (vUv.x + 1.0 - vUv.y) * 0.5;
    float shimmerPos = fract(uTime * 0.25);
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
      vec3 darkColor = vec3(0.14);

      if (uRevealProgress > threshold + 0.08) {
        // Fully revealed — show blended gradient
      } else if (uRevealProgress > threshold) {
        gl_FragColor = vec4(darkColor, 1.0);
        return;
      } else {
        gl_FragColor = vec4(vec3(0.004), 1.0);
        return;
      }
    }

    gl_FragColor = vec4(finalColor, 1.0);
  }
`

export default function HeroGradientGL({ revealTrigger }: HeroGradientGLProps) {
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
      },
    })
    materialRef.current = material

    const geometry = new THREE.PlaneGeometry(1, 1)
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    startRef.current = performance.now() / 1000

    // Continuous render loop — uTime + damped mouse tracking
    const dampingSpeed = 0.08
    const tick = () => {
      if (!mountedRef.current) return
      const now = performance.now() / 1000
      material.uniforms.uTime.value = now - startRef.current

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
