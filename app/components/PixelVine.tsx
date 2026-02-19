'use client'

import { useEffect, useRef } from 'react'

/**
 * PixelVine — Scroll-driven vine that grows from the header downward.
 *
 * A thin line of small green pixel blocks starts at the nav/header
 * and grows down the page as the user scrolls:
 *
 *   Segment 1: Vertical line from header → services section top
 *   Segment 2: Horizontal spread at services top (center → edges)
 *   Segment 3: Border streams down left/right page edges
 *
 * The top portion of the vine is always visible. Growth is scroll-driven.
 */
export default function PixelVine() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // ── Configuration ──────────────────────────────────────
    const BLOCK = 8                // small, subtle blocks
    const EDGE_INSET = 32          // border stream inset from edge
    const TRANSITION_WIDTH = 0.08  // scroll fraction each block takes to materialize
    const HEAD_MULT = 1.5          // vine leads ahead of scroll

    // Green palette (forest → mint)
    const GREENS = [
      '#1b4332', '#2d6a4f', '#40916c', '#52b788',
      '#74c69d', '#95d5b2', '#b7e4c7',
    ]

    // ── Helpers ────────────────────────────────────────────
    const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x))

    const smootherstep = (x: number) => {
      x = clamp(x, 0, 1)
      return x * x * x * (x * (6 * x - 15) + 10)
    }

    // Deterministic seeded random
    const srand = (seed: number) => {
      const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
      return x - Math.floor(x)
    }

    // Brightness adjustment for bevel
    const brighten = (hex: string, factor: number): string => {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgb(${clamp(Math.round(r * factor), 0, 255)},${clamp(Math.round(g * factor), 0, 255)},${clamp(Math.round(b * factor), 0, 255)})`
    }

    // ── Block definition ─────────────────────────────────
    interface Block {
      fx: number; fy: number      // final position (page coords)
      ox: number; oy: number      // origin position (page coords)
      pathT: number               // 0–1 on vine timeline
      color: string
      size: number
      alpha: number
    }

    // ── Layout ───────────────────────────────────────────
    const vw = window.innerWidth
    const navHeight = 80           // matches --nav-height
    const servicesEl = document.getElementById('services')
    const servicesTop = servicesEl ? servicesEl.offsetTop : 800
    const pageH = Math.max(document.documentElement.scrollHeight, 5000)

    // Vine starts at header bottom (below nav)
    const startY = navHeight + 40
    const centerX = vw / 2

    // ── Build vine path ──────────────────────────────────
    const blocks: Block[] = []
    let bid = 0

    const addBlock = (fx: number, fy: number, pathT: number, fromCenter = true) => {
      const s = bid * 1.618033
      const color = GREENS[Math.floor(srand(s + 1) * GREENS.length)]
      const size = BLOCK + Math.floor(srand(s + 2) * 2) - 1 // 7–9px

      // Origin: blocks come from the top-center area
      const ox = fromCenter ? centerX + (srand(s + 10) - 0.5) * 20 : fx
      const oy = fromCenter ? startY + (srand(s + 11) - 0.5) * 10 : fy - 30

      blocks.push({
        fx, fy, ox, oy,
        pathT: clamp(pathT, 0, 1),
        color,
        size,
        alpha: 0.5 + srand(s + 3) * 0.35, // visible: 0.5–0.85
      })
      bid++
    }

    // ── Segment 1: Vertical line — header → services ──
    // This is the main "vine" dropping from the header
    const vertLen = servicesTop - startY
    const vertSpacing = 12
    const vertCount = Math.max(10, Math.floor(vertLen / vertSpacing))

    for (let i = 0; i < vertCount; i++) {
      const t = i / vertCount
      const y = startY + t * vertLen
      const pathT = t * 0.20  // pathT 0 → 0.20

      // Main line block (center)
      addBlock(centerX, y, pathT)

      // Occasional adjacent dither block for texture (every 4th)
      if (i % 4 === 0) {
        const side = i % 8 === 0 ? -1 : 1
        addBlock(centerX + side * (BLOCK + 1), y + 2, pathT + 0.001)
      }
    }

    // ── Segment 2: Horizontal spread at services top ──
    const hY = servicesTop + 4
    const hHalf = vw / 2 - EDGE_INSET
    const hSpacing = 14
    const hSteps = Math.max(10, Math.floor(hHalf / hSpacing))

    for (let i = 0; i < hSteps; i++) {
      const dist = (i + 1) / hSteps
      const pathT = 0.20 + dist * 0.50  // 0.20 → 0.70
      // Left + Right
      addBlock(centerX - dist * hHalf, hY, pathT, false)
      addBlock(centerX + dist * hHalf, hY, pathT + 0.0003, false)
      // Texture blocks every 5th
      if (i % 5 === 0) {
        addBlock(centerX - dist * hHalf, hY - BLOCK - 1, pathT + 0.002, false)
        addBlock(centerX + dist * hHalf, hY + BLOCK + 1, pathT + 0.002, false)
      }
    }

    // ── Segment 3: Border streams down both sides ──
    const bStartY = servicesTop + 20
    const bEndY = pageH - 150
    const bLen = bEndY - bStartY
    const bSpacing = 16
    const bCount = Math.max(10, Math.floor(bLen / bSpacing))

    for (let i = 0; i < bCount; i++) {
      const t = i / bCount
      const y = bStartY + t * bLen
      const pathT = 0.70 + t * 0.30  // 0.70 → 1.0
      const wave = Math.sin(y * 0.007) * 3

      // Left border
      addBlock(EDGE_INSET + wave, y, pathT, false)
      if (i % 4 === 0) {
        addBlock(EDGE_INSET + BLOCK + 2 + wave, y + 3, pathT + 0.001, false)
      }

      // Right border
      addBlock(vw - EDGE_INSET - wave, y, pathT + 0.0002, false)
      if (i % 5 === 0) {
        addBlock(vw - EDGE_INSET - BLOCK - 2 - wave, y + 3, pathT + 0.001, false)
      }
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

      // ── Scroll progress ──
      // Linear mapping over ~2 viewport heights — fast enough to track scrolling.
      // Base of 0.06 ensures the first few vine blocks are always visible.
      // No smootherstep on raw progress — keeps 1:1 scroll responsiveness.
      const rawProg = clamp(scrollY / (vh * 1.8) + 0.06, 0, 1)
      const headPos = rawProg * HEAD_MULT

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < blocks.length; i++) {
        const bl = blocks[i]

        // Per-block progress
        const bp = clamp((headPos - bl.pathT) / TRANSITION_WIDTH, 0, 1)
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
        const shimmer = 0.9 + 0.1 * Math.sin(time * 1.2 + bl.pathT * 20)
        const alpha = bl.alpha * bp * shimmer
        const hs = bl.size / 2
        const bx = Math.round(sx - hs)
        const by = Math.round(sy - hs)

        // ── Draw block with subtle bevel ──
        ctx.globalAlpha = alpha
        ctx.fillStyle = bl.color
        ctx.fillRect(bx, by, bl.size, bl.size)

        // Bevel highlight (top-left) + shadow (bottom-right)
        if (bl.size >= 6) {
          ctx.globalAlpha = alpha * 0.3
          ctx.fillStyle = brighten(bl.color, 1.4)
          ctx.fillRect(bx, by, bl.size, 1)
          ctx.fillRect(bx, by, 1, bl.size)

          ctx.fillStyle = brighten(bl.color, 0.55)
          ctx.fillRect(bx, by + bl.size - 1, bl.size, 1)
          ctx.fillRect(bx + bl.size - 1, by, 1, bl.size)
        }
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
