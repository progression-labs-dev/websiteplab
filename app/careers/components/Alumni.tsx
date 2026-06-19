/* eslint-disable @next/next/no-img-element */
import Image from 'next/image'
import CareersSection from './CareersSection'
import { ALUMNI } from '../data/careersContent'

export default function Alumni() {
  const { eyebrow, heading, intro, image, imageAlt, destinations, quote } = ALUMNI
  return (
    <CareersSection id="alumni" tone="dark" eyebrow={eyebrow} heading={heading} intro={intro}>
      <div className="careers-alumni-split">
        <div className="careers-alumni-art">
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="(max-width: 900px) 100vw, 40vw"
            className="careers-alumni-img"
          />
        </div>
        <div className="careers-alumni-content">
          <div className="careers-alumni-logos">
            {destinations.map((d) => (
              <div className="careers-alumni-logo" key={d.name}>
                {d.src ? (
                  <img className="careers-logo" src={d.src} alt={d.name} loading="lazy" />
                ) : (
                  <span className="careers-logo-text">{d.name}</span>
                )}
              </div>
            ))}
          </div>
          <blockquote className="careers-alumni-quote">
            <p>{quote.text}</p>
            <cite>{quote.attribution}</cite>
          </blockquote>
        </div>
      </div>
    </CareersSection>
  )
}
