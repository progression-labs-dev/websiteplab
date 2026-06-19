import Image from 'next/image'
import CareersSection from './CareersSection'
import { VIDEO_SUITE } from '../data/careersContent'

// Video suite — placeholder poster carousel. Each card is a slot ready to drop
// a real clip into after the filming day. The first clip renders full-width.
export default function VideoSuite() {
  const { eyebrow, heading, intro, clips } = VIDEO_SUITE
  return (
    <CareersSection id="video-suite" eyebrow={eyebrow} heading={heading} intro={intro}>
      <div className="careers-videos">
        {clips.map((clip) => (
          <button type="button" className="careers-video-card" key={clip.key} aria-label={`Play: ${clip.title}`}>
            <Image
              src={clip.poster}
              alt=""
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              className="careers-video-poster"
            />
            <span className="careers-video-scrim" aria-hidden="true" />
            <span className="careers-video-meta">
              <span className="careers-video-play" aria-hidden="true">
                <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                  <path d="M1 1.3v13.4a.6.6 0 0 0 .92.5l11-6.7a.6.6 0 0 0 0-1L1.92.8A.6.6 0 0 0 1 1.3Z" fill="currentColor" />
                </svg>
              </span>
              <span className="careers-video-titles">
                <span className="careers-video-label">{clip.label} · {clip.duration}</span>
                <span className="careers-video-title">{clip.title}</span>
              </span>
            </span>
          </button>
        ))}
      </div>
    </CareersSection>
  )
}
