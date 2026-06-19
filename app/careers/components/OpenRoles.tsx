import CareersSection from './CareersSection'
import { OPEN_ROLES } from '../data/careersContent'

export default function OpenRoles() {
  const { eyebrow, heading, note, roles, viewAllLabel } = OPEN_ROLES
  return (
    <CareersSection id="open-roles" eyebrow={eyebrow} heading={heading} intro={note}>
      <div className="careers-roles">
        {roles.map((r) => (
          <div className="careers-role-card" key={r.title}>
            <div className="careers-role-head">
              <h3 className="careers-role-title">{r.title}</h3>
              <div className="careers-role-meta">
                <span>{r.type}</span>
                <span aria-hidden="true">·</span>
                <span>{r.location}</span>
              </div>
            </div>
            <p className="careers-role-blurb">{r.blurb}</p>
            {/* Inert in v1 — application flow (ATS vs form) is still an open decision. */}
            <span className="careers-role-link" aria-disabled="true">
              View role →
            </span>
          </div>
        ))}
      </div>
      <div className="careers-roles-footer">
        <span className="exp-btn-outline" aria-disabled="true">
          {viewAllLabel}
        </span>
      </div>
    </CareersSection>
  )
}
