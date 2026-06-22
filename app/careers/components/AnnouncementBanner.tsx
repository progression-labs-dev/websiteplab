import ArrowIcon from '../../experiment/components/ArrowIcon'
import { ANNOUNCEMENT } from '../data/careersContent'

// Slim cream announcement bar under the fixed nav, hairline divider.
export default function AnnouncementBanner() {
  const { text, cta, href } = ANNOUNCEMENT
  return (
    <a href={href} className="careers-banner">
      <span className="careers-banner-dot" aria-hidden="true" />
      <span className="careers-banner-text">{text}</span>
      <span className="careers-banner-cta">
        {cta} <ArrowIcon />
      </span>
    </a>
  )
}
