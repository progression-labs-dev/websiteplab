import CareersSection from './CareersSection'
import IconCards from './IconCards'
import { BENEFITS } from '../data/careersContent'

export default function Benefits() {
  const { eyebrow, heading, note, items } = BENEFITS
  return (
    <CareersSection id="benefits" eyebrow={eyebrow} heading={heading} intro={note}>
      <IconCards items={items} columns={3} />
    </CareersSection>
  )
}
