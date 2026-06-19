import CareersNav from './components/CareersNav'
import AnnouncementBanner from './components/AnnouncementBanner'
import CareersHero from './components/CareersHero'
import CultureTabs from './components/CultureTabs'
import WhyPL from './components/WhyPL'
import FoundersLetter from './components/FoundersLetter'
import OpenRoles from './components/OpenRoles'
import HowWeHire from './components/HowWeHire'
import TeamCarousel from './components/TeamCarousel'
import Alumni from './components/Alumni'
import Credibility from './components/Credibility'
import Benefits from './components/Benefits'
import CareersFooter from './components/CareersFooter'

// Careers/Talent page — "Northslope feel, PL brand". Placeholder content +
// AI-generated brand imagery (Gemini/Palindrom). Unlinked preview (not in
// nav/sitemap). See app/careers/data/careersContent.ts to swap placeholders.
// Light editorial base with dark navy bands (banner, How we hire, Alumni,
// footer) and restrained one-shot reveals via CareersSection.
export default function CareersPage() {
  return (
    <>
      <CareersNav />
      <AnnouncementBanner />
      <main>
        <CareersHero />
        <CultureTabs />
        <WhyPL />
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
