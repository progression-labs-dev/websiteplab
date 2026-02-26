'use client'

import { useEffect, useRef, useCallback } from 'react'

interface MosaicOverlayProps {
  active: boolean
}

const CELL_SIZE = 8
const INFLUENCE_RADIUS = 80
const DECAY_RATE = 0.96
const BASE_ALPHA = 0.03
const MOBILE_BASE_ALPHA = 0.05
const TRAIL_OPACITY = 0.3

export default function MosaicOverlay({ active }: MosaicOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const isMobileRef = useRef(false)

  // Per-pixel alpha values stored in a flat Float32Array
  // Index = row * cols + col
  const alphaRef = useRef<Float32Array | null>(null)
  const colsRef = useRef(0)
  const rowsRef = useRef(0)

  // Active pixel indices for efficient iteration
  const activeSetRef = useRef(new Set<number>())

  const buildGrid = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    isMobileRef.current = window.innerWidth <= 768
    const cols = Math.ceil(canvas.width / CELL_SIZE)
    const rows = Math.ceil(canvas.height / CELL_SIZE)

    colsRef.current = cols
    rowsRef.current = rows
    alphaRef.current = new Float32Array(cols * rows)
    activeSetRef.current.clear()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const updateSize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      buildGrid()
    }
    updateSize()
    window.addEventListener('resize', updateSize)

    const handleMouseMove = (e: MouseEvent) => {
      if (isMobileRef.current) return
      // Convert to canvas-relative coordinates
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
    }

    window.addEventListener('mousemove', handleMouseMove)

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)

      if (!active) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        return
      }

      const cols = colsRef.current
      const rows = rowsRef.current
      const alpha = alphaRef.current
      if (!alpha || cols === 0) return

      const mouse = mouseRef.current
      const activeSet = activeSetRef.current
      const isMobile = isMobileRef.current
      const baseAlpha = isMobile ? MOBILE_BASE_ALPHA : BASE_ALPHA

      // Apply mouse influence — set pixels near cursor to 1.0
      if (!isMobile) {
        const mx = mouse.x
        const my = mouse.y
        const cellRadius = Math.ceil(INFLUENCE_RADIUS / CELL_SIZE)
        const centerCol = Math.floor(mx / CELL_SIZE)
        const centerRow = Math.floor(my / CELL_SIZE)

        for (let dr = -cellRadius; dr <= cellRadius; dr++) {
          const r = centerRow + dr
          if (r < 0 || r >= rows) continue
          for (let dc = -cellRadius; dc <= cellRadius; dc++) {
            const c = centerCol + dc
            if (c < 0 || c >= cols) continue

            const px = c * CELL_SIZE + CELL_SIZE / 2
            const py = r * CELL_SIZE + CELL_SIZE / 2
            const dist = Math.sqrt((px - mx) ** 2 + (py - my) ** 2)

            if (dist < INFLUENCE_RADIUS) {
              const idx = r * cols + c
              const proximity = 1 - dist / INFLUENCE_RADIUS
              const newAlpha = proximity
              if (newAlpha > alpha[idx]) {
                alpha[idx] = newAlpha
                activeSet.add(idx)
              }
            }
          }
        }
      }

      // Decay active pixels
      const toRemove: number[] = []
      activeSet.forEach((idx) => {
        alpha[idx] *= DECAY_RATE
        if (alpha[idx] < 0.01) {
          alpha[idx] = 0
          toRemove.push(idx)
        }
      })
      for (let i = 0; i < toRemove.length; i++) {
        activeSet.delete(toRemove[i])
      }

      // Render
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw base grid at very low alpha (visible texture)
      ctx.fillStyle = `rgba(255, 255, 255, ${baseAlpha})`
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1)
        }
      }

      // Draw active trail pixels with enhanced alpha
      activeSet.forEach((idx) => {
        const c = idx % cols
        const r = (idx - c) / cols
        const a = alpha[idx] * TRAIL_OPACITY
        if (a < 0.005) return
        ctx.fillStyle = `rgba(255, 255, 255, ${a.toFixed(3)})`
        ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1)
      })
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', updateSize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [active, buildGrid])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 3,
      }}
    />
  )
}
