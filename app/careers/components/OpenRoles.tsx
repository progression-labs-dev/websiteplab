import CareersSection from './CareersSection'
import { OPEN_ROLES } from '../data/careersContent'

// Halfspace-style thin-divider role list. Square, hover-indented rows. CTAs are
// inert until the application flow (ATS vs form) is decided.
export default function OpenRoles() {
  const { eyebrow, heading, note, roles, viewAllLabel } = OPEN_ROLES
  return (
    <CareersSection id="open-roles" eyebrow={eyebrow} heading={heading} intro={note}>
      <div className="careers-roles">
        {roles.map((r) => (
          <div className="careers-role" key={r.title}>
            <h3 className="careers-role-title">{r.title}</h3>
            <div className="careers-role-meta">
              <span>{r.type}</span>
              <span aria-hidden="true">·</span>
              <span>{r.location}</span>
            </div>
            <p className="careers-role-blurb">{r.blurb}</p>
            <span className="careers-role-cta" aria-disabled="true">View role →</span>
          </div>
        ))}
      </div>
      <div className="careers-roles-footer">
        <span className="exp-btn-outline" aria-disabled="true">{viewAllLabel}</span>
      </div>
    </CareersSection>
  )
}
