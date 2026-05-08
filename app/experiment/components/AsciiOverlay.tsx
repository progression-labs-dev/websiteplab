'use client'

import { useEffect, useRef } from 'react'

interface AsciiOverlayProps {
  active: boolean
}

// Expanded character set for more organic texture
const CHARS = '0123456789@#$%&*+=?<>{}[]/\\|LABS'
const BLOCK_SIZE = 32 // Matches 'float blockPx = 32.0;' in HeroGradientGL
const FILL_CHANCE = 0.4
const FONT_SIZE = 12 // Scaled from 14 to keep proportion with the smaller block grid

export default function AsciiOverlay({ active }: AsciiOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = canvas.offsetWidth
    let height = canvas.offsetHeight
    let grid: { cellX: number; cellY: number; char: string; brightness: number }[] = []

    let mouseX = 0.5
    let mouseY = 0.5
    let targetX = 0.5
    let targetY = 0.5
    let mouseActive = 0
    let targetActive = 0

    const initGrid = () => {
      width = canvas.offsetWidth
      height = canvas.offsetHeight
      canvas.width = width
      canvas.height = height

      grid = []
      const cols = Math.ceil(width / BLOCK_SIZE)
      const rows = Math.ceil(height / BLOCK_SIZE)

      // WebGL draws its floor() grid from the bottom up.
      // We must track cellY starting from 0 at the bottom to align perfectly.
      for (let cellY = 0; cellY < rows; cellY++) {
        for (let cellX = 0; cellX < cols; cellX++) {
          if (Math.random() < FILL_CHANCE) {
            grid.push({
              cellX,
              cellY,
              char: CHARS[Math.floor(Math.random() * CHARS.length)],
              brightness: Math.random() * 0.5 + 0.5, // Random intensity multiplier
            })
          }
        }
      }
    }

    initGrid()

    const startTime = performance.now() / 1000
    let rafId: number

    const render = () => {
      mouseX += (targetX - mouseX) * 0.08
      mouseY += (targetY - mouseY) * 0.08
      mouseActive += (targetActive - mouseActive) * 0.1

      const time = performance.now() / 1000 - startTime
      const aspect = width / height

      ctx.clearRect(0, 0, width, height)
      ctx.font = `500 ${FONT_SIZE}px "Inter", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      for (let i = 0; i < grid.length; i++) {
        const cell = grid[i]

        // 1. Calculate WebGL UV coordinates for the CENTER of this specific block
        const vUvX = (cell.cellX + 0.5) * BLOCK_SIZE / width
        const vUvY = (cell.cellY + 0.5) * BLOCK_SIZE / height

        // 2. Convert to Canvas pixel coordinates (Canvas Y is inverted compared to WebGL)
        const px = vUvX * width
        const py = height - (vUvY * height)

        // 3. Mouse Mask Math (Matches WebGL)
        const distX = (vUvX - mouseX) * aspect
        const distY = vUvY - mouseY
        const distSq = distX * distX + distY * distY
        const mouseMask = Math.exp(-distSq * 18.0) * mouseActive

        // 4. Shimmer Mask Math (Matches WebGL)
        const diag = (vUvX + 1.0 - vUvY) * 0.5
        const shimmerPos = (time * 0.25) % 1.0
        let shimmerDist = Math.abs(diag - shimmerPos)
        shimmerDist = Math.min(shimmerDist, 1.0 - shimmerDist)
        const shimmerMask = Math.exp(-shimmerDist * shimmerDist * 120.0) * 0.6

        // Combine masks
        const mask = Math.max(mouseMask, shimmerMask * (1.0 - mouseActive))

        // ONLY DRAW if the mask is actually active (no lingering background text)
        if (mask > 0.01) {
          const finalAlpha = mask * cell.brightness
          ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha})`
          ctx.fillText(cell.char, px, py)
        }
      }

      rafId = requestAnimationFrame(render)
    }

    rafId = requestAnimationFrame(render)

    const wrapper = canvas.parentElement
    const onMouseMove = (e: MouseEvent) => {
      if (!wrapper) return
      const rect = wrapper.getBoundingClientRect()
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom

      if (inside) {
        targetX = (e.clientX - rect.left) / rect.width
        targetY = 1.0 - (e.clientY - rect.top) / rect.height // WebGL Y is 0 at bottom
        targetActive = 1
      } else {
        targetActive = 0
      }
    }

    window.addEventListener('mousemove', onMouseMove)

    let resizeTimer: NodeJS.Timeout
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(initGrid, 100)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      clearTimeout(resizeTimer)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="exp-ascii-overlay"
      data-active={active}
    />
  )
}
