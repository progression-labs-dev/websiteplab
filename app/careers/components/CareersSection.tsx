import type { ReactNode } from 'react'
import RevealText from './RevealText'
import InView from './InView'

interface CareersSectionProps {
  id?: string
  tone?: 'light' | 'dark'
  /** Bone panel background (rhythm without photos). */
  panel?: boolean
  /** Section label (left of the bordered-row header). */
  eyebrow?: string
  /** One line of context (right of the header), Halfspace-style. */
  context?: string
  heading?: string
  intro?: string
  children?: ReactNode
}

// Section shell. A drawn top-rule + a bordered-row header (label left, context
// right), then a masked word-rise heading, then the intro. Per-element motion
// is handled by InView / RevealText, so there is no whole-section fade.
export default function CareersSection({
  id,
  tone = 'light',
  panel = false,
  eyebrow,
  context,
  heading,
  intro,
  children,
}: CareersSectionProps) {
  return (
    <section
      id={id}
      className="careers-section"
      data-tone={tone}
      data-theme={tone === 'dark' ? 'dark' : 'light'}
      data-panel={panel ? 'true' : undefined}
    >
      <div className="careers-inner">
        {(eyebrow || context) && (
          <>
            <InView className="cz-rule" />
            <div className="careers-rowhead">
              {eyebrow ? <p className="careers-eyebrow">{eyebrow}</p> : <span />}
              {context && <p className="careers-rowhead-context">{context}</p>}
            </div>
          </>
        )}
        {heading && <RevealText as="h2" className="careers-heading" text={heading} />}
        {intro && (
          <InView as="p" className="careers-intro cz-rev">
            {intro}
          </InView>
        )}
        {children}
      </div>
    </section>
  )
}
