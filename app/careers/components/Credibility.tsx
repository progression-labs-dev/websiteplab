/* eslint-disable @next/next/no-img-element */
import CareersSection from './CareersSection'
import { CREDIBILITY } from '../data/careersContent'

export default function Credibility() {
  const { eyebrow, heading, previouslyAt, proof, badges } = CREDIBILITY
  return (
    <CareersSection id="credibility" panel eyebrow={eyebrow} context="The bar we hold ourselves to." heading={heading}>
      <p className="careers-strip-label">Team previously at</p>
      <div className="careers-logo-strip">
        {previouslyAt.map((logo) => (
          logo.src ? (
            <img className="careers-logo" src={logo.src} alt={logo.name} loading="lazy" key={logo.name} />
          ) : (
            <span className="careers-logo-text" key={logo.name}>{logo.name}</span>
          )
        ))}
      </div>
      <div className="careers-cred-footer">
        <span className="careers-cred-link" aria-disabled="true">{proof.label} →</span>
        <div className="careers-badges">
          {badges.map((b) => (
            <span className="careers-badge" key={b}>{b}</span>
          ))}
        </div>
      </div>
    </CareersSection>
  )
}
