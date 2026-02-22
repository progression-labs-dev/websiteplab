'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import IntroAnimation from './components/IntroAnimation'
import VideoCarousel from './components/VideoCarousel'
import PixelVine from './components/PixelVine'
import TextScramble from './components/TextScramble'

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

  // Memoize callback to prevent useEffect re-runs in IntroAnimation
  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true)
  }, [])

  // Track scroll position for nav styling
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight
      setScrolledPastHero(window.scrollY > heroHeight - 100)
    }
    window.addEventListener('scroll', handleScroll)
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

      // Hero animations
      const heroTimeline = gsap.timeline({ delay: 0.2 })
      heroTimeline
        .fromTo('.hero-dark-title',
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
        )
        .fromTo('.hero-dark-subtitle',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.5'
        )
        .fromTo('.hero-dark-actions',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.4'
        )
        .fromTo('.hero-image',
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 1.2, ease: 'back.out(1.2)' },
          '-=0.8'
        )

      // Fade up animations — bouncy easing
      const fadeUpElements = document.querySelectorAll('.fade-up:not(.hero-title):not(.hero-subtitle):not(.hero-actions)')
      fadeUpElements.forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        )
      })

      // Fade in animations
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

      // Service tiles stagger
      const serviceTiles = document.querySelectorAll('.service-tile')
      if (serviceTiles.length) {
        gsap.fromTo(serviceTiles,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: serviceTiles[0],
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        )
      }

      // Slide animations — bouncy
      document.querySelectorAll('.slide-left').forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, x: -40 },
          {
            opacity: 1,
            x: 0,
            duration: 0.9,
            delay: i * 0.1,
            ease: 'back.out(1.2)',
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
          { opacity: 0, x: 40 },
          {
            opacity: 1,
            x: 0,
            duration: 0.9,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        )
      })

      // Metric count-up
      const metricValues = document.querySelectorAll('.metric-value')
      metricValues.forEach((el) => {
        const htmlEl = el as HTMLElement
        const target = parseFloat(htmlEl.dataset.count || '0')
        const suffix = htmlEl.dataset.suffix || ''
        const isDecimal = htmlEl.dataset.decimal === 'true'

        ScrollTrigger.create({
          trigger: el,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            const obj = { val: 0 }
            gsap.to(obj, {
              val: target,
              duration: 2.5,
              ease: 'elastic.out(1, 0.5)',
              onUpdate: () => {
                if (isDecimal) {
                  htmlEl.textContent = obj.val.toFixed(1) + suffix
                } else {
                  htmlEl.textContent = Math.round(obj.val) + suffix
                }
              }
            })
          }
        })
      })

      // Resource cards stagger
      const resourceCards = document.querySelectorAll('.resource-card')
      if (resourceCards.length) {
        gsap.fromTo(resourceCards,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: resourceCards[0],
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        )
      }

      // Mockup bars animation
      const mockupBars = document.querySelectorAll('.mockup-card-bar-fill')
      mockupBars.forEach((bar) => {
        const htmlBar = bar as HTMLElement
        const targetWidth = htmlBar.style.width
        htmlBar.style.width = '0%'

        ScrollTrigger.create({
          trigger: bar,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(bar, {
              width: targetWidth,
              duration: 1.2,
              ease: 'power2.out',
              delay: 0.3
            })
          }
        })
      })
    }

    initAnimations()
  }, [])

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

      {/* Pixel Vine — scroll-driven dither particles flowing down the page */}
      {introComplete && <PixelVine />}

      {/* Navigation */}
      <nav className={`nav nav-black ${introComplete ? 'intro-visible' : 'intro-hidden'}`} id="nav">
        <div className="nav-container">
          <a href="/" className="nav-logo" aria-label="Progression Labs home">
            <Image src="/logo-white.png" alt="Progression Labs" className="nav-logo-img" width={42} height={28} />
            <span className="nav-wordmark">Progression Labs</span>
          </a>

          <div className="nav-links">
            <a href="#hero">Home</a>
            <a href="#services">Services</a>
            <a href="#case-studies">Case Studies</a>
            <a href="#team">Team</a>
            <a href="#blog">Blog</a>
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
      <div className="announcement-bar">
        <div className="announcement-bar-content">
          <span className="announcement-bar-text">New: AI Agent Platform now available for enterprise</span>
          <a href="#contact" className="announcement-bar-link">Learn more &rarr;</a>
        </div>
      </div>

      {/* Hero Section - Fullscreen */}
      <section className="hero-fullscreen" id="hero">
        <div className={`hero-fullscreen-content ${introComplete ? 'intro-visible' : 'intro-hidden'}`}>
          <TextScramble tag="h1" text="Turn your company a leader in the age of AI" trigger="load" delay={300} duration={1400} className="hero-dark-title" triggerWhen={introComplete} />
          <p className="hero-dark-subtitle">We&#39;re a frontier AI-native engineering partner that helps companies in complex industries lead the next decade.</p>
          <div className="hero-dark-actions">
            <a href="#contact" className="btn btn-dark">Request a brainstorm</a>
          </div>
        </div>
        <div className={`hero-image ${introComplete ? 'intro-visible' : 'intro-hidden'}`}>
          <VideoCarousel isActive={introComplete} />
        </div>
      </section>

      {/* Comparison Section */}
      <section className="section section-offwhite" id="comparison">
        <div className="container">
          <div className="section-header fade-up" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 60px' }}>
            <p className="label">A Different Approach</p>
            <h2>We rebuilt consulting from scratch</h2>
          </div>

          <div className="comparison-grid">
            {/* Old Approach */}
            <div className="comparison-card old fade-up">
              <div className="comparison-card-header">
                <div className="comparison-icon old">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div>
                  <span className="comparison-card-label">Traditional Consulting</span>
                  <h3>Legacy Model</h3>
                </div>
              </div>

              {/* Visual: Bloated org hierarchy */}
              <div className="comparison-visual">
                <svg width="320" height="140" viewBox="0 0 320 140" fill="none">
                  {/* Your Company - on the left */}
                  <circle cx="55" cy="70" r="50" fill="#9ca3af" stroke="#6b7280" strokeWidth="2"/>
                  <text x="55" y="64" textAnchor="middle" fontSize="14" fill="white" fontWeight="600">YOUR</text>
                  <text x="55" y="82" textAnchor="middle" fontSize="14" fill="white" fontWeight="600">CO.</text>

                  {/* Arrow pointing to hierarchy */}
                  <line x1="110" y1="70" x2="145" y2="70" stroke="#ccc" strokeWidth="1.5" strokeDasharray="4,3"/>
                  <polygon points="150,70 144,66 144,74" fill="#ccc"/>

                  {/* Top level - Partner */}
                  <circle cx="220" cy="20" r="10" fill="#999" stroke="#666" strokeWidth="1"/>

                  {/* Second level - Senior Managers */}
                  <line x1="220" y1="30" x2="180" y2="44" stroke="#ccc" strokeWidth="1"/>
                  <line x1="220" y1="30" x2="260" y2="44" stroke="#ccc" strokeWidth="1"/>
                  <circle cx="180" cy="52" r="8" fill="#aaa" stroke="#888" strokeWidth="1"/>
                  <circle cx="260" cy="52" r="8" fill="#aaa" stroke="#888" strokeWidth="1"/>

                  {/* Third level - Project Managers */}
                  <line x1="180" y1="60" x2="160" y2="74" stroke="#ccc" strokeWidth="1"/>
                  <line x1="180" y1="60" x2="195" y2="74" stroke="#ccc" strokeWidth="1"/>
                  <line x1="260" y1="60" x2="245" y2="74" stroke="#ccc" strokeWidth="1"/>
                  <line x1="260" y1="60" x2="280" y2="74" stroke="#ccc" strokeWidth="1"/>
                  <circle cx="160" cy="80" r="6" fill="#bbb" stroke="#999" strokeWidth="1"/>
                  <circle cx="195" cy="80" r="6" fill="#bbb" stroke="#999" strokeWidth="1"/>
                  <circle cx="245" cy="80" r="6" fill="#bbb" stroke="#999" strokeWidth="1"/>
                  <circle cx="280" cy="80" r="6" fill="#bbb" stroke="#999" strokeWidth="1"/>

                  {/* Bottom level - Analysts/Juniors */}
                  <line x1="160" y1="86" x2="152" y2="98" stroke="#ddd" strokeWidth="1"/>
                  <line x1="160" y1="86" x2="168" y2="98" stroke="#ddd" strokeWidth="1"/>
                  <line x1="195" y1="86" x2="187" y2="98" stroke="#ddd" strokeWidth="1"/>
                  <line x1="195" y1="86" x2="203" y2="98" stroke="#ddd" strokeWidth="1"/>
                  <line x1="245" y1="86" x2="237" y2="98" stroke="#ddd" strokeWidth="1"/>
                  <line x1="245" y1="86" x2="253" y2="98" stroke="#ddd" strokeWidth="1"/>
                  <line x1="280" y1="86" x2="272" y2="98" stroke="#ddd" strokeWidth="1"/>
                  <line x1="280" y1="86" x2="288" y2="98" stroke="#ddd" strokeWidth="1"/>
                  <circle cx="152" cy="104" r="5" fill="#ccc" stroke="#aaa" strokeWidth="1"/>
                  <circle cx="168" cy="104" r="5" fill="#ccc" stroke="#aaa" strokeWidth="1"/>
                  <circle cx="187" cy="104" r="5" fill="#ccc" stroke="#aaa" strokeWidth="1"/>
                  <circle cx="203" cy="104" r="5" fill="#ccc" stroke="#aaa" strokeWidth="1"/>
                  <circle cx="237" cy="104" r="5" fill="#ccc" stroke="#aaa" strokeWidth="1"/>
                  <circle cx="253" cy="104" r="5" fill="#ccc" stroke="#aaa" strokeWidth="1"/>
                  <circle cx="272" cy="104" r="5" fill="#ccc" stroke="#aaa" strokeWidth="1"/>
                  <circle cx="288" cy="104" r="5" fill="#ccc" stroke="#aaa" strokeWidth="1"/>
                </svg>
              </div>

              <div className="comparison-list">
                <div className="comparison-item">
                  <span className="comparison-item-icon negative">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 4L4 12M4 4l8 8"/>
                    </svg>
                  </span>
                  <span>Large teams with layers of project managers</span>
                </div>
                <div className="comparison-item">
                  <span className="comparison-item-icon negative">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 4L4 12M4 4l8 8"/>
                    </svg>
                  </span>
                  <span>Bloated overhead eating into your budget</span>
                </div>
                <div className="comparison-item">
                  <span className="comparison-item-icon negative">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 4L4 12M4 4l8 8"/>
                    </svg>
                  </span>
                  <span>Slow delivery, endless meetings</span>
                </div>
                <div className="comparison-item">
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
            <div className="comparison-card fade-up">
              <div className="comparison-card-header">
                <div className="comparison-icon new">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div>
                  <span className="comparison-card-label">Progression Labs</span>
                  <h3>The New Way</h3>
                </div>
              </div>

              {/* Visual: Triangle team + AI agents per person */}
              <div className="comparison-visual">
                <svg width="240" height="140" viewBox="0 0 240 140" fill="none">
                  {/* Connection lines between team members */}
                  <line x1="120" y1="45" x2="70" y2="95" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3,3"/>
                  <line x1="120" y1="45" x2="170" y2="95" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3,3"/>
                  <line x1="70" y1="95" x2="170" y2="95" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3,3"/>

                  {/* Top engineer - with 2 AI agents */}
                  <circle cx="120" cy="45" r="14" fill="#3b82f6" stroke="#2563eb" strokeWidth="2"/>
                  <line x1="108" y1="38" x2="88" y2="25" stroke="#c084fc" strokeWidth="1" strokeDasharray="2,2" opacity="0.7"/>
                  <line x1="132" y1="38" x2="152" y2="25" stroke="#c084fc" strokeWidth="1" strokeDasharray="2,2" opacity="0.7"/>
                  <g className="ai-node">
                    <rect x="75" y="12" width="14" height="14" rx="2" fill="#a855f7" stroke="#9333ea" strokeWidth="1.5" transform="rotate(45 82 19)"/>
                    <text x="82" y="22" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">AI</text>
                  </g>
                  <g className="ai-node">
                    <rect x="151" y="12" width="14" height="14" rx="2" fill="#a855f7" stroke="#9333ea" strokeWidth="1.5" transform="rotate(45 158 19)"/>
                    <text x="158" y="22" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">AI</text>
                  </g>

                  {/* Bottom-left engineer - with 2 AI agents */}
                  <circle cx="70" cy="95" r="12" fill="#3b82f6" stroke="#2563eb" strokeWidth="2"/>
                  <line x1="60" y1="88" x2="40" y2="70" stroke="#c084fc" strokeWidth="1" strokeDasharray="2,2" opacity="0.7"/>
                  <line x1="62" y1="105" x2="42" y2="120" stroke="#c084fc" strokeWidth="1" strokeDasharray="2,2" opacity="0.7"/>
                  <g className="ai-node">
                    <rect x="27" y="57" width="14" height="14" rx="2" fill="#a855f7" stroke="#9333ea" strokeWidth="1.5" transform="rotate(45 34 64)"/>
                    <text x="34" y="67" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">AI</text>
                  </g>
                  <g className="ai-node">
                    <rect x="29" y="110" width="14" height="14" rx="2" fill="#a855f7" stroke="#9333ea" strokeWidth="1.5" transform="rotate(45 36 117)"/>
                    <text x="36" y="120" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">AI</text>
                  </g>

                  {/* Bottom-right engineer - with 2 AI agents */}
                  <circle cx="170" cy="95" r="12" fill="#3b82f6" stroke="#2563eb" strokeWidth="2"/>
                  <line x1="180" y1="88" x2="200" y2="70" stroke="#c084fc" strokeWidth="1" strokeDasharray="2,2" opacity="0.7"/>
                  <line x1="178" y1="105" x2="198" y2="120" stroke="#c084fc" strokeWidth="1" strokeDasharray="2,2" opacity="0.7"/>
                  <g className="ai-node">
                    <rect x="197" y="57" width="14" height="14" rx="2" fill="#a855f7" stroke="#9333ea" strokeWidth="1.5" transform="rotate(45 204 64)"/>
                    <text x="204" y="67" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">AI</text>
                  </g>
                  <g className="ai-node">
                    <rect x="195" y="110" width="14" height="14" rx="2" fill="#a855f7" stroke="#9333ea" strokeWidth="1.5" transform="rotate(45 202 117)"/>
                    <text x="202" y="120" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">AI</text>
                  </g>
                </svg>
              </div>

              <div className="comparison-list">
                <div className="comparison-item">
                  <span className="comparison-item-icon positive">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 4L6 11L3 8"/>
                    </svg>
                  </span>
                  <span>Lean team of senior AI engineers</span>
                </div>
                <div className="comparison-item">
                  <span className="comparison-item-icon positive">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 4L6 11L3 8"/>
                    </svg>
                  </span>
                  <span>AI agents that multiply our output 10x</span>
                </div>
                <div className="comparison-item">
                  <span className="comparison-item-icon positive">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 4L6 11L3 8"/>
                    </svg>
                  </span>
                  <span>Ship fast, iterate faster</span>
                </div>
                <div className="comparison-item">
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
      </section>

      {/* Services */}
      <section className="section grid-section" id="services">
        <div className="grid-container">
          <div className="container">
            <div className="section-header fade-up" style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 60px' }}>
              <p className="label">What we do</p>
              <TextScramble tag="h2" text="Wherever you are with AI, we meet you there" trigger="inView" duration={1000} />
            </div>

            <div className="services-grid-3col">
              {/* Service 1: AI Expert */}
              <div className="service-tile fade-up">
                <pre className="service-ascii-icon">{`
  ┌─────────┐
  │ ◉  ◉  ◉ │
  │ ╠══╬══╣ │
  │ ║ AI  ║ │
  │ ╚═════╝ │
  └─────────┘
                `}</pre>
                <span className="service-number">01</span>
                <h3>AI Expert</h3>
                <p>On-demand access to senior AI engineers and strategists. We embed within your team to architect, build, and ship production AI — from LLM fine-tuning to agent orchestration.</p>
                <a href="#" className="feature-row-link">Learn more &rarr;</a>
              </div>

              {/* Service 2: AI Builds */}
              <div className="service-tile fade-up">
                <pre className="service-ascii-icon">{`
  ┌─────────┐
  │ ▓▓▓░░░░ │
  │ ████▓▓░ │
  │ ███████ │
  │ ▓▓▓▓▓▓▓ │
  └─────────┘
                `}</pre>
                <span className="service-number">02</span>
                <h3>AI Builds</h3>
                <p>Full-stack AI product development from zero to production. Custom models, data pipelines, APIs, and interfaces — delivered as working software with ongoing support.</p>
                <a href="#" className="feature-row-link">Learn more &rarr;</a>
              </div>

              {/* Service 3: AI Transformation */}
              <div className="service-tile fade-up">
                <pre className="service-ascii-icon">{`
  ┌─────────┐
  │ ○───→ ● │
  │ │     ↓ │
  │ ◇ ←── ◆ │
  │ ↓       │
  └─────────┘
                `}</pre>
                <span className="service-number">03</span>
                <h3>AI Transformation</h3>
                <p>Strategic advisory for enterprise AI adoption. We assess, plan, and guide your organization through digital transformation — from roadmapping to change management.</p>
                <a href="#" className="feature-row-link">Learn more &rarr;</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="section grid-section" id="case-studies">
        <div className="grid-container">
        <div className="container">
          <div className="section-header fade-up" style={{ textAlign: 'center', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
            <p className="label">Case Studies</p>
            <TextScramble tag="h2" text="Measurable impact across every engagement" trigger="inView" duration={1000} />
          </div>

          <div className="metrics-grid">
            <div className="metric-card fade-up">
              <div className="metric-value" data-count="50" data-suffix="+">0</div>
              <div className="metric-label">Enterprise clients across 12 industries</div>
            </div>
            <div className="metric-card fade-up">
              <div className="metric-value" data-count="3.2" data-suffix="x" data-decimal="true">0</div>
              <div className="metric-label">Average ROI within first 12 months</div>
            </div>
            <div className="metric-card fade-up">
              <div className="metric-value" data-count="47" data-suffix="%">0</div>
              <div className="metric-label">Reduction in operational costs through AI automation</div>
            </div>
            <div className="metric-card fade-up">
              <div className="metric-value" data-count="99.9" data-suffix="%" data-decimal="true">0</div>
              <div className="metric-label">Platform uptime SLA</div>
            </div>
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
                  <div className="testimonial-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${testimonial.videoId}`}
                      title={`${testimonial.author} testimonial`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
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
        </div>
      </section>

      {/* Team */}
      <section className="section grid-section" id="team">
        <div className="container">
          <div className="platform-content">
            <div className="platform-text">
              <p className="label fade-up">Our Team</p>
              <TextScramble tag="h2" text="The people behind Progression Labs" trigger="inView" duration={1000} className="fade-up" />
              <p className="fade-up">Technology consultation, computer technology consultancy, and AI-powered analytics — unified in a single platform. Monitor, deploy, and scale your AI systems with confidence.</p>

              <div className="platform-features">
                <div className="platform-feature slide-left">
                  <div className="platform-feature-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="5" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/><circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/><line x1="7" y1="7" x2="9" y2="9" stroke="currentColor" strokeWidth="1.5"/></svg>
                  </div>
                  <div>
                    <h4>AI Agent Orchestration</h4>
                    <p>Design, deploy, and monitor AI agents across your organization with full observability and control.</p>
                  </div>
                </div>

                <div className="platform-feature slide-left">
                  <div className="platform-feature-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                  <div>
                    <h4>Data Pipeline Management</h4>
                    <p>Automated data processing, machine learning model management, and continuous training pipelines.</p>
                  </div>
                </div>

                <div className="platform-feature slide-left">
                  <div className="platform-feature-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><polyline points="4,10 7,6 10,8 13,4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <h4>Analytics Dashboard</h4>
                    <p>Business analytics, performance monitoring, and real-time reporting for all your AI operations.</p>
                  </div>
                </div>

                <div className="platform-feature slide-left">
                  <div className="platform-feature-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><line x1="7" y1="8" x2="9" y2="8" stroke="currentColor" strokeWidth="1.5"/></svg>
                  </div>
                  <div>
                    <h4>Integration Hub</h4>
                    <p>Connect to 200+ enterprise tools and data sources. Seamless interoperability with your existing stack.</p>
                  </div>
                </div>
              </div>

              <a href="#login" className="platform-login-link fade-up">Log in to your dashboard &rarr;</a>
            </div>

            {/* Platform UI Mockup */}
            <div className="platform-visual slide-right">
              <div className="platform-mockup">
                <div className="mockup-header">
                  <div className="mockup-dot active"></div>
                  <div className="mockup-dot"></div>
                  <div className="mockup-dot"></div>
                  <span className="mockup-title">Progression Platform</span>
                </div>
                <div className="mockup-grid">
                  <div className="mockup-card">
                    <div className="mockup-card-label">Active Agents</div>
                    <div className="mockup-card-value">24</div>
                    <div className="mockup-card-bar"><div className="mockup-card-bar-fill salmon" style={{ width: '78%' }}></div></div>
                  </div>
                  <div className="mockup-card">
                    <div className="mockup-card-label">Accuracy</div>
                    <div className="mockup-card-value">97.3%</div>
                    <div className="mockup-card-bar"><div className="mockup-card-bar-fill orchid" style={{ width: '97%' }}></div></div>
                  </div>
                  <div className="mockup-card">
                    <div className="mockup-card-label">API Calls</div>
                    <div className="mockup-card-value">1.2M</div>
                    <div className="mockup-card-bar"><div className="mockup-card-bar-fill blue" style={{ width: '65%' }}></div></div>
                  </div>
                  <div className="mockup-card">
                    <div className="mockup-card-label">Cost Saved</div>
                    <div className="mockup-card-value">$340K</div>
                    <div className="mockup-card-bar"><div className="mockup-card-bar-fill black" style={{ width: '85%' }}></div></div>
                  </div>
                  <div className="mockup-sidebar">
                    <span className="mockup-tag">NLP Pipeline</span>
                    <span className="mockup-tag blue">Vision API</span>
                    <span className="mockup-tag salmon">Forecasting</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog */}
      <section className="section grid-section" id="blog">
        <div className="container">
          <div className="section-header fade-up">
            <p className="label">Blog</p>
            <TextScramble tag="h2" text="Latest thinking from our team" trigger="inView" duration={1000} />
          </div>

          <div className="resources-grid">
            <a href="#" className="resource-card fade-up">
              <span className="resource-category strategy">Strategy</span>
              <h4>The Business Case for Production-Ready AI Systems</h4>
              <p className="resource-meta">8 min read &middot; February 2026</p>
            </a>

            <a href="#" className="resource-card fade-up">
              <span className="resource-category technology">Technology</span>
              <h4>Digital Transformation in 2026: A Strategic Framework</h4>
              <p className="resource-meta">12 min read &middot; January 2026</p>
            </a>

            <a href="#" className="resource-card fade-up">
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
          <div className="fade-up">
            <p className="label">Get in touch</p>
            <TextScramble tag="h2" text="Ready to transform your business with AI?" trigger="inView" duration={1000} />
            <p>Whether you need strategic business consultancy, a managed AI platform, or custom technology solutions — our team of experts is ready to help you build AI systems that deliver real results.</p>
            <a href="mailto:hello@progressionlabs.com" className="cta-email">hello@progressionlabs.com</a>
          </div>
          <div className="cta-actions fade-up">
            <a href="#" className="btn btn-primary btn-lg">Schedule a consultation</a>
            <a href="#" className="btn btn-ghost btn-lg">Request a demo</a>
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
