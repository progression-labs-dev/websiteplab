import CareersNav from './components/CareersNav'
import AnnouncementBanner from './components/AnnouncementBanner'
import CareersHero from './components/CareersHero'
import WhyPL from './components/WhyPL'
import MediaTiles from './components/MediaTiles'
import FilmSuite from './components/FilmSuite'
import FoundersLetter from './components/FoundersLetter'
import OpenRoles from './components/OpenRoles'
import HowWeHire from './components/HowWeHire'
import MeetTheTeam from './components/MeetTheTeam'
import Alumni from './components/Alumni'
import Credibility from './components/Credibility'
import Benefits from './components/Benefits'
import SpectrumCTA from './components/SpectrumCTA'
import CareersFooter from './components/CareersFooter'

// Careers page — v3, Halfspace-grade and brand-correct. Warm monochrome cream/
// near-black + one indigo accent, SQUARE everything, NO photography. The brand
// spectrum appears once, in the closing LED-mosaic CTA. Placeholder copy lives
// in app/careers/data/careersContent.ts. Unlinked preview (not in nav/sitemap).
export default function CareersPage() {
  return (
    <>
      <CareersNav />
      <AnnouncementBanner />
      <main>
        <CareersHero />
        <WhyPL />
        <MediaTiles />
        <FilmSuite />
        <FoundersLetter />
        <OpenRoles />
        <HowWeHire />
        <MeetTheTeam />
        <Alumni />
        <Credibility />
        <Benefits />
        <SpectrumCTA />
      </main>
      <CareersFooter />
    </>
  )
}
