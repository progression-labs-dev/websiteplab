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

// Single-pass fragment shader: procedural hue-cycling gradient + pixel reveal
const fragmentShader = `
  precision highp float;

  uniform float uTime;          // elapsed seconds
  uniform float uRevealProgress; // 0 = dark grid, 1 = full gradient
  uniform vec2 uResolution;     // container size in px

  varying vec2 vUv;

  // ─── HSL → RGB (matches HeroGradientCanvas.tsx hslToRgbStr) ───
  vec3 hsl2rgb(float h, float s, float l) {
    h = h / 360.0;
    float a = s * min(l, 1.0 - l);
    float f0 = mod(0.0 + h * 12.0, 12.0);
    float f8 = mod(8.0 + h * 12.0, 12.0);
    float f4 = mod(4.0 + h * 12.0, 12.0);
    float r = l - a * max(min(min(f0 - 3.0, 9.0 - f0), 1.0), -1.0);
    float g = l - a * max(min(min(f8 - 3.0, 9.0 - f8), 1.0), -1.0);
    float b = l - a * max(min(min(f4 - 3.0, 9.0 - f4), 1.0), -1.0);
    return vec3(r, g, b);
  }

  // ─── Shortest-path hue interpolation ───
  float lerpHue(float a, float b, float t) {
    float diff = b - a;
    if (diff > 180.0) diff -= 360.0;
    if (diff < -180.0) diff += 360.0;
    return mod(a + diff * t + 360.0, 360.0);
  }

  float lerp1(float a, float b, float t) {
    return a + (b - a) * t;
  }

  // ─── Cubic smoothstep for organic keyframe easing ───
  float ssmooth(float t) {
    return t * t * (3.0 - 2.0 * t);
  }

  // ─── Per-cell deterministic random ───
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    // ═══ LAYER 1: Procedural hue-cycling gradient ═══
    // 5 keyframes over 30s cycle, matching HeroGradientCanvas exactly
    float cycleMs = 30000.0;
    float elapsed = uTime * 1000.0;
    float progress = mod(elapsed, cycleMs) / cycleMs;
    float segProgress = progress * 5.0;
    int segIndex = int(floor(segProgress));
    float t = ssmooth(segProgress - floor(segProgress));

    // Keyframe lookup via if/else (GLSL ES 1.0 safe)
    float fromH, fromS, fromL, toH, toS, toL;

    if (segIndex == 0) {
      // Blue → Green
      fromH = 220.0; fromS = 0.72; fromL = 0.38;
      toH   = 150.0; toS   = 0.65; toL   = 0.42;
    } else if (segIndex == 1) {
      // Green → Yellow
      fromH = 150.0; fromS = 0.65; fromL = 0.42;
      toH   = 48.0;  toS   = 0.85; toL   = 0.52;
    } else if (segIndex == 2) {
      // Yellow → Orange
      fromH = 48.0;  fromS = 0.85; fromL = 0.52;
      toH   = 25.0;  toS   = 0.82; toL   = 0.48;
    } else if (segIndex == 3) {
      // Orange → Pink
      fromH = 25.0;  fromS = 0.82; fromL = 0.48;
      toH   = 330.0; toS   = 0.68; toL   = 0.48;
    } else {
      // Pink → Blue (wrap)
      fromH = 330.0; fromS = 0.68; fromL = 0.48;
      toH   = 220.0; toS   = 0.72; toL   = 0.38;
    }

    float hue   = lerpHue(fromH, toH, t);
    float sat   = lerp1(fromS, toS, t);
    float light = lerp1(fromL, toL, t);

    // Gradient position: 0 at top (dark), 1 at bottom (white)
    // THREE.js PlaneGeometry: vUv.y=1 is top, vUv.y=0 is bottom
    float gp = 1.0 - vUv.y;

    // 10-stop gradient matching Canvas version exactly
    vec3 gradColor;
    if (gp < 0.10) {
      float t2 = gp / 0.10;
      gradColor = mix(vec3(0.004), hsl2rgb(hue, sat * 0.5, light * 0.12), t2);
    } else if (gp < 0.22) {
      float t2 = (gp - 0.10) / 0.12;
      gradColor = mix(
        hsl2rgb(hue, sat * 0.5, light * 0.12),
        hsl2rgb(hue, sat * 0.7, light * 0.25), t2);
    } else if (gp < 0.35) {
      float t2 = (gp - 0.22) / 0.13;
      gradColor = mix(
        hsl2rgb(hue, sat * 0.7, light * 0.25),
        hsl2rgb(hue, sat * 0.9, light * 0.55), t2);
    } else if (gp < 0.48) {
      float t2 = (gp - 0.35) / 0.13;
      gradColor = mix(
        hsl2rgb(hue, sat * 0.9, light * 0.55),
        hsl2rgb(hue, sat, light * 0.85), t2);
    } else if (gp < 0.58) {
      float t2 = (gp - 0.48) / 0.10;
      gradColor = mix(
        hsl2rgb(hue, sat, light * 0.85),
        hsl2rgb(hue, sat * 0.9, light * 1.1), t2);
    } else if (gp < 0.68) {
      float t2 = (gp - 0.58) / 0.10;
      gradColor = mix(
        hsl2rgb(hue, sat * 0.9, light * 1.1),
        hsl2rgb(hue, sat * 0.6, min(0.85, light * 1.4)), t2);
    } else if (gp < 0.78) {
      float t2 = (gp - 0.68) / 0.10;
      gradColor = mix(
        hsl2rgb(hue, sat * 0.6, min(0.85, light * 1.4)),
        hsl2rgb(hue, sat * 0.35, min(0.92, light * 1.7)), t2);
    } else if (gp < 0.88) {
      float t2 = (gp - 0.78) / 0.10;
      gradColor = mix(
        hsl2rgb(hue, sat * 0.35, min(0.92, light * 1.7)),
        hsl2rgb(hue, sat * 0.15, 0.95), t2);
    } else {
      float t2 = (gp - 0.88) / 0.12;
      gradColor = mix(hsl2rgb(hue, sat * 0.15, 0.95), vec3(1.0), t2);
    }

    // ═══ LAYER 2: Pixel reveal ═══
    // When fully revealed, skip all reveal math (perf optimization)
    if (uRevealProgress >= 1.0) {
      gl_FragColor = vec4(gradColor, 1.0);
      return;
    }

    // Grid: ~20px cells
    float cellCount = floor(uResolution.x / 20.0);
    vec2 gridSize = vec2(cellCount, cellCount * uResolution.y / uResolution.x);
    vec2 cell = floor(vUv * gridSize);

    float noise = hash(cell);

    // Top-to-bottom sweep: top reveals first
    float sweep = 1.0 - vUv.y; // 0 at top, 1 at bottom
    float threshold = noise * 0.3 + sweep * 0.7;

    vec3 darkColor = vec3(0.14); // #242424 transition squares

    if (uRevealProgress > threshold + 0.08) {
      // Fully revealed cell — show gradient
      gl_FragColor = vec4(gradColor, 1.0);
    } else if (uRevealProgress > threshold) {
      // Transition zone — dark colored squares
      gl_FragColor = vec4(darkColor, 1.0);
    } else {
      // Unrevealed — dark background
      gl_FragColor = vec4(vec3(0.004), 1.0); // #010101
    }
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
      },
    })
    materialRef.current = material

    const geometry = new THREE.PlaneGeometry(1, 1)
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    startRef.current = performance.now() / 1000

    // Continuous render loop — uTime always updates for gradient cycling
    const tick = () => {
      if (!mountedRef.current) return
      const now = performance.now() / 1000
      material.uniforms.uTime.value = now - startRef.current
      renderer.render(scene, camera)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

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

  // Trigger reveal animation via GSAP
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
