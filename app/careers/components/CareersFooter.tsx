import { CONTACT_EMAIL, LINKEDIN_URL } from '../../experiment/data/siteContent'

// Footer meta only — the "Think you're a fit?" CTA lives in SpectrumCTA above.
export default function CareersFooter() {
  return (
    <footer className="careers-footer">
      <div className="careers-footer-inner">
        <div className="careers-footer-meta">
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <span>Progression Labs · London</span>
          <span className="careers-footer-legal">© 2026 Progression Labs. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
