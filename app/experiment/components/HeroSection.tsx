'use client'

import { useState, useRef, useCallback } from 'react'
import BlueprintIntro from './BlueprintIntro'
import TextScramble from './TextScramble'
import MosaicOverlay from './MosaicOverlay'
import HeroGradientGL from './HeroGradientGL'
import ArrowIcon from './ArrowIcon'

interface HeroSectionProps {
  onNavReveal: () => void
  onBrandReveal: () => void
}

const HEADLINE_TEXT =
  "We're building custom AI agents that scale for the most complex problems in the real world"

export default function HeroSection({ onNavReveal, onBrandReveal }: HeroSectionProps) {
  const [mosaicActive, setMosaicActive] = useState(false)
  const [heroReveal, setHeroReveal] = useState(false)
  const [scrambleTrigger, setScrambleTrigger] = useState(false)
  const [scrambleDone, setScrambleDone] = useState(false)
  const [showButtons, setShowButtons] = useState(false)

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const addTimer = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timersRef.current.push(id)
    return id
  }, [])

  const handleBlueprintComplete = useCallback(() => {
    // Blueprint overlay has faded — reveal everything

    // Nav appears immediately
    onNavReveal()

    // Brand text fades in after brief pause
    addTimer(() => onBrandReveal(), 200)

    // Activate mosaic overlay (interactive pixel trail)
    setMosaicActive(true)

    // Trigger hero gradient pixel reveal
    setHeroReveal(true)

    // Trigger TextScramble after brief delay
    addTimer(() => setScrambleTrigger(true), 300)

    // Swap to bold-keyword headline after scramble resolves
    addTimer(() => setScrambleDone(true), 300 + 1200)

    // Show CTA buttons after scramble + brief pause
    addTimer(() => setShowButtons(true), 300 + 1200 + 100)
  }, [onNavReveal, onBrandReveal, addTimer])

  return (
    <section className="exp-hero">
      {/* Full-screen blueprint P-logo intro animation */}
      <BlueprintIntro onComplete={handleBlueprintComplete} />

      <div className="exp-hero-frame">
        {/* Layer 0: WebGL hue-cycling gradient with pixel reveal */}
        <HeroGradientGL revealTrigger={heroReveal} />

        {/* Layer 1: Interactive mosaic pixel grid — digital wake trail */}
        <MosaicOverlay active={mosaicActive} />

        {/* Layer 2: Hero content — bottom-left inside frame */}
        <div className="exp-hero-content">
          {/* Headline with TextScramble → bold keywords after resolve */}
          {!scrambleDone ? (
            <TextScramble
              text={HEADLINE_TEXT}
              trigger="load"
              triggerWhen={scrambleTrigger}
              duration={1200}
              tag="h1"
              className="exp-hero-headline"
            />
          ) : (
            <h1 className="exp-hero-headline">
              We&apos;re building <strong>custom AI agents</strong> that scale
              for the <strong>most complex problems</strong> in the{' '}
              <strong>real world</strong>
            </h1>
          )}

          {/* CTA Buttons */}
          <div
            className="exp-hero-buttons"
            style={{
              opacity: showButtons ? 1 : 0,
              transform: showButtons ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}
          >
            <a href="#contact" className="exp-btn-filled">
              Request a brainstorm <ArrowIcon />
            </a>
            <a href="#work" className="exp-btn-outline">
              See our work <ArrowIcon />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
