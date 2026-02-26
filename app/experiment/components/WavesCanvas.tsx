'use client'

import { useEffect, useRef } from 'react'

/**
 * WavesCanvas — Perlin noise–driven wave lines with mouse interaction
 *
 * Ported from Isidor's createWaves() function:
 * - Perlin noise for organic wave displacement
 * - Mouse velocity tracking with friction/tension physics
 * - Smooth quadraticCurveTo bezier curves between points
 * - Configurable: lineColor, waveSpeed, waveAmp, lineWidth, xGap, yGap
 */

interface WavesCanvasProps {
  /** Line stroke color */
  lineColor?: string
  /** Background fill (transparent = no fill) */
  backgroundColor?: string
  /** Horizontal gap between wave points */
  xGap?: number
  /** Vertical gap between wave lines */
  yGap?: number
  /** Stroke width */
  lineWidth?: number
  /** Wave amplitude multiplier */
  waveAmp?: number
  /** Wave speed (Perlin noise time step) */
  waveSpeed?: number
  /** Mouse friction (0-1, higher = more friction) */
  friction?: number
  /** Mouse tension (0-1, higher = snappier) */
  tension?: number
  /** Enable mouse interaction */
  mouseInteraction?: boolean
  /** CSS class for the canvas */
  className?: string
  /** Inline styles */
  style?: React.CSSProperties
}

/* ─── Perlin Noise (classic 2D, Ken Perlin) ─── */

class PerlinNoise {
  private perm: number[]

  constructor(seed = 0) {
    const p: number[] = []
    for (let i = 0; i < 256; i++) p[i] = i

    // Fisher-Yates shuffle with seed
    let s = seed
    for (let i = 255; i > 0; i--) {
      s = (s * 16807 + 0) % 2147483647
      const j = s % (i + 1)
      ;[p[i], p[j]] = [p[j], p[i]]
    }

    this.perm = [...p, ...p] // double for overflow
  }

  private fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  private lerp(a: number, b: number, t: number) {
    return a + t * (b - a)
  }

  private grad(hash: number, x: number, y: number) {
    const h = hash & 3
    const u = h < 2 ? x : y
    const v = h < 2 ? y : x
    return (h & 1 ? -u : u) + (h & 2 ? -v : v)
  }

  noise2D(x: number, y: number) {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255
    const xf = x - Math.floor(x)
    const yf = y - Math.floor(y)
    const u = this.fade(xf)
    const v = this.fade(yf)

    const aa = this.perm[this.perm[X] + Y]
    const ab = this.perm[this.perm[X] + Y + 1]
    const ba = this.perm[this.perm[X + 1] + Y]
    const bb = this.perm[this.perm[X + 1] + Y + 1]

    return this.lerp(
      this.lerp(this.grad(aa, xf, yf), this.grad(ba, xf - 1, yf), u),
      this.lerp(this.grad(ab, xf, yf - 1), this.grad(bb, xf - 1, yf - 1), u),
      v
    )
  }
}

export default function WavesCanvas({
  lineColor = 'rgba(255, 255, 255, 0.12)',
  backgroundColor,
  xGap = 12,
  yGap = 36,
  lineWidth = 1,
  waveAmp = 40,
  waveSpeed = 0.003,
  friction = 0.88,
  tension = 0.015,
  mouseInteraction = true,
  className,
  style,
}: WavesCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const mouseRef = useRef({ x: -9999, y: -9999, vx: 0, vy: 0, prevX: -9999, prevY: -9999 })
  const timeRef = useRef(0)
  const perlinRef = useRef<PerlinNoise>(new PerlinNoise(42))
  const dprRef = useRef(1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1
      dprRef.current = dpr
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
    }
    updateSize()
    window.addEventListener('resize', updateSize)

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseInteraction) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const mouse = mouseRef.current
      mouse.prevX = mouse.x
      mouse.prevY = mouse.y
      mouse.x = x
      mouse.y = y
    }

    const handleMouseLeave = () => {
      mouseRef.current.x = -9999
      mouseRef.current.y = -9999
    }

    if (mouseInteraction) {
      canvas.addEventListener('mousemove', handleMouseMove)
      canvas.addEventListener('mouseleave', handleMouseLeave)
    }

    const perlin = perlinRef.current
    const mouse = mouseRef.current

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)

      const dpr = dprRef.current
      const w = canvas.width / dpr
      const h = canvas.height / dpr

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      if (backgroundColor) {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, w, h)
      }

      timeRef.current += waveSpeed

      // Mouse velocity with friction
      mouse.vx = (mouse.vx + (mouse.x - mouse.prevX) * tension) * friction
      mouse.vy = (mouse.vy + (mouse.y - mouse.prevY) * tension) * friction
      mouse.prevX = mouse.x
      mouse.prevY = mouse.y

      const t = timeRef.current
      const cols = Math.ceil(w / xGap) + 2
      const rows = Math.ceil(h / yGap) + 2
      const startY = -yGap

      ctx.strokeStyle = lineColor
      ctx.lineWidth = lineWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      for (let row = 0; row < rows; row++) {
        const baseY = startY + row * yGap

        ctx.beginPath()

        const points: { x: number; y: number }[] = []

        for (let col = 0; col < cols; col++) {
          const px = col * xGap
          const py = baseY

          // Perlin noise displacement
          const noiseVal = perlin.noise2D(px * 0.003 + t, py * 0.003 + t * 0.5)
          let dy = noiseVal * waveAmp

          // Mouse influence — push waves away from cursor
          if (mouseInteraction && mouse.x > -999) {
            const dx = px - mouse.x
            const dmy = py - mouse.y
            const dist = Math.sqrt(dx * dx + dmy * dmy)
            const influenceRadius = 200
            if (dist < influenceRadius) {
              const force = (1 - dist / influenceRadius) * 0.6
              dy += mouse.vy * force * 30
              // Subtle horizontal push too
              const pushX = mouse.vx * force * 8
              points.push({ x: px + pushX, y: py + dy })
              continue
            }
          }

          points.push({ x: px, y: py + dy })
        }

        // Draw smooth bezier curve through points
        if (points.length < 2) continue

        ctx.moveTo(points[0].x, points[0].y)

        for (let i = 1; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2
          const yc = (points[i].y + points[i + 1].y) / 2
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
        }

        // Last segment
        const last = points[points.length - 1]
        ctx.lineTo(last.x, last.y)

        ctx.stroke()
      }
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', updateSize)
      if (mouseInteraction) {
        canvas.removeEventListener('mousemove', handleMouseMove)
        canvas.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [lineColor, backgroundColor, xGap, yGap, lineWidth, waveAmp, waveSpeed, friction, tension, mouseInteraction])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', ...style }}
    />
  )
}
