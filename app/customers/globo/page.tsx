import type { Metadata } from 'next'
import ExperimentLayout from '../../experiment/layout'
import GloboCaseStudy from './GloboCaseStudy'

export const metadata: Metadata = {
  title: 'Globo × Progression Labs · An extension of the team',
  description:
    'How Progression Labs became an embedded AI partner for Globo, building Kai, the industry-first AI medical interpreter, and GAIT, real-time QA across 250+ languages.',
  openGraph: {
    title: 'Globo × Progression Labs · Customer Story',
    description:
      'How Progression Labs became an embedded AI partner for Globo. Kai (industry-first AI medical interpreter) and GAIT (real-time QA across 250+ languages).',
    type: 'article',
    url: 'https://progressionlabs.com/customers/globo',
  },
}

export default function GloboPage() {
  return (
    <ExperimentLayout>
      <GloboCaseStudy />
    </ExperimentLayout>
  )
}
