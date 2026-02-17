'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface AsciiPixel {
  char: string
  color: string
  brightness: number
  hasContent: boolean
  x: number
  y: number
}

const ASCII_CHARS = ['@', '#', 'S', '%', '?', '*', '+', ';', ':', ',', '.']

function getAsciiChar(brightness: number): string {
  const index = Math.floor((1 - brightness / 255) * (ASCII_CHARS.length - 1))
  return ASCII_CHARS[Math.min(index, ASCII_CHARS.length - 1)]
}

function interpolateColor(brightness: number, randomSeed: number): string {
  // Color palette
  const colors = [
    { r: 0, g: 0, b: 255 },       // Blue #0000FF
    { r: 64, g: 224, b: 208 },    // Turquoise #40E0D0
    { r: 185, g: 233, b: 121 },   // Progression Green #B9E979
    { r: 255, g: 160, b: 122 },   // Light Salmon #FFA07A
    { r: 186, g: 85, b: 211 },    // Medium Orchid #BA55D3
    { r: 245, g: 245, b: 245 },   // White Smoke #F5F5F5
  ]

  // Use brightness to influence color selection, but add randomness
  const t = brightness / 255

  // Add random offset to mix up colors while still being influenced by brightness
  const randomOffset = (randomSeed % 100) / 100 * 0.6 - 0.3 // -0.3 to +0.3
  const adjustedT = Math.max(0, Math.min(1, t + randomOffset))

  // Select color index based on adjusted brightness
  const colorIndex = Math.floor(adjustedT * (colors.length - 1))
  const nextIndex = Math.min(colorIndex + 1, colors.length - 1)

  // Interpolate between two adjacent colors
  const localT = (adjustedT * (colors.length - 1)) - colorIndex

  const lower = colors[colorIndex]
  const upper = colors[nextIndex]

  const r = Math.round(lower.r + localT * (upper.r - lower.r))
  const g = Math.round(lower.g + localT * (upper.g - lower.g))
  const b = Math.round(lower.b + localT * (upper.b - lower.b))

  return `rgb(${r}, ${g}, ${b})`
}

interface AsciiImageProps {
  src: string
  width: number
  height: number
  blockSize?: number
  className?: string
}

