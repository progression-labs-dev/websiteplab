'use client'

import { useState } from 'react'
import CareersSection from './CareersSection'
import InView from './InView'
import { MEET_THE_TEAM } from '../data/careersContent'

function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
}

// Square initial tiles on near-black (no photos). Clicking a member animates the
// testimonial panel to their quote (the Halfspace click-to-cycle touch).
export default function MeetTheTeam() {
  const { eyebrow, heading, members } = MEET_THE_TEAM
  const [active, setActive] = useState(0)
  const [nonce, setNonce] = useState(0)
  const m = members[active]

  const pick = (i: number) => {
    setActive(i)
    setNonce((n) => n + 1)
  }

  return (
    <CareersSection id="team" eyebrow={eyebrow} context="Select a name to hear from them." heading={heading}>
      <div className="careers-team">
        <InView className="careers-team-grid cz-stagger" role="tablist" aria-label="Team members">
          {members.map((mem, i) => (
            <button
              key={mem.name}
              role="tab"
              aria-selected={i === active}
              className={`careers-member${i === active ? ' is-active' : ''}`}
              onClick={() => pick(i)}
              onMouseEnter={() => pick(i)}
            >
              <span className="careers-member-initials" aria-hidden="true">{initials(mem.name)}</span>
              <span>
                <span className="careers-member-name">{mem.name}</span>
                <span className="careers-member-role">{mem.role}</span>
              </span>
            </button>
          ))}
        </InView>

        <div className="careers-testimonial">
          <blockquote className="careers-testimonial-quote is-anim" key={nonce}>
            “{m.quote}”
          </blockquote>
          <div>
            <div className="careers-testimonial-name">{m.name}</div>
            <div className="careers-testimonial-role">{m.role}</div>
            <div className="careers-testimonial-line">{m.location} · Previously: {m.previously}</div>
          </div>
          <p className="careers-testimonial-hint">Select a name to hear from them</p>
        </div>
      </div>
    </CareersSection>
  )
}
