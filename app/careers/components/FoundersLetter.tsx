import Image from 'next/image'
import CareersSection from './CareersSection'
import AnimatedSignature from './AnimatedSignature'
import { FOUNDERS_LETTER } from '../data/careersContent'

export default function FoundersLetter() {
  const { eyebrow, greeting, paragraphs, signature, signatureRole, portrait } = FOUNDERS_LETTER
  return (
    <CareersSection id="founders-letter" tone="dark" eyebrow={eyebrow}>
      <div className="careers-letter">
        <aside className="careers-letter-portrait">
          <Image
            src={portrait}
            alt={`${signature}, ${signatureRole}`}
            fill
            sizes="(max-width: 900px) 100vw, 320px"
            className="careers-letter-portrait-img"
          />
        </aside>
        <div className="careers-letter-body">
          <p className="careers-letter-greeting">{greeting}</p>
          {paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
          <div className="careers-signature">
            <AnimatedSignature name={signature} />
            <span className="careers-signature-role">{signatureRole}</span>
          </div>
        </div>
      </div>
    </CareersSection>
  )
}
