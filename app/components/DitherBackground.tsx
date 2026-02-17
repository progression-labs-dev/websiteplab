'use client'

import { useEffect, useRef } from 'react'

interface DitherBackgroundProps {
  width: number
  height: number
  blockSize?: number
  blockColorStart?: string
  blockColorEnd?: string
  circleProbability?: number
  asciiProbability?: number
}

const ASCII_CHARS = ['@', '#', '$', '%', '&', '*', '+', '=', '-', ':', '.', '/', '\\', '|', '!', '?', 'X', 'O', '0', '1']

export default function DitherBackground({
  width,
  height,
  blockSize = 12,
  blockColorStart = '#0000ff',
  blockColorEnd = '#00ffff',
  circleProbability = 0.36,
  asciiProbability = 0.8,
}: DitherBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (width <= 0 || height <= 0) return

    canvas.width = width
    canvas.height = height

    const getBlockRandom = (x: number, y: number, seed: number = 0): number => {
      const hash = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453
      return hash - Math.floor(hash)
    }

    const parseHex = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0]
    }

    const lerpColor = (start: string, end: string, t: number): string => {
      const startRgb = parseHex(start)
      const endRgb = parseHex(end)
      const r = Math.round(startRgb[0] + (endRgb[0] - startRgb[0]) * t)
      const g = Math.round(startRgb[1] + (endRgb[1] - startRgb[1]) * t)
      const b = Math.round(startRgb[2] + (endRgb[2] - startRgb[2]) * t)
      return `rgb(${r}, ${g}, ${b})`
    }

    const blendWithWhite = (r: number, g: number, b: number): string => {
      const newR = Math.round((r + 255) / 2)
      const newG = Math.round((g + 255) / 2)
      const newB = Math.round((b + 255) / 2)
      return `rgb(${newR}, ${newG}, ${newB})`
    }

    // Clear canvas with black
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, width, height)

    // Draw dithered blocks
    for (let y = 0; y < height; y += blockSize) {
      for (let x = 0; x < width; x += blockSize) {
        const normalizedX = x / width
        const normalizedY = y / height
        const baseT = (normalizedX + (1 - normalizedY)) / 2
        const randomOffset = (getBlockRandom(x, y, 4) - 0.5) * 0.6
        const t = Math.max(0, Math.min(1, baseT + randomOffset))

        const blockColor = lerpColor(blockColorStart, blockColorEnd, t)
        ctx.fillStyle = blockColor
        ctx.fillRect(x, y, blockSize, blockSize)

        const rand1 = getBlockRandom(x, y, 1)
        const rand2 = getBlockRandom(x, y, 2)
        const rand3 = getBlockRandom(x, y, 3)

        const rgbMatch = blockColor.match(/\d+/g)
        const circleColor = rgbMatch ? blendWithWhite(
          parseInt(rgbMatch[0]),
          parseInt(rgbMatch[1]),
          parseInt(rgbMatch[2])
        ) : '#ffffff'

        if (rand1 < circleProbability) {
          ctx.fillStyle = circleColor
          ctx.beginPath()
          ctx.arc(x + blockSize / 2, y + blockSize / 2, blockSize / 2 - 1, 0, Math.PI * 2)
          ctx.fill()
        } else if (rand2 < asciiProbability) {
          const charIndex = Math.floor(rand3 * ASCII_CHARS.length)
          const char = ASCII_CHARS[charIndex]
          ctx.fillStyle = circleColor
          ctx.font = `${blockSize * 0.9}px monospace`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(char, x + blockSize / 2, y + blockSize / 2)
        }
      }
    }
  }, [width, height, blockSize, blockColorStart, blockColorEnd, circleProbability, asciiProbability])

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        backgroundColor: '#000000',
      }}
    />
  )
}
