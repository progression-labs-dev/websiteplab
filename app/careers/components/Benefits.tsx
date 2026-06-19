import CareersSection from './CareersSection'
import { BENEFITS } from '../data/careersContent'

export default function Benefits() {
  const { eyebrow, heading, note, items } = BENEFITS
  return (
    <CareersSection id="benefits" eyebrow={eyebrow} heading={heading} intro={note}>
      <div className="careers-benefit-grid">
        {items.map((b) => (
          <div className="careers-benefit-card" key={b.title}>
            <h3 className="careers-benefit-title">{b.title}</h3>
            <p className="careers-benefit-body">{b.body}</p>
          </div>
        ))}
      </div>
    </CareersSection>
  )
}
