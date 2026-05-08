'use client'

import { useEffect, useRef } from 'react'
import { SHARED_START } from './sharedTime'

const CHARS = '0123456789@#$%&*+=?<>{}[]/\\|LABS'
const SHADER_BLOCK_PX = 32 // CSS px — matches blockPx in PixelGradientCanvas shader (DPR-independent)
const FILL_CHANCE = 0.4
const FONT_SIZE = 12 // Matches AsciiOverlay (hero) so both ASCII layers feel identical

export default function FinderAsciiOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cssBlockSize = SHADER_BLOCK_PX

    // Find the sibling WebGL canvas to sample actual rendered pixels
    const glCanvas = canvas.parentElement?.querySelector('canvas:not(.exp-ascii-overlay)') as HTMLCanvasElement | null

    // Offscreen canvas for sampling the GL output at grid resolution
    const sampleCanvas = document.createElement('canvas')
    const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true })

    let cssWidth = canvas.offsetWidth
    let cssHeight = canvas.offsetHeight
    let cols = 0
    let rows = 0
    let grid: { cellX: number; cellY: number; char: string; brightness: number }[] = []

    const initGrid = () => {
      cssWidth = canvas.offsetWidth
      cssHeight = canvas.offsetHeight
      canvas.width = cssWidth
      canvas.height = cssHeight

      cols = Math.ceil(cssWidth / cssBlockSize)
      rows = Math.ceil(cssHeight / cssBlockSize)

      // Sample canvas matches grid dimensions (one pixel per cell)
      sampleCanvas.width = cols
      sampleCanvas.height = rows

      grid = []
      for (let cellY = 0; cellY < rows; cellY++) {
        for (let cellX = 0; cellX < cols; cellX++) {
          if (Math.random() < FILL_CHANCE) {
            grid.push({
              cellX,
              cellY,
              char: CHARS[Math.floor(Math.random() * CHARS.length)],
              brightness: Math.random() * 0.5 + 0.5,
            })
          }
        }
      }
    }

    initGrid()

    let rafId: number
    const fontSize = FONT_SIZE

    const render = () => {
      const time = performance.now() / 1000 - SHARED_START

      ctx.clearRect(0, 0, cssWidth, cssHeight)

      // Sample the actual WebGL canvas — downscale to grid resolution
      let pixelData: Uint8ClampedArray | null = null
      if (glCanvas && sampleCtx && cols > 0 && rows > 0) {
        sampleCtx.clearRect(0, 0, cols, rows)
        sampleCtx.drawImage(glCanvas, 0, 0, cols, rows)
        pixelData = sampleCtx.getImageData(0, 0, cols, rows).data
      }

      ctx.font = `500 ${fontSize}px "Inter", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      for (let i = 0; i < grid.length; i++) {
        const cell = grid[i]

        // UV coordinates matching the WebGL shader's grid
        const vUvX = (cell.cellX + 0.5) * cssBlockSize / cssWidth
        const vUvY = (cell.cellY + 0.5) * cssBlockSize / cssHeight

        // Canvas pixel position (Y inverted — WebGL 0 is bottom, canvas 0 is top)
        const px = vUvX * cssWidth
        const py = cssHeight - (vUvY * cssHeight)

        // Shimmer mask — same math as shader and hero
        const diag = (vUvX + 1.0 - vUvY) * 0.5
        const shimmerPos = (time * 0.25) % 1.0
        let shimmerDist = Math.abs(diag - shimmerPos)
        shimmerDist = Math.min(shimmerDist, 1.0 - shimmerDist)
        const shimmerMask = Math.exp(-shimmerDist * shimmerDist * 120.0) * 0.6

        // Sample actual rendered brightness from the GL canvas
        // The sample canvas is drawn top-down, so cellY=0 = top of canvas
        // But our cellY=0 maps to WebGL bottom. We need to flip:
        // Canvas row for cellY in WebGL-bottom-up → sample row = (rows - 1 - cellY)
        let glBrightness = 0
        if (pixelData) {
          const sampleRow = rows - 1 - cell.cellY
          const idx = (sampleRow * cols + cell.cellX) * 4
          const r = pixelData[idx]
          const g = pixelData[idx + 1]
          const b = pixelData[idx + 2]
          const a = pixelData[idx + 3]
          // Effective brightness: color over black background, premultiplied by alpha
          glBrightness = (Math.max(r, g, b) / 255) * (a / 255)
        }

        // Only show ASCII where the gradient is actually visible
        if (shimmerMask > 0.01 && glBrightness > 0.12) {
          const finalAlpha = shimmerMask * cell.brightness * Math.min(glBrightness * 2.0, 1.0)
          ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha})`
          ctx.fillText(cell.char, px, py)
        }
      }

      rafId = requestAnimationFrame(render)
    }

    rafId = requestAnimationFrame(render)

    let resizeTimer: NodeJS.Timeout
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(initGrid, 100)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      clearTimeout(resizeTimer)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="exp-ascii-overlay"
      data-active="true"
    />
  )
}
