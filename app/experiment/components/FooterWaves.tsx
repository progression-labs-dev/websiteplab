'use client'

import { useEffect, useRef } from 'react'

export default function FooterWaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let dpr = window.devicePixelRatio || 1

    const updateSize = () => {
      dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    updateSize()
    window.addEventListener('resize', updateSize)

    // Wave parameters (Isidor createWaves config)
    const waveSpeedX = 0.04
    const waveAmpX = 20
    const lineWidth = 2
    const lineColor = '#AEA6B6'
    const waveCount = 5
    const phaseOffsets = Array.from({ length: waveCount }, (_, i) => i * 0.8)

    let time = 0

    const draw = () => {
      const w = canvas.width / dpr
      const h = canvas.height / dpr

      ctx.clearRect(0, 0, w, h)
      ctx.lineWidth = lineWidth
      ctx.strokeStyle = lineColor

      for (let wave = 0; wave < waveCount; wave++) {
        const baseY = h * 0.3 + wave * (h * 0.12)
        const phase = phaseOffsets[wave]

        ctx.beginPath()
        ctx.globalAlpha = 1 - wave * 0.15

        for (let x = 0; x <= w; x += 2) {
          const y =
            baseY + Math.sin(x * 0.01 + time * waveSpeedX + phase) * waveAmpX
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }

        ctx.stroke()
      }

      ctx.globalAlpha = 1
      time++
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', updateSize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="exp-footer-waves"
    />
  )
}
