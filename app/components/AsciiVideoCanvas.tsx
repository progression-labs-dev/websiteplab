'use client'

import { useEffect, useRef, useState } from 'react'

interface AsciiVideoCanvasProps {
  isActive: boolean
  videoSrc: string
}

// Ocean color palette - blue to turquoise (mapped to video brightness)
const OCEAN_COLORS = [
  { r: 0, g: 119, b: 190 },   // Ocean blue (darkest visible areas)
  { r: 0, g: 150, b: 199 },   // Medium blue
  { r: 0, g: 180, b: 216 },   // Bright blue
  { r: 72, g: 202, b: 228 },  // Cyan
  { r: 144, g: 224, b: 239 }, // Light cyan
  { r: 173, g: 232, b: 244 }, // Pale turquoise
  { r: 202, g: 240, b: 248 }, // Very light turquoise (brightest areas)
]

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

    // Block size for ASCII overlay
    const blockSize = 28

    // Brightness threshold - only show blocks above this
    const brightnessThreshold = 0.35

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
      // Normalize brightness above threshold to 0-1 range
      const normalizedBrightness = (brightness - brightnessThreshold) / (1 - brightnessThreshold)
      const t = Math.max(0, Math.min(1, normalizedBrightness))

      const index = Math.min(Math.floor(t * (OCEAN_COLORS.length - 1)), OCEAN_COLORS.length - 2)
      const nextIndex = index + 1

      // Interpolate between two nearest colors
      const localT = (t * (OCEAN_COLORS.length - 1)) - index
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

      // Clear canvas with black
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Calculate video dimensions to maintain aspect ratio (contain)
      const videoAspect = video.videoWidth / video.videoHeight || 1
      const canvasAspect = canvas.width / canvas.height

      let drawWidth, drawHeight, offsetX, offsetY

      if (videoAspect > canvasAspect) {
        // Video is wider - fit to width
        drawWidth = canvas.width
        drawHeight = drawWidth / videoAspect
        offsetX = 0
        offsetY = (canvas.height - drawHeight) / 2
      } else {
        // Video is taller - fit to height
        drawHeight = canvas.height
        drawWidth = drawHeight * videoAspect
        offsetX = (canvas.width - drawWidth) / 2
        offsetY = 0
      }

      // Draw the actual video frame first (grayscale)
      ctx.filter = 'grayscale(100%)'
      ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight)
      ctx.filter = 'none'

      // Sample video at block resolution for ASCII overlay
      const sampleWidth = Math.ceil(drawWidth / blockSize)
      const sampleHeight = Math.ceil(drawHeight / blockSize)

      offscreen.width = sampleWidth
      offscreen.height = sampleHeight
      offCtx.drawImage(video, 0, 0, sampleWidth, sampleHeight)

      const imageData = offCtx.getImageData(0, 0, sampleWidth, sampleHeight)
      const data = imageData.data

      // Draw ASCII block overlay
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

          // Only show blocks above threshold (skip dark background areas)
          if (brightness < brightnessThreshold) continue

          const screenX = offsetX + x * blockSize
          const screenY = offsetY + y * blockSize

          // Get ocean gradient color based on brightness
          const color = getOceanColor(brightness)

          // Random values for this block
          const rand = getBlockRandom(x, y, 1)
          const rand2 = getBlockRandom(x, y, 2)

          // Draw solid block background (fully opaque)
          ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
          ctx.fillRect(screenX, screenY, blockSize - 1, blockSize - 1)

          // Symbol color - lighter/whiter version
          const symbolColor = {
            r: Math.min(255, color.r + 80),
            g: Math.min(255, color.g + 80),
            b: Math.min(255, color.b + 80),
          }

          // Draw symbol inside block (35% chance)
          if (rand < 0.35) {
            ctx.fillStyle = `rgb(${symbolColor.r}, ${symbolColor.g}, ${symbolColor.b})`

            if (rand2 < 0.6) {
              // Draw plus sign
              ctx.font = `bold ${blockSize * 0.6}px sans-serif`
              ctx.fillText('+', screenX + blockSize / 2, screenY + blockSize / 2)
            } else {
              // Draw small dot
              ctx.beginPath()
              ctx.arc(screenX + blockSize / 2, screenY + blockSize / 2, blockSize / 8, 0, Math.PI * 2)
              ctx.fill()
            }
          }
        }
      }

      animationRef.current = requestAnimationFrame(render)
    }

    // Start video and rendering when active
    if (isActive && !videoEnded) {
      video.play().catch(() => {
        // Autoplay might be blocked
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
