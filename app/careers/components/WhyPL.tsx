import CareersSection from './CareersSection'
import RevealText from './RevealText'
import InView from './InView'
import SmallnessChart from './SmallnessChart'
import IconCards from './IconCards'
import { WHY_PL } from '../data/careersContent'

// Why PL — the self-select moment. Header row, then copy + the smallness bar
// chart, then the four values as hover-animated icon cards.
export default function WhyPL() {
  const { eyebrow, heading, intro, values } = WHY_PL
  return (
    <CareersSection id="why" panel eyebrow={eyebrow} context="A small senior team, by design.">
      <div className="careers-split">
        <div className="careers-split-copy">
          <RevealText as="h2" className="careers-heading" text={heading} />
          <InView as="p" className="careers-intro cz-rev">
            {intro}
          </InView>
        </div>
        <SmallnessChart />
      </div>
      <div style={{ marginTop: 'clamp(56px, 8vh, 96px)' }}>
        <IconCards items={values} columns={4} />
      </div>
    </CareersSection>
  )
}
