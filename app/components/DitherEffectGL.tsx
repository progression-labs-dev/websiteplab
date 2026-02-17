'use client'

import { useEffect, useRef } from 'react'

export type AnimationMode = 'none' | 'random' | 'right-half' | 'mouse-follow'

export interface DitherEffectConfig {
  rectWidth: number
  rectHeight: number
  backgroundColor: string
  backgroundColorLeft: string
  backgroundColorRight: string
  blockSize: number
  blockColorStart: string
  blockColorEnd: string
  circleColorStart: string
  circleColorEnd: string
  circleProbability: number
  asciiProbability: number
  asciiColorStart: string
  asciiColorEnd: string
  brightnessThreshold: number
  invertThreshold: boolean
  grainIntensity: number
  mouseFollowSize: number
  rectangleCount: number
  rectangleInterval: number
  animationMode: AnimationMode
}

export const defaultDitherConfig: DitherEffectConfig = {
  rectWidth: 0.3,
  rectHeight: 0.3,
  backgroundColor: '#f5f5f5',
  backgroundColorLeft: '#000000',
  backgroundColorRight: '#000000',
  blockSize: 12,
  blockColorStart: '#0000ff',
  blockColorEnd: '#00ffff',
  circleColorStart: '#d4f1f9',
  circleColorEnd: '#ffffff',
  circleProbability: 0.36,
  asciiProbability: 0.8,
  asciiColorStart: '#d4f1f9',
  asciiColorEnd: '#ffffff',
  brightnessThreshold: 226,
  invertThreshold: false,
  grainIntensity: 0.3,
  mouseFollowSize: 150,
  rectangleCount: 3,
  rectangleInterval: 0.1,
  animationMode: 'random',
}

interface Rectangle {
  x: number
  y: number
  seed: number
}

const ASCII_CHARS = ['@', '#', '$', '%', '&', '*', '+', '=', '-', ':', '.', '/', '\\', '|', '!', '?', 'X', 'O', '0', '1']

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result) {
    return [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16),
    ]
  }
  return [0, 0, 0]
}

// Interpolate between two colors based on a value 0-255
function lerpColor(colorStart: string, colorEnd: string, brightness: number, threshold: number, invert: boolean = false): string {
  const startRgb = hexToRgb(colorStart)
  const endRgb = hexToRgb(colorEnd)

  // Normalize brightness to 0-1 range
  let t: number
  if (invert) {
    // When inverted: threshold maps to start color, 255 maps to end color
    t = Math.min(1, Math.max(0, (brightness - threshold) / (255 - threshold)))
  } else {
    // Normal: 0 maps to start color, threshold maps to end color
    t = Math.min(1, brightness / threshold)
  }

  const r = Math.round(startRgb[0] + (endRgb[0] - startRgb[0]) * t)
  const g = Math.round(startRgb[1] + (endRgb[1] - startRgb[1]) * t)
  const b = Math.round(startRgb[2] + (endRgb[2] - startRgb[2]) * t)

  return `rgb(${r}, ${g}, ${b})`
}

// Blend a color 50% with white
function blendWithWhite(colorRgbString: string): string {
  // Parse rgb(r, g, b) string
  const match = colorRgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!match) return colorRgbString

  const r = parseInt(match[1])
  const g = parseInt(match[2])
  const b = parseInt(match[3])

  // Blend 50% with white (255, 255, 255)
  const blendedR = Math.round(r + (255 - r) * 0.5)
  const blendedG = Math.round(g + (255 - g) * 0.5)
  const blendedB = Math.round(b + (255 - b) * 0.5)

  return `rgb(${blendedR}, ${blendedG}, ${blendedB})`
}

// Simplex-like noise for organic shape distortion
function organicNoise(x: number, y: number, seed: number): number {
  const n1 = Math.sin(x * 0.05 + seed) * Math.cos(y * 0.07 + seed * 1.3)
  const n2 = Math.sin((x + y) * 0.03 + seed * 0.7) * 0.5
  const n3 = Math.cos(x * 0.08 - y * 0.04 + seed * 2.1) * 0.3
  return (n1 + n2 + n3) / 1.8 // Normalize to roughly -1 to 1
}

// Seeded random for consistency
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

