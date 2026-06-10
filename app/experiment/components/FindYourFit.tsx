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
import { ROLES, JOURNEYS, RECOMMENDATIONS, RECOMMENDATIONS_VARIANT, FINDER_VARIANT, FIND_YOUR_FIT_FORM, CONTACT_EMAIL, type Role, type Journey } from '../data/siteContent'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

  // Inline "set up a call" form state (shown at the result step)
  const formCopy = isVariant ? FIND_YOUR_FIT_FORM.variant : FIND_YOUR_FIT_FORM.control
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formNote, setFormNote] = useState('')
  const [formHoneypot, setFormHoneypot] = useState('') // bots fill this; humans never see it
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const sectionRef = useRef<HTMLDivElement>(null)
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

      const el = sectionRef.current
      if (!el) return

      ctx = gsap.context(() => {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        if (prefersReduced) {
          gsap.set(el, { opacity: 1, filter: 'blur(0px)' })
          return
        }

        gsap.set(el, {
          opacity: 0.35,
          filter: 'blur(22px)',
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
          opacity: 0.35,
          filter: 'blur(22px)',
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
      setFormName('')
      setFormEmail('')
      setFormNote('')
      setFormHoneypot('')
      setFormState('idle')
    })
  }, [animateTransition])

  const recommendation = selectedRole && selectedJourney
    ? recommendations[`${selectedRole}-${selectedJourney}`]
    : null

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (formState === 'submitting') return
    // Honeypot: a filled hidden field means a bot — silently "succeed", send nothing.
    if (formHoneypot) { setFormState('success'); return }
    if (!EMAIL_RE.test(formEmail.trim())) { setFormState('error'); return }

    const roleLabel = roles.find(r => r.id === selectedRole)?.label || selectedRole || ''
    const journeyLabel = journeys.find(j => j.id === selectedJourney)?.label || selectedJourney || ''
    const rec = recommendation

    setFormState('submitting')
    posthog.capture('finder_form_submitted', {
      role: roleLabel,
      journey: journeyLabel,
      recommendation: rec?.title,
      has_note: !!formNote.trim(),
    })

    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_email: formEmail.trim(),
          name: formName.trim() || undefined,
          project_name: rec?.title,
          project_description: `${roleLabel} · ${journeyLabel} → ${rec?.title}. ${rec?.desc}`,
          message: formNote.trim() || undefined,
          source: 'find-your-fit-form',
          role: roleLabel,
          journey: journeyLabel,
          recommendation: rec?.title,
        }),
      })
      if (!res.ok) throw new Error(`intake ${res.status}`)
      setFormState('success')
    } catch {
      setFormState('error')
    }
  }, [formState, formHoneypot, formEmail, formName, formNote, selectedRole, selectedJourney, recommendation])

  return (
    <div ref={sectionRef} className="exp-12-grid exp-12-grid--half exp-finder">
      {/* Left column — Unicorn Studio WebGL canvas + text overlay */}
      <div ref={labelRef} className="exp-col-label exp-col-label--gradient exp-col-label--top">
        {/* WebGL pixel gradient canvas — sits behind text. solidAlpha forces
            alpha=1.0 so the shader's wavy partial-alpha fade can't expose its
            32px pixel grid; the .exp-fyf-bottom-fade div below handles the
            fade-to-black instead. */}
        <PixelGradientCanvas solidAlpha />
        {/* ASCII characters that appear with the shimmer sweep */}
        <FinderAsciiOverlay />
        {/* Dark gradient overlay over the bottom of the canvas — hides the
            chunky pixel structure where the shader fades to transparent.
            Mirrors the hero's .exp-hero-frame::before approach. */}
        <div className="exp-fyf-bottom-fade" aria-hidden="true" />
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
                {formState === 'success' ? (
                  <div className="exp-finder-form-success">
                    <span className="exp-terminal-caret">&gt;</span> {formCopy.success}
                  </div>
                ) : (
                  <form className="exp-finder-form" onSubmit={handleFormSubmit}>
                    <div className="exp-finder-form-heading">{formCopy.heading}</div>
                    <div className="exp-finder-form-sub">{formCopy.sub}</div>
                    {/* Honeypot — visually hidden; only bots fill it */}
                    <input
                      type="text"
                      name="company"
                      className="exp-finder-hp"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      value={formHoneypot}
                      onChange={(e) => setFormHoneypot(e.target.value)}
                    />
                    <div className="exp-finder-form-fields">
                      <input
                        type="text"
                        className="exp-finder-input"
                        placeholder="Your name"
                        autoComplete="name"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                      />
                      <input
                        type="email"
                        className="exp-finder-input"
                        placeholder="Work email"
                        autoComplete="email"
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                      />
                      <textarea
                        className="exp-finder-input exp-finder-textarea"
                        placeholder="Anything specific? (optional)"
                        rows={2}
                        value={formNote}
                        onChange={(e) => setFormNote(e.target.value)}
                      />
                    </div>
                    {formState === 'error' && (
                      <div className="exp-finder-form-error">
                        {formCopy.error}{' '}
                        <a href={BRAINSTORM_HREF} onClick={openBrainstormEmail} className="exp-finder-form-emaillink">
                          Email {CONTACT_EMAIL}
                        </a>
                      </div>
                    )}
                    <button
                      type="submit"
                      className="exp-btn-filled"
                      disabled={formState === 'submitting'}
                      style={{ marginTop: 4 }}
                    >
                      {formState === 'submitting' ? formCopy.sending : formCopy.submit} <ArrowIcon />
                    </button>
                    <div className="exp-finder-form-secondary">
                      or{' '}
                      <a href={BRAINSTORM_HREF} onClick={openBrainstormEmail} className="exp-finder-form-emaillink">
                        email us directly
                      </a>
                    </div>
                  </form>
                )}
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
