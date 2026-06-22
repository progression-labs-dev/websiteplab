import CareersSection from './CareersSection'
import PlayGlyph from './PlayGlyph'
import { FILM_SUITE } from '../data/careersContent'

// Film suite (the ticket's biggest differentiator). Near-black tiles, title +
// play + duration, no posters. First clip leads full-width. Real video later.
export default function FilmSuite() {
  const { eyebrow, heading, intro, clips } = FILM_SUITE
  return (
    <CareersSection id="film-suite" eyebrow={eyebrow} heading={heading} intro={intro}>
      <div className="careers-tiles">
        {clips.map((c, i) => (
          <button type="button" className={`careers-tile careers-tile-film${i === 0 ? ' is-lead' : ''}`} key={c.key}>
            <span className="careers-tile-play"><PlayGlyph /></span>
            <p className="careers-tile-label">{c.label} · {c.duration}</p>
            <h3 className="careers-tile-title">{c.title}</h3>
          </button>
        ))}
      </div>
    </CareersSection>
  )
}
