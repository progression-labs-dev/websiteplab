'use client'

import { useState, useCallback } from 'react'
import DepixelateAvatar from '../../experiment/components/DepixelateAvatar'
import { MEET_THE_TEAM } from '../data/careersContent'

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

// Northslope-style team carousel: one member at a time — avatar + italic quote
// + name + location + "Previously" pedigree, with arrows and dots. Real photos
// use the hover de-pixelate reveal; others fall back to an initials tile.
export default function TeamCarousel() {
  const { eyebrow, heading, members } = MEET_THE_TEAM
  const [i, setI] = useState(0)
  const count = members.length
  const go = useCallback((d: number) => setI((p) => (p + d + count) % count), [count])
  const m = members[i]

  return (
    <section className="careers-section careers-team" id="team" data-theme="light" data-tone="light">
      <div className="careers-inner">
        <p className="careers-eyebrow">{eyebrow}</p>
        <h2 className="careers-heading">{heading}</h2>

        <div className="careers-carousel">
          <button
            className="careers-carousel-arrow"
            onClick={() => go(-1)}
            aria-label="Previous team member"
          >
            &larr;
          </button>

          <div className="careers-carousel-card" key={m.name}>
            <div className="careers-carousel-avatar">
              {m.imageUrl ? (
                <DepixelateAvatar src={m.imageUrl} alt={m.name} cellSize={12} />
              ) : (
                <span className="careers-team-initials">{initials(m.name)}</span>
              )}
            </div>
            <div className="careers-carousel-body">
              <blockquote className="careers-carousel-quote">&ldquo;{m.quote}&rdquo;</blockquote>
              <div className="careers-carousel-meta">
                <span className="careers-carousel-name">{m.name}</span>
                <span className="careers-carousel-role">{m.role}</span>
                <span className="careers-carousel-line">
                  {m.location} &middot; Previously: {m.previously}
                </span>
              </div>
            </div>
          </div>

          <button
            className="careers-carousel-arrow"
            onClick={() => go(1)}
            aria-label="Next team member"
          >
            &rarr;
          </button>
        </div>

        <div className="careers-dots" role="tablist" aria-label="Team members">
          {members.map((mem, idx) => (
            <button
              key={mem.name}
              role="tab"
              aria-selected={idx === i}
              aria-label={mem.name}
              className={`careers-dot${idx === i ? ' is-active' : ''}`}
              onClick={() => setI(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