// Draw film grain effect on a block
const drawGrain = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  intensity: number,
  seed: number
) => {
  if (intensity <= 0) return

  // Fine 1px grain for film-like effect
  const grainDensity = 0.4 // Only draw grain on some pixels

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const grainSeed = seed + py * 137 + px * 251 + Math.floor(Date.now() / 50)
      const rand1 = seededRandom(grainSeed)

      // Skip some pixels for natural look
      if (rand1 > grainDensity) continue

      const rand2 = seededRandom(grainSeed + 1000)
      const rand3 = seededRandom(grainSeed + 2000)

      // Varying gray values (not just black/white)
      const brightness = Math.floor(rand2 * 255)
      // Subtle alpha based on intensity
      const alpha = rand3 * intensity * 0.3

      ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, ${alpha})`
      ctx.fillRect(x + px, y + py, 1, 1)
    }
  }
}

interface DitherEffectGLProps {
  src: string
  width: number
  height: number
  config: DitherEffectConfig
  className?: string
  isVideo?: boolean
}

export default function DitherEffectGL({
  src,
  width,
  height,
  config,
  className = '',
  isVideo = false
}: DitherEffectGLProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageCanvasRef = useRef<HTMLCanvasElement>(null)
  const blurredCanvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const imageElementRef = useRef<HTMLImageElement | null>(null)
  const animationRef = useRef<number>(0)
  const imageLoadedRef = useRef(false)
  const imageDataRef = useRef<ImageData | null>(null)
  const blurredImageDataRef = useRef<ImageData | null>(null)
  const rectanglesRef = useRef<Rectangle[]>([])
  const lastUpdateRef = useRef<number>(0)
  const mousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  // Create a random rectangle
  const createRectangle = (canvasWidth: number, canvasHeight: number, rectW: number, rectH: number): Rectangle => {
    const maxX = canvasWidth - rectW
    const maxY = canvasHeight - rectH
    return {
      x: Math.floor(Math.random() * Math.max(1, maxX)),
      y: Math.floor(Math.random() * Math.max(1, maxY)),
      seed: Math.floor(Math.random() * 10000)
    }
  }

  // Load image or video
  useEffect(() => {
    const imgCanvas = imageCanvasRef.current
    if (!imgCanvas) return

    const ctx = imgCanvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    imgCanvas.width = width
    imgCanvas.height = height

    if (isVideo) {
      // Clean up previous video
      if (videoRef.current) {
        videoRef.current.onerror = null // Remove error handler before cleanup
        videoRef.current.pause()
        videoRef.current.removeAttribute('src')
        videoRef.current.load() // Reset the video element
        videoRef.current = null
      }

      const video = document.createElement('video')
      video.crossOrigin = 'anonymous'
      video.loop = true
      video.muted = true
      video.playsInline = true
      video.autoplay = true
      videoRef.current = video

      video.oncanplay = () => {
        imageLoadedRef.current = true
        video.play().catch(err => {
          console.log('Video autoplay failed, trying again:', err)
          // Try playing on next frame
          setTimeout(() => video.play().catch(() => {}), 100)
        })
      }

      video.onerror = (e) => {
        // Only log if we have a valid src (not during cleanup)
        if (video.src && video.src !== '') {
          console.error('Video load error:', e)
        }
      }

      video.src = src
      video.load()
    } else {
      // Clean up video if switching to image
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.src = ''
        videoRef.current = null
      }

      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        // Store reference to the image element
        imageElementRef.current = img

        // Fill background with black so letterbox areas don't trigger blocks
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, width, height)

        // Center the image
        const scale = Math.min(width / img.width, height / img.height)
        const scaledWidth = img.width * scale
        const scaledHeight = img.height * scale
        const offsetX = (width - scaledWidth) / 2
        const offsetY = (height - scaledHeight) / 2

        ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight)
        imageDataRef.current = ctx.getImageData(0, 0, width, height)

        // Create blurred version for mouse-follow mode
        const blurredCanvas = blurredCanvasRef.current
        if (blurredCanvas) {
          const blurredCtx = blurredCanvas.getContext('2d', { willReadFrequently: true })
          if (blurredCtx) {
            blurredCtx.filter = 'blur(20px)'
            blurredCtx.drawImage(imgCanvas, 0, 0)
            blurredCtx.filter = 'none'
            blurredImageDataRef.current = blurredCtx.getImageData(0, 0, width, height)
          }
        }

        imageLoadedRef.current = true
      }
      img.src = src
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.onerror = null
        videoRef.current.pause()
      }
    }
  }, [src, width, height, config.backgroundColor, isVideo])

  // Initialize rectangles for random mode
  useEffect(() => {
    if (config.animationMode !== 'random') return

    const rectW = Math.floor(config.rectWidth * width)
    const rectH = Math.floor(config.rectHeight * height)

    const initialRects: Rectangle[] = []
    for (let i = 0; i < config.rectangleCount; i++) {
      initialRects.push(createRectangle(width, height, rectW, rectH))
    }
    rectanglesRef.current = initialRects
    lastUpdateRef.current = Date.now()
  }, [width, height, config.rectWidth, config.rectHeight, config.rectangleCount, config.animationMode])

  // Mouse tracking for mouse-follow mode
  useEffect(() => {
    if (config.animationMode !== 'mouse-follow') return

    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = width / rect.width
      const scaleY = height / rect.height
      mousePositionRef.current = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      }
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    return () => canvas.removeEventListener('mousemove', handleMouseMove)
  }, [config.animationMode, width, height])

  // Helper function to draw blocks in a rectangle area
  const drawBlocksInRect = (
    ctx: CanvasRenderingContext2D,
    rectX: number,
    rectY: number,
    rectW: number,
    rectH: number,
    seed: number,
    imageData: ImageData | null
  ) => {
    const blockSize = config.blockSize
    const cols = Math.ceil(rectW / blockSize)
    const rows = Math.ceil(rectH / blockSize)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const blockX = rectX + col * blockSize
        const blockY = rectY + row * blockSize

        // Don't draw outside the rectangle
        if (blockX + blockSize > rectX + rectW || blockY + blockSize > rectY + rectH) {
          continue
        }

        // Sample the pixel brightness at the center of this block
        const sampleX = Math.floor(blockX + blockSize / 2)
        const sampleY = Math.floor(blockY + blockSize / 2)

        let brightness = 0
        if (imageData && sampleX >= 0 && sampleX < width && sampleY >= 0 && sampleY < height) {
          const idx = (sampleY * width + sampleX) * 4
          const r = imageData.data[idx]
          const g = imageData.data[idx + 1]
          const b = imageData.data[idx + 2]
          brightness = Math.round(r * 0.299 + g * 0.587 + b * 0.114)
        }

        // Only draw block if brightness passes threshold check
        const shouldDraw = config.invertThreshold
          ? brightness >= config.brightnessThreshold
          : brightness < config.brightnessThreshold
        if (shouldDraw) {
          const blockSeed = seed + row * 173 + col * 311

          // Draw block with gradient color based on brightness
          const blockColor = lerpColor(config.blockColorStart, config.blockColorEnd, brightness, config.brightnessThreshold, config.invertThreshold)
          ctx.fillStyle = blockColor
          ctx.fillRect(blockX, blockY, blockSize, blockSize)

          // Draw grain effect on block
          drawGrain(ctx, blockX, blockY, blockSize, config.grainIntensity, blockSeed + 500)

          // Check if this block should have a circle
          const circleRand = seededRandom(blockSeed + 100)
          if (circleRand < config.circleProbability) {
            // Circle color is 50% between block color and white
            const circleColor = blendWithWhite(blockColor)
            ctx.fillStyle = circleColor
            ctx.beginPath()
            ctx.arc(
              blockX + blockSize / 2,
              blockY + blockSize / 2,
              blockSize / 2,
              0,
              Math.PI * 2
            )
            ctx.fill()
          }

          // Check if this block should have an ASCII character
          const asciiRand = seededRandom(blockSeed + 200)
          if (asciiRand < config.asciiProbability) {
            const charIdx = Math.floor(seededRandom(blockSeed + 300) * ASCII_CHARS.length)
            const char = ASCII_CHARS[charIdx]

            const asciiColor = lerpColor(config.asciiColorStart, config.asciiColorEnd, brightness, config.brightnessThreshold, config.invertThreshold)
            ctx.fillStyle = asciiColor
            ctx.font = `bold ${blockSize * 0.8}px monospace`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(char, blockX + blockSize / 2, blockY + blockSize / 2)
          }
        }
      }
    }
  }

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    const imgCanvas = imageCanvasRef.current
    const blurredCanvas = blurredCanvasRef.current
    if (!canvas || !imgCanvas || !blurredCanvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imgCtx = imgCanvas.getContext('2d', { willReadFrequently: true })
    const blurredCtx = blurredCanvas.getContext('2d', { willReadFrequently: true })

    // Helper to create blurred image data for mouse-follow smoothing
    const updateBlurredImageData = () => {
      if (!blurredCtx || !imgCtx) return

      blurredCtx.filter = 'blur(20px)'
      blurredCtx.drawImage(imgCanvas, 0, 0)
      blurredCtx.filter = 'none'
      blurredImageDataRef.current = blurredCtx.getImageData(0, 0, width, height)
    }

    const render = () => {
      // For video, always try to capture current frame if video is ready
      if (isVideo && videoRef.current && imgCtx) {
        const video = videoRef.current

        // Check if video is ready to play
        if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
          imageLoadedRef.current = true

          // Fill background with black so letterbox areas don't trigger blocks
          imgCtx.fillStyle = '#000000'
          imgCtx.fillRect(0, 0, width, height)

          // Center the video frame
          const scale = Math.min(width / video.videoWidth, height / video.videoHeight)
          const scaledWidth = video.videoWidth * scale
          const scaledHeight = video.videoHeight * scale
          const offsetX = (width - scaledWidth) / 2
          const offsetY = (height - scaledHeight) / 2

          imgCtx.drawImage(video, offsetX, offsetY, scaledWidth, scaledHeight)
          imageDataRef.current = imgCtx.getImageData(0, 0, width, height)

          // Update blurred version for mouse-follow mode
          if (config.animationMode === 'mouse-follow') {
            updateBlurredImageData()
          }
        }
      }

      if (!imageLoadedRef.current) {
        animationRef.current = requestAnimationFrame(render)
        return
      }

      const now = Date.now()
      const rectW = Math.floor(config.rectWidth * width)
      const rectH = Math.floor(config.rectHeight * height)
      const imageData = imageDataRef.current

      // Handle right-half mode with split background
      if (config.animationMode === 'right-half') {
        const halfX = Math.floor(width / 2)

        // Draw left background
        ctx.fillStyle = config.backgroundColorLeft
        ctx.fillRect(0, 0, halfX, height)

        // Draw right background
        ctx.fillStyle = config.backgroundColorRight
        ctx.fillRect(halfX, 0, width - halfX, height)

        // Draw the image/video on the left half
        ctx.save()
        ctx.beginPath()
        ctx.rect(0, 0, halfX, height)
        ctx.clip()

        // Get the source and draw centered
        let source: CanvasImageSource | null = null
        let srcWidth = 0
        let srcHeight = 0

        if (isVideo && videoRef.current && videoRef.current.readyState >= 2) {
          source = videoRef.current
          srcWidth = videoRef.current.videoWidth
          srcHeight = videoRef.current.videoHeight
        } else if (!isVideo && imageElementRef.current) {
          source = imageElementRef.current
          srcWidth = imageElementRef.current.width
          srcHeight = imageElementRef.current.height
        }

        if (source && srcWidth > 0 && srcHeight > 0) {
          const scale = Math.min(width / srcWidth, height / srcHeight)
          const scaledWidth = srcWidth * scale
          const scaledHeight = srcHeight * scale
          const offsetX = (width - scaledWidth) / 2
          const offsetY = (height - scaledHeight) / 2
          ctx.drawImage(source, offsetX, offsetY, scaledWidth, scaledHeight)
        }
        ctx.restore()

        // Draw blocks on the right half
        drawBlocksInRect(ctx, halfX, 0, width - halfX, height, 54321, imageData)
      } else {
        // Draw the base image for other modes
        ctx.drawImage(imgCanvas, 0, 0)
      }

      switch (config.animationMode) {
        case 'none': {
          // Single static rectangle in center
          const rectX = Math.floor((width - rectW) / 2)
          const rectY = Math.floor((height - rectH) / 2)
          drawBlocksInRect(ctx, rectX, rectY, rectW, rectH, 12345, imageData)
          break
        }

        case 'random': {
          // Check if it's time to update rectangles
          if (now - lastUpdateRef.current >= config.rectangleInterval * 1000) {
            lastUpdateRef.current = now

            // Remove oldest rectangle and add a new one
            if (rectanglesRef.current.length > 0) {
              rectanglesRef.current.shift()
            }
            rectanglesRef.current.push(createRectangle(width, height, rectW, rectH))

            // Ensure we have the right number of rectangles
            while (rectanglesRef.current.length < config.rectangleCount) {
              rectanglesRef.current.push(createRectangle(width, height, rectW, rectH))
            }
            while (rectanglesRef.current.length > config.rectangleCount) {
              rectanglesRef.current.shift()
            }
          }

          // Draw each rectangle
          for (const rect of rectanglesRef.current) {
            drawBlocksInRect(ctx, rect.x, rect.y, rectW, rectH, rect.seed, imageData)
          }
          break
        }

        case 'right-half': {
          // Already handled above
          break
        }

        case 'mouse-follow': {
          // Organic distorted shape follows mouse position
          const centerX = mousePositionRef.current.x
          const centerY = mousePositionRef.current.y
          const radius = config.mouseFollowSize
          const blockSize = config.blockSize

          // Calculate grid bounds around mouse
          const startCol = Math.max(0, Math.floor((centerX - radius * 1.5) / blockSize))
          const endCol = Math.min(Math.ceil(width / blockSize), Math.ceil((centerX + radius * 1.5) / blockSize))
          const startRow = Math.max(0, Math.floor((centerY - radius * 1.5) / blockSize))
          const endRow = Math.min(Math.ceil(height / blockSize), Math.ceil((centerY + radius * 1.5) / blockSize))

          for (let row = startRow; row < endRow; row++) {
            for (let col = startCol; col < endCol; col++) {
              const blockX = col * blockSize
              const blockY = row * blockSize
              const blockCenterX = blockX + blockSize / 2
              const blockCenterY = blockY + blockSize / 2

              // Calculate distance from mouse center
              const dx = blockCenterX - centerX
              const dy = blockCenterY - centerY
              const distance = Math.sqrt(dx * dx + dy * dy)

              // Add noise-based distortion to the radius
              const noise = organicNoise(blockCenterX, blockCenterY, 12345)
              const distortedRadius = radius * (0.6 + noise * 0.5)

              // Only draw if within the distorted shape
              if (distance < distortedRadius) {
                // Sample the pixel brightness from the BLURRED image data for smoother results
                const sampleX = Math.floor(blockCenterX)
                const sampleY = Math.floor(blockCenterY)

                let brightness = 0
                const blurredData = blurredImageDataRef.current
                if (blurredData && sampleX >= 0 && sampleX < width && sampleY >= 0 && sampleY < height) {
                  const idx = (sampleY * width + sampleX) * 4
                  const r = blurredData.data[idx]
                  const g = blurredData.data[idx + 1]
                  const b = blurredData.data[idx + 2]
                  brightness = Math.round(r * 0.299 + g * 0.587 + b * 0.114)
                }

                // Only draw block if brightness passes threshold check
                const shouldDraw = config.invertThreshold
                  ? brightness >= config.brightnessThreshold
                  : brightness < config.brightnessThreshold
                if (shouldDraw) {
                  const blockSeed = 99999 + row * 173 + col * 311

                  // Draw block with gradient color
                  const blockColor = lerpColor(config.blockColorStart, config.blockColorEnd, brightness, config.brightnessThreshold, config.invertThreshold)
                  ctx.fillStyle = blockColor
                  ctx.fillRect(blockX, blockY, blockSize, blockSize)

                  // Draw grain effect on block
                  drawGrain(ctx, blockX, blockY, blockSize, config.grainIntensity, blockSeed + 500)

                  // Check if this block should have a circle
                  const circleRand = seededRandom(blockSeed + 100)
                  if (circleRand < config.circleProbability) {
                    // Circle color is 50% between block color and white
                    const circleColor = blendWithWhite(blockColor)
                    ctx.fillStyle = circleColor
                    ctx.beginPath()
                    ctx.arc(blockCenterX, blockCenterY, blockSize / 2, 0, Math.PI * 2)
                    ctx.fill()
                  }

                  // Check if this block should have an ASCII character
                  const asciiRand = seededRandom(blockSeed + 200)
                  if (asciiRand < config.asciiProbability) {
                    const charIdx = Math.floor(seededRandom(blockSeed + 300) * ASCII_CHARS.length)
                    const char = ASCII_CHARS[charIdx]

                    const asciiColor = lerpColor(config.asciiColorStart, config.asciiColorEnd, brightness, config.brightnessThreshold, config.invertThreshold)
                    ctx.fillStyle = asciiColor
                    ctx.font = `bold ${blockSize * 0.8}px monospace`
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.fillText(char, blockCenterX, blockCenterY)
                  }
                }
              }
            }
          }
          break
        }
      }

      animationRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [width, height, config, isVideo])

  return (
    <div style={{ position: 'relative', width, height }}>
      <canvas
        ref={imageCanvasRef}
        width={width}
        height={height}
        style={{ display: 'none' }}
      />
      <canvas
        ref={blurredCanvasRef}
        width={width}
        height={height}
        style={{ display: 'none' }}
      />
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={className}
        style={{
          width,
          height,
          backgroundColor: config.backgroundColor,
        }}
      />
    </div>
  )
}
