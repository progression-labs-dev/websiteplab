import ArrowIcon from '../../experiment/components/ArrowIcon'
import RevealText from './RevealText'
import InView from './InView'
import HeroMosaic from './HeroMosaic'
import StatCounter from './StatCounter'
import { CAREERS_HERO } from '../data/careersContent'

// Type-led hero, two columns: copy + a living LED-mosaic panel (the brand's
// signature spectrum, breathing). No photography. Headline rises word-by-word.
export default function CareersHero() {
  const { eyebrow, headline, subhead, primaryCta, secondaryCta, stats } = CAREERS_HERO
  return (
    <header id="top">
      <div className="careers-hero-layout">
        <div className="careers-hero-copy">
          <p className="careers-hero-eyebrow">{eyebrow}</p>
          <RevealText as="h1" className="careers-hero-headline" text={headline} step={60} />
          <InView as="p" className="careers-hero-sub cz-rev" delay={260}>
            {subhead}
          </InView>
          <InView className="careers-hero-actions cz-rev" delay={360}>
            <a href={primaryCta.href} className="exp-btn-filled">
              {primaryCta.label} <ArrowIcon />
            </a>
            <a href={secondaryCta.href} className="exp-btn-outline">
              {secondaryCta.label}
            </a>
          </InView>
        </div>
        <HeroMosaic />
      </div>
      <InView className="careers-hero-meta cz-stagger">
        {stats.map((s) => (
          <StatCounter key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
        ))}
      </InView>
    </header>
  )
}
