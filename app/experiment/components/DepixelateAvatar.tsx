'use client'

import { useRef, useEffect, useCallback } from 'react'

/**
 * DepixelateAvatar — Canvas-based cell-by-cell de-pixelation on hover.
 * Ports the hero shader's hash-based stagger to 2D canvas.
 *
 * Default state (progress=0): pixelated blocks (~cellSize px)
 * Hover: GSAP animates progress 0→1 over 0.8s for a bottom-to-top sweep reveal
 * Leave: reverse animation 1→0 over 0.6s
 */

interface DepixelateAvatarProps {
  src: string
  alt: string
  cellSize?: number
}

// Shader-style hash for per-cell stagger (matching hero shader)
function hash(x: number, y: number): number {
  return ((Math.sin(x * 127.1 + y * 311.7) * 43758.5453) % 1 + 1) % 1
}

export default function DepixelateAvatar({ src, alt, cellSize = 12 }: DepixelateAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const progressRef = useRef(0)
  const rafRef = useRef<number>(0)
  const gsapRef = useRef<typeof import('gsap')['default'] | null>(null)
  const tweenRef = useRef<{ kill: () => void } | null>(null)
  const pixelDataRef = useRef<ImageData | null>(null)

  // Load GSAP
  useEffect(() => {
    import('gsap').then(mod => { gsapRef.current = mod.default })
  }, [])

  // Load image and generate initial pixelated state
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src

    const onLoad = () => {
      imgRef.current = img
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.parentElement?.getBoundingClientRect()
      const w = rect?.width || 280
      const h = rect?.height || 280
      canvas.width = w
      canvas.height = h

      // Create offscreen canvas for pixel sampling
      const offscreen = document.createElement('canvas')
      offscreen.width = w
      offscreen.height = h
      const offCtx = offscreen.getContext('2d')
      if (!offCtx) return
      offCtx.drawImage(img, 0, 0, w, h)
      pixelDataRef.current = offCtx.getImageData(0, 0, w, h)

      // Draw initial pixelated state
      drawFrame(canvas, w, h, 0)
    }

    if (img.complete && img.naturalWidth > 0) {
      onLoad()
    } else {
      img.addEventListener('load', onLoad)
      return () => img.removeEventListener('load', onLoad)
    }
  }, [src, cellSize])

  const drawFrame = useCallback((canvas: HTMLCanvasElement, w: number, h: number, progress: number) => {
    const ctx = canvas.getContext('2d')
    const img = imgRef.current
    const pixelData = pixelDataRef.current
    if (!ctx || !img || !pixelData) return

    const cols = Math.ceil(w / cellSize)
    const rows = Math.ceil(h / cellSize)

    ctx.clearRect(0, 0, w, h)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cx = col * cellSize
        const cy = row * cellSize
        const cw = Math.min(cellSize, w - cx)
        const ch = Math.min(cellSize, h - cy)

        // Vertical sweep: bottom cells reveal first (1 - normalized row)
        const verticalSweep = 1 - (row / rows)
        const threshold = hash(col, row) * 0.3 + verticalSweep * 0.7

        if (progress > threshold + 0.08) {
          // Clean image cell
          ctx.drawImage(img, cx, cy, cw, ch, cx, cy, cw, ch)
          // Apply grayscale tint that fades out as progress nears 1
          const grayAmount = Math.max(0, 1 - (progress - threshold - 0.08) / 0.3)
          if (grayAmount > 0) {
            // Sample average color for desaturation overlay
            ctx.fillStyle = `rgba(20, 20, 20, ${grayAmount * 0.5})`
            ctx.fillRect(cx, cy, cw, ch)
          }
        } else if (progress > threshold) {
          // Transition band — mid-gray
          ctx.fillStyle = '#242424'
          ctx.fillRect(cx, cy, cw, ch)
        } else {
          // Pixelated block — average color from center of cell
          const sampleX = Math.min(cx + Math.floor(cellSize / 2), w - 1)
          const sampleY = Math.min(cy + Math.floor(cellSize / 2), h - 1)
          const idx = (sampleY * w + sampleX) * 4
          const r = pixelData.data[idx]
          const g = pixelData.data[idx + 1]
          const b = pixelData.data[idx + 2]

          // Convert to grayscale for pixelated state
          const gray = Math.round(r * 0.299 + g * 0.587 + b * 0.114)
          ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`
          ctx.fillRect(cx, cy, cw, ch)
        }
      }
    }
  }, [cellSize])

  // Animation loop during active transition
  const startAnimLoop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const loop = () => {
      drawFrame(canvas, canvas.width, canvas.height, progressRef.current)
      rafRef.current = requestAnimationFrame(loop)
    }
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(loop)
  }, [drawFrame])

  const stopAnimLoop = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    // Draw one final frame
    const canvas = canvasRef.current
    if (canvas) {
      drawFrame(canvas, canvas.width, canvas.height, progressRef.current)
    }
  }, [drawFrame])

  const handleMouseEnter = useCallback(() => {
    const gsap = gsapRef.current
    if (!gsap) return

    tweenRef.current?.kill()
    startAnimLoop()

    const proxy = { value: progressRef.current }
    tweenRef.current = gsap.to(proxy, {
      value: 1,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: () => { progressRef.current = proxy.value },
      onComplete: stopAnimLoop,
    })
  }, [startAnimLoop, stopAnimLoop])

  const handleMouseLeave = useCallback(() => {
    const gsap = gsapRef.current
    if (!gsap) return

    tweenRef.current?.kill()
    startAnimLoop()

    const proxy = { value: progressRef.current }
    tweenRef.current = gsap.to(proxy, {
      value: 0,
      duration: 0.6,
      ease: 'power2.inOut',
      onUpdate: () => { progressRef.current = proxy.value },
      onComplete: stopAnimLoop,
    })
  }, [startAnimLoop, stopAnimLoop])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current)
      tweenRef.current?.kill()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="exp-team-depixelate-canvas"
      aria-label={alt}
      role="img"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  )
}
