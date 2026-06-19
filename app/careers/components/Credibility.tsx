/* eslint-disable @next/next/no-img-element */
import CareersSection from './CareersSection'
import { CREDIBILITY } from '../data/careersContent'

export default function Credibility() {
  const { eyebrow, heading, previouslyAt, proof, badges } = CREDIBILITY
  return (
    <CareersSection id="credibility" eyebrow={eyebrow} heading={heading}>
      <p className="careers-strip-label">Team previously at</p>
      <div className="careers-logo-strip">
        {previouslyAt.map((logo) => (
          <div className="careers-logo-box" key={logo.name}>
            {logo.src ? (
              <img className="careers-logo" src={logo.src} alt={logo.name} loading="lazy" />
            ) : (
              <span className="careers-logo-text">{logo.name}</span>
            )}
          </div>
        ))}
      </div>

      <div className="careers-cred-footer">
        {/* Inert link placeholder until the Globo case study is wired up. */}
        <span className="careers-role-link" aria-disabled="true">
          {proof.label} →
        </span>
        <div className="careers-badges">
          {badges.map((b) => (
            <span className="careers-badge" key={b}>
              {b}
            </span>
          ))}
        </div>
      </div>
    </CareersSection>
  )
}
