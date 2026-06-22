import CareersSection from './CareersSection'
import AnimatedSignature from './AnimatedSignature'
import { FOUNDERS_LETTER } from '../data/careersContent'

// Dark cinematic anchor (#0a0a0a), no portrait, no gradient. Letter + animated
// signature. The thin indigo rule on the lead paragraph is the only accent.
export default function FoundersLetter() {
  const { eyebrow, greeting, paragraphs, signature, signatureRole } = FOUNDERS_LETTER
  return (
    <CareersSection id="founders-letter" tone="dark" eyebrow={eyebrow}>
      <div className="careers-letter">
        <p className="careers-letter-greeting">{greeting}</p>
        <div className="careers-letter-body">
          {paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
        <div className="careers-signature">
          <AnimatedSignature name={signature} />
          <span className="careers-signature-role">{signatureRole}</span>
        </div>
      </div>
    </CareersSection>
  )
}
