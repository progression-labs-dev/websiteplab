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

// Blue-to-turquoise color palette for dither effect
const OCEAN_COLORS = [
  { r: 0, g: 119, b: 190 },
  { r: 0, g: 150, b: 199 },
  { r: 0, g: 180, b: 216 },
  { r: 72, g: 202, b: 228 },
  { r: 144, g: 224, b: 239 },
  { r: 173, g: 232, b: 244 },
  { r: 202, g: 240, b: 248 },
]

const ASCII_CHARS = [
  '@', '#', '$', '%', '&', '*', '+', '=', '-', ':',
  '.', '/', '\\', '|', '!', '?', 'X', 'O', '0', '1',
]

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

    // Dither effect: ocean-colored blocks + ASCII chars over the logo
    const drawDitherEffect = (progress: number) => {
      if (progress <= 0) return

      const logoLeft = startX - ditherBlockSize * 2
      const logoTop = startY - ditherBlockSize * 2
      const logoRight = startX + gridWidth + ditherBlockSize * 2
      const logoBottom = startY + gridHeight + ditherBlockSize * 2

      for (let y = logoTop; y < logoBottom; y += ditherBlockSize) {
        for (let x = logoLeft; x < logoRight; x += ditherBlockSize) {
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

          // Diagonal gradient with randomness
          const normalizedX = (x - logoLeft) / (logoRight - logoLeft)
          const normalizedY = (y - logoTop) / (logoBottom - logoTop)
          const baseT = (normalizedX + (1 - normalizedY)) / 2
          const randomOffset = (getBlockRandom(x, y, 4) - 0.5) * 0.6
          const t = Math.max(0, Math.min(1, baseT + randomOffset))

          // Interpolate ocean color
          const colorIndex = Math.min(
            Math.floor(t * (OCEAN_COLORS.length - 1)),
            OCEAN_COLORS.length - 2
          )
          const nextIndex = colorIndex + 1
          const localT = t * (OCEAN_COLORS.length - 1) - colorIndex
          const c1 = OCEAN_COLORS[colorIndex]
          const c2 = OCEAN_COLORS[nextIndex]
          const color = {
            r: Math.round(c1.r + (c2.r - c1.r) * localT),
            g: Math.round(c1.g + (c2.g - c1.g) * localT),
            b: Math.round(c1.b + (c2.b - c1.b) * localT),
          }

          // Draw block background
          ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
          ctx.globalAlpha = Math.min(1, blockProgress * 2)
          ctx.fillRect(x, y, ditherBlockSize, ditherBlockSize)

          // Random decoration (35% chance)
          const rand1 = getBlockRandom(x, y, 1)
          const rand2 = getBlockRandom(x, y, 2)
          const rand3 = getBlockRandom(x, y, 3)

          if (rand1 < 0.35) {
            const symbolColor = {
              r: Math.min(255, color.r + 80),
              g: Math.min(255, color.g + 80),
              b: Math.min(255, color.b + 80),
            }
            ctx.fillStyle = `rgb(${symbolColor.r}, ${symbolColor.g}, ${symbolColor.b})`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            if (rand2 < 0.5) {
              // ASCII character
              const charIndex = Math.floor(rand3 * ASCII_CHARS.length)
              ctx.font = `bold ${ditherBlockSize * 0.7}px monospace`
              ctx.fillText(
                ASCII_CHARS[charIndex],
                x + ditherBlockSize / 2,
                y + ditherBlockSize / 2
              )
            } else {
              // Circle
              ctx.beginPath()
              ctx.arc(
                x + ditherBlockSize / 2,
                y + ditherBlockSize / 2,
                (ditherBlockSize - 2) / 2,
                0,
                Math.PI * 2
              )
              ctx.fill()
            }
          }

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
