'use client'

import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react'
import type { CSSProperties } from 'react'
import * as THREE from 'three'

export interface GlitchImageHandle {
  progress: number
}

interface GlitchImageProps {
  src: string
  className?: string
  style?: CSSProperties
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  precision highp float;

  uniform sampler2D uTexture;
  uniform float uProgress;
  uniform vec2 uResolution;
  uniform vec3 uColor;

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    // Grid: consistent ~20px cells based on container width
    float cellCount = floor(uResolution.x / 20.0);
    vec2 gridSize = vec2(cellCount, cellCount * uResolution.y / uResolution.x);
    vec2 cell = floor(vUv * gridSize);

    // Per-cell random for organic stagger
    float noise = hash(cell);

    // Top-to-bottom sweep: vUv.y=1 at top, 0 at bottom
    // Invert so top reveals first
    float sweep = 1.0 - vUv.y;
    float threshold = noise * 0.3 + sweep * 0.7;

    if (uProgress > threshold + 0.08) {
      // Fully revealed — sample texture at block center for pixelated look
      vec2 blockCenter = (cell + 0.5) / gridSize;

      // Cover-fit UV adjustment
      float imgAspect = uResolution.x / uResolution.y;
      vec2 coverUv = blockCenter;
      // Assume square-ish texture; adjust if aspect mismatch
      coverUv.y = 1.0 - coverUv.y; // Flip Y for texture

      gl_FragColor = texture2D(uTexture, coverUv);
    } else if (uProgress > threshold) {
      // Transition zone — colored squares
      gl_FragColor = vec4(uColor, 1.0);
    } else {
      // Not yet revealed — transparent
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    }
  }
`

const GlitchImage = forwardRef<GlitchImageHandle, GlitchImageProps>(
  ({ src, className, style }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const progressRef = useRef(0)
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
    const materialRef = useRef<THREE.ShaderMaterial | null>(null)
    const sceneRef = useRef<THREE.Scene | null>(null)
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null)
    const rafRef = useRef<number>(0)
    const lastProgressRef = useRef(-1)
    const mountedRef = useRef(true)
    const initializedRef = useRef(false)
    const srcRef = useRef(src)
    const resizeObserverRef = useRef<ResizeObserver | null>(null)

    srcRef.current = src

    const initWebGL = useCallback(() => {
      if (initializedRef.current || !mountedRef.current) return
      const container = containerRef.current
      if (!container) return

      initializedRef.current = true
      const width = container.clientWidth || 300
      const height = container.clientHeight || 300

      const scene = new THREE.Scene()
      sceneRef.current = scene

      const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10)
      camera.position.z = 1
      cameraRef.current = camera

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
      })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      container.appendChild(renderer.domElement)
      rendererRef.current = renderer

      const loader = new THREE.TextureLoader()
      loader.load(
        srcRef.current,
        (texture) => {
          if (!mountedRef.current) return
          texture.minFilter = THREE.LinearFilter
          texture.magFilter = THREE.LinearFilter

          const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
              uTexture: { value: texture },
              uProgress: { value: progressRef.current },
              uResolution: { value: new THREE.Vector2(width, height) },
              uColor: { value: new THREE.Vector3(0.14, 0.14, 0.14) },
            },
            transparent: true,
          })
          materialRef.current = material

          const geometry = new THREE.PlaneGeometry(1, 1)
          const mesh = new THREE.Mesh(geometry, material)
          scene.add(mesh)

          renderer.render(scene, camera)
          lastProgressRef.current = progressRef.current
          startRenderLoop()
        },
        undefined,
        () => {
          if (!mountedRef.current) return
          // Fallback dark texture
          const canvas = document.createElement('canvas')
          canvas.width = 2
          canvas.height = 2
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.fillStyle = '#1a1a2e'
            ctx.fillRect(0, 0, 2, 2)
          }
          const fallback = new THREE.CanvasTexture(canvas)

          const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
              uTexture: { value: fallback },
              uProgress: { value: progressRef.current },
              uResolution: { value: new THREE.Vector2(width, height) },
              uColor: { value: new THREE.Vector3(0.14, 0.14, 0.14) },
            },
            transparent: true,
          })
          materialRef.current = material

          const geometry = new THREE.PlaneGeometry(1, 1)
          const mesh = new THREE.Mesh(geometry, material)
          scene.add(mesh)
          renderer.render(scene, camera)
          lastProgressRef.current = progressRef.current
          startRenderLoop()
        }
      )

      const ro = new ResizeObserver((entries) => {
        const { width: w, height: h } = entries[0].contentRect
        if (w > 0 && h > 0 && rendererRef.current) {
          rendererRef.current.setSize(w, h)
          if (materialRef.current) {
            materialRef.current.uniforms.uResolution.value.set(w, h)
          }
          lastProgressRef.current = -1
        }
      })
      ro.observe(container)
      resizeObserverRef.current = ro
    }, [])

    const startRenderLoop = useCallback(() => {
      const tick = () => {
        if (!mountedRef.current) return
        const renderer = rendererRef.current
        const material = materialRef.current
        const scene = sceneRef.current
        const camera = cameraRef.current

        if (renderer && material && scene && camera) {
          if (Math.abs(progressRef.current - lastProgressRef.current) > 0.001) {
            material.uniforms.uProgress.value = progressRef.current
            renderer.render(scene, camera)
            lastProgressRef.current = progressRef.current
          }
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }, [])

    useImperativeHandle(ref, () => ({
      get progress() {
        return progressRef.current
      },
      set progress(value: number) {
        progressRef.current = value
        if (value > 0 && !initializedRef.current) {
          initWebGL()
        }
      },
    }), [initWebGL])

    useEffect(() => {
      mountedRef.current = true
      return () => {
        mountedRef.current = false
        cancelAnimationFrame(rafRef.current)

        resizeObserverRef.current?.disconnect()

        const container = containerRef.current
        if (rendererRef.current) {
          rendererRef.current.dispose()
          if (container && container.contains(rendererRef.current.domElement)) {
            container.removeChild(rendererRef.current.domElement)
          }
        }
        if (sceneRef.current) {
          sceneRef.current.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
              obj.geometry.dispose()
              if (obj.material instanceof THREE.ShaderMaterial) {
                obj.material.dispose()
                if (obj.material.uniforms.uTexture?.value) {
                  obj.material.uniforms.uTexture.value.dispose()
                }
              }
            }
          })
        }
        initializedRef.current = false
      }
    }, [])

    return (
      <div
        ref={containerRef}
        className={className}
        style={{ width: '100%', height: '100%', position: 'relative', ...style }}
      />
    )
  }
)

GlitchImage.displayName = 'GlitchImage'

export default GlitchImage
