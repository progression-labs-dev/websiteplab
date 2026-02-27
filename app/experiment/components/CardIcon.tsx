'use client'

import { useRef, useEffect, useState } from 'react'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'
import PanelCorners from './PanelCorners'
import GradientLottie from './GradientLottie'

/**
 * CardIcon — Lottie animated icons for method + service cards.
 * Plays animation on hover; pauses at first frame when idle.
 * Falls back to a navy glow placeholder if the JSON fails to load.
 */

const lottieMap: Record<string, string> = {
  discover: '/lottie/growth-chart.json',
  design: '/lottie/method-design.json',
  build: '/lottie/method-build.json',
  scale: '/lottie/method-scale.json',
  expert: '/lottie/service-expert.json',
  builds: '/lottie/service-builds.json',
  transform: '/lottie/service-transform.json',
  audit: '/lottie/service-audit.json',
  surgery: '/lottie/service-surgery.json',
  ideation: '/lottie/service-ideation.json',
}

export default function CardIcon({ name }: { name: string }) {
  const lottieRef = useRef<LottieRefCurrentProps>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [animData, setAnimData] = useState<object | null>(null)

  const path = lottieMap[name]

  // Fetch the Lottie JSON
  useEffect(() => {
    if (!path) return
    fetch(path)
      .then(r => r.json())
      .then(setAnimData)
      .catch(() => {}) // silently fail — placeholder shown
  }, [path])

  // Play on hover via parent .exp-panel
  useEffect(() => {
    const panel = containerRef.current?.closest('.exp-panel')
    if (!panel) return

    const handleEnter = () => lottieRef.current?.play()
    const handleLeave = () => {
      lottieRef.current?.goToAndStop(0, true)
    }

    panel.addEventListener('mouseenter', handleEnter)
    panel.addEventListener('mouseleave', handleLeave)
    return () => {
      panel.removeEventListener('mouseenter', handleEnter)
      panel.removeEventListener('mouseleave', handleLeave)
    }
  }, [animData])

  // Also play when scrolled into view (for non-hover devices)
  useEffect(() => {
    const el = containerRef.current
    if (!el || !animData) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          lottieRef.current?.play()
        } else {
          lottieRef.current?.goToAndStop(0, true)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [animData])

  const useGradient = name === 'discover'

  if (!path) return null

  return (
    <div className="exp-panel-icon" data-icon={name} ref={containerRef}>
      <PanelCorners />
      {useGradient ? (
        <GradientLottie src={path} size={80} />
      ) : animData ? (
        <Lottie
          lottieRef={lottieRef}
          animationData={animData}
          loop={true}
          autoplay={false}
          style={{ width: 80, height: 80 }}
        />
      ) : (
        /* Placeholder while loading / if fetch fails */
        <div style={{ width: 80, height: 80, opacity: 0.3 }} />
      )}
    </div>
  )
}
