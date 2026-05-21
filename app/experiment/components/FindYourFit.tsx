'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import ScrollDecode from './ScrollDecode'
import ArrowIcon from './ArrowIcon'
import StepIcons from './StepIcons'
import { useColorCycle } from './useColorCycle'
import PixelGradientCanvas from './PixelGradientCanvas'
import FinderAsciiOverlay from './FinderAsciiOverlay'
import { BRAINSTORM_HREF, openBrainstormEmail } from './brainstormMailto'
import { useFeatureFlagVariantKey } from '@posthog/react'
import posthog from 'posthog-js'
import { ROLES, JOURNEYS, RECOMMENDATIONS, RECOMMENDATIONS_VARIANT, FINDER_VARIANT, type Role, type Journey } from '../data/siteContent'

const TYPING_SPEED = 35 // ms per character

const roles = ROLES
const journeys = JOURNEYS

export default function FindYourFit() {
  const flagVariant = useFeatureFlagVariantKey('hero-ab-test')
  const isVariant = flagVariant === 'variant'
  const recommendations = isVariant ? RECOMMENDATIONS_VARIANT : RECOMMENDATIONS

  const [step, setStep] = useState(0)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null)
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [resultLines, setResultLines] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const gsapRef = useRef<typeof import('gsap')['default'] | null>(null)
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Shared color cycle — skip gradient override (WebGL canvas handles visuals), keep terminal accents
  const labelRef = useColorCycle([terminalRef], { skipGradient: true })

  useEffect(() => {
    import('gsap').then(mod => { gsapRef.current = mod.default })
  }, [])

  // Bidirectional scroll-blur reveal — matches ProofSection.
  // Section enters blurred from below, focuses through the middle,
  // re-blurs as it exits the top. Mirrored on scroll-up.
  useEffect(() => {
    let ctx: { revert: () => void } | null = null

    const initGsap = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      const el = contentRef.current
      if (!el) return

      ctx = gsap.context(() => {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        if (prefersReduced) {
          gsap.set(el, { opacity: 1, filter: 'blur(0px)' })
          return
        }

        gsap.set(el, {
          opacity: 0.4,
          filter: 'blur(14px)',
          y: 40,
          willChange: 'filter, transform, opacity',
        })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        })

        tl.to(el, {
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          ease: 'power2.out',
          duration: 0.35,
        }, 0)

        tl.to(el, {
          opacity: 0.4,
          filter: 'blur(14px)',
          y: -40,
          ease: 'power2.in',
          duration: 0.35,
        }, 0.65)
      })
    }

    initGsap()
    return () => { ctx?.revert() }
  }, [])

  // Stagger result lines when step 2 is reached
  useEffect(() => {
    if (step !== 2) return
    // Track the recommendation shown
    if (selectedRole && selectedJourney) {
      const rec = recommendations[`${selectedRole}-${selectedJourney}`]
      posthog.capture('finder_recommendation_shown', {
        role: roles.find(r => r.id === selectedRole)?.label,
        role_id: selectedRole,
        journey: journeys.find(j => j.id === selectedJourney)?.label,
        journey_id: selectedJourney,
        recommendation: rec?.title,
        services: rec?.services,
      })
    }
    const timers: ReturnType<typeof setTimeout>[] = []
    for (let i = 1; i <= 5; i++) {
      timers.push(setTimeout(() => setResultLines(i), 400 + i * 150))
    }
    return () => timers.forEach(t => clearTimeout(t))
  }, [step, selectedRole, selectedJourney])

  // Typing effect — returns a promise that resolves when typing completes
  const typeText = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typingRef.current) clearInterval(typingRef.current)
      setIsTyping(true)
      setTypedText('')
      let i = 0
      typingRef.current = setInterval(() => {
        i++
        setTypedText(text.slice(0, i))
        if (i >= text.length) {
          if (typingRef.current) clearInterval(typingRef.current)
          typingRef.current = null
          setIsTyping(false)
          resolve()
        }
      }, TYPING_SPEED)
    })
  }, [])

  // Cleanup typing on unmount
  useEffect(() => {
    return () => { if (typingRef.current) clearInterval(typingRef.current) }
  }, [])

  const animateTransition = useCallback((callback: () => void) => {
    const gsap = gsapRef.current
    const el = contentRef.current
    if (!gsap || !el) { callback(); return }

    el.style.minHeight = `${el.offsetHeight}px`

    gsap.to(el, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        callback()
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            gsap.fromTo(el,
              { opacity: 0 },
              {
                opacity: 1,
                duration: 0.4,
                ease: 'power2.out',
                onComplete: () => { el.style.minHeight = '' },
              }
            )
          })
        })
      },
    })
  }, [])

  const handleRoleSelect = useCallback(async (role: Role) => {
    const label = roles.find(r => r.id === role)?.label || role
    posthog.capture('finder_role_selected', { role: label, role_id: role })
    setSelectedRole(role)
    await typeText(label)
    await new Promise(r => setTimeout(r, 350))
    setTypedText('')
    animateTransition(() => setStep(1))
  }, [animateTransition, typeText])

  const handleJourneySelect = useCallback(async (journey: Journey) => {
    const label = journeys.find(j => j.id === journey)?.label || journey
    const roleLabel = roles.find(r => r.id === selectedRole)?.label || selectedRole
    posthog.capture('finder_journey_selected', {
      journey: label,
      journey_id: journey,
      role: roleLabel,
      role_id: selectedRole,
    })
    setSelectedJourney(journey)
    await typeText(label)
    await new Promise(r => setTimeout(r, 350))
    setTypedText('')
    setResultLines(0)
    animateTransition(() => setStep(2))
  }, [animateTransition, typeText, selectedRole])

  const handleReset = useCallback(() => {
    animateTransition(() => {
      setStep(0)
      setSelectedRole(null)
      setSelectedJourney(null)
      setTypedText('')
      setResultLines(0)
    })
  }, [animateTransition])

  const recommendation = selectedRole && selectedJourney
    ? recommendations[`${selectedRole}-${selectedJourney}`]
    : null

  return (
    <div className="exp-12-grid exp-12-grid--half exp-finder">
      {/* Left column — Unicorn Studio WebGL canvas + text overlay */}
      <div ref={labelRef} className="exp-col-label exp-col-label--gradient exp-col-label--top">
        {/* WebGL pixel gradient canvas — sits behind text */}
        <PixelGradientCanvas />
        {/* ASCII characters that appear with the shimmer sweep */}
        <FinderAsciiOverlay />
        {/* Text content — sits on top */}
        <div className="exp-col-label-content">
          <ScrollDecode
            text="Find Your Fit"
            trigger="inView"
            tag="h2"
            className="exp-section-heading"
            duration={800}
          />
          <p className="exp-label-desc">
            Two questions. One recommendation.
          </p>
          <div className="exp-finder-progress" aria-hidden="true">
            <div className={`exp-finder-dot${step >= 0 ? ' exp-finder-dot--active' : ''}`} />
            <div className={`exp-finder-dot${step >= 1 ? ' exp-finder-dot--active' : ''}`} />
          </div>
        </div>
      </div>

      {/* Right column — terminal interface */}
      <div ref={contentRef} className="exp-col-content exp-finder-content" aria-live="polite">
        <div ref={terminalRef} className="exp-finder-terminal">
          {/* Terminal header bar */}
          <div className="exp-terminal-bar">
            <span className="exp-terminal-dot exp-terminal-dot--red" />
            <span className="exp-terminal-dot exp-terminal-dot--yellow" />
            <span className="exp-terminal-dot exp-terminal-dot--green" />
            <span className="exp-terminal-title">progression-labs://finder</span>
          </div>

          {/* Shared icon wrapper — all 3 SVGs always in DOM for crossfade */}
          <div style={{ marginBottom: 16 }}>
            <StepIcons step={step} />
          </div>

          {/* Step 0: Role selection */}
          {step === 0 && (
            <div className="exp-finder-step exp-finder-step--visible">
              <div className="exp-terminal-prompt">
                <span className="exp-terminal-caret">&gt;</span>
                <span className="exp-terminal-text">{isVariant ? FINDER_VARIANT.stepPrompts[0] : "What\u2019s your role?"}</span>
                {!typedText && !isTyping && <span className="exp-terminal-cursor" />}
              </div>
              <div className="exp-terminal-keys">
                {roles.map(role => (
                  <button
                    key={role.id}
                    className="exp-terminal-key"
                    onClick={() => handleRoleSelect(role.id)}
                    disabled={isTyping}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
              {typedText && (
                <div className="exp-terminal-typed">
                  <span className="exp-terminal-caret">&gt;</span> {typedText}
                  {isTyping && <span className="exp-terminal-cursor" />}
                </div>
              )}
            </div>
          )}

          {/* Step 1: Journey selection */}
          {step === 1 && (
            <div className="exp-finder-step exp-finder-step--visible">
              <div className="exp-terminal-prompt">
                <span className="exp-terminal-caret">&gt;</span>
                <span className="exp-terminal-text">{isVariant ? FINDER_VARIANT.stepPrompts[1] : 'Where are you on your AI journey?'}</span>
                {!typedText && !isTyping && <span className="exp-terminal-cursor" />}
              </div>
              <div className="exp-terminal-keys">
                {journeys.map(j => (
                  <button
                    key={j.id}
                    className="exp-terminal-key"
                    onClick={() => handleJourneySelect(j.id)}
                    disabled={isTyping}
                  >
                    {j.label}
                  </button>
                ))}
              </div>
              {typedText && (
                <div className="exp-terminal-typed">
                  <span className="exp-terminal-caret">&gt;</span> {typedText}
                  {isTyping && <span className="exp-terminal-cursor" />}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Result */}
          {step === 2 && recommendation && (
            <div className="exp-finder-step exp-finder-step--visible">
              <div className={`exp-terminal-line${resultLines >= 1 ? ' exp-terminal-line--visible' : ''}`}>
                <div className="exp-terminal-divider">
                  {isVariant ? FINDER_VARIANT.resultHeader : 'Analysis complete'}
                </div>
              </div>
              <div className={`exp-terminal-line${resultLines >= 2 ? ' exp-terminal-line--visible' : ''}`}>
                <div className="exp-terminal-result-title">
                  {recommendation.title}
                </div>
              </div>
              <div className={`exp-terminal-line${resultLines >= 3 ? ' exp-terminal-line--visible' : ''}`}>
                <div className="exp-terminal-result-desc">{recommendation.desc}</div>
              </div>
              <div className={`exp-terminal-line${resultLines >= 4 ? ' exp-terminal-line--visible' : ''}`}>
                <div className="exp-terminal-result-tags">
                  {recommendation.services.map(s => (
                    <span key={s} className="exp-terminal-tag">{s}</span>
                  ))}
                </div>
              </div>
              <div className={`exp-terminal-line${resultLines >= 5 ? ' exp-terminal-line--visible' : ''}`}>
                <a href={BRAINSTORM_HREF} onClick={(e) => {
                  posthog.capture('finder_cta_clicked', {
                    cta_text: recommendation.cta,
                    role: roles.find(r => r.id === selectedRole)?.label,
                    journey: journeys.find(j => j.id === selectedJourney)?.label,
                    recommendation: recommendation.title,
                  })
                  openBrainstormEmail(e)
                }} className="exp-btn-filled" style={{ marginTop: 16 }}>
                  {recommendation.cta} <ArrowIcon />
                </a>
              </div>
              <button className="exp-terminal-reset" onClick={() => {
                posthog.capture('finder_reset', {
                  role: roles.find(r => r.id === selectedRole)?.label,
                  journey: journeys.find(j => j.id === selectedJourney)?.label,
                })
                handleReset()
              }}>
                {isVariant ? FINDER_VARIANT.resetLabel : '> reset'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
