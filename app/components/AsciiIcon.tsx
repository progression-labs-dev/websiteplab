'use client'

import { useEffect, useRef, useState } from 'react'

type IconType = 'expert' | 'builds' | 'transform' | 'audit' | 'surgery' | 'ideation'

interface ServiceIconProps {
  icon: IconType
  className?: string
}

export default function ServiceIcon({ icon, className }: ServiceIconProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`service-icon-animated ${isVisible ? 'is-visible' : ''} ${className || ''}`}>
      {renderIcon(icon)}
    </div>
  )
}

function renderIcon(icon: IconType) {
  switch (icon) {
    case 'expert':
      return (
        <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Neural network nodes */}
          <circle className="si-node" cx="24" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
          <circle className="si-node" cx="10" cy="32" r="3.5" stroke="currentColor" strokeWidth="1.8" />
          <circle className="si-node" cx="38" cy="32" r="3.5" stroke="currentColor" strokeWidth="1.8" />
          <circle className="si-node" cx="24" cy="40" r="3.5" stroke="currentColor" strokeWidth="1.8" />
          {/* Connection lines with flowing dash */}
          <line className="si-flow" x1="24" y1="12" x2="10" y2="28" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <line className="si-flow" x1="24" y1="12" x2="38" y2="28" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <line className="si-flow" x1="14" y1="32" x2="34" y2="32" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <line className="si-flow" x1="10" y1="36" x2="24" y2="40" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <line className="si-flow" x1="38" y1="36" x2="24" y2="40" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          {/* Center pulse dot */}
          <circle className="si-pulse" cx="24" cy="24" r="2" fill="currentColor" opacity="0.5" />
        </svg>
      )
    case 'builds':
      return (
        <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Rocket body */}
          <path d="M24 6L28 20H20L24 6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          {/* Fins */}
          <path d="M20 20L15 26L20 24" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M28 20L33 26L28 24" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          {/* Window */}
          <circle cx="24" cy="14" r="2" stroke="currentColor" strokeWidth="1" />
          {/* Exhaust flames */}
          <path className="si-flame si-flame-1" d="M22 24Q24 32 24 30Q24 32 26 24" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <path className="si-flame si-flame-2" d="M23 26Q24 36 24 34Q24 36 25 26" stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
          {/* Thrust particles */}
          <circle className="si-particle si-particle-1" cx="22" cy="32" r="1" fill="currentColor" opacity="0.2" />
          <circle className="si-particle si-particle-2" cx="26" cy="34" r="0.8" fill="currentColor" opacity="0.15" />
          <circle className="si-particle si-particle-3" cx="24" cy="38" r="1.2" fill="currentColor" opacity="0.1" />
        </svg>
      )
    case 'transform':
      return (
        <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Circular arrow path */}
          <path className="si-orbit" d="M24 8A16 16 0 0 1 40 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="4 3" />
          <path className="si-orbit" d="M40 24A16 16 0 0 1 24 40" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="4 3" />
          <path className="si-orbit" d="M24 40A16 16 0 0 1 8 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="4 3" />
          <path className="si-orbit" d="M8 24A16 16 0 0 1 24 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="4 3" />
          {/* Arrow heads */}
          <polygon points="40,24 36,21 36,27" fill="currentColor" opacity="0.5" />
          <polygon points="24,40 21,36 27,36" fill="currentColor" opacity="0.5" />
          <polygon points="8,24 12,27 12,21" fill="currentColor" opacity="0.5" />
          <polygon points="24,8 27,12 21,12" fill="currentColor" opacity="0.5" />
          {/* Center dot */}
          <circle className="si-pulse" cx="24" cy="24" r="2.5" fill="currentColor" opacity="0.3" />
        </svg>
      )
    case 'audit':
      return (
        <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Document */}
          <rect x="8" y="6" width="22" height="30" rx="2" stroke="currentColor" strokeWidth="1.8" />
          {/* Text lines */}
          <line x1="13" y1="14" x2="25" y2="14" stroke="currentColor" strokeWidth="1" opacity="0.25" />
          <line x1="13" y1="19" x2="25" y2="19" stroke="currentColor" strokeWidth="1" opacity="0.25" />
          <line x1="13" y1="24" x2="21" y2="24" stroke="currentColor" strokeWidth="1" opacity="0.25" />
          <line x1="13" y1="29" x2="25" y2="29" stroke="currentColor" strokeWidth="1" opacity="0.25" />
          {/* Magnifying glass */}
          <circle className="si-lens" cx="35" cy="30" r="8" stroke="currentColor" strokeWidth="1.8" />
          <line className="si-lens-handle" x1="40.5" y1="35.5" x2="45" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          {/* Check inside lens */}
          <path className="si-check" d="M31 30L34 33L39 27" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        </svg>
      )
    case 'surgery':
      return (
        <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Gear */}
          <circle className="si-gear" cx="18" cy="26" r="8" stroke="currentColor" strokeWidth="1.8" strokeDasharray="5 3" />
          <circle cx="18" cy="26" r="3" stroke="currentColor" strokeWidth="1" />
          {/* Wrench */}
          <path d="M30 10L34 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M34 14L28 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="28" cy="20" r="2" stroke="currentColor" strokeWidth="1.2" />
          {/* Connecting line to gear */}
          <line className="si-flow" x1="26" y1="22" x2="22" y2="26" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
          {/* Sparks */}
          <circle className="si-spark" cx="25" cy="16" r="1" fill="currentColor" opacity="0.4" />
          <circle className="si-spark" cx="22" cy="12" r="0.8" fill="currentColor" opacity="0.3" />
          <circle className="si-spark" cx="28" cy="13" r="0.6" fill="currentColor" opacity="0.35" />
        </svg>
      )
    case 'ideation':
      return (
        <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Lightbulb */}
          <path d="M24 8C19 8 15 12 15 17C15 21 17.5 24 20 26V30H28V26C30.5 24 33 21 33 17C33 12 29 8 24 8Z" stroke="currentColor" strokeWidth="1.8" />
          <line x1="20" y1="33" x2="28" y2="33" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="22" y1="36" x2="26" y2="36" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          {/* Inner filament */}
          <path d="M22 20Q24 16 26 20" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
          {/* Rays */}
          <line className="si-ray" x1="24" y1="1" x2="24" y2="4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <line className="si-ray" x1="37" y1="8" x2="35" y2="10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <line className="si-ray" x1="11" y1="8" x2="13" y2="10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <line className="si-ray" x1="40" y1="17" x2="37" y2="17" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <line className="si-ray" x1="8" y1="17" x2="11" y2="17" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          {/* Glow */}
          <circle className="si-glow" cx="24" cy="17" r="6" fill="currentColor" opacity="0.06" />
        </svg>
      )
  }
}
