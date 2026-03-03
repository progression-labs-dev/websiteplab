'use client'

import { useEffect, useRef, useCallback } from 'react'

interface MosaicOverlayProps {
  active: boolean
}

const CELL_SIZE = 8
const BASE_ALPHA = 0.03
const MOBILE_BASE_ALPHA = 0.05

export default function MosaicOverlay({ active }: MosaicOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const isMobileRef = useRef(false)
  const colsRef = useRef(0)
  const rowsRef = useRef(0)

  const buildGrid = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    isMobileRef.current = window.innerWidth <= 768
    const cols = Math.ceil(canvas.width / CELL_SIZE)
    const rows = Math.ceil(canvas.height / CELL_SIZE)

    colsRef.current = cols
    rowsRef.current = rows
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

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)

      if (!active) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        return
      }

      const cols = colsRef.current
      const rows = rowsRef.current
      if (cols === 0) return

      const isMobile = isMobileRef.current
      const baseAlpha = isMobile ? MOBILE_BASE_ALPHA : BASE_ALPHA

      // Render — base grid only (no mouse trail/glow)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = `rgba(255, 255, 255, ${baseAlpha})`
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1)
        }
      }
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', updateSize)
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
