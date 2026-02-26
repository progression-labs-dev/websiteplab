'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import ScrollDecode from './ScrollDecode'
import PanelCorners from './PanelCorners'
import ScannerImageReveal from './ScannerImageReveal'

const teamMembers = [
  { name: 'Gabor Soter', role: 'Founder & CEO', imageUrl: '/team/gabor-soter.jpg' },
  { name: 'Sam Bourton', role: 'Head of Product', imageUrl: null },
  { name: 'Endre Sagi', role: 'Head of Finance', imageUrl: null },
  { name: 'Jon Duffy', role: 'Head of Engineering', imageUrl: null },
  { name: 'Joe O\'Meara', role: 'Associate', imageUrl: '/team/joe-omeara.jpg' },
  { name: 'Conrad Guest', role: 'Senior Engineer', imageUrl: null },
  { name: 'Chris Little', role: 'Senior Engineer', imageUrl: null },
  { name: 'Talha Muhammad', role: 'Senior Engineer', imageUrl: null },
]

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

export default function ExperimentTeamSection() {
  const [current, setCurrent] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const total = teamMembers.length

  const goTo = useCallback((index: number) => {
    const next = ((index % total) + total) % total
    setCurrent(next)
  }, [total])

  const goNext = useCallback(() => goTo(current + 1), [current, goTo])
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo])

  // Auto-advance every 4 seconds, pause on hover
  useEffect(() => {
    if (isHovered) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % total)
    }, 4000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isHovered, total])

  // GSAP crossfade on card change
  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    let ctx: { revert: () => void } | null = null

    const animate = async () => {
      const { default: gsap } = await import('gsap')

      ctx = gsap.context(() => {
        gsap.fromTo(
          card,
          { opacity: 0, x: 40 },
          { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }
        )
      })
    }

    animate()

    return () => {
      ctx?.revert()
    }
  }, [current])

  const member = teamMembers[current]

  return (
    <div className="exp-team-section">
      <div className="exp-team-header">
        <div className="exp-tag">Team</div>
        <ScrollDecode
          text="Who We Are"
          trigger="inView"
          tag="h2"
          className="exp-section-heading"
          duration={800}
        />
      </div>

      {/* Isidor-style meta bar: label left, counter right */}
      <div className="exp-team-meta">
        <span>Progression Labs</span>
        <span>{current + 1} of {total}</span>
      </div>

      <div
        className="exp-team-single"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="exp-team-single-card" ref={cardRef} key={current}>
          <PanelCorners />
          <div className="exp-team-avatar">
            {member.imageUrl ? (
              <ScannerImageReveal
                src={member.imageUrl}
                alt={member.name}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <span className="exp-team-initials">{getInitials(member.name)}</span>
            )}
          </div>
          <div className="exp-team-info">
            <div className="exp-team-id">{String(current + 1).padStart(2, '0')}</div>
            <div className="exp-team-name">{member.name}</div>
            <div className="exp-team-role">{member.role}</div>
          </div>
        </div>
      </div>

      <div className="exp-team-carousel-nav">
        <button className="exp-team-carousel-btn" onClick={goPrev} aria-label="Previous team member">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <div className="exp-team-carousel-dots">
          {teamMembers.map((_, i) => (
            <button
              key={i}
              className={`exp-team-carousel-dot${i === current ? ' active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to ${teamMembers[i].name}`}
            />
          ))}
        </div>

        <button className="exp-team-carousel-btn" onClick={goNext} aria-label="Next team member">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  )
}
