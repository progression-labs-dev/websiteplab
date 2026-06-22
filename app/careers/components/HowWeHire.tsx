import CareersSection from './CareersSection'
import HiringRoadmap from './HiringRoadmap'
import { HOW_WE_HIRE } from '../data/careersContent'

export default function HowWeHire() {
  const { eyebrow, heading, fdeNarrative } = HOW_WE_HIRE
  return (
    <CareersSection id="how-we-hire" panel eyebrow={eyebrow} heading={heading} intro={fdeNarrative}>
      <HiringRoadmap />
    </CareersSection>
  )
}
