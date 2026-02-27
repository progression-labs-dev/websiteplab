'use client'

import { useEffect, useRef } from 'react'

/**
 * ConvergenceSection — Replaced canvas animation with a video element.
 * Video plays when scrolled into view, pauses when leaving viewport.
 *
 * NOTE: /public/diagram.mp4 does not exist yet — provide this asset
 * to complete the visual. Until then, the video element will be empty.
 */

export default function ConvergenceSection() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let ctx: { revert: () => void } | null = null

    const setup = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: video,
          start: 'top 80%',
          end: 'bottom 20%',
          onEnter: () => video.play(),
          onLeave: () => video.pause(),
          onEnterBack: () => video.play(),
          onLeaveBack: () => video.pause(),
        })
      })
    }

    setup()

    return () => {
      ctx?.revert()
    }
  }, [])

  return (
    <div
      style={{
        maxWidth: 'var(--exp-container)',
        margin: '0 auto',
        padding: 'var(--exp-section-pad) 32px',
      }}
    >
      {/* TODO: Add /public/diagram.mp4 asset */}
      <video
        ref={videoRef}
        id="diagram-video"
        muted
        loop
        playsInline
        src="/diagram.mp4"
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          maxHeight: 400,
          objectFit: 'contain',
          borderRadius: 0,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(255, 255, 255, 0.02)',
        }}
      />
    </div>
  )
}
