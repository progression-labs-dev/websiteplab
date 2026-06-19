import ArrowIcon from '../../experiment/components/ArrowIcon'
import { ANNOUNCEMENT } from '../data/careersContent'

// Slim announcement bar above the hero. Sits just under the fixed nav; light
// cream treatment with a spectrum hairline (handled in careers.css).
export default function AnnouncementBanner() {
  const { text, cta, href } = ANNOUNCEMENT
  return (
    <a href={href} className="careers-banner" data-theme="light" data-tone="light">
      <span className="careers-banner-dot" aria-hidden="true" />
      <span className="careers-banner-text">{text}</span>
      <span className="careers-banner-cta">
        {cta} <ArrowIcon />
      </span>
    </a>
  )
}
