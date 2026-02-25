'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import IntroAnimation from './components/IntroAnimation'
// AsciiVideoCanvas now integrated into IntroAnimation for seamless P logo -> flower transition
import TeamGrid from './components/TeamGrid'
import ServiceIcon from './components/AsciiIcon'
import GlitchImage, { type GlitchImageHandle } from './components/GlitchImage'
import TerminalText from './components/TerminalText'

const testimonials = [
  {
    videoId: 'rDV_iqkWzHY', // Replace with actual YouTube video ID
    quote: "They've gone beyond just a number of engineers that I'm outsourcing AI for. They truly have been a thought partner, someone that's been very dependable and someone who helped us shape our strategy.",
    author: "Dipak Patel",
    role: "CEO of Globo"
  },
  {
    videoId: 'rDV_iqkWzHY', // Replace with actual YouTube video ID
    quote: "Progression Labs transformed our approach to AI implementation. Their team delivered beyond our expectations and helped us achieve results we didn't think were possible.",
    author: "Sarah Chen",
    role: "CTO of TechVentures"
  },
  {
    videoId: 'rDV_iqkWzHY', // Replace with actual YouTube video ID
    quote: "Working with Progression Labs has been a game-changer. They brought deep expertise and a collaborative approach that made all the difference in our AI journey.",
    author: "Michael Roberts",
    role: "VP Engineering at DataFlow"
  }
]

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolledPastHero, setScrolledPastHero] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [introComplete, setIntroComplete] = useState(false)
  const [comparisonInView, setComparisonInView] = useState(false)
  const [servicesInView, setServicesInView] = useState(false)
  const [caseStudiesInView, setCaseStudiesInView] = useState(false)
  const [teamInView, setTeamInView] = useState(false)
  const [blogInView, setBlogInView] = useState(false)
  const [ctaInView, setCtaInView] = useState(false)
  const [bootTime, setBootTime] = useState('')
  const [activeSection, setActiveSection] = useState('hero')
  const comparisonRef = useRef<HTMLDivElement>(null)
  const servicesRef = useRef<HTMLDivElement>(null)
  const caseStudiesRef = useRef<HTMLDivElement>(null)
  const teamRef = useRef<HTMLDivElement>(null)
  const blogRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  // Service tile pixel reveal refs
  const serviceGlitchRefs = useRef<(GlitchImageHandle | null)[]>([])
  const serviceTileRefs = useRef<(HTMLDivElement | null)[]>([])

  // Testimonial pixel reveal refs
  const testimonialGlitchRefs = useRef<(GlitchImageHandle | null)[]>([])
  const testimonialVideoContainerRefs = useRef<(HTMLDivElement | null)[]>([])
  const testimonialRevealedRef = useRef(false)
  const testimonialRevealFnRef = useRef<((index: number) => any) | null>(null)
  const testimonialTimelineRef = useRef<any>(null)
  const gsapRef = useRef<any>(null)

  const serviceImages = [
    '/services/ai-expert.jpg',
    '/services/ai-builds.jpg',
    '/services/ai-transformation.jpg',
    '/services/ai-audit.jpg',
    '/services/project-surgery.jpg',
    '/services/ideation-sessions.jpg',
  ]

  // Trigger terminal scrambles when sections scroll into view (fire once)
  useEffect(() => {
    const sections: [React.RefObject<HTMLDivElement | null>, (v: boolean) => void][] = [
      [comparisonRef, setComparisonInView],
      [servicesRef, setServicesInView],
      [caseStudiesRef, setCaseStudiesInView],
      [teamRef, setTeamInView],
      [blogRef, setBlogInView],
      [ctaRef, setCtaInView],
    ]
    const observers: IntersectionObserver[] = []
    sections.forEach(([ref, setter]) => {
      const el = ref.current
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setter(true)
            obs.disconnect()
          }
        },
        { threshold: 0.05 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(obs => obs.disconnect())
  }, [])

  // Memoize callback to prevent useEffect re-runs in IntroAnimation
  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true)
  }, [])

  // Live clock for hero boot data
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Europe/London' })
      const date = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Europe/London' }).toUpperCase()
      setBootTime(`${time} GMT — ${date}`)
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  // System boot — synchronized clip-path wipe after intro completes
  useEffect(() => {
    if (!introComplete) return
    const initBoot = async () => {
      const gsap = (await import('gsap')).default
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.to('.global-sync-reveal', {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.8,
        ease: 'power3.inOut',
      })
      // Recalculate all ScrollTrigger positions after intro overlay clears
      setTimeout(() => ScrollTrigger.refresh(), 1000)
    }
    initBoot()
  }, [introComplete])

  // Track scroll position for nav styling + active section
  useEffect(() => {
    const sectionIds = ['blog', 'team', 'case-studies', 'services', 'comparison', 'hero']
    const handleScroll = () => {
      const heroHeight = window.innerHeight
      setScrolledPastHero(window.scrollY > heroHeight - 100)

      // Scroll-spy: find which section is currently in view
      const offset = 200
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top < offset) {
          setActiveSection(id)
          break
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Dynamic import for GSAP to avoid SSR issues
    const initAnimations = async () => {
      const gsap = (await import('gsap')).default
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')

      gsap.registerPlugin(ScrollTrigger)

      gsap.defaults({
        ease: 'power2.out',
        duration: 0.8
      })

      // Hero image — subtle scale-in (text is handled by boot wipe)
      gsap.fromTo('.hero-image',
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1.2, delay: 0.3, ease: 'back.out(1.2)' }
      )

      // Fade up animations — smooth easing, play once
      const fadeUpElements = document.querySelectorAll('.fade-up:not(.hero-title):not(.hero-subtitle):not(.hero-actions)')
      fadeUpElements.forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        )
      })

      // Section titles — clip-path wipe left-to-right, play once
      document.querySelectorAll('.section-title-reveal').forEach((el) => {
        gsap.fromTo(el,
          { clipPath: 'inset(0 100% 0 0)' },
          {
            clipPath: 'inset(0 0% 0 0)',
            duration: 0.8,
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        )
      })

      // Fade in animations, play once
      document.querySelectorAll('.fade-in').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.8,
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        )
      })

      // Service tiles — L-shaped scan bar + pixel reveal choreography
      const serviceTiles = document.querySelectorAll('.service-tile')
      if (serviceTiles.length) {
        serviceTiles.forEach((tile, i) => {
          const textEl = tile.querySelector('.service-tile-text')
          const scanBar = tile.querySelector('.service-tile-scan-bar') as HTMLElement
          const glitchHandle = serviceGlitchRefs.current[i]

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: tile,
              start: 'top 85%',
              toggleActions: 'play none none none'
            },
            delay: i * 0.15
          })

          // 1. Fade tile in
          tl.fromTo(tile,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
            0
          )

          // 2. L-shaped scan bar — Phase 1: horizontal across top edge
          if (scanBar) {
            tl.set(scanBar, { top: 0, left: '0%', right: 'auto', width: 3, height: 3, opacity: 1 }, 0.2)
            tl.to(scanBar, { left: '100%', duration: 0.6, ease: 'power2.inOut' }, 0.2)

            // Phase 2: snap to right edge, drop vertical
            tl.set(scanBar, { left: 'auto', right: 0, top: '0%', width: 3, height: 0 }, 0.8)
            tl.to(scanBar, { height: '100%', duration: 0.6, ease: 'power2.inOut' }, 0.8)

            // Fade out after L-path completes
            tl.to(scanBar, { opacity: 0, duration: 0.2 }, 1.35)
          }

          // 3. Pixel reveal fires AFTER scan bar completes
          if (glitchHandle) {
            tl.fromTo(glitchHandle, { progress: 0 }, {
              progress: 1,
              duration: 1.2,
              ease: 'power2.inOut'
            }, 1.2)
          }

          // 4. Text clip-path wipe reveal (slightly after pixel reveal starts)
          if (textEl) {
            tl.fromTo(textEl,
              { clipPath: 'inset(0 0 0 100%)' },
              { clipPath: 'inset(0 0 0 0%)', duration: 1, ease: 'power3.inOut' },
              1.3
            )
          }
        })
      }

      // Slide animations — smooth
      document.querySelectorAll('.slide-left').forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            delay: i * 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        )
      })

      document.querySelectorAll('.slide-right').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, x: 20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        )
      })

      // === Comparison Section Choreography ===
      const comparisonSection = document.querySelector('#comparison')
      if (comparisonSection) {
        const compTl = gsap.timeline({
          scrollTrigger: {
            trigger: comparisonSection,
            start: 'top 65%',
            toggleActions: 'play none none none'
          }
        })

        // Phase 1a — Legacy SVG: "The Bureaucracy Builds" (0.0s → 1.4s)
        compTl
          // Company circle fades in
          .fromTo('.legacy-company',
            { opacity: 0, scale: 0.8, transformOrigin: '55px 70px' },
            { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' },
            0
          )
          // Dashed arrow draws in
          .fromTo('.legacy-arrow',
            { opacity: 0 },
            { opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.inOut' },
            0.3
          )
          // Partner (tier 1) drops in
          .fromTo('.legacy-tier1',
            { opacity: 0, y: -20, transformOrigin: '220px 20px' },
            { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)' },
            0.5
          )
          // Tier 2 lines + managers
          .fromTo('.legacy-tier2-line',
            { opacity: 0 },
            { opacity: 1, duration: 0.3, stagger: 0.05 },
            0.7
          )
          .fromTo('.legacy-tier2',
            { opacity: 0, scale: 0, transformOrigin: 'center' },
            { opacity: 1, scale: 1, duration: 0.35, stagger: 0.08, ease: 'back.out(1.4)' },
            0.75
          )
          // Tier 3 lines + PMs — faster stagger
          .fromTo('.legacy-tier3-line',
            { opacity: 0 },
            { opacity: 1, duration: 0.25, stagger: 0.04 },
            0.9
          )
          .fromTo('.legacy-tier3',
            { opacity: 0, scale: 0, transformOrigin: 'center' },
            { opacity: 1, scale: 1, duration: 0.3, stagger: 0.06, ease: 'back.out(1.4)' },
            0.95
          )
          // Tier 4 lines + juniors — rapid = overwhelming
          .fromTo('.legacy-tier4-line',
            { opacity: 0 },
            { opacity: 1, duration: 0.2, stagger: 0.03 },
            1.1
          )
          .fromTo('.legacy-tier4',
            { opacity: 0, scale: 0, transformOrigin: 'center' },
            { opacity: 1, scale: 1, duration: 0.25, stagger: 0.04, ease: 'back.out(1.4)' },
            1.15
          )

        // Phase 1b — New Way SVG: "The Network Ignites" (0.3s → 1.6s)
        compTl
          // Engineers scale in with elastic snap
          .fromTo('.newway-engineer',
            { opacity: 0, scale: 0, transformOrigin: 'center' },
            { opacity: 1, scale: 1, duration: 0.5, stagger: 0.15, ease: 'elastic.out(1, 0.6)' },
            0.3
          )
          // Connection lines draw between engineers
          .fromTo('.newway-connection',
            { opacity: 0 },
            { opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out' },
            0.8
          )
          // AI connector lines appear
          .fromTo('.newway-ai-line',
            { opacity: 0 },
            { opacity: 0.7, duration: 0.3, stagger: 0.04 },
            1.0
          )
          // AI diamonds snap into place with aggressive overshoot
          .fromTo('.newway-ai-node',
            { opacity: 0, scale: 0, transformOrigin: 'center' },
            { opacity: 1, scale: 1, duration: 0.4, stagger: 0.06, ease: 'back.out(2.0)' },
            1.1
          )

        // AI node pulse animation (ambient, starts at 1.6s)
        compTl.add(() => {
          gsap.to('.newway-ai-node', {
            opacity: 0.6,
            duration: 1,
            stagger: 0.3,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
          })
        }, 1.6)

        // Phase 2 — Bullet Points: "Bish Bish Bish Bish" (1.6s → 2.5s)
        // Left column (legacy red X items) — slide from left with blur
        compTl.fromTo('.legacy-item',
          { opacity: 0, x: -30, filter: 'blur(4px)' },
          { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.45, stagger: 0.10, ease: 'back.out(1.7)' },
          1.6
        )
        // Right column (new way green check items) — slide from right with blur
        compTl.fromTo('.newway-item',
          { opacity: 0, x: 30, filter: 'blur(4px)' },
          { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.45, stagger: 0.10, ease: 'back.out(1.7)' },
          1.75 // 0.15s offset from left column = zipper pattern
        )

        // Phase 3 — Ambient glow on New Way card
        compTl.add(() => {
          gsap.to('.new-way-card', {
            boxShadow: '0 0 60px rgba(59,130,246,0.15)',
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
          })
        }, 2.5)

        // Continuous loop animations after timeline completes
        compTl.eventCallback('onComplete', () => {
          // Legacy SVG — "Bureaucratic Chaos"
          // Tier 4 juniors: aggressive flickering (overwhelmed)
          gsap.to('.legacy-tier4', {
            opacity: 0.3,
            duration: 0.8,
            stagger: { each: 0.1, repeat: -1, yoyo: true },
            ease: 'power1.inOut'
          })
          // Tier 3 PMs: visible wobble (stressed)
          gsap.to('.legacy-tier3', {
            scale: 1.15,
            rotation: 5,
            duration: 1.2,
            stagger: { each: 0.2, repeat: -1, yoyo: true },
            ease: 'sine.inOut',
            transformOrigin: 'center'
          })
          // Tier 2 managers: slow drift (disconnected)
          gsap.to('.legacy-tier2', {
            y: '+=4',
            x: '+=2',
            duration: 2,
            stagger: { each: 0.5, repeat: -1, yoyo: true },
            ease: 'sine.inOut',
            transformOrigin: 'center'
          })
          // Company circle: heavy breathing pulse
          gsap.to('.legacy-company circle', {
            scale: 1.04,
            duration: 2.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            transformOrigin: '55px 70px'
          })
          // Legacy arrows: fade in and out (unreliable connection)
          gsap.to('.legacy-arrow', {
            opacity: 0.3,
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
          })

          // New Way SVG — "Network Alive & Thriving"
          // Connection lines: fast data flowing
          gsap.to('.newway-connection', {
            strokeDashoffset: -24,
            duration: 1.2,
            repeat: -1,
            ease: 'none'
          })
          // Engineer circles: orbital float
          gsap.to('.newway-engineer', {
            y: '+=6',
            duration: 1.8,
            stagger: { each: 0.3, repeat: -1, yoyo: true },
            ease: 'sine.inOut'
          })
          // AI diamonds: energetic pulse + rotation
          gsap.to('.newway-ai-node', {
            scale: 1.2,
            rotation: 10,
            duration: 1,
            stagger: { each: 0.15, repeat: -1, yoyo: true },
            ease: 'sine.inOut',
            transformOrigin: 'center'
          })
          // AI lines: shimmer effect
          gsap.to('.newway-ai-line', {
            opacity: 1,
            duration: 0.8,
            stagger: { each: 0.1, repeat: -1, yoyo: true },
            ease: 'power1.inOut'
          })
        })
      }

      // === Team Grid — L-shaped scan bar + Pixel Dissolve Reveal ===
      const teamCards = document.querySelectorAll('.team-card')
      teamCards.forEach((card, i) => {
        const blocks = card.querySelectorAll('.pixel-block')
        const scanEdge = card.querySelector('.team-card-scan-edge') as HTMLElement

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          delay: i * 0.2
        })

        // 1. Fade card in
        tl.fromTo(card,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
          0
        )

        // 2. L-shaped scan bar — Phase 1: horizontal across top edge
        if (scanEdge) {
          tl.set(scanEdge, { top: 0, left: '0%', right: 'auto', width: 3, height: 3, opacity: 1 }, 0.2)
          tl.to(scanEdge, { left: '100%', duration: 0.5, ease: 'power2.inOut' }, 0.2)

          // Phase 2: snap to right edge, drop vertical
          tl.set(scanEdge, { left: 'auto', right: 0, top: '0%', width: 3, height: 0 }, 0.7)
          tl.to(scanEdge, { height: '100%', duration: 0.5, ease: 'power2.inOut' }, 0.7)

          // Fade out after L-path completes
          tl.to(scanEdge, { opacity: 0, duration: 0.15 }, 1.15)
        }

        // 3. Pixel dissolve — fires AFTER scan bar completes
        tl.to(blocks, {
          opacity: 0,
          duration: 0.015,
          stagger: 1.0 / blocks.length,
          ease: 'none'
        }, 1.0)
      })

      // Resource cards stagger
      const resourceCards = document.querySelectorAll('.resource-card')
      if (resourceCards.length) {
        gsap.fromTo(resourceCards,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: resourceCards[0],
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        )
      }

      // Testimonial video — scanner bar + pixel reveal
      gsapRef.current = gsap
      const testimonialSection = document.querySelector('#case-studies')
      if (testimonialSection) {
        const playTestimonialReveal = (index: number) => {
          // Kill any in-flight timeline to prevent overlap
          if (testimonialTimelineRef.current) {
            testimonialTimelineRef.current.kill()
          }

          const container = testimonialVideoContainerRefs.current[index]
          const glitchHandle = testimonialGlitchRefs.current[index]
          const scannerEl = container?.querySelector('.testimonial-video-scanner')
          const overlayEl = container?.querySelector('.testimonial-video-overlay')
          const iframeEl = container?.querySelector('iframe')

          if (!container || !glitchHandle) return

          // Reset state
          if (overlayEl) gsap.set(overlayEl, { opacity: 1, pointerEvents: 'auto' })
          if (iframeEl) gsap.set(iframeEl, { opacity: 0 })
          glitchHandle.progress = 0

          const tl = gsap.timeline()
          testimonialTimelineRef.current = tl

          // 1. Scanner bar sweeps left → right
          if (scannerEl) {
            tl.fromTo(scannerEl,
              { left: '0%', opacity: 1, scaleY: 1 },
              { left: '100%', opacity: 1, duration: 1.2, ease: 'power2.inOut' },
              0
            )
            tl.to(scannerEl, { opacity: 0, duration: 0.15 }, '-=0.15')
          }

          // 2. Pixel reveal follows the scanner
          tl.fromTo(glitchHandle,
            { progress: 0 },
            { progress: 1, duration: 1.4, ease: 'power2.inOut' },
            0.1
          )

          // 3. After reveal, crossfade to interactive iframe
          if (overlayEl && iframeEl) {
            tl.to(iframeEl, { opacity: 1, duration: 0.3 }, '-=0.3')
            tl.to(overlayEl, { opacity: 0, pointerEvents: 'none', duration: 0.3 }, '-=0.3')
          }

          return tl
        }

        // Store on ref for carousel useEffect
        testimonialRevealFnRef.current = playTestimonialReveal

        // Scroll-triggered reveal (plays once)
        ScrollTrigger.create({
          trigger: testimonialSection,
          start: 'top 75%',
          once: true,
          onEnter: () => {
            testimonialRevealedRef.current = true
            playTestimonialReveal(activeTestimonial)
          }
        })
      }

    }

    initAnimations()
  }, [])

  // Replay pixel reveal when carousel changes
  useEffect(() => {
    if (!testimonialRevealedRef.current) return
    const play = testimonialRevealFnRef.current
    if (play) {
      // Small delay to let the CSS transition start positioning the card
      const timer = setTimeout(() => play(activeTestimonial), 100)
      return () => clearTimeout(timer)
    }
  }, [activeTestimonial])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* Intro Animation - stays mounted to provide dither background */}
      <IntroAnimation onComplete={handleIntroComplete} />

      {/* Navigation */}
      <nav className={`nav nav-black ${introComplete ? 'intro-visible' : 'intro-hidden'}`} id="nav">
        <div className="nav-container">
          <a href="/" className="nav-logo global-sync-reveal" aria-label="Progression Labs home">
            <Image src="/logo-white.png" alt="Progression Labs" className="nav-logo-img" width={42} height={28} />
            <span className="nav-wordmark"><TerminalText trigger={introComplete} duration={700}>Progression Labs</TerminalText></span>
          </a>

          <div className="nav-links global-sync-reveal">
            <a href="#hero" className={activeSection === 'hero' ? 'nav-active' : ''}><TerminalText trigger={introComplete} duration={700}>Home</TerminalText></a>
            <a href="#services" className={activeSection === 'services' || activeSection === 'comparison' ? 'nav-active' : ''}><TerminalText trigger={introComplete} duration={700}>Services</TerminalText></a>
            <a href="#case-studies" className={activeSection === 'case-studies' ? 'nav-active' : ''}><TerminalText trigger={introComplete} duration={700}>Case Studies</TerminalText></a>
            <a href="#team" className={activeSection === 'team' ? 'nav-active' : ''}><TerminalText trigger={introComplete} duration={700}>Team</TerminalText></a>
            <a href="#blog" className={activeSection === 'blog' ? 'nav-active' : ''}><TerminalText trigger={introComplete} duration={700}>Blog</TerminalText></a>
          </div>

          <div className="nav-actions">
          </div>

          <button className="nav-mobile-toggle" id="mobile-toggle" aria-label="Toggle menu" onClick={toggleMobileMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`} id="mobile-menu">
        <a href="#hero" onClick={closeMobileMenu}>Home</a>
        <a href="#services" onClick={closeMobileMenu}>Services</a>
        <a href="#case-studies" onClick={closeMobileMenu}>Case Studies</a>
        <a href="#team" onClick={closeMobileMenu}>Team</a>
        <a href="#blog" onClick={closeMobileMenu}>Blog</a>
      </div>

      {/* Announcement Bar */}
      <div className="announcement-bar global-sync-reveal">
        <div className="announcement-bar-content">
          <span className="announcement-bar-text"><TerminalText trigger={introComplete} duration={800}>New: AI Agent Platform now available for enterprise</TerminalText></span>
          <a href="#contact" className="announcement-bar-link"><TerminalText trigger={introComplete} duration={700}>Learn more →</TerminalText></a>
        </div>
      </div>

      {/* Hero Section - Fullscreen */}
      <section className="hero-fullscreen" id="hero">
        <div className="hero-fullscreen-inner">
          <div className={`hero-fullscreen-content blueprint-box ${introComplete ? 'intro-visible' : 'intro-hidden'}`}>
            <TerminalText as="h1" className="hero-dark-title global-sync-reveal" trigger={introComplete} duration={900}>Turn your company into a leader in the age of AI</TerminalText>
            <p className="hero-dark-subtitle global-sync-reveal"><TerminalText trigger={introComplete} duration={900}>We&apos;re a frontier AI-native engineering partner that helps companies in complex industries lead the next decade.</TerminalText></p>
            <div className="hero-dark-actions global-sync-reveal">
              <a href="#contact" className="btn btn-dark"><TerminalText trigger={introComplete} duration={700}>Request a brainstorm</TerminalText></a>
            </div>
          </div>
          <div className={`hero-image ${introComplete ? 'intro-visible' : 'intro-hidden'}`}>
            {/* Flower video is rendered by IntroAnimation canvas overlay */}
            <div style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
        {/* Boot data — bottom right */}
        <div className="hero-boot-data global-sync-reveal">
          {bootTime}
        </div>
      </section>

      {/* Comparison Section */}
      <section className="section grid-section" id="comparison">
        <div className="grid-container">
        <div className="container">
          <div ref={comparisonRef} className="section-header section-title-reveal" style={{ maxWidth: '600px', marginBottom: '60px' }}>
            <TerminalText as="h2" trigger={comparisonInView} duration={900}>We rebuilt consulting from scratch</TerminalText>
          </div>

          <div className="comparison-grid">
            {/* Old Approach */}
            <div className="comparison-card old blueprint-box" data-comparison="legacy">
              <h3 className="comparison-card-title">Legacy Model</h3>

              {/* Visual: Bloated org hierarchy — animated via GSAP */}
              <div className="comparison-visual">
                <svg width="320" height="140" viewBox="0 0 320 140" fill="none" className="legacy-svg">
                  {/* Your Company circle */}
                  <g className="legacy-company" style={{ opacity: 0.3 }}>
                    <circle cx="55" cy="70" r="50" fill="#9ca3af" stroke="#6b7280" strokeWidth="2"/>
                    <text x="55" y="64" textAnchor="middle" fontSize="14" fill="white" fontWeight="600">YOUR</text>
                    <text x="55" y="82" textAnchor="middle" fontSize="14" fill="white" fontWeight="600">CO.</text>
                  </g>

                  {/* Arrow */}
                  <line className="legacy-arrow" x1="110" y1="70" x2="145" y2="70" stroke="#ccc" strokeWidth="1.5" strokeDasharray="4,3" style={{ opacity: 0 }}/>
                  <polygon className="legacy-arrow" points="150,70 144,66 144,74" fill="#ccc" style={{ opacity: 0 }}/>

                  {/* Tier 1 - Partner */}
                  <circle className="legacy-tier1" cx="220" cy="20" r="10" fill="#999" stroke="#666" strokeWidth="1" style={{ opacity: 0.2 }}/>

                  {/* Tier 2 lines + managers */}
                  <line className="legacy-tier2-line" x1="220" y1="30" x2="180" y2="44" stroke="#ccc" strokeWidth="1" style={{ opacity: 0 }}/>
                  <line className="legacy-tier2-line" x1="220" y1="30" x2="260" y2="44" stroke="#ccc" strokeWidth="1" style={{ opacity: 0 }}/>
                  <circle className="legacy-tier2" cx="180" cy="52" r="8" fill="#aaa" stroke="#888" strokeWidth="1" style={{ opacity: 0 }}/>
                  <circle className="legacy-tier2" cx="260" cy="52" r="8" fill="#aaa" stroke="#888" strokeWidth="1" style={{ opacity: 0 }}/>

                  {/* Tier 3 lines + PMs */}
                  <line className="legacy-tier3-line" x1="180" y1="60" x2="160" y2="74" stroke="#ccc" strokeWidth="1" style={{ opacity: 0 }}/>
                  <line className="legacy-tier3-line" x1="180" y1="60" x2="195" y2="74" stroke="#ccc" strokeWidth="1" style={{ opacity: 0 }}/>
                  <line className="legacy-tier3-line" x1="260" y1="60" x2="245" y2="74" stroke="#ccc" strokeWidth="1" style={{ opacity: 0 }}/>
                  <line className="legacy-tier3-line" x1="260" y1="60" x2="280" y2="74" stroke="#ccc" strokeWidth="1" style={{ opacity: 0 }}/>
                  <circle className="legacy-tier3" cx="160" cy="80" r="6" fill="#bbb" stroke="#999" strokeWidth="1" style={{ opacity: 0 }}/>
                  <circle className="legacy-tier3" cx="195" cy="80" r="6" fill="#bbb" stroke="#999" strokeWidth="1" style={{ opacity: 0 }}/>
                  <circle className="legacy-tier3" cx="245" cy="80" r="6" fill="#bbb" stroke="#999" strokeWidth="1" style={{ opacity: 0 }}/>
                  <circle className="legacy-tier3" cx="280" cy="80" r="6" fill="#bbb" stroke="#999" strokeWidth="1" style={{ opacity: 0 }}/>

                  {/* Tier 4 lines + juniors */}
                  <line className="legacy-tier4-line" x1="160" y1="86" x2="152" y2="98" stroke="#ddd" strokeWidth="1" style={{ opacity: 0 }}/>
                  <line className="legacy-tier4-line" x1="160" y1="86" x2="168" y2="98" stroke="#ddd" strokeWidth="1" style={{ opacity: 0 }}/>
                  <line className="legacy-tier4-line" x1="195" y1="86" x2="187" y2="98" stroke="#ddd" strokeWidth="1" style={{ opacity: 0 }}/>
                  <line className="legacy-tier4-line" x1="195" y1="86" x2="203" y2="98" stroke="#ddd" strokeWidth="1" style={{ opacity: 0 }}/>
                  <line className="legacy-tier4-line" x1="245" y1="86" x2="237" y2="98" stroke="#ddd" strokeWidth="1" style={{ opacity: 0 }}/>
                  <line className="legacy-tier4-line" x1="245" y1="86" x2="253" y2="98" stroke="#ddd" strokeWidth="1" style={{ opacity: 0 }}/>
                  <line className="legacy-tier4-line" x1="280" y1="86" x2="272" y2="98" stroke="#ddd" strokeWidth="1" style={{ opacity: 0 }}/>
                  <line className="legacy-tier4-line" x1="280" y1="86" x2="288" y2="98" stroke="#ddd" strokeWidth="1" style={{ opacity: 0 }}/>
                  <circle className="legacy-tier4" cx="152" cy="104" r="5" fill="#ccc" stroke="#aaa" strokeWidth="1" style={{ opacity: 0 }}/>
                  <circle className="legacy-tier4" cx="168" cy="104" r="5" fill="#ccc" stroke="#aaa" strokeWidth="1" style={{ opacity: 0 }}/>
                  <circle className="legacy-tier4" cx="187" cy="104" r="5" fill="#ccc" stroke="#aaa" strokeWidth="1" style={{ opacity: 0 }}/>
                  <circle className="legacy-tier4" cx="203" cy="104" r="5" fill="#ccc" stroke="#aaa" strokeWidth="1" style={{ opacity: 0 }}/>
                  <circle className="legacy-tier4" cx="237" cy="104" r="5" fill="#ccc" stroke="#aaa" strokeWidth="1" style={{ opacity: 0 }}/>
                  <circle className="legacy-tier4" cx="253" cy="104" r="5" fill="#ccc" stroke="#aaa" strokeWidth="1" style={{ opacity: 0 }}/>
                  <circle className="legacy-tier4" cx="272" cy="104" r="5" fill="#ccc" stroke="#aaa" strokeWidth="1" style={{ opacity: 0 }}/>
                  <circle className="legacy-tier4" cx="288" cy="104" r="5" fill="#ccc" stroke="#aaa" strokeWidth="1" style={{ opacity: 0 }}/>
                </svg>
              </div>

              <div className="comparison-list legacy-list">
                <div className="comparison-item legacy-item" style={{ opacity: 0 }}>
                  <span className="comparison-item-icon negative">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 4L4 12M4 4l8 8"/>
                    </svg>
                  </span>
                  <span>Large teams with layers of project managers</span>
                </div>
                <div className="comparison-item legacy-item" style={{ opacity: 0 }}>
                  <span className="comparison-item-icon negative">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 4L4 12M4 4l8 8"/>
                    </svg>
                  </span>
                  <span>Bloated overhead eating into your budget</span>
                </div>
                <div className="comparison-item legacy-item" style={{ opacity: 0 }}>
                  <span className="comparison-item-icon negative">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 4L4 12M4 4l8 8"/>
                    </svg>
                  </span>
                  <span>Slow delivery, endless meetings</span>
                </div>
                <div className="comparison-item legacy-item" style={{ opacity: 0 }}>
                  <span className="comparison-item-icon negative">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 4L4 12M4 4l8 8"/>
                    </svg>
                  </span>
                  <span>Junior consultants learning on your dime</span>
                </div>
              </div>
            </div>

            {/* New Approach */}
            <div className="comparison-card new-way-card blueprint-box" data-comparison="newway">
              <h3 className="comparison-card-title">The New Way</h3>

              {/* Visual: Triangle team + AI agents — animated via GSAP */}
              <div className="comparison-visual">
                <svg width="240" height="140" viewBox="0 0 240 140" fill="none" className="newway-svg">
                  {/* Connection lines between team members */}
                  <line className="newway-connection" x1="120" y1="45" x2="70" y2="95" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3,3" style={{ opacity: 0.15 }}/>
                  <line className="newway-connection" x1="120" y1="45" x2="170" y2="95" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3,3" style={{ opacity: 0.15 }}/>
                  <line className="newway-connection" x1="70" y1="95" x2="170" y2="95" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3,3" style={{ opacity: 0.15 }}/>

                  {/* Top engineer */}
                  <circle className="newway-engineer" cx="120" cy="45" r="14" fill="#3b82f6" stroke="#2563eb" strokeWidth="2" style={{ opacity: 0.3 }}/>
                  {/* AI agent connectors */}
                  <line className="newway-ai-line" x1="108" y1="38" x2="88" y2="25" stroke="#c084fc" strokeWidth="1" strokeDasharray="2,2" style={{ opacity: 0 }}/>
                  <line className="newway-ai-line" x1="132" y1="38" x2="152" y2="25" stroke="#c084fc" strokeWidth="1" strokeDasharray="2,2" style={{ opacity: 0 }}/>
                  {/* AI agent diamonds */}
                  <g className="newway-ai-node" style={{ opacity: 0 }}>
                    <rect x="75" y="12" width="14" height="14" rx="2" fill="#a855f7" stroke="#9333ea" strokeWidth="1.5" transform="rotate(45 82 19)"/>
                    <text x="82" y="22" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">AI</text>
                  </g>
                  <g className="newway-ai-node" style={{ opacity: 0 }}>
                    <rect x="151" y="12" width="14" height="14" rx="2" fill="#a855f7" stroke="#9333ea" strokeWidth="1.5" transform="rotate(45 158 19)"/>
                    <text x="158" y="22" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">AI</text>
                  </g>

                  {/* Bottom-left engineer */}
                  <circle className="newway-engineer" cx="70" cy="95" r="12" fill="#3b82f6" stroke="#2563eb" strokeWidth="2" style={{ opacity: 0.3 }}/>
                  <line className="newway-ai-line" x1="60" y1="88" x2="40" y2="70" stroke="#c084fc" strokeWidth="1" strokeDasharray="2,2" style={{ opacity: 0 }}/>
                  <line className="newway-ai-line" x1="62" y1="105" x2="42" y2="120" stroke="#c084fc" strokeWidth="1" strokeDasharray="2,2" style={{ opacity: 0 }}/>
                  <g className="newway-ai-node" style={{ opacity: 0 }}>
                    <rect x="27" y="57" width="14" height="14" rx="2" fill="#a855f7" stroke="#9333ea" strokeWidth="1.5" transform="rotate(45 34 64)"/>
                    <text x="34" y="67" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">AI</text>
                  </g>
                  <g className="newway-ai-node" style={{ opacity: 0 }}>
                    <rect x="29" y="110" width="14" height="14" rx="2" fill="#a855f7" stroke="#9333ea" strokeWidth="1.5" transform="rotate(45 36 117)"/>
                    <text x="36" y="120" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">AI</text>
                  </g>

                  {/* Bottom-right engineer */}
                  <circle className="newway-engineer" cx="170" cy="95" r="12" fill="#3b82f6" stroke="#2563eb" strokeWidth="2" style={{ opacity: 0.3 }}/>
                  <line className="newway-ai-line" x1="180" y1="88" x2="200" y2="70" stroke="#c084fc" strokeWidth="1" strokeDasharray="2,2" style={{ opacity: 0 }}/>
                  <line className="newway-ai-line" x1="178" y1="105" x2="198" y2="120" stroke="#c084fc" strokeWidth="1" strokeDasharray="2,2" style={{ opacity: 0 }}/>
                  <g className="newway-ai-node" style={{ opacity: 0 }}>
                    <rect x="197" y="57" width="14" height="14" rx="2" fill="#a855f7" stroke="#9333ea" strokeWidth="1.5" transform="rotate(45 204 64)"/>
                    <text x="204" y="67" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">AI</text>
                  </g>
                  <g className="newway-ai-node" style={{ opacity: 0 }}>
                    <rect x="195" y="110" width="14" height="14" rx="2" fill="#a855f7" stroke="#9333ea" strokeWidth="1.5" transform="rotate(45 202 117)"/>
                    <text x="202" y="120" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">AI</text>
                  </g>
                </svg>
              </div>

              <div className="comparison-list newway-list">
                <div className="comparison-item newway-item" style={{ opacity: 0 }}>
                  <span className="comparison-item-icon positive">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 4L6 11L3 8"/>
                    </svg>
                  </span>
                  <span>Lean team of senior AI engineers</span>
                </div>
                <div className="comparison-item newway-item" style={{ opacity: 0 }}>
                  <span className="comparison-item-icon positive">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 4L6 11L3 8"/>
                    </svg>
                  </span>
                  <span>AI agents that multiply our output 10x</span>
                </div>
                <div className="comparison-item newway-item" style={{ opacity: 0 }}>
                  <span className="comparison-item-icon positive">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 4L6 11L3 8"/>
                    </svg>
                  </span>
                  <span>Ship fast, iterate faster</span>
                </div>
                <div className="comparison-item newway-item" style={{ opacity: 0 }}>
                  <span className="comparison-item-icon positive">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 4L6 11L3 8"/>
                    </svg>
                  </span>
                  <span>Direct access to experts, no middlemen</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Services */}
      <section className="section grid-section" id="services">
        <div className="grid-container">
          <div className="container">
            <div ref={servicesRef} className="section-header section-title-reveal" style={{ maxWidth: '700px', marginBottom: '60px' }}>
              <TerminalText as="h2" trigger={servicesInView} duration={900}>Wherever you are with AI, we meet you there</TerminalText>
            </div>

            <div className="services-grid-3col">
              {[
                { icon: 'expert' as const, num: '01', title: 'AI Expert', desc: 'On-demand access to senior AI engineers and strategists. We embed within your team to architect, build, and ship production AI — from LLM fine-tuning to agent orchestration.' },
                { icon: 'builds' as const, num: '02', title: 'AI Builds', desc: 'Full-stack AI product development from zero to production. Custom models, data pipelines, APIs, and interfaces — delivered as working software with ongoing support.' },
                { icon: 'transform' as const, num: '03', title: 'AI Transformation', desc: 'Strategic advisory for enterprise AI adoption. We assess, plan, and guide your organization through digital transformation — from roadmapping to change management.' },
                { icon: 'audit' as const, num: '04', title: 'AI Audit', desc: 'Deep-dive assessment of your AI readiness, current systems, and opportunities. We identify gaps, risks, and quick wins — delivering a prioritised roadmap in weeks, not months.' },
                { icon: 'surgery' as const, num: '05', title: 'Project Surgery', desc: 'When AI projects stall, we diagnose and fix. Our team parachutes in to rescue troubled implementations — refactoring models, fixing pipelines, and getting your project back on track.' },
                { icon: 'ideation' as const, num: '06', title: 'Ideation Sessions', desc: 'Structured workshops that turn business challenges into AI-powered solutions. We facilitate brainstorms with your team, prototype concepts live, and leave you with a concrete action plan.' },
              ].map((service, i) => (
                <div
                  key={service.num}
                  className="service-tile blueprint-box"
                  ref={(el) => { serviceTileRefs.current[i] = el }}
                  style={{ opacity: 0 }}
                >
                  <div className="service-tile-image">
                    <GlitchImage
                      ref={(el) => { serviceGlitchRefs.current[i] = el }}
                      imageUrl={serviceImages[i]}
                    />
                  </div>
                  <div className="service-tile-content">
                    <div className="service-tile-text">
                      <ServiceIcon icon={service.icon} className="service-icon-slot" />
                      <span className="service-number">{service.num}</span>
                      <TerminalText as="h3" trigger={servicesInView} duration={700}>{service.title}</TerminalText>
                      <TerminalText as="p" trigger={servicesInView} duration={800}>{service.desc}</TerminalText>
                      <a href="#" className="feature-row-link">Learn more &rarr;</a>
                    </div>
                    <div className="service-tile-scan-bar" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="section section-offwhite" id="case-studies">
        <div className="container">
          <div ref={caseStudiesRef} className="section-header section-title-reveal" style={{ maxWidth: '600px' }}>
            <TerminalText as="h2" trigger={caseStudiesInView} duration={900}>What our clients say</TerminalText>
          </div>

          <div className="testimonial-carousel fade-up">
            <button
              className="carousel-arrow carousel-arrow-left"
              onClick={() => setActiveTestimonial(prev => prev === 0 ? testimonials.length - 1 : prev - 1)}
              aria-label="Previous testimonial"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="testimonial-cards">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`testimonial-card ${index === activeTestimonial ? 'active' : ''}`}
                >
                  <div
                    className="testimonial-video blueprint-box-light"
                    ref={el => { testimonialVideoContainerRefs.current[index] = el }}
                  >
                    <iframe
                      src={`https://www.youtube.com/embed/${testimonial.videoId}`}
                      title={`${testimonial.author} testimonial`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                      style={{ opacity: 0 }}
                    />
                    <div className="testimonial-video-overlay">
                      <GlitchImage
                        ref={el => { testimonialGlitchRefs.current[index] = el }}
                        imageUrl={`https://img.youtube.com/vi/${testimonial.videoId}/maxresdefault.jpg`}
                      />
                    </div>
                    <div className="testimonial-video-scanner" />
                  </div>
                  <blockquote>&ldquo;{testimonial.quote}&rdquo;</blockquote>
                  <cite>— {testimonial.author}, {testimonial.role}</cite>
                </div>
              ))}
            </div>

            <button
              className="carousel-arrow carousel-arrow-right"
              onClick={() => setActiveTestimonial(prev => prev === testimonials.length - 1 ? 0 : prev + 1)}
              aria-label="Next testimonial"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="testimonial-dots">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`testimonial-dot ${index === activeTestimonial ? 'active' : ''}`}
                  onClick={() => setActiveTestimonial(index)}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section" id="team" style={{ background: 'var(--bg-warm)' }}>
        <div className="container">
          <div ref={teamRef} className="section-header section-title-reveal">
            <TerminalText as="h2" trigger={teamInView} duration={900}>The people behind Progression Labs</TerminalText>
            <TerminalText as="p" className="team-section-subtitle" trigger={teamInView} duration={800}>A lean team of senior engineers, researchers, and strategists.</TerminalText>
          </div>
        </div>
        <TeamGrid />
      </section>

      {/* Blog */}
      <section className="section section-offwhite" id="blog">
        <div className="container">
          <div ref={blogRef} className="section-header section-title-reveal">
            <TerminalText as="h2" trigger={blogInView} duration={900}>Latest thinking from our team</TerminalText>
          </div>

          <div className="resources-grid">
            <a href="#" className="resource-card fade-up blueprint-box-light">
              <span className="resource-category strategy">Strategy</span>
              <h4>The Business Case for Production-Ready AI Systems</h4>
              <p className="resource-meta">8 min read &middot; February 2026</p>
            </a>

            <a href="#" className="resource-card fade-up blueprint-box-light">
              <span className="resource-category technology">Technology</span>
              <h4>Digital Transformation in 2026: A Strategic Framework</h4>
              <p className="resource-meta">12 min read &middot; January 2026</p>
            </a>

            <a href="#" className="resource-card fade-up blueprint-box-light">
              <span className="resource-category case-study">Case Study</span>
              <h4>From AI Experimentation to Enterprise Operations</h4>
              <p className="resource-meta">6 min read &middot; January 2026</p>
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section" id="contact">
        <div className="container">
          <div ref={ctaRef} className="section-title-reveal blueprint-box" style={{ padding: '40px 32px', maxWidth: '600px' }}>
            <TerminalText as="h2" trigger={ctaInView} duration={900}>Ready to transform your business with AI?</TerminalText>
            <p>Whether you need strategic business consultancy, a managed AI platform, or custom technology solutions — our team of experts is ready to help you build AI systems that deliver real results.</p>
            <a href="mailto:hello@progressionlabs.com" className="cta-email">hello@progressionlabs.com</a>
            <div className="cta-actions" style={{ marginTop: '16px' }}>
              <a href="#" className="btn btn-primary btn-lg">Schedule a consultation</a>
              <a href="#" className="btn btn-ghost btn-lg">Request a demo</a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Image src="/logo-white.png" alt="Progression Labs" className="footer-logo-img" width={36} height={24} />
              <div className="footer-brand-name">Progression Labs</div>
              <p className="footer-brand-desc">AI consultancy and technology partner. We build production-ready artificial intelligence systems, provide strategic business advisory, and operate managed AI platforms for enterprise clients.</p>
              <a href="https://twitter.com/WeAreProgression" className="footer-social-handle" target="_blank" rel="noopener noreferrer">@WeAreProgression</a>
              <div className="footer-wap-tagline">WeAreProgression&trade; — Where strategy meets intelligence.</div>
            </div>

            <div className="footer-column">
              <h5>Services</h5>
              <a href="#services">Digital Transformation Advisory</a>
              <a href="#services">Business Intelligence &amp; Analytics</a>
              <a href="#services">Strategic AI Roadmapping</a>
              <a href="#services">AI Platform &amp; AIaaS</a>
              <a href="#services">Custom Software Development</a>
              <a href="#services">AI Research &amp; Consultancy</a>
            </div>

            <div className="footer-column">
              <h5>Platform</h5>
              <a href="#platform">AI Agent Orchestration</a>
              <a href="#platform">Data Pipeline Management</a>
              <a href="#platform">Analytics Dashboard</a>
              <a href="#platform">Integration Hub</a>
              <a href="#login">Log in</a>
              <a href="#">Documentation</a>
            </div>

            <div className="footer-column">
              <h5>Company</h5>
              <a href="#">About</a>
              <a href="#">Careers</a>
              <a href="#resources">Blog</a>
              <a href="#contact">Contact</a>
              <a href="#">Security</a>
              <a href="#">Status</a>
            </div>
          </div>

          <div className="footer-bottom">
            <span className="footer-copyright">&copy; 2026 Progression Labs. All rights reserved.</span>
            <div className="footer-legal">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
