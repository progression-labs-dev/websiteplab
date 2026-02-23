'use client'

import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react'
import * as THREE from 'three'

export interface GlitchImageHandle {
  progress: number
}

interface GlitchImageProps {
  imageUrl: string
  className?: string
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform sampler2D u_texture;
  uniform float u_progress;
  uniform vec2 u_resolution;

  varying vec2 vUv;

  // Pseudo-random hash for per-block noise
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    // Subdivide into 40x40 block grid
    vec2 gridUv = floor(vUv * 40.0) / 40.0;

    // Per-block random noise
    float noise = hash(gridUv);

    // Directional wipe left -> right
    float wipe = vUv.x;

    // Combined threshold: noise adds randomness to the wipe edge
    float threshold = noise * 0.4 + wipe * 0.6;

    // Royal Blue scanning edge color: #4169E1
    vec3 royalBlue = vec3(0.255, 0.412, 0.882);

    if (u_progress > threshold + 0.05) {
      // Fully revealed — show texture pixel (sampled at block center for pixelated look)
      vec2 blockCenter = gridUv + 0.5 / 40.0;
      vec4 texColor = texture2D(u_texture, blockCenter);
      gl_FragColor = texColor;
    } else if (u_progress > threshold) {
      // Scanning edge — flash Royal Blue
      float edgeFactor = (u_progress - threshold) / 0.05;
      vec4 texColor = texture2D(u_texture, gridUv + 0.5 / 40.0);
      gl_FragColor = vec4(mix(royalBlue, texColor.rgb, edgeFactor * 0.3), 1.0);
    } else {
      // Not yet revealed — transparent
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    }
  }
`

const GlitchImage = forwardRef<GlitchImageHandle, GlitchImageProps>(
  ({ imageUrl, className }, ref) => {
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
    const imageUrlRef = useRef(imageUrl)

    // Keep imageUrl ref in sync
    imageUrlRef.current = imageUrl

    // Initialize Three.js lazily — only when progress first becomes > 0
    const initWebGL = useCallback(() => {
      if (initializedRef.current || !mountedRef.current) return
      const container = containerRef.current
      if (!container) return

      initializedRef.current = true
      const width = container.clientWidth || 300
      const height = container.clientHeight || 188

      // Scene setup
      const scene = new THREE.Scene()
      sceneRef.current = scene

      const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10)
      camera.position.z = 1
      cameraRef.current = camera

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: 'low-power'
      })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      container.appendChild(renderer.domElement)
      rendererRef.current = renderer

      // Load texture
      const loader = new THREE.TextureLoader()
      loader.load(
        imageUrlRef.current,
        (texture) => {
          if (!mountedRef.current) return

          texture.minFilter = THREE.LinearFilter
          texture.magFilter = THREE.LinearFilter

          const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
              u_texture: { value: texture },
              u_progress: { value: progressRef.current },
              u_resolution: { value: new THREE.Vector2(width, height) }
            },
            transparent: true
          })
          materialRef.current = material

          const geometry = new THREE.PlaneGeometry(1, 1)
          const mesh = new THREE.Mesh(geometry, material)
          scene.add(mesh)

          // Render current state immediately
          renderer.render(scene, camera)
          lastProgressRef.current = progressRef.current

          // Start render loop
          startRenderLoop()
        },
        undefined,
        () => {
          // Image load error — create a fallback dark plane so the shader still runs
          if (!mountedRef.current) return

          const canvas = document.createElement('canvas')
          canvas.width = 2
          canvas.height = 2
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.fillStyle = '#1a1a2e'
            ctx.fillRect(0, 0, 2, 2)
          }
          const fallbackTexture = new THREE.CanvasTexture(canvas)

          const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
              u_texture: { value: fallbackTexture },
              u_progress: { value: progressRef.current },
              u_resolution: { value: new THREE.Vector2(width, height) }
            },
            transparent: true
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

      // Handle resize
      const resizeObserver = new ResizeObserver((entries) => {
        const { width: w, height: h } = entries[0].contentRect
        if (w > 0 && h > 0 && rendererRef.current) {
          rendererRef.current.setSize(w, h)
          if (materialRef.current) {
            materialRef.current.uniforms.u_resolution.value.set(w, h)
          }
          lastProgressRef.current = -1 // Force re-render
        }
      })
      resizeObserver.observe(container)

      return resizeObserver
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
            material.uniforms.u_progress.value = progressRef.current
            renderer.render(scene, camera)
            lastProgressRef.current = progressRef.current
          }
        }

        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }, [])

    // Expose progress as a mutable property for GSAP
    // When progress is first set > 0, lazily init WebGL
    useImperativeHandle(ref, () => ({
      get progress() {
        return progressRef.current
      },
      set progress(value: number) {
        progressRef.current = value
        if (value > 0 && !initializedRef.current) {
          initWebGL()
        }
      }
    }), [initWebGL])

    useEffect(() => {
      mountedRef.current = true

      return () => {
        mountedRef.current = false
        cancelAnimationFrame(rafRef.current)

        const container = containerRef.current

        // Cleanup Three.js resources
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
                if (obj.material.uniforms.u_texture?.value) {
                  obj.material.uniforms.u_texture.value.dispose()
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
        style={{ width: '100%', height: '100%', position: 'relative' }}
      />
    )
  }
)

GlitchImage.displayName = 'GlitchImage'

export default GlitchImage
