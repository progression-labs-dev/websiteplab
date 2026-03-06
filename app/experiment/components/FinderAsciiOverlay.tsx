'use client'

import { useEffect, useRef } from 'react'

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

const CHARS = '0123456789@#$%&*+=?<>{}[]/\\|LABS'
const SHADER_BLOCK_PX = 45 // Must match blockPx in PixelGradientCanvas shader
const FILL_CHANCE = 0.4

export default function FinderAsciiOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    // The WebGL shader uses 45px in PHYSICAL pixel space.
    // In CSS space, each block is 45 / dpr pixels.
    const cssBlockSize = SHADER_BLOCK_PX / dpr

    let cssWidth = canvas.offsetWidth
    let cssHeight = canvas.offsetHeight
    let grid: { cellX: number; cellY: number; char: string; brightness: number }[] = []

    const initGrid = () => {
      cssWidth = canvas.offsetWidth
      cssHeight = canvas.offsetHeight
      // Set canvas resolution to match CSS size (1:1, not scaled by dpr)
      canvas.width = cssWidth
      canvas.height = cssHeight

      grid = []
      const cols = Math.ceil(cssWidth / cssBlockSize)
      const rows = Math.ceil(cssHeight / cssBlockSize)

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

    const startTime = performance.now() / 1000
    let rafId: number

    // Font size scaled to fit neatly inside each block
    const fontSize = Math.round(cssBlockSize * 0.55)

    const render = () => {
      const time = performance.now() / 1000 - startTime

      ctx.clearRect(0, 0, cssWidth, cssHeight)
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

        // Fade out ASCII in lower dark areas — match the shader's alpha fade
        const wave = Math.sin(vUvX * 3.5 + 1.2) * 0.06
                   + Math.sin(vUvX * 7.0 + 3.7) * 0.03
                   + Math.cos(vUvX * 5.0 + 0.5) * 0.04
        const leftPush = Math.max(0, 1.0 - vUvX / 0.5) * 0.25
        const rightPush = Math.max(0, 1.0 - (1.0 - vUvX) / 0.4) * 0.10
        const edgePush = leftPush + rightPush
        const gradientAlpha = smoothstep(-0.35, 0.65, vUvY + wave + edgePush)

        if (shimmerMask > 0.01 && gradientAlpha > 0.05) {
          const finalAlpha = shimmerMask * cell.brightness * gradientAlpha
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
