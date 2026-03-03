'use client'

import { useEffect, useRef, useCallback } from 'react'

/**
 * ConvergenceCanvas — Particle-to-wave animation
 *
 * Left zone (0-35%): Chaotic particles moving rightward
 * Center (35-65%): "AGENTIC ORCHESTRATION" bordered box
 * Right zone (65-100%): Smooth Perlin noise wave lines
 *
 * Particles funnel into the box, waves emerge from it.
 */

/* ─── Perlin Noise (classic 2D) ─── */
class PerlinNoise {
  private perm: number[]

  constructor(seed = 0) {
    const p: number[] = []
    for (let i = 0; i < 256; i++) p[i] = i
    let s = seed
    for (let i = 255; i > 0; i--) {
      s = (s * 16807 + 0) % 2147483647
      const j = s % (i + 1)
      ;[p[i], p[j]] = [p[j], p[i]]
    }
    this.perm = [...p, ...p]
  }

  private fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10) }
  private lerp(a: number, b: number, t: number) { return a + t * (b - a) }
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

/* ─── Particle type ─── */
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  opacity: number
  length: number
}

function createParticle(w: number, h: number, reset?: boolean): Particle {
  return {
    x: reset ? -Math.random() * w * 0.2 : Math.random() * w * 0.35,
    y: Math.random() * h,
    vx: 1 + Math.random() * 2,
    vy: (Math.random() - 0.5) * 1.5,
    opacity: 0.1 + Math.random() * 0.4,
    length: 8 + Math.random() * 20,
  }
}

interface ConvergenceCanvasProps {
  className?: string
  style?: React.CSSProperties
}

export default function ConvergenceCanvas({ className, style }: ConvergenceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const timeRef = useRef(0)
  const perlinRef = useRef(new PerlinNoise(42))
  const particlesRef = useRef<Particle[]>([])
  const isVisibleRef = useRef(false)
  const mouseRef = useRef({ x: -9999, y: -9999, vx: 0, vy: 0, prevX: -9999, prevY: -9999 })

  const initParticles = useCallback((w: number, h: number) => {
    const count = Math.min(100, Math.max(60, Math.floor(w / 15)))
    const particles: Particle[] = []
    for (let i = 0; i < count; i++) {
      particles.push(createParticle(w, h))
    }
    particlesRef.current = particles
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let dpr = 1

    const updateSize = () => {
      dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      initParticles(rect.width, rect.height)
    }

    updateSize()
    window.addEventListener('resize', updateSize)

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const m = mouseRef.current
      m.prevX = m.x
      m.prevY = m.y
      m.x = e.clientX - rect.left
      m.y = e.clientY - rect.top
    }
    const handleMouseLeave = () => {
      mouseRef.current.x = -9999
      mouseRef.current.y = -9999
    }
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    // IntersectionObserver — only animate when visible
    const observer = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting },
      { threshold: 0.1 }
    )
    observer.observe(canvas)

    const perlin = perlinRef.current
    const mouse = mouseRef.current

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)

      if (!isVisibleRef.current) return

      const w = canvas.width / dpr
      const h = canvas.height / dpr

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      timeRef.current += 0.003

      // Mouse velocity
      mouse.vx = (mouse.vx + (mouse.x - mouse.prevX) * 0.015) * 0.88
      mouse.vy = (mouse.vy + (mouse.y - mouse.prevY) * 0.015) * 0.88
      mouse.prevX = mouse.x
      mouse.prevY = mouse.y

      const t = timeRef.current
      const boxLeft = w * 0.35
      const boxRight = w * 0.65
      const boxTop = h * 0.3
      const boxBottom = h * 0.7
      const boxCenterY = h * 0.5

      // ── LEFT ZONE: Chaotic particles ──
      const particles = particlesRef.current
      ctx.lineCap = 'round'

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Funnel toward center Y as particles approach the box
        const funnelStrength = Math.max(0, (p.x / boxLeft) * 0.03)
        const dyToCenter = (boxCenterY - p.y) * funnelStrength
        p.vy += dyToCenter

        // Mouse push-away
        if (mouse.x > -999) {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            const force = (1 - dist / 150) * 0.4
            p.vy += mouse.vy * force * 15
          }
        }

        // Y-axis random jitter (chaos)
        p.vy += (Math.random() - 0.5) * 0.3

        p.x += p.vx
        p.y += p.vy
        p.vy *= 0.95 // dampen vertical velocity

        // Fade in from left edge
        const fadeIn = Math.min(1, p.x / (w * 0.1))
        const alpha = p.opacity * fadeIn

        // Draw particle line
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(p.x - p.length, p.y)
        ctx.lineTo(p.x, p.y)
        ctx.stroke()

        // Recycle: if particle exits past box left edge or off screen
        if (p.x > boxLeft + 10 || p.y < -20 || p.y > h + 20) {
          particles[i] = createParticle(w, h, true)
        }
      }

      // ── CENTER: Bordered box with label ──
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
      ctx.lineWidth = 1
      ctx.strokeRect(boxLeft, boxTop, boxRight - boxLeft, boxBottom - boxTop)

      ctx.font = '11px "SF Mono", "Fira Code", "Cascadia Code", "Courier New", monospace'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('AGENTIC ORCHESTRATION', (boxLeft + boxRight) / 2, boxCenterY)

      // ── RIGHT ZONE: Smooth Perlin noise waves ──
      const waveStartX = boxRight
      const waveEndX = w
      const waveLines = 5
      const waveGap = (boxBottom - boxTop) / (waveLines + 1)
      const xStep = 10

      for (let line = 0; line < waveLines; line++) {
        const baseY = boxTop + waveGap * (line + 1)
        const lineOpacity = 0.12 + (line % 2) * 0.06

        ctx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity})`
        ctx.lineWidth = 1
        ctx.beginPath()

        const points: { x: number; y: number }[] = []

        for (let x = waveStartX; x <= waveEndX; x += xStep) {
          // Wave amplitude builds from box edge outward
          const distFromBox = (x - waveStartX) / (waveEndX - waveStartX)
          const amp = distFromBox * 25

          const noiseVal = perlin.noise2D(x * 0.005 + t + line * 0.5, baseY * 0.005 + t * 0.3)
          const dy = noiseVal * amp

          // Mouse influence on waves
          let pushY = 0
          if (mouse.x > -999) {
            const dx = x - mouse.x
            const dmy = (baseY + dy) - mouse.y
            const dist = Math.sqrt(dx * dx + dmy * dmy)
            if (dist < 200) {
              pushY = mouse.vy * (1 - dist / 200) * 20
            }
          }

          points.push({ x, y: baseY + dy + pushY })
        }

        if (points.length < 2) continue

        ctx.moveTo(points[0].x, points[0].y)
        for (let i = 1; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2
          const yc = (points[i].y + points[i + 1].y) / 2
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
        }
        const last = points[points.length - 1]
        ctx.lineTo(last.x, last.y)
        ctx.stroke()
      }
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', updateSize)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      observer.disconnect()
    }
  }, [initParticles])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: 300, ...style }}
    />
  )
}
