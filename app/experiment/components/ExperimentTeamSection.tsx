'use client'

import { useRef, useCallback } from 'react'
import ScrollDecode from './ScrollDecode'
import PanelCorners from './PanelCorners'
import DepixelateAvatar from './DepixelateAvatar'

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

const SHUFFLE_CHARS = '01'
const SHUFFLE_INTERVAL = 60
const SHUFFLE_TIMEOUT = 500

/**
 * InitialsAvatar — Shows initials with a binary scramble on hover
 * (reuses ShuffleHover pattern inline to keep it self-contained).
 */
function InitialsAvatar({ name }: { name: string }) {
  const initials = getInitials(name)
  const elRef = useRef<HTMLSpanElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null }
  }, [])

  const handleMouseEnter = useCallback(() => {
    const el = elRef.current
    if (!el) return
    clearTimers()
    intervalRef.current = setInterval(() => {
      el.textContent = initials
        .split('')
        .map(() => SHUFFLE_CHARS[Math.floor(Math.random() * 2)])
        .join('')
    }, SHUFFLE_INTERVAL)
    timeoutRef.current = setTimeout(() => {
      clearTimers()
      if (el) el.textContent = initials
    }, SHUFFLE_TIMEOUT)
  }, [initials, clearTimers])

  const handleMouseLeave = useCallback(() => {
    clearTimers()
    if (elRef.current) elRef.current.textContent = initials
  }, [initials, clearTimers])

  return (
    <span
      ref={elRef}
      className="exp-team-initials"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {initials}
    </span>
  )
}

/**
 * MarqueeRow — A single row of team cards that scrolls infinitely.
 * direction="left" (default) or "right" for counter-scrolling.
 */
function MarqueeRow({ direction = 'left', speed = '25s' }: { direction?: 'left' | 'right'; speed?: string }) {
  const doubled = [...teamMembers, ...teamMembers]
  const trackClass = direction === 'right'
    ? 'exp-team-marquee-track exp-team-marquee-reverse'
    : 'exp-team-marquee-track'

  return (
    <div className="exp-team-single">
      <div className={trackClass} style={{ animationDuration: speed }}>
        {doubled.map((member, i) => (
          <div className="exp-team-single-card" key={`${member.name}-${direction}-${i}`}>
            <PanelCorners />
            <div className="exp-team-avatar">
              {member.imageUrl ? (
                <DepixelateAvatar src={member.imageUrl} alt={member.name} />
              ) : (
                <InitialsAvatar name={member.name} />
              )}
            </div>
            <div className="exp-team-info">
              <div className="exp-team-id">{String((i % teamMembers.length) + 1).padStart(2, '0')}</div>
              <div className="exp-team-name">{member.name}</div>
              <div className="exp-team-role">{member.role}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * ExperimentTeamSection — Single-row scrolling marquee of team cards.
 * Photos are pixelated by default; hover triggers a cell-by-cell de-pixelation reveal.
 */
export default function ExperimentTeamSection() {
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

      <div className="exp-team-rows">
        <MarqueeRow direction="left" speed="30s" />
      </div>
    </div>
  )
}
