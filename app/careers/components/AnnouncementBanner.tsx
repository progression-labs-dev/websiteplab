import ArrowIcon from '../../experiment/components/ArrowIcon'
import { ANNOUNCEMENT } from '../data/careersContent'

// Slim announcement bar above the hero (Northslope-style). Sits just under the
// fixed nav; data-theme="dark" gives it the navy/white treatment.
export default function AnnouncementBanner() {
  const { text, cta, href } = ANNOUNCEMENT
  return (
    <a href={href} className="careers-banner" data-theme="dark" data-tone="dark">
      <span className="careers-banner-dot" aria-hidden="true" />
      <span className="careers-banner-text">{text}</span>
      <span className="careers-banner-cta">
        {cta} <ArrowIcon />
      </span>
    </a>
  )
}
