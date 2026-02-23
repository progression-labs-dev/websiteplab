'use client'

import { useEffect, useRef } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import AutoScroll from 'embla-carousel-auto-scroll'

const teamMembers = [
  { name: 'Gabor Soter', role: 'CEO & Co-founder', gradient: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' },
  { name: 'Joe O\'Meara', role: 'CTO & Co-founder', gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)' },
  { name: 'Elena Vasquez', role: 'Senior AI Engineer', gradient: 'linear-gradient(135deg, #14b8a6, #10b981)' },
  { name: 'Marcus Chen', role: 'Head of Product', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
  { name: 'Sarah Okafor', role: 'ML Research Lead', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
  { name: 'David Kim', role: 'Senior Platform Engineer', gradient: 'linear-gradient(135deg, #0ea5e9, #3b82f6)' },
  { name: 'Anna Kowalski', role: 'AI Solutions Architect', gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
  { name: 'James Mwangi', role: 'Data Engineering Lead', gradient: 'linear-gradient(135deg, #14b8a6, #0ea5e9)' },
]

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

export default function TeamCarousel() {
  const [emblaRef] = useEmblaCarousel(
    { loop: true, dragFree: true, align: 'start', containScroll: false },
    [AutoScroll({ speed: 1.2, stopOnInteraction: false, stopOnMouseEnter: true, startDelay: 0 })]
  )

  return (
    <div className="team-carousel-wrapper">
      <div className="team-carousel" ref={emblaRef}>
        <div className="team-carousel-container">
          {teamMembers.map((member, i) => (
            <div className="team-card" key={i}>
              <div
                className="team-avatar"
                style={{ background: member.gradient }}
              >
                <span className="team-initials">{getInitials(member.name)}</span>
              </div>
              <div className="team-card-name">{member.name}</div>
              <div className="team-card-role">{member.role}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
