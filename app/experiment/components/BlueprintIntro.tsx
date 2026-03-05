'use client'

import { useEffect, useRef } from 'react'

interface BlueprintIntroProps {
  onComplete: () => void
}

// Logo pattern: 5 columns x 4 rows of circles
// 1 = white circle position in the P shape
const LOGO_PATTERN = [
  [0, 1, 1, 1, 0],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 0],
  [1, 0, 0, 0, 0],
]

// P shape pixels: 10 columns x 8 rows (fine grid)
const P_SHAPE_PIXELS = [
  [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
  [1, 1, 1, 0, 0, 0, 0, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]

// ─── Brand palette matching HeroGradientGL ───────────────────────
// Progression Labs brand colors — same 5 used in the hero shader
const BRAND_COLORS = [
  { r: 186, g: 85, b: 211 },  // Orchid    #BA55D3
  { r: 255, g: 160, b: 122 }, // Salmon    #FFA07A
  { r: 185, g: 233, b: 121 }, // Green     #B9E979
  { r: 64, g: 224, b: 208 },  // Turquoise #40E0D0
  { r: 0, g: 0, b: 255 },     // Blue      #0000FF
]

// ─── Gradient ramp matching HeroGradientGL's computeGradient() ───
// Maps a vertical position (0=bottom, 1=top) and a peak color to
// the same black→color→white ramp the GLSL shader uses.
function computeGradient(gp: number, peak: { r: number; g: number; b: number }) {
  const mix = (a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }, t: number) => ({
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  })
  const black = { r: 1, g: 1, b: 1 }
  const deep = { r: peak.r * 0.06, g: peak.g * 0.06, b: peak.b * 0.06 }
  const mid = { r: peak.r * 0.35, g: peak.g * 0.35, b: peak.b * 0.35 }
  const hot = peak
  const wash = { r: peak.r + (255 - peak.r) * 0.5, g: peak.g + (255 - peak.g) * 0.5, b: peak.b + (255 - peak.b) * 0.5 }

  if (gp < 0.04) return mix(black, deep, gp / 0.04)
  if (gp < 0.18) return mix(deep, mid, (gp - 0.04) / 0.14)
  if (gp < 0.45) return mix(mid, hot, (gp - 0.18) / 0.27)
  if (gp < 0.72) return mix(hot, wash, (gp - 0.45) / 0.27)
  return mix(wash, { r: 255, g: 255, b: 255 }, (gp - 0.72) / 0.28)
}

export default function BlueprintIntro({ onComplete }: BlueprintIntroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let cancelled = false
    let animationFrame: number

    const updateSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    updateSize()
    window.addEventListener('resize', updateSize)

    // Grid dimensions
    const pixelCols = 10
    const pixelRows = 8
    const circleCols = 5
    const circleRows = 4

    // Calculate sizes (30% of original — matching dev/nextjs)
    const pixelSize = Math.min(canvas.width / 14, canvas.height / 11) * 0.3
    const gridWidth = pixelCols * pixelSize
    const gridHeight = pixelRows * pixelSize
    const startX = (canvas.width - gridWidth) / 2
    const startY = (canvas.height - gridHeight) / 2
    const circleSpan = pixelSize * 2
    const circleRadius = circleSpan / 2
    const ditherBlockSize = pixelSize / 2

    // Timing constants (each step 500ms)
    const GRID_START = 0
    const CIRCLES_START = 500
    const SQUARES_START = 1000
    const CUTOUTS_START = 1000
    const ANIMATION_END = 1500

    let phase: 'animating' | 'holding' | 'fading' = 'animating'
    const startTime = Date.now()
    let phaseStartTime = startTime

    // Starting offset for grid line slide-in
    const slideOffset = Math.min(canvas.width, canvas.height) * 0.3

    // ── Pre-generate random delays ──────────────────────────────────

    const horizontalLineDelays: { delay: number; fromLeft: boolean }[] = []
    const verticalLineDelays: { delay: number; fromTop: boolean }[] = []
    for (let i = 0; i <= circleRows; i++) {
      horizontalLineDelays.push({
        delay: Math.random() * 350,
        fromLeft: Math.random() > 0.5,
      })
    }
    for (let i = 0; i <= circleCols; i++) {
      verticalLineDelays.push({
        delay: Math.random() * 350,
        fromTop: Math.random() > 0.5,
      })
    }

    const circleDelays: number[][] = []
    for (let row = 0; row < circleRows; row++) {
      circleDelays[row] = []
      for (let col = 0; col < circleCols; col++) {
        circleDelays[row][col] = Math.random() * 350
      }
    }

    const squareDelays: number[][] = []
    for (let row = 0; row < pixelRows; row++) {
      squareDelays[row] = []
      for (let col = 0; col < pixelCols; col++) {
        squareDelays[row][col] = Math.random() * 350
      }
    }

    const blackCircleDelays: { row: number; col: number; delay: number }[] = []
    for (let row = 0; row < circleRows; row++) {
      for (let col = 0; col < circleCols; col++) {
        if (LOGO_PATTERN[row][col] === 0) {
          blackCircleDelays.push({ row, col, delay: Math.random() * 350 })
        }
      }
    }

    const horizontalLineFadeDelays: number[] = []
    const verticalLineFadeDelays: number[] = []
    const circleOutlineFadeDelays: number[][] = []
    for (let i = 0; i <= circleRows; i++) {
      horizontalLineFadeDelays.push(Math.random() * 300)
    }
    for (let i = 0; i <= circleCols; i++) {
      verticalLineFadeDelays.push(Math.random() * 300)
    }
    for (let row = 0; row < circleRows; row++) {
      circleOutlineFadeDelays[row] = []
      for (let col = 0; col < circleCols; col++) {
        circleOutlineFadeDelays[row][col] = Math.random() * 300
      }
    }

    // ── Pre-generate per-column y-offsets (matches hero shader's colOffset) ──
    const colOffsets: number[] = []
    for (let i = 0; i < 200; i++) {
      const hash = Math.sin(i * 127.1) * 43758.5453
      colOffsets.push((hash - Math.floor(hash)) * 0.035)
    }

    // ── Helper functions ────────────────────────────────────────────

    // Deterministic random based on position (for stable dither patterns)
    const getBlockRandom = (x: number, y: number, seed: number = 0): number => {
      const hash = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453
      return hash - Math.floor(hash)
    }

    const getCircleCenter = (row: number, col: number) => ({
      cx: startX + col * circleSpan + circleSpan / 2,
      cy: startY + row * circleSpan + circleSpan / 2,
    })

    // Check if a point is part of the P logo (in P shape but not in black circle cutout)
    const isPartOfLogo = (px: number, py: number): boolean => {
      const pCol = Math.floor((px - startX) / pixelSize)
      const pRow = Math.floor((py - startY) / pixelSize)

      if (pCol >= 0 && pCol < pixelCols && pRow >= 0 && pRow < pixelRows) {
        if (P_SHAPE_PIXELS[pRow][pCol] === 1) {
          // Check not inside a black circle cutout
          for (let row = 0; row < circleRows; row++) {
            for (let col = 0; col < circleCols; col++) {
              if (LOGO_PATTERN[row][col] === 0) {
                const { cx, cy } = getCircleCenter(row, col)
                const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2)
                if (dist < circleRadius - 1) return false
              }
            }
          }
          return true
        }
      }

      // Check white circle areas
      for (let row = 0; row < circleRows; row++) {
        for (let col = 0; col < circleCols; col++) {
          if (LOGO_PATTERN[row][col] === 1) {
            const { cx, cy } = getCircleCenter(row, col)
            const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2)
            if (dist < circleRadius) return true
          }
        }
      }

      return false
    }

    // ── Get the brand peak color for the current moment ──────────
    // Matches HeroGradientGL's 5-color cycle over 30s
    const getBrandPeakColor = () => {
      const cycleSec = 30
      const elapsed = (Date.now() - startTime) / 1000
      const progress = (elapsed % cycleSec) / cycleSec
      const segProgress = progress * 5
      const segIndex = Math.floor(segProgress) % 5
      const t = segProgress - Math.floor(segProgress)
      // Smoothstep
      const ss = t * t * (3 - 2 * t)

      const from = BRAND_COLORS[segIndex]
      const to = BRAND_COLORS[(segIndex + 1) % 5]
      return {
        r: from.r + (to.r - from.r) * ss,
        g: from.g + (to.g - from.g) * ss,
        b: from.b + (to.b - from.b) * ss,
      }
    }

    // ── Drawing functions ───────────────────────────────────────────

    // Grid lines with slide-in animation (Step 0)
    const drawWhiteGrid = (
      elapsed: number,
      opacity: number = 0.3,
      fadeElapsed: number = -1
    ) => {
      const gridElapsed = Math.max(0, elapsed - GRID_START)
      ctx.lineWidth = 1

      // Horizontal lines
      for (let i = 0; i <= circleRows; i++) {
        const { delay, fromLeft } = horizontalLineDelays[i]
        const progress = Math.max(0, Math.min(1, (gridElapsed - delay) / 150))

        let fadeMultiplier = 1
        if (fadeElapsed >= 0) {
          const fadeDelay = horizontalLineFadeDelays[i]
          const fp = Math.max(0, Math.min(1, (fadeElapsed - fadeDelay) / 150))
          fadeMultiplier = 1 - fp
        }

        if (progress > 0 && fadeMultiplier > 0) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * progress * fadeMultiplier})`
          const y = startY + i * circleSpan
          const offset = slideOffset * (1 - progress)
          const lineStartX = fromLeft ? startX - offset : startX
          const lineEndX = fromLeft ? startX + gridWidth : startX + gridWidth + offset
          const currentLength = gridWidth * progress
          const actualStartX = fromLeft ? lineStartX : lineEndX - currentLength
          const actualEndX = fromLeft ? lineStartX + currentLength : lineEndX

          ctx.beginPath()
          ctx.moveTo(actualStartX, y)
          ctx.lineTo(actualEndX, y)
          ctx.stroke()
        }
      }

      // Vertical lines
      for (let i = 0; i <= circleCols; i++) {
        const { delay, fromTop } = verticalLineDelays[i]
        const progress = Math.max(0, Math.min(1, (gridElapsed - delay) / 150))

        let fadeMultiplier = 1
        if (fadeElapsed >= 0) {
          const fadeDelay = verticalLineFadeDelays[i]
          const fp = Math.max(0, Math.min(1, (fadeElapsed - fadeDelay) / 150))
          fadeMultiplier = 1 - fp
        }

        if (progress > 0 && fadeMultiplier > 0) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * progress * fadeMultiplier})`
          const x = startX + i * circleSpan
          const offset = slideOffset * (1 - progress)
          const lineStartY = fromTop ? startY - offset : startY
          const lineEndY = fromTop ? startY + gridHeight : startY + gridHeight + offset
          const currentLength = gridHeight * progress
          const actualStartY = fromTop ? lineStartY : lineEndY - currentLength
          const actualEndY = fromTop ? lineStartY + currentLength : lineEndY

          ctx.beginPath()
          ctx.moveTo(x, actualStartY)
          ctx.lineTo(x, actualEndY)
          ctx.stroke()
        }
      }
    }

    // Step 1: All circles (white filled for logo, outlined for non-logo)
    const drawStep1AllCircles = (
      elapsed: number,
      fadeElapsed: number = -1
    ) => {
      const circlesElapsed = Math.max(0, elapsed - CIRCLES_START)

      for (let row = 0; row < circleRows; row++) {
        for (let col = 0; col < circleCols; col++) {
          const delay = circleDelays[row][col]
          const progress = Math.max(
            0,
            Math.min(1, (circlesElapsed - delay) / 75)
          )

          if (progress > 0) {
            const { cx, cy } = getCircleCenter(row, col)
            const radius = circleRadius * progress
            const isWhite = LOGO_PATTERN[row][col] === 1

            ctx.beginPath()
            ctx.arc(cx, cy, radius, 0, Math.PI * 2)

            if (isWhite) {
              ctx.fillStyle = `rgba(255, 255, 255, ${progress})`
              ctx.fill()
            } else {
              let outlineOpacity = progress * 0.5
              if (fadeElapsed >= 0) {
                const fadeDelay = circleOutlineFadeDelays[row][col]
                const fp = Math.max(
                  0,
                  Math.min(1, (fadeElapsed - fadeDelay) / 150)
                )
                outlineOpacity *= 1 - fp
              }
              if (outlineOpacity > 0.01) {
                ctx.strokeStyle = `rgba(255, 255, 255, ${outlineOpacity})`
                ctx.lineWidth = 1
                ctx.stroke()
              }
            }
          }
        }
      }
    }

    // Circle outlines (all positions)
    const drawAllCircleOutlines = (
      opacity: number = 0.5,
      fadeElapsed: number = -1
    ) => {
      for (let row = 0; row < circleRows; row++) {
        for (let col = 0; col < circleCols; col++) {
          let finalOpacity = opacity
          if (fadeElapsed >= 0) {
            const delay = circleOutlineFadeDelays[row][col]
            const fp = Math.max(0, Math.min(1, (fadeElapsed - delay) / 150))
            finalOpacity = opacity * (1 - fp)
          }
          if (finalOpacity > 0.01) {
            const { cx, cy } = getCircleCenter(row, col)
            ctx.beginPath()
            ctx.arc(cx, cy, circleRadius, 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(255, 255, 255, ${finalOpacity})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }
    }

    // Step 2: P shape white squares
    const drawStep2PShape = (elapsed: number) => {
      const squaresElapsed = Math.max(0, elapsed - SQUARES_START)

      for (let row = 0; row < pixelRows; row++) {
        for (let col = 0; col < pixelCols; col++) {
          if (P_SHAPE_PIXELS[row][col] === 1) {
            const delay = squareDelays[row][col]
            const progress = Math.max(
              0,
              Math.min(1, (squaresElapsed - delay) / 75)
            )
            if (progress > 0) {
              ctx.fillStyle = `rgba(255, 255, 255, ${progress})`
              const x = startX + col * pixelSize
              const y = startY + row * pixelSize
              ctx.fillRect(x, y, pixelSize + 1, pixelSize + 1)
            }
          }
        }
      }
    }

    // Step 3: Black circle cutouts (punch through to background)
    const drawStep3BlackCircles = (elapsed: number) => {
      const cutoutsElapsed = Math.max(0, elapsed - CUTOUTS_START)

      for (const { row, col, delay } of blackCircleDelays) {
        const progress = Math.max(
          0,
          Math.min(1, (cutoutsElapsed - delay) / 75)
        )
        if (progress > 0) {
          const { cx, cy } = getCircleCenter(row, col)
          const radius = (circleRadius - 1) * progress
          ctx.beginPath()
          ctx.arc(cx, cy, radius, 0, Math.PI * 2)
          ctx.fillStyle = '#000000'
          ctx.fill()
        }
      }
    }

    // ── Brand gradient dither — pixel blocks matching HeroGradientGL ──
    // Uses the same vertical gradient ramp and brand color cycling as the
    // hero shader, with per-column y-offset to break horizontal banding.
    // Clean pixel blocks only — no ASCII chars or circle decorations.
    const drawDitherEffect = (progress: number) => {
      if (progress <= 0) return

      const peakColor = getBrandPeakColor()
      const logoLeft = startX - ditherBlockSize * 2
      const logoTop = startY - ditherBlockSize * 2
      const logoRight = startX + gridWidth + ditherBlockSize * 2
      const logoBottom = startY + gridHeight + ditherBlockSize * 2

      let colIndex = 0
      for (let x = logoLeft; x < logoRight; x += ditherBlockSize) {
        const colYOffset = colOffsets[colIndex % colOffsets.length]
        colIndex++

        for (let y = logoTop; y < logoBottom; y += ditherBlockSize) {
          const centerX = x + ditherBlockSize / 2
          const centerY = y + ditherBlockSize / 2

          if (!isPartOfLogo(centerX, centerY)) continue

          // Staggered appearance
          const appearDelay = getBlockRandom(x, y, 5) * 0.8
          const blockProgress = Math.max(
            0,
            Math.min(1, (progress - appearDelay) / (1 - appearDelay))
          )
          if (blockProgress <= 0) continue

          // Vertical gradient position (0=bottom, 1=top) matching hero shader
          // normalizedY: 0 at logoTop, 1 at logoBottom → invert so top=1
          const normalizedY = 1 - (y - logoTop) / (logoBottom - logoTop)
          // Add per-column offset to break horizontal banding
          const gp = Math.max(0, Math.min(1, normalizedY + colYOffset))

          // Compute gradient color using same ramp as HeroGradientGL
          const color = computeGradient(gp, peakColor)

          // Draw clean pixel block — no decorations
          ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
          ctx.globalAlpha = Math.min(1, blockProgress * 2)
          ctx.fillRect(x, y, ditherBlockSize, ditherBlockSize)

          ctx.globalAlpha = 1
        }
      }
    }

    // ── Render loop ─────────────────────────────────────────────────

    const render = () => {
      if (cancelled) return

      const elapsed = Date.now() - startTime

      // Black background
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (phase === 'animating') {
        // Step 0: Grid lines slide in
        drawWhiteGrid(elapsed)
        // Step 1: Circles appear (white filled + outlined)
        drawStep1AllCircles(elapsed)
        // Step 2: P shape squares fill in
        drawStep2PShape(elapsed)
        // Circle outlines visible through P shape
        drawAllCircleOutlines(0.3)
        // Step 3: Black circles cut through
        drawStep3BlackCircles(elapsed)

        if (elapsed > ANIMATION_END) {
          phase = 'holding'
          phaseStartTime = Date.now()
        }
      } else if (phase === 'holding') {
        const holdElapsed = Date.now() - phaseStartTime
        const fadeElapsed = holdElapsed

        // Dither materializes over logo (0→300ms)
        const ditherProgress = Math.min(1, holdElapsed / 300)
        const outlinesFullyFaded = fadeElapsed >= 300
        const logoOpacity = 1 - ditherProgress

        // Grid lines fade out
        drawWhiteGrid(100000, 0.3, fadeElapsed)

        // Logo elements fade as dither appears
        if (logoOpacity > 0) {
          ctx.globalAlpha = logoOpacity
          drawStep1AllCircles(
            100000,
            outlinesFullyFaded ? 100000 : fadeElapsed
          )
          drawStep2PShape(100000)
          if (!outlinesFullyFaded) {
            drawAllCircleOutlines(0.3, fadeElapsed)
          }
          drawStep3BlackCircles(100000)
          ctx.globalAlpha = 1
        }

        // Dither effect appears
        if (ditherProgress > 0) {
          drawDitherEffect(ditherProgress)
        }

        // After 800ms of holding, start fading the overlay out
        if (holdElapsed >= 800) {
          phase = 'fading'
          phaseStartTime = Date.now()
        }
      } else if (phase === 'fading') {
        const fadeElapsed = Date.now() - phaseStartTime
        const fadeProgress = Math.min(1, fadeElapsed / 500)

        // Draw the fully-formed dithered P
        drawDitherEffect(1)

        // Fade the entire container
        container.style.opacity = String(1 - fadeProgress)

        if (fadeProgress >= 1 && !cancelled) {
          container.style.display = 'none'
          onComplete()
          return
        }
      }

      animationFrame = requestAnimationFrame(render)
    }

    animationFrame = requestAnimationFrame(render)

    return () => {
      cancelled = true
      window.removeEventListener('resize', updateSize)
      cancelAnimationFrame(animationFrame)
    }
  }, [onComplete])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#000000',
        pointerEvents: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
