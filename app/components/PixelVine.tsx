'use client'

import { useEffect, useRef } from 'react'

/**
 * PixelVine — A single connected line of pixel blocks flowing from the hero image.
 *
 * Path: hero image bottom → vertical drop → horizontal split at services → cascade down edges.
 * One block per position. Clean, minimal, connected. Multi-color by Y position.
 */
export default function PixelVine() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // ── Config ───────────────────────────────────────────
    const BLOCK = 10
    const EDGE_INSET = 24
    const TRANSITION_W = 0.08 // how wide the per-block easing window is

    // Seeded random for consistent rendering
    const srand = (seed: number) => {
      const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
      return x - Math.floor(x)
    }

    // ── Color palette (green → turquoise → warm) ─────────
    const hexToRgb = (hex: string): [number, number, number] => {
      const n = parseInt(hex.replace('#', ''), 16)
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    }

    const lerpColor = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] => [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t),
    ]

    const COLOR_STOPS: Array<{ pos: number; color: [number, number, number] }> = [
      { pos: 0.0, color: hexToRgb('#0a1628') },
      { pos: 0.25, color: hexToRgb('#1e3a5f') },
      { pos: 0.5, color: hexToRgb('#2563eb') },
      { pos: 0.75, color: hexToRgb('#60a5fa') },
      { pos: 1.0, color: hexToRgb('#93c5fd') },
    ]

    const colorAtT = (t: number): [number, number, number] => {
      const f = Math.max(0, Math.min(1, t))
      for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
        if (f <= COLOR_STOPS[i + 1].pos) {
          const local = (f - COLOR_STOPS[i].pos) / (COLOR_STOPS[i + 1].pos - COLOR_STOPS[i].pos)
          return lerpColor(COLOR_STOPS[i].color, COLOR_STOPS[i + 1].color, local)
        }
      }
      return COLOR_STOPS[COLOR_STOPS.length - 1].color
    }

    // ── Brightness adjust for bevel ──────────────────────
    const adjustBrightness = (r: number, g: number, b: number, factor: number): [number, number, number] => [
      Math.min(255, Math.round(r * factor)),
      Math.min(255, Math.round(g * factor)),
      Math.min(255, Math.round(b * factor)),
    ]

    // ── Draw one beveled pixel block ─────────────────────
    const drawBlock = (
      x: number, y: number, size: number,
      r: number, g: number, b: number, alpha: number
    ) => {
      ctx.globalAlpha = alpha
      ctx.fillStyle = `rgb(${r},${g},${b})`
      ctx.fillRect(x, y, size, size)

      if (size >= 6) {
        const [hr, hg, hb] = adjustBrightness(r, g, b, 1.4)
        ctx.fillStyle = `rgba(${hr},${hg},${hb},0.5)`
        ctx.fillRect(x, y, size, 1)
        ctx.fillRect(x, y, 1, size)
        const [sr, sg, sb] = adjustBrightness(r, g, b, 0.55)
        ctx.fillStyle = `rgba(${sr},${sg},${sb},0.5)`
        ctx.fillRect(x, y + size - 1, size, 1)
        ctx.fillRect(x + size - 1, y, 1, size)
      }
    }

    // ── Block definition ─────────────────────────────────
    interface Block {
      fx: number; fy: number      // final position (page coords)
      ox: number; oy: number      // origin position (page coords)
      pathT: number               // 0–1 on vine timeline
      yFrac: number               // fraction of page height (for color)
    }

    // ── Layout ───────────────────────────────────────────
    const vw = window.innerWidth
    const pageH = Math.max(document.documentElement.scrollHeight, 5000)

    // Hero image origin point
    const heroEl = document.querySelector('.hero-image') as HTMLElement | null
    const heroRect = heroEl?.getBoundingClientRect()
    const scrollY0 = window.scrollY
    const heroBottom = heroEl ? (heroRect!.bottom + scrollY0) : 400
    const centerX = vw / 2

    // Services section target
    const servicesEl = document.getElementById('services')
    const servicesTop = servicesEl ? servicesEl.offsetTop : heroBottom + 600

    // ── Build the single path ────────────────────────────
    const blocks: Block[] = []
    const STEP = BLOCK + 2 // spacing between blocks

    const addBlock = (fx: number, fy: number, pathT: number, ox?: number, oy?: number) => {
      blocks.push({
        fx, fy,
        ox: ox ?? centerX,
        oy: oy ?? heroBottom,
        pathT: Math.max(0, Math.min(1, pathT)),
        yFrac: fy / pageH,
      })
    }

    // Segment 1: Vertical drop from hero bottom to services top (pathT 0 → 0.20)
    const dropStartY = heroBottom + 20
    const dropEndY = servicesTop - 10
    const dropLen = dropEndY - dropStartY
    const dropCount = Math.max(5, Math.floor(dropLen / STEP))

    for (let i = 0; i < dropCount; i++) {
      const t = i / dropCount
      addBlock(centerX, dropStartY + t * dropLen, t * 0.20)
    }

    // Segment 2: Horizontal split — left and right from center (pathT 0.20 → 0.50)
    const spreadY = servicesTop
    const halfW = centerX - EDGE_INSET
    const spreadCount = Math.max(5, Math.floor(halfW / STEP))

    for (let i = 1; i <= spreadCount; i++) {
      const t = i / spreadCount
      const pathT = 0.20 + t * 0.30
      const x = t * halfW
      // Left
      addBlock(centerX - x, spreadY, pathT, centerX, spreadY)
      // Right
      addBlock(centerX + x, spreadY, pathT + 0.001, centerX, spreadY)
    }

    // Segment 3: Cascade down left and right edges (pathT 0.50 → 1.0)
    const cascadeStartY = servicesTop + STEP
    const cascadeEndY = pageH - 200
    const cascadeLen = cascadeEndY - cascadeStartY
    const cascadeCount = Math.max(5, Math.floor(cascadeLen / STEP))

    for (let i = 0; i < cascadeCount; i++) {
      const t = i / cascadeCount
      const y = cascadeStartY + t * cascadeLen
      const pathT = 0.50 + t * 0.50

      // Left edge
      addBlock(EDGE_INSET, y, pathT, EDGE_INSET, spreadY)
      // Right edge
      addBlock(vw - EDGE_INSET, y, pathT + 0.001, vw - EDGE_INSET, spreadY)
    }

    // ── Easing ───────────────────────────────────────────
    const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x))
    const smootherstep = (x: number) => {
      x = clamp(x, 0, 1)
      return x * x * x * (x * (6 * x - 15) + 10)
    }

    // ── Render loop ──────────────────────────────────────
    let raf: number
    let time = 0

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.imageSmoothingEnabled = false
    }

    const render = () => {
      time += 0.016
      const scrollY = window.scrollY
      const vh = window.innerHeight
      const vwNow = window.innerWidth

      // Element-based scroll progress
      let rawProg = 0
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect()
        const triggerLine = vh * 0.7
        if (rect.bottom < triggerLine) {
          rawProg = clamp((triggerLine - rect.bottom) / (vh * 2.5), 0, 1)
        }
      } else {
        rawProg = clamp(scrollY / (vh * 2.5), 0, 1)
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < blocks.length; i++) {
        const bl = blocks[i]

        // Per-block progress
        const bp = clamp((rawProg - bl.pathT) / TRANSITION_W, 0, 1)
        if (bp <= 0) continue

        const eased = smootherstep(bp)

        // Interpolate origin → final
        const x = bl.ox + (bl.fx - bl.ox) * eased
        const y = bl.oy + (bl.fy - bl.oy) * eased

        // Page → screen coords
        const sx = x
        const sy = y - scrollY

        // Viewport culling
        if (sy < -20 || sy > vh + 20 || sx < -20 || sx > vwNow + 20) continue

        // Subtle shimmer
        const shimmer = 0.92 + 0.08 * Math.sin(time * 1.5 + bl.pathT * 25)
        const alpha = Math.min(1, bp * 1.2) * shimmer

        // Color by Y fraction
        const [cr, cg, cb] = colorAtT(bl.yFrac)

        // Pixel jitter based on seed for organic feel
        const jx = (srand(i * 1.618) - 0.5) * 1.5
        const jy = (srand(i * 2.718) - 0.5) * 1.5

        const bx = Math.round(sx - BLOCK / 2 + jx)
        const by = Math.round(sy - BLOCK / 2 + jy)

        drawBlock(bx, by, BLOCK, cr, cg, cb, alpha)
      }

      ctx.globalAlpha = 1
      raf = requestAnimationFrame(render)
    }

    resize()
    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 2,
      }}
    />
  )
}
