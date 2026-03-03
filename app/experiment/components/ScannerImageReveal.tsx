'use client'

import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import GlitchImage from './GlitchImage'
import type { GlitchImageHandle } from './GlitchImage'

interface ScannerImageRevealProps {
  src: string
  alt?: string
  className?: string
  style?: CSSProperties
}

export default function ScannerImageReveal({
  src,
  alt,
  className,
  style,
}: ScannerImageRevealProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const curtainRef = useRef<HTMLDivElement>(null)
  const glitchRef = useRef<GlitchImageHandle>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const curtain = curtainRef.current
    if (!wrapper || !curtain) return

    let ctx: { revert: () => void } | null = null

    const setup = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapper,
            start: 'top 80%',
            once: true,
          },
        })

        // Phase 1: Horizontal scan — line sweeps left to right
        tl.fromTo(
          curtain,
          { scaleX: 0, scaleY: 0.01 },
          { scaleX: 1, duration: 0.4, ease: 'expo.inOut' }
        )

        // Phase 2: Vertical drop — curtain expands full height
        tl.to(curtain, {
          scaleY: 1,
          duration: 0.5,
          ease: 'expo.inOut',
        }, '>')

        // Phase 3a: Curtain fades out
        tl.to(curtain, {
          opacity: 0,
          duration: 0.1,
        }, '>')

        // Phase 3b: Pixel reveal (runs simultaneously with 3a)
        tl.to(
          {},
          {
            duration: 1.2,
            ease: 'power2.out',
            onUpdate: function (this: gsap.core.Tween) {
              if (glitchRef.current) {
                glitchRef.current.progress = this.progress()
              }
            },
          },
          '<'
        )
      }, wrapper)
    }

    setup()

    return () => {
      ctx?.revert()
    }
  }, [])

  return (
    <div
      ref={wrapperRef}
      className={`scanner-reveal-wrapper ${className || ''}`}
      style={style}
      role="img"
      aria-label={alt}
    >
      {/* WebGL pixel-reveal image (bottom layer) */}
      <GlitchImage ref={glitchRef} src={src} />

      {/* CSS curtain overlay (top layer) */}
      <div ref={curtainRef} className="scanner-reveal-curtain" />
    </div>
  )
}
