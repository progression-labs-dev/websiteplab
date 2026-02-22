'use client'

import { useEffect, useRef, useState } from 'react'

interface AsciiVideoCanvasProps {
  isActive: boolean
  videoSrc: string
}

// Ocean color palette - blue to turquoise with butter/cream tones for bright areas
const OCEAN_COLORS = [
  { r: 0, g: 119, b: 182 },   // Ocean blue (dark areas)
  { r: 0, g: 150, b: 180 },   // Teal blue
  { r: 50, g: 180, b: 180 },  // Blue-green
  { r: 80, g: 200, b: 180 },  // Sea green
  { r: 120, g: 210, b: 170 }, // Light green
  { r: 180, g: 220, b: 150 }, // Yellow-green
  { r: 220, g: 230, b: 180 }, // Butter/cream
  { r: 245, g: 245, b: 220 }, // Light cream (bright areas)
]

// Simple symbols that look good at larger sizes
const SYMBOLS = ['+', '•', '○', '◦', '·']

export default function AsciiVideoCanvas({ isActive, videoSrc }: AsciiVideoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const animationRef = useRef<number>(0)
  const [videoEnded, setVideoEnded] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Larger block size for chunky pixel look
    const blockSize = 24

    // Offscreen canvas for sampling video
    const offscreen = document.createElement('canvas')
    const offCtx = offscreen.getContext('2d')
    if (!offCtx) return

    const updateSize = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)

    // Get ocean color based on brightness (0-1)
    const getOceanColor = (brightness: number): { r: number; g: number; b: number } => {
      // Map brightness to color index (bright = cream/butter, dark = blue)
      const t = brightness
      const index = Math.min(Math.floor(t * OCEAN_COLORS.length), OCEAN_COLORS.length - 1)
      const nextIndex = Math.min(index + 1, OCEAN_COLORS.length - 1)

      // Interpolate between two nearest colors
      const localT = (t * OCEAN_COLORS.length) - index
      const c1 = OCEAN_COLORS[index]
      const c2 = OCEAN_COLORS[nextIndex]

      return {
        r: Math.round(c1.r + (c2.r - c1.r) * localT),
        g: Math.round(c1.g + (c2.g - c1.g) * localT),
        b: Math.round(c1.b + (c2.b - c1.b) * localT),
      }
    }

    // Pseudo-random based on position (for consistent randomness)
    const getBlockRandom = (x: number, y: number, seed: number = 0): number => {
      const hash = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453
      return hash - Math.floor(hash)
    }

    // Handle video end
    const handleVideoEnd = () => {
      setVideoEnded(true)
    }
    video.addEventListener('ended', handleVideoEnd)

    const render = () => {
      if (!isActive) {
        animationRef.current = requestAnimationFrame(render)
        return
      }

      // Keep rendering the last frame when video ends
      if (video.paused && !videoEnded && video.currentTime === 0) {
        animationRef.current = requestAnimationFrame(render)
        return
      }

      // Clear canvas
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Calculate video dimensions to maintain aspect ratio
      const videoAspect = video.videoWidth / video.videoHeight || 1
      const canvasAspect = canvas.width / canvas.height

      let drawWidth, drawHeight, offsetX, offsetY

      if (videoAspect > canvasAspect) {
        drawHeight = canvas.height
        drawWidth = drawHeight * videoAspect
        offsetX = (canvas.width - drawWidth) / 2
        offsetY = 0
      } else {
        drawWidth = canvas.width
        drawHeight = drawWidth / videoAspect
        offsetX = 0
        offsetY = (canvas.height - drawHeight) / 2
      }

      // Sample video to offscreen canvas at lower resolution
      const sampleWidth = Math.ceil(drawWidth / blockSize)
      const sampleHeight = Math.ceil(drawHeight / blockSize)

      offscreen.width = sampleWidth
      offscreen.height = sampleHeight
      offCtx.drawImage(video, 0, 0, sampleWidth, sampleHeight)

      const imageData = offCtx.getImageData(0, 0, sampleWidth, sampleHeight)
      const data = imageData.data

      // Draw blocks
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      for (let y = 0; y < sampleHeight; y++) {
        for (let x = 0; x < sampleWidth; x++) {
          const idx = (y * sampleWidth + x) * 4
          const r = data[idx]
          const g = data[idx + 1]
          const b = data[idx + 2]
          const a = data[idx + 3]

          // Skip fully transparent pixels
          if (a < 10) continue

          // Calculate brightness
          const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255

          // Skip very dark pixels (background)
          if (brightness < 0.08) continue

          const screenX = offsetX + x * blockSize
          const screenY = offsetY + y * blockSize

          // Get ocean gradient color
          const color = getOceanColor(brightness)

          // Random values for this block
          const rand = getBlockRandom(x, y, 1)
          const rand2 = getBlockRandom(x, y, 2)
          const rand3 = getBlockRandom(x, y, 3)

          // Draw solid block background
          ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
          ctx.fillRect(screenX, screenY, blockSize - 1, blockSize - 1)

          // Symbol color - lighter version of block color
          const symbolColor = {
            r: Math.min(255, color.r + 60),
            g: Math.min(255, color.g + 60),
            b: Math.min(255, color.b + 60),
          }

          // Draw symbol inside block (30% chance)
          if (rand < 0.35) {
            ctx.fillStyle = `rgba(${symbolColor.r}, ${symbolColor.g}, ${symbolColor.b}, 0.8)`

            if (rand2 < 0.5) {
              // Draw plus sign
              ctx.font = `bold ${blockSize * 0.7}px sans-serif`
              ctx.fillText('+', screenX + blockSize / 2, screenY + blockSize / 2)
            } else if (rand2 < 0.75) {
              // Draw small dot
              ctx.beginPath()
              ctx.arc(screenX + blockSize / 2, screenY + blockSize / 2, blockSize / 6, 0, Math.PI * 2)
              ctx.fill()
            } else {
              // Draw circle outline
              ctx.strokeStyle = `rgba(${symbolColor.r}, ${symbolColor.g}, ${symbolColor.b}, 0.6)`
              ctx.lineWidth = 2
              ctx.beginPath()
              ctx.arc(screenX + blockSize / 2, screenY + blockSize / 2, blockSize / 4, 0, Math.PI * 2)
              ctx.stroke()
            }
          }
        }
      }

      animationRef.current = requestAnimationFrame(render)
    }

    // Start video and rendering when active
    if (isActive && !videoEnded) {
      video.play().catch(() => {
        // Autoplay might be blocked, that's ok
      })
    }
    render()

    return () => {
      window.removeEventListener('resize', updateSize)
      video.removeEventListener('ended', handleVideoEnd)
      cancelAnimationFrame(animationRef.current)
    }
  }, [isActive, videoSrc, videoEnded])

  return (
    <div className="video-carousel" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        playsInline
        style={{ display: 'none' }}
      />
      <canvas
        ref={canvasRef}
        className={isActive ? 'active' : ''}
        style={{
          width: '100%',
          height: '100%',
          opacity: isActive ? 1 : 0,
          transition: 'opacity 1s ease-in-out',
        }}
      />
    </div>
  )
}
