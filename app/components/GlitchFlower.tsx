'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

interface GlitchFlowerProps {
  src: string
  width: number
  height: number
  blockSize?: number
  density?: number
  className?: string
}

const COLOR_PALETTE = ['#F5F5F5', '#BA55D3', '#FFA07A', '#B9E979', '#40E0D0', '#0000FF']
const ASCII_CHARS = ['@', '#', '$', '%', '&', '!', '*', '^']

// Seeded random for consistency
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

interface GridCell {
  color: string | null
  hasCircle: boolean
  circleColor?: string
  showAscii: boolean
  char: string
  charColor: string
  foreground: boolean
  // Movement properties
  moves: boolean
  moveDirection: 'horizontal' | 'vertical'
  moveSpeed: number // ticks per move
  movePhase: number // starting phase offset
}

// Map brightness (0-255) to color palette
const brightnessToColor = (brightness: number): string => {
  const index = Math.floor((brightness / 255) * (COLOR_PALETTE.length - 1))
  return COLOR_PALETTE[Math.min(index, COLOR_PALETTE.length - 1)]
}

interface FlowerCell {
  color: string
  brightness: number
  showAscii: boolean
  char: string
  charColor: string
}

export default function GlitchFlower({
  src,
  width,
  height,
  blockSize = 16,
  density = 0.45,
  className = ''
}: GlitchFlowerProps) {
  const [grid, setGrid] = useState<GridCell[][]>([])
  const [flowerGrid, setFlowerGrid] = useState<FlowerCell[][]>([])
  const [imageLoaded, setImageLoaded] = useState(false)
  const [tick, setTick] = useState(0)
  const animationRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Animation loop
  useEffect(() => {
    animationRef.current = setInterval(() => {
      setTick(t => t + 1)
    }, 150) // Update every 150ms

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current)
      }
    }
  }, [])

  // Load flower image and create color-mapped grid
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

      const cols = Math.ceil(width / blockSize)
      const rows = Math.ceil(height / blockSize)

      // Calculate scale to map grid to image
      const scaleX = img.width / width
      const scaleY = img.height / height

      const newFlowerGrid: FlowerCell[][] = []

      for (let row = 0; row < rows; row++) {
        const rowData: FlowerCell[] = []
        for (let col = 0; col < cols; col++) {
          const imgX = Math.floor((col * blockSize + blockSize / 2) * scaleX)
          const imgY = Math.floor((row * blockSize + blockSize / 2) * scaleY)

          try {
            const pixel = ctx.getImageData(imgX, imgY, 1, 1).data
            const r = pixel[0]
            const g = pixel[1]
            const b = pixel[2]
            const a = pixel[3]

            // Calculate brightness
            const brightness = (r * 0.299 + g * 0.587 + b * 0.114)

            // Only show if there's content (alpha > 30 and brightness > 20)
            if (a > 30 && brightness > 20) {
              const seed = row * 173 + col * 311
              const animSeed = seed + Math.floor(tick / 2) * 7
              const showAscii = seededRandom(seed + 500) < 0.8
              const charIndex = Math.floor(seededRandom(animSeed + 501) * ASCII_CHARS.length)
              const charColorIndex = Math.floor(seededRandom(animSeed + 502) * COLOR_PALETTE.length)

              rowData.push({
                color: brightnessToColor(brightness),
                brightness,
                showAscii,
                char: ASCII_CHARS[charIndex],
                charColor: COLOR_PALETTE[charColorIndex]
              })
            } else {
              rowData.push({
                color: '',
                brightness: 0,
                showAscii: false,
                char: '',
                charColor: ''
              })
            }
          } catch (e) {
            rowData.push({
              color: '',
              brightness: 0,
              showAscii: false,
              char: '',
              charColor: ''
            })
          }
        }
        newFlowerGrid.push(rowData)
      }

      setFlowerGrid(newFlowerGrid)
      setImageLoaded(true)
    }

    img.src = src
  }, [src, width, height, blockSize, tick])

  useEffect(() => {
    const cols = Math.ceil(width / blockSize)
    const rows = Math.ceil(height / blockSize)
    const centerX = cols / 2
    const centerY = rows / 2

    // Initialize empty grid
    const newGrid: GridCell[][] = []
    for (let row = 0; row < rows; row++) {
      const rowData: GridCell[] = []
      for (let col = 0; col < cols; col++) {
        rowData.push({
          color: null,
          hasCircle: false,
          showAscii: false,
          char: '',
          charColor: '#ffffff',
          foreground: false,
          moves: false,
          moveDirection: 'horizontal',
          moveSpeed: 10,
          movePhase: 0
        })
      }
      newGrid.push(rowData)
    }

    // Helper to fill a cell
    const fillCell = (row: number, col: number, color: string, hasCircle: boolean, circleColor: string | undefined, foreground: boolean) => {
      if (row >= 0 && row < rows && col >= 0 && col < cols && newGrid[row][col].color === null) {
        const baseSeed = row * 173 + col * 311
        // Use tick to animate ASCII and colors (longer cycle)
        const animSeed = baseSeed + Math.floor(tick / 2) * 7
        const showAscii = seededRandom(baseSeed + 100) < 0.8
        const charIndex = Math.floor(seededRandom(animSeed + 101) * ASCII_CHARS.length)
        const charColorIndex = Math.floor(seededRandom(animSeed + 102) * COLOR_PALETTE.length)

        // 25% of cells move
        const moves = seededRandom(baseSeed + 200) < 0.25
        const moveDirection = seededRandom(baseSeed + 201) < 0.5 ? 'horizontal' : 'vertical'
        const moveSpeed = Math.floor(seededRandom(baseSeed + 202) * 15) + 5 // 5-20 ticks per move
        const movePhase = Math.floor(seededRandom(baseSeed + 203) * 100)

        newGrid[row][col] = {
          color,
          hasCircle,
          circleColor,
          showAscii,
          char: ASCII_CHARS[charIndex],
          charColor: COLOR_PALETTE[charColorIndex],
          foreground,
          moves,
          moveDirection,
          moveSpeed,
          movePhase
        }
      }
    }

    // First pass: Add large blocks (made of individual cells)
    const numLargeBlocks = Math.floor((cols * rows) * 0.04)

    for (let i = 0; i < numLargeBlocks; i++) {
      const seed = i * 997 + 12345

      const col = Math.floor(seededRandom(seed + 1) * cols)
      const row = Math.floor(seededRandom(seed + 2) * rows)

      // Calculate distance from center (rectangular)
      const dx = Math.abs(col - centerX) / centerX
      const dy = Math.abs(row - centerY) / centerY
      const rectDist = Math.max(dx, dy)

      // 40% margin for large blocks too
      if (rectDist > 0.5) continue

      // Random block dimensions (in cells)
      const blockW = Math.floor(seededRandom(seed + 3) * 4) + 2 // 2-5 cells wide
      const blockH = Math.floor(seededRandom(seed + 4) * 4) + 2 // 2-5 cells tall

      // Use tick to animate colors (longer cycle)
      const colorTick = Math.floor(tick / 10)
      const colorIndex = Math.floor(seededRandom(seed + 5 + colorTick) * COLOR_PALETTE.length)
      const color = COLOR_PALETTE[colorIndex]

      const foreground = seededRandom(seed + 6) < 0.4

      // Fill all cells in this large block
      for (let r = 0; r < blockH; r++) {
        for (let c = 0; c < blockW; c++) {
          fillCell(row + r, col + c, color, false, undefined, foreground)
        }
      }
    }

    // Second pass: Fill individual cells
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Skip if already filled by large block
        if (newGrid[row][col].color !== null) continue

        const seed = row * 173 + col * 311
        const rand = seededRandom(seed)

        // Calculate distance from center (rectangular)
        const dx = Math.abs(col - centerX) / centerX
        const dy = Math.abs(row - centerY) / centerY
        const rectDist = Math.max(dx, dy)

        // 40% margin - no blocks beyond 60% from center
        if (rectDist > 0.6) continue

        // Simple falloff: most dense at center (rectDist=0), less toward edges
        const falloff = Math.pow(1 - rectDist, 2)
        const adjustedDensity = density * 1.5 * falloff

        if (rand < adjustedDensity) {
          // Use tick to animate colors (change every few ticks, longer cycle)
          const colorTick = Math.floor(tick / 8)
          const colorIndex = Math.floor(seededRandom(seed + 1 + colorTick) * COLOR_PALETTE.length)
          const color = COLOR_PALETTE[colorIndex]

          // 30% chance for circle
          const hasCircle = seededRandom(seed + 2) < 0.3
          let circleColor: string | undefined
          if (hasCircle) {
            let circleColorIndex = Math.floor(seededRandom(seed + 3 + colorTick) * COLOR_PALETTE.length)
            if (circleColorIndex === colorIndex) {
              circleColorIndex = (circleColorIndex + 1) % COLOR_PALETTE.length
            }
            circleColor = COLOR_PALETTE[circleColorIndex]
          }

          const foreground = seededRandom(seed + 4) < 0.3

          fillCell(row, col, color, hasCircle, circleColor, foreground)
        }
      }
    }

    setGrid(newGrid)
  }, [width, height, blockSize, density, tick])

  const renderCell = (cell: GridCell, row: number, col: number, index: number) => {
    if (!cell.color) return null

    // Calculate movement offset
    let offsetX = 0
    let offsetY = 0
    if (cell.moves) {
      const moveStep = Math.floor((tick + cell.movePhase) / cell.moveSpeed)
      // Oscillate back and forth: 0, 1, 2, 1, 0, -1, -2, -1, 0...
      const oscillation = Math.sin(moveStep * 0.3) * 2
      const offset = Math.round(oscillation) * blockSize
      if (cell.moveDirection === 'horizontal') {
        offsetX = offset
      } else {
        offsetY = offset
      }
    }

    return (
      <div
        key={index}
        style={{
          position: 'absolute',
          left: col * blockSize + offsetX,
          top: row * blockSize + offsetY,
          width: blockSize,
          height: blockSize,
          backgroundColor: cell.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'left 0.2s ease, top 0.2s ease, background-color 0.15s ease',
        }}
      >
        {cell.hasCircle && (
          <div
            style={{
              position: 'absolute',
              width: blockSize,
              height: blockSize,
              borderRadius: '50%',
              backgroundColor: cell.circleColor,
              transition: 'background-color 0.15s ease',
            }}
          />
        )}
        {cell.showAscii && (
          <span
            style={{
              position: 'relative',
              zIndex: 1,
              color: cell.charColor,
              fontSize: blockSize * 0.6,
              fontFamily: 'monospace',
              fontWeight: 'bold',
              transition: 'color 0.15s ease',
            }}
          >
            {cell.char}
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      className={`glitch-flower-container ${className}`}
      style={{
        position: 'relative',
        width,
        height,
        backgroundColor: '#000000',
        overflow: 'hidden',
      }}
    >
      {/* Hidden canvas for reading pixel data */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Background blocks (behind flower) - normal blend */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {grid.flatMap((rowData, row) =>
          rowData.map((cell, col) =>
            !cell.foreground ? renderCell(cell, row, col, row * 1000 + col) : null
          )
        )}
      </div>

      {/* Base grayscale flower image */}
      <img
        src={src}
        alt=""
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          filter: 'grayscale(100%) contrast(1.2)',
          zIndex: 20,
        }}
      />

      {/* Flower color-mapped overlay - normal blend */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 25,
        }}
      >
        {flowerGrid.flatMap((rowData, row) =>
          rowData.map((cell, col) =>
            cell.color ? (
              <div
                key={`flower-${row}-${col}`}
                style={{
                  position: 'absolute',
                  left: col * blockSize,
                  top: row * blockSize,
                  width: blockSize,
                  height: blockSize,
                  backgroundColor: cell.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {cell.showAscii && (
                  <span
                    style={{
                      color: cell.charColor,
                      fontSize: blockSize * 0.6,
                      fontFamily: 'monospace',
                      fontWeight: 'bold',
                    }}
                  >
                    {cell.char}
                  </span>
                )}
              </div>
            ) : null
          )
        )}
      </div>

      {/* Foreground blocks (in front of flower) - multiply blend */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 30,
          mixBlendMode: 'multiply',
        }}
      >
        {grid.flatMap((rowData, row) =>
          rowData.map((cell, col) =>
            cell.foreground ? renderCell(cell, row, col, row * 1000 + col) : null
          )
        )}
      </div>
    </div>
  )
}
