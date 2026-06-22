import CareersSection from './CareersSection'
import SmallnessChart from './SmallnessChart'
import IconCards from './IconCards'
import { WHY_PL } from '../data/careersContent'

// Why PL — the self-select moment. Top: copy + the smallness bar chart. Below:
// the four values as Halfspace-style hover-animated icon cards.
export default function WhyPL() {
  const { eyebrow, heading, intro, values } = WHY_PL
  return (
    <CareersSection id="why" panel>
      <div className="careers-split">
        <div className="careers-split-copy">
          <p className="careers-eyebrow">{eyebrow}</p>
          <h2 className="careers-heading">{heading}</h2>
          <p className="careers-intro">{intro}</p>
        </div>
        <SmallnessChart />
      </div>
      <div style={{ marginTop: 'clamp(56px, 8vh, 96px)' }}>
        <IconCards items={values} columns={4} />
      </div>
    </CareersSection>
  )
}
