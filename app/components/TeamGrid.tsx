'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const teamMembers = [
  { name: 'Gabor Soter', role: 'Founder & CEO', gradient: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', imageUrl: '/team/gabor-soter.jpg' },
  { name: 'Sam Bourton', role: 'Head of Product', gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)', imageUrl: '/team/sam-bourton.jpg' },
  { name: 'Endre Sagi', role: 'Head of Finance', gradient: 'linear-gradient(135deg, #14b8a6, #10b981)', imageUrl: '/team/endre-sagi.jpg' },
  { name: 'Jon Duffy', role: 'Head of Engineering', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', imageUrl: '/team/jon-duffy.jpg' },
  { name: 'Joe O\'Meara', role: 'Associate', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', imageUrl: '/team/joe-omeara.jpg' },
  { name: 'Conrad Guest', role: 'Senior Engineer', gradient: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', imageUrl: '/team/conrad-guest.jpg' },
  { name: 'Chris Little', role: 'Senior Engineer', gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)', imageUrl: '/team/chris-little.jpg' },
  { name: 'Talha Muhammad', role: 'Senior Engineer', gradient: 'linear-gradient(135deg, #14b8a6, #0ea5e9)', imageUrl: '/team/talha-muhammad.jpg' },
]

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const COLS = 8
const ROWS = 10

function hashNoise(col: number, row: number, cardIndex: number): number {
  let h = (cardIndex * 7919 + col * 131 + row * 524287) | 0
  h = ((h >> 16) ^ h) * 0x45d9f3b
  h = ((h >> 16) ^ h) * 0x45d9f3b
  h = (h >> 16) ^ h
  return (h & 0x7fffffff) / 0x7fffffff
}

function buildSortedBlocks(cardIndex: number): { col: number; row: number; threshold: number }[] {
  const blocks: { col: number; row: number; threshold: number }[] = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const noise = hashNoise(c, r, cardIndex)
      const wipe = c / (COLS - 1)
      const threshold = noise * 0.4 + wipe * 0.6
      blocks.push({ col: c, row: r, threshold })
    }
  }
  blocks.sort((a, b) => a.threshold - b.threshold)
  return blocks
}

function PixelOverlay({ cardIndex }: { cardIndex: number }) {
  const sortedBlocks = buildSortedBlocks(cardIndex)

  return (
    <div className="team-card-pixel-overlay">
      {sortedBlocks.map((block, i) => (
        <div
          key={i}
          className="pixel-block"
          style={{
            left: `${(block.col / COLS) * 100}%`,
            top: `${(block.row / ROWS) * 100}%`,
            width: `${100 / COLS}%`,
            height: `${100 / ROWS}%`,
          }}
        />
      ))}
      <div className="team-card-scan-edge" />
    </div>
  )
}

export default function TeamGrid() {
  const [offset, setOffset] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  // How many cards to scroll per click
  const SCROLL_COUNT = 1
  const maxOffset = teamMembers.length - 1

  const goNext = useCallback(() => {
    setOffset(prev => Math.min(prev + SCROLL_COUNT, maxOffset))
  }, [maxOffset])

  const goPrev = useCallback(() => {
    setOffset(prev => Math.max(prev - SCROLL_COUNT, 0))
  }, [])

  // GSAP entrance animation — runs once when section scrolls into view
  useEffect(() => {
    const track = trackRef.current
    if (!track || hasAnimated.current) return

    const runAnimation = async () => {
      const { default: gsap } = await import('gsap')

      const cards = track.querySelectorAll('.team-card')
      cards.forEach((card, i) => {
        const blocks = card.querySelectorAll('.pixel-block')
        const scanEdge = card.querySelector('.team-card-scan-edge') as HTMLElement

        const tl = gsap.timeline({ delay: i * 0.15 })

        // 1. Fade card in
        tl.fromTo(card,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
          0
        )

        // 2. L-shaped scan bar
        if (scanEdge) {
          tl.set(scanEdge, { top: 0, left: '0%', right: 'auto', width: 3, height: 3, opacity: 1 }, 0.2)
          tl.to(scanEdge, { left: '100%', duration: 0.5, ease: 'power3.inOut' }, 0.2)
          tl.set(scanEdge, { left: 'auto', right: 0, top: '0%', width: 3, height: 0 }, 0.7)
          tl.to(scanEdge, { height: '100%', duration: 0.5, ease: 'power3.inOut' }, 0.7)
          tl.to(scanEdge, { opacity: 0, duration: 0.15 }, 1.15)
        }

        // 3. Pixel dissolve
        tl.to(blocks, {
          opacity: 0,
          duration: 0.015,
          stagger: 1.0 / blocks.length,
          ease: 'none'
        }, 1.0)
      })

      hasAnimated.current = true
    }

    runAnimation()
  }, [])

  return (
    <div className="team-carousel-wrapper">
      <div className="team-carousel-viewport">
        <div
          className="team-carousel-track"
          ref={trackRef}
          style={{
            transform: `translateX(calc(-${offset} * (var(--team-card-width) + var(--team-card-gap))))`,
          }}
        >
          {teamMembers.map((member, i) => (
            <div className="team-card blueprint-box" key={i} style={{ opacity: 0 }}>
              <div
                className="team-avatar"
                style={{ background: member.gradient }}
              >
                {member.imageUrl ? (
                  <img src={member.imageUrl} alt={member.name} className="team-card-image" />
                ) : (
                  <span className="team-initials">{getInitials(member.name)}</span>
                )}
              </div>
              <div className="team-card-name">{member.name}</div>
              <div className="team-card-role">{member.role}</div>
              <PixelOverlay cardIndex={i} />
            </div>
          ))}
        </div>
      </div>

      <div className="team-carousel-nav">
        <button
          className="team-carousel-btn"
          onClick={goPrev}
          aria-label="Previous team member"
          disabled={offset === 0}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <div className="team-carousel-counter">
          {offset + 1} / {teamMembers.length}
        </div>

        <button
          className="team-carousel-btn"
          onClick={goNext}
          aria-label="Next team member"
          disabled={offset >= maxOffset}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  )
}
