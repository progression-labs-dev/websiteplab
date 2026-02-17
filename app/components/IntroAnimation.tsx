'use client'

import { useEffect, useRef, useState } from 'react'

interface IntroAnimationProps {
  onComplete: () => void
}

// Logo pattern: 5 columns x 4 rows of circles
// 1 = white circle, coordinates given:
// Row 1: (2,1), (3,1), (4,1)
// Row 2: (1,2), (5,2)
// Row 3: (1,3), (2,3), (3,3), (4,3)
// Row 4: (1,4)
const LOGO_PATTERN = [
  [0, 1, 1, 1, 0],  // Row 1: cols 2,3,4 white
  [1, 0, 0, 0, 1],  // Row 2: cols 1,5 white
  [1, 1, 1, 1, 0],  // Row 3: cols 1,2,3,4 white
  [1, 0, 0, 0, 0],  // Row 4: col 1 white
]

// P shape pixels: 10 columns x 8 rows (1-indexed in comments)
const P_SHAPE_PIXELS = [
  [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],  // Row 1: cols 4,5,6,7
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],  // Row 2: cols 2-9
  [0, 1, 1, 0, 0, 0, 0, 1, 1, 0],  // Row 3: cols 2,3,8,9
  [1, 1, 1, 0, 0, 0, 0, 1, 1, 0],  // Row 4: cols 1,2,3,8,9
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],  // Row 5: cols 1-9
  [1, 1, 1, 1, 1, 1, 1, 0, 0, 0],  // Row 6: cols 1-7
  [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],  // Row 7: cols 1,2,3
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  // Row 8: empty
]

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    let phase: 'animating' | 'holding' | 'expanding' | 'complete' = 'animating'
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const updateSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    updateSize()
    window.addEventListener('resize', updateSize)

    // Grid dimensions: 10 columns x 8 rows of pixels
    // Circles span 2x2 pixels each (5 cols x 4 rows of circles)
    const pixelCols = 10
    const pixelRows = 8
    const circleCols = 5
    const circleRows = 4

    // Calculate sizes (70% smaller = 30% of original)
    const pixelSize = Math.min(canvas.width / 14, canvas.height / 11) * 0.3
    const gridWidth = pixelCols * pixelSize
    const gridHeight = pixelRows * pixelSize
    const startX = (canvas.width - gridWidth) / 2
    const startY = (canvas.height - gridHeight) / 2

    // Circle size (spans 2x2 pixels)
    const circleSpan = pixelSize * 2
    const circleRadius = circleSpan / 2

    let animationFrame: number
    const startTime = Date.now()
    let phaseStartTime = startTime

    // Timing constants (each step is 0.5 seconds)
    const STEP_DURATION = 500
    const GRID_START = 0
    const CIRCLES_START = 500
    const SQUARES_START = 1000
    const CUTOUTS_START = 1000 // Same as squares - appear together
    const ANIMATION_END = 1500

    // Random delays and directions for grid lines (Step 0)
    // Horizontal lines slide from left or right, vertical from top or bottom
    const horizontalLineDelays: { delay: number; fromLeft: boolean }[] = []
    const verticalLineDelays: { delay: number; fromTop: boolean }[] = []
    for (let i = 0; i <= circleRows; i++) {
      horizontalLineDelays.push({ delay: Math.random() * 350, fromLeft: Math.random() > 0.5 })
    }
    for (let i = 0; i <= circleCols; i++) {
      verticalLineDelays.push({ delay: Math.random() * 350, fromTop: Math.random() > 0.5 })
    }
    // Starting offset (30% from screen edge)
    const slideOffset = Math.min(canvas.width, canvas.height) * 0.3

    // Random delays for circle appearances (Step 1)
    const circleDelays: number[][] = []
    for (let row = 0; row < circleRows; row++) {
      circleDelays[row] = []
      for (let col = 0; col < circleCols; col++) {
        circleDelays[row][col] = Math.random() * 350
      }
    }

    // Random delays for P shape squares (Step 2)
    const squareDelays: number[][] = []
    for (let row = 0; row < pixelRows; row++) {
      squareDelays[row] = []
      for (let col = 0; col < pixelCols; col++) {
        squareDelays[row][col] = Math.random() * 350
      }
    }

    // Random delays for black circle cut-outs (Step 3)
    const blackCircleDelays: { row: number; col: number; delay: number }[] = []
    for (let row = 0; row < circleRows; row++) {
      for (let col = 0; col < circleCols; col++) {
        if (LOGO_PATTERN[row][col] === 0) {
          blackCircleDelays.push({ row, col, delay: Math.random() * 350 })
        }
      }
    }

    // Random delays for disappearing (lines and circle outlines)
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

    // Draw the 5x4 white grid (for circles) with slide-in animation
    const drawWhiteGrid = (elapsed: number, opacity: number = 0.3, fadeElapsed: number = -1) => {
      const gridElapsed = Math.max(0, elapsed - GRID_START)
      ctx.lineWidth = 1

      // Horizontal lines (5 lines for 4 rows of circles) - slide from left or right
      for (let i = 0; i <= circleRows; i++) {
        const { delay, fromLeft } = horizontalLineDelays[i]
        const progress = Math.max(0, Math.min(1, (gridElapsed - delay) / 150))

        // Calculate fade out if in fade mode
        let fadeMultiplier = 1
        if (fadeElapsed >= 0) {
          const fadeDelay = horizontalLineFadeDelays[i]
          const fadeProgress = Math.max(0, Math.min(1, (fadeElapsed - fadeDelay) / 150))
          fadeMultiplier = 1 - fadeProgress
        }

        if (progress > 0 && fadeMultiplier > 0) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * progress * fadeMultiplier})`
          const y = startY + i * circleSpan

          // Calculate offset based on direction and progress
          const offset = slideOffset * (1 - progress)
          const lineStartX = fromLeft ? startX - offset : startX
          const lineEndX = fromLeft ? startX + gridWidth : startX + gridWidth + offset

          // Scale line length based on progress
          const currentLength = gridWidth * progress
          const actualStartX = fromLeft ? lineStartX : lineEndX - currentLength
          const actualEndX = fromLeft ? lineStartX + currentLength : lineEndX

          ctx.beginPath()
          ctx.moveTo(actualStartX, y)
          ctx.lineTo(actualEndX, y)
          ctx.stroke()
        }
      }

      // Vertical lines (6 lines for 5 columns of circles) - slide from top or bottom
      for (let i = 0; i <= circleCols; i++) {
        const { delay, fromTop } = verticalLineDelays[i]
        const progress = Math.max(0, Math.min(1, (gridElapsed - delay) / 150))

        // Calculate fade out if in fade mode
        let fadeMultiplier = 1
        if (fadeElapsed >= 0) {
          const fadeDelay = verticalLineFadeDelays[i]
          const fadeProgress = Math.max(0, Math.min(1, (fadeElapsed - fadeDelay) / 150))
          fadeMultiplier = 1 - fadeProgress
        }

        if (progress > 0 && fadeMultiplier > 0) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * progress * fadeMultiplier})`
          const x = startX + i * circleSpan

          // Calculate offset based on direction and progress
          const offset = slideOffset * (1 - progress)
          const lineStartY = fromTop ? startY - offset : startY
          const lineEndY = fromTop ? startY + gridHeight : startY + gridHeight + offset

          // Scale line length based on progress
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

    // Get circle center position
    const getCircleCenter = (row: number, col: number) => {
      const cx = startX + col * circleSpan + circleSpan / 2
      const cy = startY + row * circleSpan + circleSpan / 2
      return { cx, cy }
    }

    // LAYER 1: All circles from Step 1 (white filled + black outlined)
    const drawStep1AllCircles = (elapsed: number, fadeElapsed: number = -1) => {
      const circlesElapsed = Math.max(0, elapsed - CIRCLES_START)

      for (let row = 0; row < circleRows; row++) {
        for (let col = 0; col < circleCols; col++) {
          const delay = circleDelays[row][col]
          const progress = Math.max(0, Math.min(1, (circlesElapsed - delay) / 75))

          if (progress > 0) {
            const { cx, cy } = getCircleCenter(row, col)
            const radius = circleRadius * progress
            const isWhite = LOGO_PATTERN[row][col] === 1

            ctx.beginPath()
            ctx.arc(cx, cy, radius, 0, Math.PI * 2)

            if (isWhite) {
              // White filled circle
              ctx.fillStyle = `rgba(255, 255, 255, ${progress})`
              ctx.fill()
            } else {
              // Black circle with white outline (outline only in step 1)
              // Fade out the outline during holding phase
              let outlineOpacity = progress * 0.5
              if (fadeElapsed >= 0) {
                const fadeDelay = circleOutlineFadeDelays[row][col]
                const fadeProgress = Math.max(0, Math.min(1, (fadeElapsed - fadeDelay) / 150))
                outlineOpacity = outlineOpacity * (1 - fadeProgress)
              }
              // Only draw if opacity is significant (threshold to avoid anti-aliasing artifacts)
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

    // Draw all circle outlines (for visibility through P shape in final)
    const drawAllCircleOutlines = (opacity: number = 0.5, fadeElapsed: number = -1) => {
      for (let row = 0; row < circleRows; row++) {
        for (let col = 0; col < circleCols; col++) {
          let finalOpacity = opacity

          // If fading out, calculate individual opacity based on random delay
          if (fadeElapsed >= 0) {
            const delay = circleOutlineFadeDelays[row][col]
            const fadeProgress = Math.max(0, Math.min(1, (fadeElapsed - delay) / 150))
            finalOpacity = opacity * (1 - fadeProgress)
          }

          // Only draw if opacity is significant (threshold to avoid anti-aliasing artifacts)
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

    // LAYER 2: P shape (white pixels only, no grid) with random appearance
    const drawStep2PShape = (elapsed: number) => {
      const squaresElapsed = Math.max(0, elapsed - SQUARES_START)

      for (let row = 0; row < pixelRows; row++) {
        for (let col = 0; col < pixelCols; col++) {
          if (P_SHAPE_PIXELS[row][col] === 1) {
            const delay = squareDelays[row][col]
            const progress = Math.max(0, Math.min(1, (squaresElapsed - delay) / 75))

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

    // Dither effect configuration - half the size of P shape squares
    const ditherBlockSize = pixelSize / 2
    const ditherColors = {
      blockColorStart: '#0000ff',
      blockColorEnd: '#00ffff',
      circleColorStart: '#d4f1f9',
      circleColorEnd: '#ffffff',
    }
    const ASCII_CHARS = ['@', '#', '$', '%', '&', '*', '+', '=', '-', ':', '.', '/', '\\', '|', '!', '?', 'X', 'O', '0', '1']
    const circleProbability = 0.36
    const asciiProbability = 0.8

    // Pre-generate random values for each block position (seeded by position)
    const getBlockRandom = (x: number, y: number, seed: number = 0): number => {
      const hash = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453
      return hash - Math.floor(hash)
    }

    // Helper to interpolate colors
    const lerpColor = (start: string, end: string, t: number): string => {
      const parseHex = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0]
      }
      const startRgb = parseHex(start)
      const endRgb = parseHex(end)
      const r = Math.round(startRgb[0] + (endRgb[0] - startRgb[0]) * t)
      const g = Math.round(startRgb[1] + (endRgb[1] - startRgb[1]) * t)
      const b = Math.round(startRgb[2] + (endRgb[2] - startRgb[2]) * t)
      return `rgb(${r}, ${g}, ${b})`
    }

    // Blend color 50% with white
    const blendWithWhite = (r: number, g: number, b: number): string => {
      const newR = Math.round((r + 255) / 2)
      const newG = Math.round((g + 255) / 2)
      const newB = Math.round((b + 255) / 2)
      return `rgb(${newR}, ${newG}, ${newB})`
    }

    // Check if a point is part of the logo (P shape or white circles, excluding black circles)
    const isPartOfLogo = (px: number, py: number): boolean => {
      // Check if in P shape
      const pCol = Math.floor((px - startX) / pixelSize)
      const pRow = Math.floor((py - startY) / pixelSize)
      if (pCol >= 0 && pCol < pixelCols && pRow >= 0 && pRow < pixelRows) {
        if (P_SHAPE_PIXELS[pRow][pCol] === 1) {
          // Check if NOT inside a black circle cutout
          for (let row = 0; row < circleRows; row++) {
            for (let col = 0; col < circleCols; col++) {
              if (LOGO_PATTERN[row][col] === 0) {
                const { cx, cy } = getCircleCenter(row, col)
                const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2)
                if (dist < circleRadius - 1) {
                  return false // Inside black circle
                }
              }
            }
          }
          return true
        }
      }

      // Check if in white circle (but not in P shape area we already checked)
      for (let row = 0; row < circleRows; row++) {
        for (let col = 0; col < circleCols; col++) {
          if (LOGO_PATTERN[row][col] === 1) {
            const { cx, cy } = getCircleCenter(row, col)
            const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2)
            if (dist < circleRadius) {
              return true
            }
          }
        }
      }

      return false
    }

    // Draw dither effect over the logo
    const drawDitherEffect = (progress: number) => {
      if (progress <= 0) return

      // Calculate logo bounds for dither effect
      const logoLeft = startX - ditherBlockSize * 2
      const logoTop = startY - ditherBlockSize * 2
      const logoRight = startX + gridWidth + ditherBlockSize * 2
      const logoBottom = startY + gridHeight + ditherBlockSize * 2

      // Draw dithered blocks based on logo geometry
      for (let y = logoTop; y < logoBottom; y += ditherBlockSize) {
        for (let x = logoLeft; x < logoRight; x += ditherBlockSize) {
          // Check center of block against logo shape
          const centerX = x + ditherBlockSize / 2
          const centerY = y + ditherBlockSize / 2

          // Only apply effect to logo areas
          if (isPartOfLogo(centerX, centerY)) {
            // Random appearance delay for each block (cap at 0.8 to avoid division issues)
            const appearDelay = getBlockRandom(x, y, 5) * 0.8
            const blockProgress = Math.max(0, Math.min(1, (progress - appearDelay) / (1 - appearDelay)))

            if (blockProgress > 0) {
              // Calculate position-based gradient with randomness
              const normalizedX = (x - logoLeft) / (logoRight - logoLeft)
              const normalizedY = (y - logoTop) / (logoBottom - logoTop)
              // Base diagonal gradient: combine x (left-to-right) and inverted y (bottom-to-top)
              const baseT = (normalizedX + (1 - normalizedY)) / 2
              // Add randomness to the gradient position (±0.3 variation)
              const randomOffset = (getBlockRandom(x, y, 4) - 0.5) * 0.6
              const t = Math.max(0, Math.min(1, baseT + randomOffset))

              // Draw block background
              const blockColor = lerpColor(ditherColors.blockColorStart, ditherColors.blockColorEnd, t)
              ctx.fillStyle = blockColor
              ctx.globalAlpha = Math.min(1, blockProgress * 2)
              ctx.fillRect(x, y, ditherBlockSize, ditherBlockSize)

              // Get random values for this block
              const rand1 = getBlockRandom(x, y, 1)
              const rand2 = getBlockRandom(x, y, 2)
              const rand3 = getBlockRandom(x, y, 3)

              // Determine what to draw: circle, ASCII, or nothing
              const circleColor = blendWithWhite(
                parseInt(blockColor.match(/\d+/g)![0]),
                parseInt(blockColor.match(/\d+/g)![1]),
                parseInt(blockColor.match(/\d+/g)![2])
              )

              if (rand1 < circleProbability) {
                // Draw circle
                ctx.fillStyle = circleColor
                ctx.beginPath()
                ctx.arc(x + ditherBlockSize / 2, y + ditherBlockSize / 2, ditherBlockSize / 2 - 1, 0, Math.PI * 2)
                ctx.fill()
              } else if (rand2 < asciiProbability) {
                // Draw ASCII character
                const charIndex = Math.floor(rand3 * ASCII_CHARS.length)
                const char = ASCII_CHARS[charIndex]
                ctx.fillStyle = circleColor
                ctx.font = `${ditherBlockSize * 0.9}px monospace`
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillText(char, x + ditherBlockSize / 2, y + ditherBlockSize / 2)
              }
              // else: leave just the block color

              ctx.globalAlpha = 1
            }
          }
        }
      }
    }

    // Draw expanding dither that fills the entire screen from logo center
    const drawExpandingDither = (progress: number) => {
      if (progress <= 0) return

      // Logo center position
      const logoCenterX = startX + gridWidth / 2
      const logoCenterY = startY + gridHeight / 2

      // Maximum distance from logo center to screen corner
      const maxDist = Math.sqrt(
        Math.max(logoCenterX, canvas.width - logoCenterX) ** 2 +
        Math.max(logoCenterY, canvas.height - logoCenterY) ** 2
      )

      // Use same block size as hero (12px)
      const expandBlockSize = 12

      // Draw dithered blocks across entire screen
      for (let y = 0; y < canvas.height; y += expandBlockSize) {
        for (let x = 0; x < canvas.width; x += expandBlockSize) {
          // Calculate distance from logo center
          const blockCenterX = x + expandBlockSize / 2
          const blockCenterY = y + expandBlockSize / 2
          const dist = Math.sqrt((blockCenterX - logoCenterX) ** 2 + (blockCenterY - logoCenterY) ** 2)

          // Mix distance (30%) with randomness (70%) for scattered expansion
          const normalizedDist = dist / maxDist
          const randomValue = getBlockRandom(x, y, 7)
          // Combine: slight bias toward expanding from center, but mostly random
          // Scale to 0-0.8 so all blocks appear before progress reaches 1.0
          const appearThreshold = (normalizedDist * 0.3 + randomValue * 0.7) * 0.8

          // Block appears when progress passes its threshold
          const blockProgress = Math.max(0, Math.min(1, (progress - appearThreshold) / 0.15))

          if (blockProgress > 0) {
            // Calculate position-based gradient with randomness
            const normalizedX = x / canvas.width
            const normalizedY = y / canvas.height
            const baseT = (normalizedX + (1 - normalizedY)) / 2
            const gradientOffset = (getBlockRandom(x, y, 4) - 0.5) * 0.6
            const t = Math.max(0, Math.min(1, baseT + gradientOffset))

            // Draw block background
            const blockColor = lerpColor(ditherColors.blockColorStart, ditherColors.blockColorEnd, t)
            ctx.fillStyle = blockColor
            ctx.globalAlpha = blockProgress
            ctx.fillRect(x, y, expandBlockSize, expandBlockSize)

            // Get random values for this block
            const rand1 = getBlockRandom(x, y, 1)
            const rand2 = getBlockRandom(x, y, 2)
            const rand3 = getBlockRandom(x, y, 3)

            // Determine what to draw: circle, ASCII, or nothing
            const circleColor = blendWithWhite(
              parseInt(blockColor.match(/\d+/g)![0]),
              parseInt(blockColor.match(/\d+/g)![1]),
              parseInt(blockColor.match(/\d+/g)![2])
            )

            if (rand1 < circleProbability) {
              // Draw circle
              ctx.fillStyle = circleColor
              ctx.beginPath()
              ctx.arc(x + expandBlockSize / 2, y + expandBlockSize / 2, expandBlockSize / 2 - 1, 0, Math.PI * 2)
              ctx.fill()
            } else if (rand2 < asciiProbability) {
              // Draw ASCII character
              const charIndex = Math.floor(rand3 * ASCII_CHARS.length)
              const char = ASCII_CHARS[charIndex]
              ctx.fillStyle = circleColor
              ctx.font = `${expandBlockSize * 0.9}px monospace`
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              ctx.fillText(char, x + expandBlockSize / 2, y + expandBlockSize / 2)
            }

            ctx.globalAlpha = 1
          }
        }
      }
    }

    // LAYER 3: Black circles (cutting through) with random appearance
    const drawStep3BlackCircles = (elapsed: number) => {
      const cutoutsElapsed = Math.max(0, elapsed - CUTOUTS_START)

      for (const { row, col, delay } of blackCircleDelays) {
        const progress = Math.max(0, Math.min(1, (cutoutsElapsed - delay) / 75))

        if (progress > 0) {
          const { cx, cy } = getCircleCenter(row, col)
          const radius = (circleRadius - 1) * progress

          // Black filled circle
          ctx.beginPath()
          ctx.arc(cx, cy, radius, 0, Math.PI * 2)
          ctx.fillStyle = '#000000'
          ctx.fill()
        }
      }
    }

    const render = () => {
      const elapsed = Date.now() - startTime

      // Clear canvas
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)


      if (phase === 'animating') {
        // Draw white grid (background) with random appearance
        drawWhiteGrid(elapsed)

        // LAYER 1 (back): All circles from Step 1
        drawStep1AllCircles(elapsed)

        // LAYER 2 (middle): P shape
        drawStep2PShape(elapsed)

        // Draw all circle outlines (visible through P shape)
        drawAllCircleOutlines(0.3)

        // LAYER 3 (front): Black circles cutting through
        drawStep3BlackCircles(elapsed)

        // Check if animation is complete (after all 4 steps)
        if (elapsed > ANIMATION_END) {
          phase = 'holding'
          phaseStartTime = Date.now()
        }
      }

      // HOLDING - show logo briefly then transition to dither
      if (phase === 'holding') {
        const holdElapsed = Date.now() - phaseStartTime

        // Immediately start fading out lines and circle outlines
        const fadeElapsed = holdElapsed

        // Immediately start applying dither effect on logo
        const ditherProgress = Math.min(1, holdElapsed / 300)

        // After fade completes (300ms), stop drawing outlines entirely
        const outlinesFullyFaded = fadeElapsed >= 300

        // Fade out logo as dither appears
        const logoOpacity = 1 - ditherProgress

        drawWhiteGrid(100000, 0.3, fadeElapsed)

        // Draw logo elements with fading opacity
        if (logoOpacity > 0) {
          ctx.globalAlpha = logoOpacity
          drawStep1AllCircles(100000, outlinesFullyFaded ? 100000 : fadeElapsed)
          drawStep2PShape(100000)
          if (!outlinesFullyFaded) {
            drawAllCircleOutlines(0.3, fadeElapsed)
          }
          drawStep3BlackCircles(100000)
          ctx.globalAlpha = 1
        }

        // Apply dither effect over the logo
        if (ditherProgress > 0) {
          drawDitherEffect(ditherProgress)
        }

        // After 0.5s, start expanding
        if (holdElapsed >= 500) {
          phase = 'expanding'
          phaseStartTime = Date.now()
        }
      }

      // EXPANDING - dither spreads from logo to fill screen
      if (phase === 'expanding') {
        const expandElapsed = Date.now() - phaseStartTime
        const expandDuration = 800 // 0.8 seconds to expand

        // Progress from 0 to 1
        const expandProgress = Math.min(1, expandElapsed / expandDuration)

        // Draw the logo dither first (as base)
        drawDitherEffect(1)

        // Draw the expanding dither on top (covers everything as it spreads)
        drawExpandingDither(expandProgress)

        if (expandProgress >= 1) {
          phase = 'complete'
          setIsComplete(true)
          onComplete()
          return
        }
      }

      animationFrame = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', updateSize)
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [onComplete])

  if (isComplete) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        backgroundColor: '#000000',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#000000',
        }}
      />
    </div>
  )
}