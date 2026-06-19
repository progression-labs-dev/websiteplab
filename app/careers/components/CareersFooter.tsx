import ArrowIcon from '../../experiment/components/ArrowIcon'
import { CONTACT_EMAIL, LINKEDIN_URL } from '../../experiment/data/siteContent'

export default function CareersFooter() {
  return (
    <footer className="careers-footer" data-theme="dark" data-tone="dark">
      <div className="careers-footer-inner">
        <div className="careers-footer-cta">
          <h2 className="careers-footer-heading">Think you’re a fit?</h2>
          <a href="#open-roles" className="exp-btn-filled">
            View open roles <ArrowIcon />
          </a>
        </div>
        <div className="careers-footer-meta">
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <span>Progression Labs · London</span>
          <span className="careers-footer-legal">
            © {2026} Progression Labs. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  )
}