export default function AsciiImage({
  src,
  width,
  height,
  blockSize = 16,
  className = ''
}: AsciiImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [asciiGrid, setAsciiGrid] = useState<AsciiPixel[][]>([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, cols: 0, rows: 0 })
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)

  const FADE_RADIUS = 390  // pixels from mouse where blocks are visible

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setMousePos(null)
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [handleMouseMove])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const img = new window.Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const cols = Math.ceil(img.width / blockSize)
      const rows = Math.ceil(img.height / blockSize)

      setDimensions({ width: img.width, height: img.height, cols, rows })

      // First pass: collect brightness values to find min/max
      const brightnessValues: { row: number; col: number; brightness: number; pixelX: number; pixelY: number }[] = []
      let minBrightness = 255
      let maxBrightness = 0

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const pixelX = (col + 0.5) * blockSize
          const pixelY = (row + 0.5) * blockSize

          const x = col * blockSize
          const y = row * blockSize
          const w = Math.min(blockSize, img.width - x)
          const h = Math.min(blockSize, img.height - y)

          if (w <= 0 || h <= 0) continue

          try {
            const imageData = ctx.getImageData(x, y, w, h)
            const data = imageData.data

            let totalBrightness = 0
            let totalAlpha = 0
            let pixelCount = 0

            for (let i = 0; i < data.length; i += 4) {
              const r = data[i]
              const g = data[i + 1]
              const b = data[i + 2]
              const a = data[i + 3]

              totalAlpha += a
              if (a > 30) {
                const brightness = (r * 0.299 + g * 0.587 + b * 0.114)
                totalBrightness += brightness
                pixelCount++
              }
            }

            const avgAlpha = totalAlpha / (data.length / 4)
            if (avgAlpha < 20 || pixelCount === 0) continue

            const avgBrightness = totalBrightness / pixelCount
            if (avgBrightness < 20) continue

            minBrightness = Math.min(minBrightness, avgBrightness)
            maxBrightness = Math.max(maxBrightness, avgBrightness)
            brightnessValues.push({ row, col, brightness: avgBrightness, pixelX, pixelY })
          } catch (e) {
            // Skip this block
          }
        }
      }

      // Second pass: create grid with normalized brightness
      const brightnessRange = maxBrightness - minBrightness
      const grid: AsciiPixel[][] = []

      // Initialize empty grid
      for (let row = 0; row < rows; row++) {
        const rowData: AsciiPixel[] = []
        for (let col = 0; col < cols; col++) {
          const pixelX = (col + 0.5) * blockSize
          const pixelY = (row + 0.5) * blockSize
          rowData.push({ char: '', color: 'transparent', brightness: 0, hasContent: false, x: pixelX, y: pixelY })
        }
        grid.push(rowData)
      }

      // Fill in pixels with normalized brightness
      brightnessValues.forEach(({ row, col, brightness, pixelX, pixelY }) => {
        // Normalize brightness to 0-255 range
        const normalizedBrightness = brightnessRange > 0
          ? ((brightness - minBrightness) / brightnessRange) * 255
          : 128

        const char = getAsciiChar(normalizedBrightness)
        // Use position to create consistent random seed for each block
        const randomSeed = (row * 137 + col * 251) % 1000
        const color = interpolateColor(normalizedBrightness, randomSeed)

        grid[row][col] = { char, color, brightness: normalizedBrightness, hasContent: true, x: pixelX, y: pixelY }
      })

      // Add random scattered squares
      const randomColors = [
        'rgb(0, 0, 255)',       // Blue
        'rgb(64, 224, 208)',    // Turquoise
        'rgb(185, 233, 121)',   // Green
        'rgb(255, 160, 122)',   // Salmon
        'rgb(186, 85, 211)',    // Orchid
        'rgb(245, 245, 245)',   // White
      ]

      // Seed-based random for consistency
      const seededRandom = (seed: number) => {
        const x = Math.sin(seed * 9999) * 10000
        return x - Math.floor(x)
      }

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Only add random squares to empty cells
          if (!grid[row][col].hasContent) {
            const seed = row * 173 + col * 311
            const rand = seededRandom(seed)

            // ~15% chance to add a random square
            if (rand < 0.15) {
              const colorIndex = Math.floor(seededRandom(seed + 1) * randomColors.length)
              const pixelX = (col + 0.5) * blockSize
              const pixelY = (row + 0.5) * blockSize
              const char = ASCII_CHARS[Math.floor(seededRandom(seed + 2) * ASCII_CHARS.length)]

              grid[row][col] = {
                char,
                color: randomColors[colorIndex],
                brightness: 128,
                hasContent: true,
                x: pixelX,
                y: pixelY
              }
            }
          }
        }
      }

      setAsciiGrid(grid)
    }

    img.onerror = () => {
      console.error('Failed to load image for ASCII effect')
    }

    img.src = src
  }, [src, blockSize])

  const getOpacityForPixel = (pixelX: number, pixelY: number): number => {
    if (!mousePos) return 0

    // Scale mouse position to match the original image dimensions
    const scale = dimensions.width / width
    const scaledMouseX = mousePos.x * scale
    const scaledMouseY = mousePos.y * scale

    const dx = pixelX - scaledMouseX
    const dy = pixelY - scaledMouseY
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Calculate angle for irregular edge
    const angle = Math.atan2(dy, dx)

    // Use mouse position to offset the pattern so it changes as mouse moves
    const mouseOffset = (scaledMouseX * 0.01) + (scaledMouseY * 0.01)

    // Create irregular radius using multiple sine waves that shift with mouse position
    const irregularity =
      Math.sin(angle * 3 + mouseOffset) * 0.15 +
      Math.sin(angle * 5 + mouseOffset * 1.3) * 0.1 +
      Math.sin(angle * 7 + mouseOffset * 0.7) * 0.08

    const irregularRadius = FADE_RADIUS * (1 + irregularity)

    if (distance >= irregularRadius) {
      return 0
    }

    return 1
  }

  return (
    <div
      ref={containerRef}
      className={`ascii-image-wrapper ${className}`}
      style={{ position: 'relative', width, height }}
      onMouseLeave={handleMouseLeave}
    >
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Base image */}
      <img
        src={src}
        alt=""
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />

      {/* ASCII overlay */}
      {asciiGrid.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: dimensions.width,
            height: dimensions.height,
            display: 'grid',
            gridTemplateColumns: `repeat(${dimensions.cols}, ${blockSize}px)`,
            gridTemplateRows: `repeat(${dimensions.rows}, ${blockSize}px)`,
            transformOrigin: 'top left',
            transform: `scale(${width / dimensions.width})`,
          }}
        >
          {asciiGrid.flat().map((pixel, index) => {
            return pixel.hasContent ? (
              <div
                key={index}
                style={{
                  width: blockSize,
                  height: blockSize,
                  backgroundColor: pixel.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: blockSize * 0.65,
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  color: '#ffffff',
                }}
              >
                {pixel.char}
              </div>
            ) : (
              <div key={index} style={{ width: blockSize, height: blockSize }} />
            )
          })}
        </div>
      )}
    </div>
  )
}
