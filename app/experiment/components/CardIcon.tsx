'use client'

import { useRef } from 'react'
import PanelCorners from './PanelCorners'
import GradientLottie from './GradientLottie'

/**
 * CardIcon — Lottie animated icons for method + service cards.
 * All icons get the Isidor-style white→navy gradient treatment.
 * Plays animation on hover; pauses at first frame when idle.
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
  const containerRef = useRef<HTMLDivElement>(null)
  const path = lottieMap[name]

  if (!path) return null

  return (
    <div className="exp-panel-icon" data-icon={name} ref={containerRef}>
      <PanelCorners />
      <GradientLottie src={path} size={90} />
    </div>
  )
}
