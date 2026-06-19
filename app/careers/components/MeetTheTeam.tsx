/* eslint-disable @next/next/no-img-element */
import CareersSection from './CareersSection'
import { MEET_THE_TEAM } from '../data/careersContent'

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function MeetTheTeam() {
  const { eyebrow, heading, members } = MEET_THE_TEAM
  return (
    <CareersSection id="team" eyebrow={eyebrow} heading={heading}>
      <div className="careers-team-grid">
        {members.map((m) => (
          <div className="careers-team-card" key={m.name}>
            <div className="careers-team-avatar">
              {m.imageUrl ? (
                <img src={m.imageUrl} alt={m.name} loading="lazy" />
              ) : (
                <span className="careers-team-initials">{initials(m.name)}</span>
              )}
            </div>
            <div className="careers-team-meta">
              <h3 className="careers-team-name">{m.name}</h3>
              <p className="careers-team-role">{m.role}</p>
              <p className="careers-team-line">
                {m.location} · Previously: {m.previously}
              </p>
              <p className="careers-team-quote">“{m.quote}”</p>
            </div>
          </div>
        ))}
      </div>
    </CareersSection>
  )
}
