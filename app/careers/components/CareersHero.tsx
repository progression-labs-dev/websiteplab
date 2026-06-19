import Image from 'next/image'
import ArrowIcon from '../../experiment/components/ArrowIcon'
import { CAREERS_HERO } from '../data/careersContent'

export default function CareersHero() {
  const { eyebrow, headline, subhead, primaryCta, secondaryCta, image, imageAlt } = CAREERS_HERO
  return (
    <header className="careers-hero" id="top">
      <div className="careers-hero-grid">
        <div className="careers-hero-copy">
          <p className="careers-eyebrow">{eyebrow}</p>
          <div className="careers-hero-rule" aria-hidden="true" />
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
        <div className="careers-hero-art">
          <Image
            src={image}
            alt={imageAlt}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 46vw"
            className="careers-hero-img"
          />
        </div>
      </div>
    </header>
  )
}
