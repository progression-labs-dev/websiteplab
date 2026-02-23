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
  const [animationPhase, setAnimationPhase] = useState<'intro' | 'static'>('intro')

  useEffect(() => {
    let phase: 'animating' | 'holding' | 'expanding' | 'static' = 'animating'
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

    // Load flower video for brightness sampling and playback
    let flowerImageData: ImageData | null = null
    let sampleWidth = 0
    let sampleHeight = 0
    const flowerVideo = document.createElement('video')
    flowerVideo.src = '/flower_open.mov'
    flowerVideo.muted = true
    flowerVideo.playsInline = true
    flowerVideo.preload = 'auto'

    // Offscreen canvas for sampling
    const flowerOffscreen = document.createElement('canvas')
    const flowerOffCtx = flowerOffscreen.getContext('2d')

    flowerVideo.addEventListener('loadeddata', () => {
      sampleWidth = flowerVideo.videoWidth
      sampleHeight = flowerVideo.videoHeight
      flowerOffscreen.width = sampleWidth
      flowerOffscreen.height = sampleHeight
      if (flowerOffCtx) {
        flowerOffCtx.drawImage(flowerVideo, 0, 0)
        flowerImageData = flowerOffCtx.getImageData(0, 0, sampleWidth, sampleHeight)
      }
    })

    // Update flower image data each frame when video is playing
    const updateFlowerImageData = () => {
      if (flowerOffCtx && sampleWidth > 0) {
        flowerOffCtx.drawImage(flowerVideo, 0, 0)
        flowerImageData = flowerOffCtx.getImageData(0, 0, sampleWidth, sampleHeight)
      }
    }

    // Scroll tracking for horse-to-line animation
    let scrollProgress = 0
    const updateScrollProgress = () => {
      const heroImage = document.querySelector('.hero-image video.active') as HTMLElement
      const ditherLine = document.querySelector('.services-dither-line') as HTMLElement

      if (!heroImage || !ditherLine) {
        scrollProgress = 0
        return
      }

      const heroRect = heroImage.getBoundingClientRect()
      const lineRect = ditherLine.getBoundingClientRect()

      // Start animation when horse dither reaches top of viewport
      // End animation when line is at top of viewport
      const startTrigger = heroRect.top + heroRect.height * 0.3 // Where dither is on horse
      const endTrigger = lineRect.top

      if (startTrigger > 0) {
        scrollProgress = 0
      } else if (endTrigger < 100) {
        scrollProgress = 1
      } else {
        // Calculate progress between start and end
        scrollProgress = Math.abs(startTrigger) / (Math.abs(startTrigger) + endTrigger - 100)
        scrollProgress = Math.max(0, Math.min(1, scrollProgress))
      }
    }
    window.addEventListener('scroll', updateScrollProgress)
    updateScrollProgress()

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
              // White filled circle (on dark bg)
              ctx.fillStyle = `rgba(255, 255, 255, ${progress})`
              ctx.fill()
            } else {
              // Circle with light outline (outline only in step 1)
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

    // Blue to turquoise color palette (matching AsciiVideoCanvas)
    const OCEAN_COLORS = [
      { r: 0, g: 119, b: 190 },   // Ocean blue
      { r: 0, g: 150, b: 199 },   // Medium blue
      { r: 0, g: 180, b: 216 },   // Bright blue
      { r: 72, g: 202, b: 228 },  // Cyan
      { r: 144, g: 224, b: 239 }, // Light cyan
      { r: 173, g: 232, b: 244 }, // Pale turquoise
      { r: 202, g: 240, b: 248 }, // Very light turquoise
    ]

    const ditherColors = {
      blockColorStart: '#ffffff',
      blockColorEnd: '#999999',
      circleColorStart: '#cccccc',
      circleColorEnd: '#666666',
    }
    const ASCII_CHARS = ['@', '#', '$', '%', '&', '*', '+', '=', '-', ':', '.', '/', '\\', '|', '!', '?', 'X', 'O', '0', '1']
    const circleProbability = 0.36
    const asciiProbability = 0.8

    // Get ocean color based on brightness (for flower ASCII)
    const getOceanColor = (brightness: number): { r: number; g: number; b: number } => {
      const threshold = 0.35
      if (brightness < threshold) return { r: 0, g: 0, b: 0 } // Will be skipped

      const normalizedBrightness = (brightness - threshold) / (1 - threshold)
      const t = Math.max(0, Math.min(1, normalizedBrightness))

      const index = Math.min(Math.floor(t * (OCEAN_COLORS.length - 1)), OCEAN_COLORS.length - 2)
      const nextIndex = index + 1
      const localT = (t * (OCEAN_COLORS.length - 1)) - index
      const c1 = OCEAN_COLORS[index]
      const c2 = OCEAN_COLORS[nextIndex]

      return {
        r: Math.round(c1.r + (c2.r - c1.r) * localT),
        g: Math.round(c1.g + (c2.g - c1.g) * localT),
        b: Math.round(c1.b + (c2.b - c1.b) * localT),
      }
    }

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

    // Blend color 50% with black (#000000) for visible dither detail on light blocks
    const blendWithBlack = (r: number, g: number, b: number): string => {
      const newR = Math.round(r / 2)
      const newG = Math.round(g / 2)
      const newB = Math.round(b / 2)
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

              // Use ocean colors (same as flower ASCII)
              const colorIndex = Math.min(Math.floor(t * (OCEAN_COLORS.length - 1)), OCEAN_COLORS.length - 2)
              const nextIndex = colorIndex + 1
              const localT = (t * (OCEAN_COLORS.length - 1)) - colorIndex
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

              // Get random values for this block
              const rand1 = getBlockRandom(x, y, 1)
              const rand2 = getBlockRandom(x, y, 2)
              const rand3 = getBlockRandom(x, y, 3)

              // Symbol color - lighter version (same as flower)
              const symbolColor = {
                r: Math.min(255, color.r + 80),
                g: Math.min(255, color.g + 80),
                b: Math.min(255, color.b + 80),
              }

              if (rand1 < 0.35) {
                ctx.fillStyle = `rgb(${symbolColor.r}, ${symbolColor.g}, ${symbolColor.b})`
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'

                if (rand2 < 0.5) {
                  // Random ASCII character
                  const charIndex = Math.floor(rand3 * ASCII_CHARS.length)
                  ctx.font = `bold ${ditherBlockSize * 0.7}px monospace`
                  ctx.fillText(ASCII_CHARS[charIndex], x + ditherBlockSize / 2, y + ditherBlockSize / 2)
                } else {
                  // Full circle (diameter = block size)
                  ctx.beginPath()
                  ctx.arc(x + ditherBlockSize / 2, y + ditherBlockSize / 2, (ditherBlockSize - 2) / 2, 0, Math.PI * 2)
                  ctx.fill()
                }
              }

              ctx.globalAlpha = 1
            }
          }
        }
      }
    }

    // Collect logo dither blocks for seamless transition
    const getLogoDitherBlocks = () => {
      const blocks: { x: number; y: number; t: number; rand1: number; rand2: number; rand3: number }[] = []
      const logoLeft = startX - ditherBlockSize * 2
      const logoTop = startY - ditherBlockSize * 2
      const logoRight = startX + gridWidth + ditherBlockSize * 2
      const logoBottom = startY + gridHeight + ditherBlockSize * 2

      for (let y = logoTop; y < logoBottom; y += ditherBlockSize) {
        for (let x = logoLeft; x < logoRight; x += ditherBlockSize) {
          const centerX = x + ditherBlockSize / 2
          const centerY = y + ditherBlockSize / 2
          if (isPartOfLogo(centerX, centerY)) {
            const normalizedX = (x - logoLeft) / (logoRight - logoLeft)
            const normalizedY = (y - logoTop) / (logoBottom - logoTop)
            const baseT = (normalizedX + (1 - normalizedY)) / 2
            const randomOffset = (getBlockRandom(x, y, 4) - 0.5) * 0.6
            const t = Math.max(0, Math.min(1, baseT + randomOffset))
            blocks.push({
              x, y, t,
              rand1: getBlockRandom(x, y, 1),
              rand2: getBlockRandom(x, y, 2),
              rand3: getBlockRandom(x, y, 3)
            })
          }
        }
      }
      return blocks
    }

    // Pre-calculate logo blocks
    const logoBlocks = getLogoDitherBlocks()

    // Draw converging dither - blocks flow from logo positions to target rectangle
    const drawConvergingDither = (progress: number) => {
      if (progress <= 0) return

      // Get actual horse image position from DOM
      const heroImage = document.querySelector('.hero-image video.active') as HTMLElement
      let targetRectX: number, targetRectY: number
      let heroRect: DOMRect | null = null
      const targetRectWidth = 240
      const targetRectHeight = 160

      if (heroImage) {
        heroRect = heroImage.getBoundingClientRect()
        // Position dither at top: 30%, left: 5% of the horse image
        targetRectX = heroRect.left + heroRect.width * 0.05
        targetRectY = heroRect.top + heroRect.height * 0.30
      } else {
        // Fallback calculation if element not found
        const horseHeight = canvas.height * 0.8
        const horseWidth = horseHeight * 0.55
        const horseX = canvas.width - 60 - horseWidth
        const horseY = (canvas.height - horseHeight) / 2
        targetRectX = horseX + horseWidth * 0.05
        targetRectY = horseY + horseHeight * 0.30
      }

      // Helper to sample brightness from horse image
      const sampleBrightness = (screenX: number, screenY: number): number => {
        if (!flowerImageData || !heroRect || !sampleWidth) return 0.5

        // Convert screen position to image coordinates
        const imgX = Math.floor(((screenX - heroRect.left) / heroRect.width) * sampleWidth)
        const imgY = Math.floor(((screenY - heroRect.top) / heroRect.height) * sampleHeight)

        // Clamp to image bounds
        const clampedX = Math.max(0, Math.min(sampleWidth - 1, imgX))
        const clampedY = Math.max(0, Math.min(sampleHeight - 1, imgY))

        // Get pixel from image data
        const idx = (clampedY * sampleWidth + clampedX) * 4
        const r = flowerImageData.data[idx]
        const g = flowerImageData.data[idx + 1]
        const b = flowerImageData.data[idx + 2]

        // Convert to grayscale brightness (0-1)
        return (r * 0.299 + g * 0.587 + b * 0.114) / 255
      }

      const targetBlockSize = 12
      const targetCols = Math.floor(targetRectWidth / targetBlockSize)
      const targetRows = Math.floor(targetRectHeight / targetBlockSize)

      // Map logo blocks to target positions
      const totalTargetBlocks = targetCols * targetRows

      for (let i = 0; i < totalTargetBlocks; i++) {
        const targetCol = i % targetCols
        const targetRow = Math.floor(i / targetCols)

        // Final position in target rectangle
        const finalX = targetRectX + targetCol * targetBlockSize
        const finalY = targetRectY + targetRow * targetBlockSize

        // Get corresponding logo block (wrap around if needed)
        const logoBlock = logoBlocks[i % logoBlocks.length]

        // Starting position is the logo block position
        const blockStartX = logoBlock.x
        const blockStartY = logoBlock.y

        // Random delay for staggered animation
        const delay = getBlockRandom(finalX, finalY, 12) * 0.5
        const blockProgress = Math.max(0, Math.min(1, (progress - delay) / (1 - delay) * 1.2))

        if (blockProgress > 0) {
          // Eased interpolation with slight overshoot for organic feel
          const easeProgress = blockProgress < 1
            ? 1 - Math.pow(1 - blockProgress, 3)
            : 1

          // Current position (interpolate from logo to target)
          const currentX = blockStartX + (finalX - blockStartX) * easeProgress
          const currentY = blockStartY + (finalY - blockStartY) * easeProgress

          // Scale block size during transition
          const currentBlockSize = ditherBlockSize + (targetBlockSize - ditherBlockSize) * easeProgress

          // Sample brightness from horse image at block's final position
          // Black (0) -> blue, White (1) -> turquoise
          const t = sampleBrightness(finalX + targetBlockSize / 2, finalY + targetBlockSize / 2)

          const blockColor = lerpColor(ditherColors.blockColorStart, ditherColors.blockColorEnd, t)
          ctx.fillStyle = blockColor
          ctx.globalAlpha = 1
          ctx.fillRect(currentX, currentY, currentBlockSize, currentBlockSize)

          // Get random values for decoration
          const rand1 = getBlockRandom(finalX, finalY, 1)
          const rand2 = getBlockRandom(finalX, finalY, 2)
          const rand3 = getBlockRandom(finalX, finalY, 3)

          const circleColor = blendWithBlack(
            parseInt(blockColor.match(/\d+/g)![0]),
            parseInt(blockColor.match(/\d+/g)![1]),
            parseInt(blockColor.match(/\d+/g)![2])
          )

          if (rand1 < circleProbability) {
            ctx.fillStyle = circleColor
            ctx.beginPath()
            ctx.arc(currentX + currentBlockSize / 2, currentY + currentBlockSize / 2, currentBlockSize / 2 - 1, 0, Math.PI * 2)
            ctx.fill()
          } else if (rand2 < asciiProbability) {
            const charIndex = Math.floor(rand3 * ASCII_CHARS.length)
            const char = ASCII_CHARS[charIndex]
            ctx.fillStyle = circleColor
            ctx.font = `${currentBlockSize * 0.9}px monospace`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(char, currentX + currentBlockSize / 2, currentY + currentBlockSize / 2)
          }

          ctx.globalAlpha = 1
        }
      }
    }

    // Helper to sample horse brightness
    const sampleHorseBrightnessFn = (screenX: number, screenY: number, rect: DOMRect): number => {
      if (!flowerImageData || !sampleWidth) return 0.5
      const imgX = Math.floor(((screenX - rect.left) / rect.width) * sampleWidth)
      const imgY = Math.floor(((screenY - rect.top) / rect.height) * sampleHeight)
      const clampedX = Math.max(0, Math.min(sampleWidth - 1, imgX))
      const clampedY = Math.max(0, Math.min(sampleHeight - 1, imgY))
      const idx = (clampedY * sampleWidth + clampedX) * 4
      const r = flowerImageData.data[idx]
      const g = flowerImageData.data[idx + 1]
      const b = flowerImageData.data[idx + 2]
      return (r * 0.299 + g * 0.587 + b * 0.114) / 255
    }

    // Draw dither animating from horse to horizontal line, then down sides
    const drawScrollDither = () => {
      const heroImage = document.querySelector('.hero-image video.active') as HTMLElement
      const servicesSection = document.querySelector('#services') as HTMLElement

      if (!heroImage) return

      const heroRect = heroImage.getBoundingClientRect()
      const targetBlockSize = 12

      // Helper to draw a single dither block
      const drawBlock = (x: number, y: number, t: number, seedX: number, seedY: number) => {
        const blockColor = lerpColor(ditherColors.blockColorStart, ditherColors.blockColorEnd, t)
        ctx.fillStyle = blockColor
        ctx.fillRect(x, y, targetBlockSize, targetBlockSize)

        const rand1 = getBlockRandom(seedX, seedY, 1)
        const rand2 = getBlockRandom(seedX, seedY, 2)
        const rand3 = getBlockRandom(seedX, seedY, 3)
        const circleColor = blendWithBlack(
          parseInt(blockColor.match(/\d+/g)![0]),
          parseInt(blockColor.match(/\d+/g)![1]),
          parseInt(blockColor.match(/\d+/g)![2])
        )

        if (rand1 < circleProbability) {
          ctx.fillStyle = circleColor
          ctx.beginPath()
          ctx.arc(x + targetBlockSize / 2, y + targetBlockSize / 2, targetBlockSize / 2 - 1, 0, Math.PI * 2)
          ctx.fill()
        } else if (rand2 < asciiProbability) {
          const charIndex = Math.floor(rand3 * ASCII_CHARS.length)
          ctx.fillStyle = circleColor
          ctx.font = `${targetBlockSize * 0.9}px monospace`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(ASCII_CHARS[charIndex], x + targetBlockSize / 2, y + targetBlockSize / 2)
        }
      }

      // Don't draw dither overlay when not scrolling — video is visible underneath
      if (!servicesSection || scrollProgress === 0) {
        return
      }

      const servicesRect = servicesSection.getBoundingClientRect()

      // Horse dither position (rectangle on horse)
      const horseRectX = heroRect.left + heroRect.width * 0.05
      const horseRectY = heroRect.top + heroRect.height * 0.30
      const horseRectWidth = 240
      const horseRectHeight = 160

      // Services section dimensions - sides at viewport edge (next to scroll bar)
      const sectionTop = servicesRect.top
      const sectionHeight = servicesRect.height
      const sectionLeft = 0  // Left edge of viewport
      const sectionRight = canvas.width - targetBlockSize  // Right edge (leave room for block)
      const sectionBottom = sectionTop + sectionHeight - 40

      const horseCols = Math.floor(horseRectWidth / targetBlockSize)
      const horseRows = Math.floor(horseRectHeight / targetBlockSize)
      const totalHorseBlocks = horseCols * horseRows

      // S-curve easing (smootherstep) - stickier to both ends
      const clampedScroll = Math.max(0, Math.min(1, scrollProgress))
      const easedProgress = clampedScroll * clampedScroll * clampedScroll * (clampedScroll * (6 * clampedScroll - 15) + 10)

      // Phase thresholds - 4 phases now (horizontal flow takes 5x more time)
      const phase1End = 0.05  // Gather under horse
      const phase2End = 0.1   // Flow down to services section center
      const phase3End = 0.85  // Spread horizontally to sides (75% of scroll time)
      // Phase 4: Flow down sides (0.85 - 1.0)

      const centerX = canvas.width / 2
      const serviceCenterY = sectionTop

      // Position right under the horse image
      const horseBottomY = horseRectY + horseRectHeight + 20
      const horseStartX = horseRectX + horseRectWidth / 2

      // Calculate path dimensions
      const halfWidth = (sectionRight - sectionLeft) / 2
      const sideLength = sectionBottom - sectionTop

      // Number of blocks per vertical side (determines density of the vertical lines)
      const blocksPerVerticalLine = Math.floor(sideLength / targetBlockSize)

      // Draw blocks for each side (left and right)
      for (let side = 0; side < 2; side++) {
        const isLeft = side === 0
        const direction = isLeft ? -1 : 1

        for (let i = 0; i < blocksPerVerticalLine; i++) {
          // Each block's final position on the vertical line
          const finalX = isLeft ? sectionLeft : sectionRight - targetBlockSize
          const finalY = serviceCenterY + i * targetBlockSize

          // Source position on horse (map to horse grid)
          const horseIndex = (side * blocksPerVerticalLine + i) % totalHorseBlocks
          const horseCol = horseIndex % horseCols
          const horseRow = Math.floor(horseIndex / horseCols)
          const horseX = horseRectX + horseCol * targetBlockSize
          const horseY = horseRectY + horseRow * targetBlockSize

          // Staggered timing for flowing effect
          const streamDelay = i / blocksPerVerticalLine * 0.7

          let currentX, currentY

          if (easedProgress < phase1End) {
            // Phase 1: Gather from horse dither to a point under the horse
            const phaseProgress = easedProgress / phase1End
            const delay = getBlockRandom(horseX, horseY, 15) * 0.3
            const adjustedProgress = Math.max(0, Math.min(1, (phaseProgress - delay) / (1 - delay)))
            currentX = horseX + (horseStartX - horseX) * adjustedProgress
            currentY = horseY + (horseBottomY - horseY) * adjustedProgress
          } else if (easedProgress < phase2End) {
            // Phase 2: Flow straight DOWN from under horse to services section (keep X fixed)
            const phaseProgress = (easedProgress - phase1End) / (phase2End - phase1End)
            const adjustedProgress = Math.max(0, Math.min(1, (phaseProgress - streamDelay * 0.3) / (1 - streamDelay * 0.3)))

            // Keep X at horse position, only move Y down
            currentX = horseStartX
            currentY = horseBottomY + (serviceCenterY - horseBottomY) * adjustedProgress
          } else if (easedProgress < phase3End) {
            // Phase 3: First move to center, then spread horizontally to the edges
            const phaseProgress = (easedProgress - phase2End) / (phase3End - phase2End)
            const adjustedProgress = Math.max(0, Math.min(1, (phaseProgress - streamDelay) / (1 - streamDelay)))

            // First half: move from horse X to center X
            // Second half: spread from center to edges
            if (adjustedProgress < 0.4) {
              // Move to center
              const toCenterProgress = adjustedProgress / 0.4
              currentX = horseStartX + (centerX - horseStartX) * toCenterProgress
            } else {
              // Spread to edges
              const spreadProgress = (adjustedProgress - 0.4) / 0.6
              currentX = centerX + direction * halfWidth * spreadProgress
            }
            currentY = serviceCenterY
          } else {
            // Phase 4: Flow down to final positions on the sides
            const phaseProgress = (easedProgress - phase3End) / (1 - phase3End)
            const adjustedProgress = Math.max(0, Math.min(1, (phaseProgress - streamDelay * 0.7) / (1 - streamDelay * 0.7)))

            currentX = finalX
            currentY = serviceCenterY + (finalY - serviceCenterY) * adjustedProgress
          }

          // Color gradient based on vertical position (top = blue, bottom = cyan)
          const t = i / blocksPerVerticalLine

          drawBlock(currentX, currentY, t, horseX, horseY)
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

          // Dark filled circle (punches through to background)
          ctx.beginPath()
          ctx.arc(cx, cy, radius, 0, Math.PI * 2)
          ctx.fillStyle = '#000000'
          ctx.fill()
        }
      }
    }

    const render = () => {
      const elapsed = Date.now() - startTime

      // Clear canvas - use transparent clear in static phase so horse shows through
      if (phase === 'static') {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      } else {
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }


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

      // CONVERGING - P logo blocks flow to flower video positions
      if (phase === 'expanding') {
        const expandElapsed = Date.now() - phaseStartTime
        const expandDuration = 1200 // 1.2 seconds to converge

        // Start flower video at beginning of expanding phase
        if (expandElapsed < 50 && flowerVideo.paused) {
          flowerVideo.play().catch(() => {})
        }

        // Update flower image data for current frame
        updateFlowerImageData()

        // Progress from 0 to 1
        const expandProgress = Math.min(1, expandElapsed / expandDuration)

        // Draw the flower video (grayscale) - fade in
        const videoFadeIn = Math.min(1, expandProgress * 2)
        ctx.globalAlpha = videoFadeIn

        // Get hero image area position
        const heroArea = document.querySelector('.hero-image') as HTMLElement
        let flowerX = canvas.width / 2
        let flowerY = canvas.height / 2
        let flowerW = canvas.width * 0.5
        let flowerH = canvas.height * 0.8

        if (heroArea) {
          const rect = heroArea.getBoundingClientRect()
          flowerX = rect.left
          flowerY = rect.top
          flowerW = rect.width
          flowerH = rect.height
        }

        // Maintain aspect ratio
        const videoAspect = flowerVideo.videoWidth / flowerVideo.videoHeight || 1
        const areaAspect = flowerW / flowerH
        let drawW, drawH, drawX, drawY

        if (videoAspect > areaAspect) {
          drawW = flowerW
          drawH = drawW / videoAspect
          drawX = flowerX
          drawY = flowerY + (flowerH - drawH) / 2
        } else {
          drawH = flowerH
          drawW = drawH * videoAspect
          drawX = flowerX + (flowerW - drawW) / 2
          drawY = flowerY
        }

        // Draw grayscale flower video
        ctx.filter = 'grayscale(100%)'
        ctx.drawImage(flowerVideo, drawX, drawY, drawW, drawH)
        ctx.filter = 'none'
        ctx.globalAlpha = 1

        // Calculate flower ASCII block positions
        const flowerBlockSize = 20
        const flowerCols = Math.ceil(drawW / flowerBlockSize)
        const flowerRows = Math.ceil(drawH / flowerBlockSize)

        // Sample brightness and collect visible blocks
        const flowerBlocks: { x: number; y: number; brightness: number }[] = []
        for (let row = 0; row < flowerRows; row++) {
          for (let col = 0; col < flowerCols; col++) {
            const screenX = drawX + col * flowerBlockSize
            const screenY = drawY + row * flowerBlockSize

            // Sample brightness from flower image
            if (flowerImageData && sampleWidth > 0) {
              const imgX = Math.floor(((screenX - drawX + flowerBlockSize / 2) / drawW) * sampleWidth)
              const imgY = Math.floor(((screenY - drawY + flowerBlockSize / 2) / drawH) * sampleHeight)
              const clampedX = Math.max(0, Math.min(sampleWidth - 1, imgX))
              const clampedY = Math.max(0, Math.min(sampleHeight - 1, imgY))
              const idx = (clampedY * sampleWidth + clampedX) * 4
              const r = flowerImageData.data[idx]
              const g = flowerImageData.data[idx + 1]
              const b = flowerImageData.data[idx + 2]
              const a = flowerImageData.data[idx + 3]

              if (a > 10) {
                const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255
                if (brightness >= 0.35) {
                  flowerBlocks.push({ x: screenX, y: screenY, brightness })
                }
              }
            }
          }
        }

        // Animate P logo blocks to flower positions
        const numLogoBlocks = logoBlocks.length
        const numFlowerBlocks = flowerBlocks.length

        for (let i = 0; i < Math.max(numLogoBlocks, numFlowerBlocks); i++) {
          const logoBlock = logoBlocks[i % numLogoBlocks]
          const flowerBlock = flowerBlocks[i % Math.max(1, numFlowerBlocks)]

          if (!flowerBlock) continue

          // Staggered animation delay
          const delay = getBlockRandom(i, i * 7, 20) * 0.4
          const blockProgress = Math.max(0, Math.min(1, (expandProgress - delay) / (1 - delay)))

          if (blockProgress > 0) {
            // Ease out cubic
            const eased = 1 - Math.pow(1 - blockProgress, 3)

            // Interpolate position
            const currentX = logoBlock.x + (flowerBlock.x - logoBlock.x) * eased
            const currentY = logoBlock.y + (flowerBlock.y - logoBlock.y) * eased

            // Interpolate block size
            const currentBlockSize = ditherBlockSize + (flowerBlockSize - ditherBlockSize) * eased

            // Get color based on final brightness
            const color = getOceanColor(flowerBlock.brightness)
            if (color.r === 0 && color.g === 0 && color.b === 0) continue

            // Draw block
            ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
            ctx.fillRect(currentX, currentY, currentBlockSize - 1, currentBlockSize - 1)

            // Draw symbol (35% chance)
            const rand = getBlockRandom(flowerBlock.x, flowerBlock.y, 1)
            const rand2 = getBlockRandom(flowerBlock.x, flowerBlock.y, 2)
            const rand3 = getBlockRandom(flowerBlock.x, flowerBlock.y, 3)
            if (rand < 0.35) {
              const symbolColor = {
                r: Math.min(255, color.r + 80),
                g: Math.min(255, color.g + 80),
                b: Math.min(255, color.b + 80),
              }
              ctx.fillStyle = `rgb(${symbolColor.r}, ${symbolColor.g}, ${symbolColor.b})`
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'

              if (rand2 < 0.5) {
                // Random ASCII character
                const charIndex = Math.floor(rand3 * ASCII_CHARS.length)
                ctx.font = `bold ${currentBlockSize * 0.7}px monospace`
                ctx.fillText(ASCII_CHARS[charIndex], currentX + currentBlockSize / 2, currentY + currentBlockSize / 2)
              } else {
                // Full circle (diameter = block size)
                ctx.beginPath()
                ctx.arc(currentX + currentBlockSize / 2, currentY + currentBlockSize / 2, (currentBlockSize - 2) / 2, 0, Math.PI * 2)
                ctx.fill()
              }
            }
          }
        }

        if (expandProgress >= 1) {
          phase = 'static'
          setAnimationPhase('static')
          onComplete()
        }
      }

      // STATIC - continue drawing flower with ASCII overlay
      if (phase === 'static') {
        // Update flower image data
        updateFlowerImageData()

        // Get hero image area position
        const heroArea = document.querySelector('.hero-image') as HTMLElement
        if (!heroArea) {
          animationFrame = requestAnimationFrame(render)
          return
        }

        const rect = heroArea.getBoundingClientRect()
        const flowerX = rect.left
        const flowerY = rect.top
        const flowerW = rect.width
        const flowerH = rect.height

        // Maintain aspect ratio
        const videoAspect = flowerVideo.videoWidth / flowerVideo.videoHeight || 1
        const areaAspect = flowerW / flowerH
        let drawW, drawH, drawX, drawY

        if (videoAspect > areaAspect) {
          drawW = flowerW
          drawH = drawW / videoAspect
          drawX = flowerX
          drawY = flowerY + (flowerH - drawH) / 2
        } else {
          drawH = flowerH
          drawW = drawH * videoAspect
          drawX = flowerX + (flowerW - drawW) / 2
          drawY = flowerY
        }

        // Draw grayscale flower video
        ctx.filter = 'grayscale(100%)'
        ctx.drawImage(flowerVideo, drawX, drawY, drawW, drawH)
        ctx.filter = 'none'

        // Draw ASCII overlay
        const flowerBlockSize = 20
        const flowerCols = Math.ceil(drawW / flowerBlockSize)
        const flowerRows = Math.ceil(drawH / flowerBlockSize)

        for (let row = 0; row < flowerRows; row++) {
          for (let col = 0; col < flowerCols; col++) {
            const screenX = drawX + col * flowerBlockSize
            const screenY = drawY + row * flowerBlockSize

            if (flowerImageData && sampleWidth > 0) {
              const imgX = Math.floor(((screenX - drawX + flowerBlockSize / 2) / drawW) * sampleWidth)
              const imgY = Math.floor(((screenY - drawY + flowerBlockSize / 2) / drawH) * sampleHeight)
              const clampedX = Math.max(0, Math.min(sampleWidth - 1, imgX))
              const clampedY = Math.max(0, Math.min(sampleHeight - 1, imgY))
              const idx = (clampedY * sampleWidth + clampedX) * 4
              const r = flowerImageData.data[idx]
              const g = flowerImageData.data[idx + 1]
              const b = flowerImageData.data[idx + 2]
              const a = flowerImageData.data[idx + 3]

              if (a < 10) continue

              const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255
              if (brightness < 0.35) continue

              const color = getOceanColor(brightness)
              if (color.r === 0 && color.g === 0 && color.b === 0) continue

              ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
              ctx.fillRect(screenX, screenY, flowerBlockSize - 1, flowerBlockSize - 1)

              // Draw symbol - use col/row for consistent randomness when scrolling
              const rand = getBlockRandom(col, row, 1)
              const rand2 = getBlockRandom(col, row, 2)
              const rand3 = getBlockRandom(col, row, 3)
              if (rand < 0.35) {
                const symbolColor = {
                  r: Math.min(255, color.r + 80),
                  g: Math.min(255, color.g + 80),
                  b: Math.min(255, color.b + 80),
                }
                ctx.fillStyle = `rgb(${symbolColor.r}, ${symbolColor.g}, ${symbolColor.b})`
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'

                if (rand2 < 0.5) {
                  // Random ASCII character
                  const charIndex = Math.floor(rand3 * ASCII_CHARS.length)
                  ctx.font = `bold ${flowerBlockSize * 0.7}px monospace`
                  ctx.fillText(ASCII_CHARS[charIndex], screenX + flowerBlockSize / 2, screenY + flowerBlockSize / 2)
                } else {
                  // Full circle (diameter = block size)
                  ctx.beginPath()
                  ctx.arc(screenX + flowerBlockSize / 2, screenY + flowerBlockSize / 2, (flowerBlockSize - 2) / 2, 0, Math.PI * 2)
                  ctx.fill()
                }
              }
            }
          }
        }

        // Also draw scroll dither if needed
        drawScrollDither()
      }

      animationFrame = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', updateSize)
      window.removeEventListener('scroll', updateScrollProgress)
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [onComplete])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: animationPhase === 'intro' ? 9999 : 1,
        backgroundColor: animationPhase === 'intro' ? '#000000' : 'transparent',
        pointerEvents: animationPhase === 'static' ? 'none' : 'auto',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: animationPhase === 'intro' ? '#000000' : 'transparent',
          mixBlendMode: animationPhase === 'static' ? 'screen' : 'normal',
        }}
      />
    </div>
  )
}