import ArrowIcon from '../../experiment/components/ArrowIcon'
import StatCounter from './StatCounter'
import { CAREERS_HERO } from '../data/careersContent'

// Type-led hero. No grid, no photography — the headline and negative space
// carry it (Halfspace / Northslope feel). A quiet stat row sits beneath.
export default function CareersHero() {
  const { eyebrow, headline, subhead, primaryCta, secondaryCta, stats } = CAREERS_HERO
  return (
    <header id="top">
      <div className="careers-hero">
        <p className="careers-hero-eyebrow">{eyebrow}</p>
        <h1 className="careers-hero-headline">{headline}</h1>
        <p className="careers-hero-sub">{subhead}</p>
        <div className="careers-hero-actions">
          <a href={primaryCta.href} className="exp-btn-filled">
            {primaryCta.label} <ArrowIcon />
          </a>
          <a href={secondaryCta.href} className="exp-btn-outline">
            {secondaryCta.label}
          </a>
        </div>
      </div>
      <div className="careers-hero-meta">
        {stats.map((s) => (
          <StatCounter key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
        ))}
      </div>
    </header>
  )
}
