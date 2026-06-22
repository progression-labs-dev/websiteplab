import CareersSection from './CareersSection'
import InView from './InView'
import { ALUMNI } from '../data/careersContent'

// The standout section (per the ticket). Destinations rendered as large type,
// not logos or photos. "Grow here even if you eventually leave."
export default function Alumni() {
  const { eyebrow, heading, intro, destinations, quote } = ALUMNI
  return (
    <CareersSection id="alumni" eyebrow={eyebrow} context="Time here compounds." heading={heading} intro={intro}>
      <InView className="careers-alumni-list cz-stagger">
        {destinations.map((name, i) => (
          <div className="careers-alumni-item" key={name}>
            <span className="careers-alumni-name">{name}</span>
            <span className="careers-alumni-tag">{String(i + 1).padStart(2, '0')} · Where they went</span>
          </div>
        ))}
      </InView>
      <blockquote className="careers-alumni-quote">
        <p>“{quote.text}”</p>
        <cite>{quote.attribution}</cite>
      </blockquote>
    </CareersSection>
  )
}
