'use client'

import ScrollDecode from './ScrollDecode'
import PanelCorners from './PanelCorners'

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

/**
 * ExperimentTeamSection — Infinite auto-scroll marquee of team member cards.
 * Duplicates the array for seamless looping via CSS translateX(-50%).
 * Pauses on hover. No navigation buttons or dots.
 */
export default function ExperimentTeamSection() {
  // Duplicate for seamless CSS loop
  const doubled = [...teamMembers, ...teamMembers]

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

      <div className="exp-team-single">
        <div className="exp-team-marquee-track">
          {doubled.map((member, i) => (
            <div className="exp-team-single-card" key={`${member.name}-${i}`}>
              <PanelCorners />
              <div className="exp-team-avatar">
                {member.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1)' }}
                  />
                ) : (
                  <span className="exp-team-initials">{getInitials(member.name)}</span>
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
    </div>
  )
}
