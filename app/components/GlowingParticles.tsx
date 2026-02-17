'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  hue: number
  pulse: number
  pulseSpeed: number
}

interface GlowingParticlesProps {
  count?: number
  className?: string
}

export default function GlowingParticles({ count = 30, className = '' }: GlowingParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const parent = canvas.parentElement
    if (!parent) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const rect = parent.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = []
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: -Math.random() * 0.4 - 0.1,
          opacity: Math.random() * 0.6 + 0.3,
          hue: Math.random() > 0.5 ? 180 + Math.random() * 40 : 270 + Math.random() * 30,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.02 + 0.01,
        })
      }
    }

    initParticles()

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Add slight horizontal drift
        particle.x += Math.sin(particle.pulse) * 0.2

        // Update pulse
        particle.pulse += particle.pulseSpeed

        // Calculate current opacity with pulsing
        const currentOpacity = particle.opacity * (0.5 + 0.5 * Math.sin(particle.pulse))

        // Wrap around edges
        if (particle.y < -10) {
          particle.y = canvas.height + 10
          particle.x = Math.random() * canvas.width
        }
        if (particle.x < -10) particle.x = canvas.width + 10
        if (particle.x > canvas.width + 10) particle.x = -10

        // Draw glow
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        )

        gradient.addColorStop(0, `rgba(255, 255, 255, ${currentOpacity})`)
        gradient.addColorStop(0.3, `rgba(255, 255, 255, ${currentOpacity * 0.6})`)
        gradient.addColorStop(0.6, `rgba(255, 255, 255, ${currentOpacity * 0.2})`)
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`)

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Draw bright core
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [count])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  )
}
