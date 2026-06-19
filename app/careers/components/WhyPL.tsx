import Image from 'next/image'
import CareersSection from './CareersSection'
import ValuesCarousel from './ValuesCarousel'
import { WHY_PL } from '../data/careersContent'

export default function WhyPL() {
  const { eyebrow, heading, intro, image, imageAlt } = WHY_PL
  return (
    <CareersSection id="why" eyebrow={eyebrow} heading={heading} intro={intro}>
      <div className="careers-why-split">
        <div className="careers-why-art">
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="(max-width: 900px) 100vw, 40vw"
            className="careers-why-img"
          />
        </div>
        <ValuesCarousel />
      </div>
    </CareersSection>
  )
}
