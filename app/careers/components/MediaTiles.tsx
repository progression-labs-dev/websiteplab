import CareersSection from './CareersSection'
import InView from './InView'
import PlayGlyph from './PlayGlyph'
import { CULTURE } from '../data/careersContent'

// Life at PL — near-black square media tiles, no photography. Each is a labelled
// placeholder ready to hold real footage later.
export default function MediaTiles() {
  const { eyebrow, heading, tiles } = CULTURE
  return (
    <CareersSection id="life" eyebrow={eyebrow} context="In the room, in London." heading={heading}>
      <InView className="careers-tiles careers-tiles-media cz-stagger">
        {tiles.map((t) => (
          <div className="careers-tile" key={t.key}>
            <span className="careers-tile-play"><PlayGlyph /></span>
            <p className="careers-tile-label">{t.label}</p>
            <h3 className="careers-tile-title">{t.heading}</h3>
            <p className="careers-tile-body">{t.body}</p>
          </div>
        ))}
      </InView>
    </CareersSection>
  )
}
