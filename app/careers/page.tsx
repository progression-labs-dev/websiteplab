import CareersNav from './components/CareersNav'
import AnnouncementBanner from './components/AnnouncementBanner'
import CareersHero from './components/CareersHero'
import WhyPL from './components/WhyPL'
import CultureTabs from './components/CultureTabs'
import VideoSuite from './components/VideoSuite'
import FoundersLetter from './components/FoundersLetter'
import OpenRoles from './components/OpenRoles'
import HowWeHire from './components/HowWeHire'
import TeamCarousel from './components/TeamCarousel'
import Alumni from './components/Alumni'
import Credibility from './components/Credibility'
import Benefits from './components/Benefits'
import CareersFooter from './components/CareersFooter'

// Careers/Talent page — premium editorial in the PL brand (cream base, spectrum
// accents, oversized Inter, two dark cinematic anchors: Founder's letter +
// Alumni). Placeholder content + AI-generated brand imagery (Gemini/Palindrom).
// Unlinked preview (not in nav/sitemap). Edit copy/assets in
// app/careers/data/careersContent.ts. Lead on smallness, elevate the alumni
// story (per the Notion ticket positioning). Restrained reveals via CareersSection.
export default function CareersPage() {
  return (
    <>
      <CareersNav />
      <AnnouncementBanner />
      <main>
        <CareersHero />
        <WhyPL />
        <CultureTabs />
        <VideoSuite />
        <FoundersLetter />
        <OpenRoles />
        <HowWeHire />
        <TeamCarousel />
        <Alumni />
        <Credibility />
        <Benefits />
      </main>
      <CareersFooter />
    </>
  )
}
