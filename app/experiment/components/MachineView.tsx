'use client'

import {
  NAV_LINKS,
  HERO_CONTENT,
  CTA_CONTENT,
  ROLES,
  JOURNEYS,
  RECOMMENDATIONS,
  TESTIMONIALS,
  CONTACT_EMAIL,
  LINKEDIN_URL,
} from '../data/siteContent'
import { BRAINSTORM_HREF } from './brainstormMailto'

export default function MachineView() {
  return (
    <div className="exp-machine">
      {/* Header */}
      <div className="exp-m-card" data-section="hero">
        <div className="exp-m-title">PROGRESSION LABS</div>
        <div className="exp-m-muted">Custom AI agents that scale for the most complex problems in the real world.</div>
        <div className="exp-m-links">
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href} className="exp-m-link">[{l.label}]<span className="exp-m-url">({l.href})</span></a>
          ))}
        </div>
        <div className="exp-m-links" style={{ marginTop: 8 }}>
          <a href={BRAINSTORM_HREF} className="exp-m-link exp-m-link--cta">[CONTACT]<span className="exp-m-url">({CONTACT_EMAIL})</span></a>
        </div>
      </div>

      {/* Hero */}
      <div className="exp-m-card">
        <div className="exp-m-h2">## Hero</div>
        <div className="exp-m-body">{HERO_CONTENT.control.headline}</div>
        <div className="exp-m-links" style={{ marginTop: 12 }}>
          <a href={BRAINSTORM_HREF} className="exp-m-link">[{HERO_CONTENT.control.cta}]</a>
          <a href="#work" className="exp-m-link">[See our work]</a>
        </div>
      </div>

      {/* Partner */}
      <div className="exp-m-card">
        <div className="exp-m-h2">## Partner</div>
        <div className="exp-m-body">AWS Select Tier Technology Partner</div>
      </div>

      {/* Services */}
      <div className="exp-m-card" data-section="services">
        <div className="exp-m-h2">## Services — Find Your Fit</div>
        <div className="exp-m-body">Two questions. One recommendation.</div>

        <div className="exp-m-sub" style={{ marginTop: 16 }}>
          <div className="exp-m-h3">### Roles</div>
          {ROLES.map(r => (
            <div key={r.id} className="exp-m-list-item">- {r.label}</div>
          ))}
        </div>

        <div className="exp-m-sub" style={{ marginTop: 16 }}>
          <div className="exp-m-h3">### AI Journey Stages</div>
          {JOURNEYS.map(j => (
            <div key={j.id} className="exp-m-list-item">- {j.label}</div>
          ))}
        </div>
      </div>

      {/* All Recommendations */}
      <div className="exp-m-card">
        <div className="exp-m-h2">## All Recommendations</div>
        {ROLES.map(role => (
          <div key={role.id} className="exp-m-sub">
            <div className="exp-m-h3">### {role.label}</div>
            {JOURNEYS.map(journey => {
              const rec = RECOMMENDATIONS[`${role.id}-${journey.id}`]
              if (!rec) return null
              return (
                <div key={journey.id} className="exp-m-rec">
                  <div className="exp-m-rec-journey">{journey.label}</div>
                  <div className="exp-m-rec-title">{rec.title}</div>
                  <div className="exp-m-rec-desc">{rec.desc}</div>
                  <div className="exp-m-rec-services">Services: {rec.services.join(', ')}</div>
                  <a href={BRAINSTORM_HREF} className="exp-m-link">[{rec.cta}]</a>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Testimonials */}
      <div className="exp-m-card" data-section="work">
        <div className="exp-m-h2">## Proof — Testimonials</div>
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="exp-m-quote">
            <div className="exp-m-quote-text">&ldquo;{t.quote}&rdquo;</div>
            <div className="exp-m-quote-attr">— <strong>{t.author}</strong>, {t.role}</div>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="exp-m-card" data-section="contact">
        <div className="exp-m-h2">## Contact</div>
        <div className="exp-m-body">{CTA_CONTENT.heading}</div>
        <div className="exp-m-muted">{CTA_CONTENT.subheading}</div>
        <div className="exp-m-links" style={{ marginTop: 12 }}>
          <a href={BRAINSTORM_HREF} className="exp-m-link exp-m-link--cta">[{CTA_CONTENT.cta}]</a>
        </div>
        <div className="exp-m-body" style={{ marginTop: 8 }}>
          Email: {CONTACT_EMAIL}
        </div>
        <div className="exp-m-body">
          LinkedIn: <a href={LINKEDIN_URL} className="exp-m-link">[Progression Labs]<span className="exp-m-url">({LINKEDIN_URL})</span></a>
        </div>
      </div>

      {/* Footer */}
      <div className="exp-m-footer">© 2026 Progression Labs</div>
    </div>
  )
}
