import CareersSection from './CareersSection'
import PlayGlyph from './PlayGlyph'
import { CULTURE } from '../data/careersContent'

// Life at PL — near-black square media tiles, no photography. Each is a labelled
// placeholder ready to hold real footage later.
export default function MediaTiles() {
  const { eyebrow, heading, tiles } = CULTURE
  return (
    <CareersSection id="life" eyebrow={eyebrow} heading={heading}>
      <div className="careers-tiles careers-tiles-media">
        {tiles.map((t) => (
          <div className="careers-tile" key={t.key}>
            <span className="careers-tile-play"><PlayGlyph /></span>
            <p className="careers-tile-label">{t.label}</p>
            <h3 className="careers-tile-title">{t.heading}</h3>
            <p className="careers-tile-body">{t.body}</p>
          </div>
        ))}
      </div>
    </CareersSection>
  )
}
