'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import ExperimentNav from '../../experiment/components/ExperimentNav'
import CTASection from '../../experiment/components/CTASection'
import HeroGradientGL from '../../experiment/components/HeroGradientGL'
import PlusDivider from '../../experiment/components/PlusDivider'
import ArrowIcon from '../../experiment/components/ArrowIcon'
import './case-study.css'

const NAV_LINKS = [
  { label: 'Challenge', href: '#challenge' },
  { label: 'Partnership', href: '#partner' },
  { label: 'The work', href: '#work' },
  { label: 'Contact', href: '#cta' },
]

function useGSAPCounter() {
  // Animates `.counter[data-target]` spans 0 -> target on scroll-into-view.
  useEffect(() => {
    let ctx: { revert: () => void } | null = null
    let cancelled = false

    const init = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      if (cancelled) return

      ctx = gsap.context(() => {
        document.querySelectorAll<HTMLElement>('.story-stats .counter').forEach((el) => {
          const target = parseFloat(el.dataset.target ?? '0')
          const suffix = el.dataset.suffix ?? ''
          const obj = { v: 0 }
          gsap.to(obj, {
            v: target,
            duration: 1.6,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            onUpdate: () => {
              el.textContent = `${Math.round(obj.v)}${suffix}`
            },
            onComplete: () => {
              el.textContent = `${target}${suffix}`
            },
          })
        })
      })
    }

    init()
    return () => {
      cancelled = true
      ctx?.revert()
    }
  }, [])
}

export default function GloboCaseStudy() {
  const [revealGL, setRevealGL] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  // Trigger the WebGL gradient reveal shortly after mount
  useEffect(() => {
    const t = setTimeout(() => setRevealGL(true), 100)
    return () => clearTimeout(t)
  }, [])

  // Animate the nav in on mount
  useEffect(() => {
    const el = navRef.current
    if (!el) return
    let ctx: { revert: () => void } | null = null
    const init = async () => {
      const { default: gsap } = await import('gsap')
      ctx = gsap.context(() => {
        gsap.to(el, { opacity: 1, duration: 0.6, ease: 'power2.out' })
      })
    }
    init()
    return () => ctx?.revert()
  }, [])

  // Section + counter animations
  useGSAPCounter()

  // Fade-up sections on scroll, plus staggers for criteria + stats
  useEffect(() => {
    let ctx: { revert: () => void } | null = null
    const init = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      ctx = gsap.context(() => {
        document.querySelectorAll<HTMLElement>('.story-section, .story-stats, .story-quote-section').forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            },
          )
        })

        // Stagger criteria items
        document.querySelectorAll<HTMLElement>('.criteria').forEach((wrap) => {
          const items = wrap.querySelectorAll<HTMLElement>('.criterion')
          if (!items.length) return
          gsap.fromTo(
            items,
            { opacity: 0, y: 16 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.08,
              ease: 'power2.out',
              scrollTrigger: { trigger: wrap, start: 'top 80%', once: true },
            },
          )
        })

        // Stagger stat cards
        const statCards = document.querySelectorAll<HTMLElement>('.story-stat')
        if (statCards.length) {
          gsap.fromTo(
            statCards,
            { opacity: 0, y: 18 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.12,
              ease: 'power2.out',
              scrollTrigger: { trigger: statCards[0], start: 'top 85%', once: true },
            },
          )
        }
      })
    }
    init()
    return () => ctx?.revert()
  }, [])

  return (
    <>
      <ExperimentNav
        ref={navRef}
        showBrand
        contextLabel="Customer Story"
        links={NAV_LINKS}
        instantReveal={false}
        ctaHref="#cta"
      />

      {/* Slim hero gradient banner with grain + partnership lockup */}
      <section className="hero-banner" aria-label="Progression Labs and Globo partnership">
        <div className="hero-banner-gl-wrap" aria-hidden="true">
          <HeroGradientGL revealTrigger={revealGL} />
        </div>
        <div className="hero-banner-overlay" aria-hidden="true"></div>
        <div className="hero-banner-lockup">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-white.png" alt="Progression Labs" className="hero-banner-logo hero-banner-logo--pl" />
          <span className="hero-banner-divider" aria-hidden="true"></span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/globo-logo.svg" alt="Globo" className="hero-banner-logo hero-banner-logo--globo" />
        </div>
      </section>

      {/* Hero text */}
      <header className="story-hero">
        <div className="story-hero-inner">
          <div className="story-eyebrow">
            <span className="dot" aria-hidden="true"></span>
            <span>Customer Story</span>
            <span className="sep">·</span>
            <span>Globo</span>
          </div>

          <h1 className="story-h1">
            How <strong>Globo</strong> turned interpretation into an{' '}
            <em>industry-first AI product</em>, with an embedded partner instead of an outsourced one.
          </h1>

          <p className="story-lede">
            Globo connects patients and providers across 250+ languages. Progression Labs joined as their AI partner, and stayed long enough to ship Kai, the first AI medical interpreter deployed inside hospital systems, and GAIT, real-time QA across every clinical session.
          </p>
        </div>

        <div className="story-meta">
          <div className="story-meta-item"><span className="k">Industry</span><span className="v">Healthcare · Health Tech</span></div>
          <div className="story-meta-item"><span className="k">Region</span><span className="v">United States</span></div>
          <div className="story-meta-item"><span className="k">Engaged</span><span className="v">January 2024 to Present</span></div>
          <div className="story-meta-item"><span className="k">Models</span><span className="v">Claude · AWS Bedrock</span></div>
        </div>
      </header>

      <PlusDivider />

      {/* Stats strip */}
      <section className="story-stats">
        <div className="story-stat">
          <div className="story-stat-num">
            <span className="counter" data-target="75" data-suffix="%">0%</span>
          </div>
          <div className="story-stat-label">faster first transcription <span className="muted">(10s to 2.5s)</span></div>
        </div>
        <div className="story-stat">
          <div className="story-stat-num">
            <span className="counter" data-target="100" data-suffix="%">0%</span>
          </div>
          <div className="story-stat-label">real-time QA coverage <span className="muted">across every session</span></div>
        </div>
        <div className="story-stat">
          <div className="story-stat-num">
            1<span className="story-stat-suffix">st</span>
          </div>
          <div className="story-stat-label">AI medical interpreter <span className="muted">deployed in U.S. hospitals</span></div>
        </div>
      </section>

      <PlusDivider />

      {/* About Globo */}
      <section className="story-section story-section--about">
        <div className="story-section-label">About Globo</div>
        <div className="story-section-body">
          <p>
            Globo provides real-time interpretation services for healthcare organizations, connecting patients who speak <strong>250+ languages</strong> with qualified interpreters via video calls. Their HQ platform manages thousands of interpretation sessions every day across hospitals, clinics, and telehealth providers.
          </p>
          <p>
            When CEO Dipak Patel set out to bring AI into the business, he didn&apos;t want to outsource it.{' '}
            <em>&ldquo;I just didn&apos;t want to outsource to a bunch of engineers,&rdquo;</em> he says. He wanted three things: <strong>real expertise</strong>, a <strong>real partner</strong>, and <strong>dependability</strong>.
          </p>
        </div>
      </section>

      <PlusDivider />

      {/* The Challenge */}
      <section id="challenge" className="story-section">
        <div className="story-section-label">The challenge</div>
        <div className="story-section-body">
          <h2 className="story-h2">&ldquo;Healthcare is too complicated. The technology isn&apos;t there.&rdquo;</h2>
          <p>
            Before this engagement, Globo had no automated way to monitor interpretation quality in real time. Whether interpreters were presenting professionally on camera, whether background noise was disrupting calls, whether transcriptions were accurate, whether medical terminology was being faithfully conveyed: all of it was reviewed manually, after the fact.
          </p>
          <p>
            Quality assurance was <strong>manual, sample-based, and retrospective</strong>. A process that couldn&apos;t scale with Globo&apos;s growth, and one that left compliance gaps in a sector where miscommunication carries real patient-safety risk.
          </p>
          <p>
            That opening sentence was the industry consensus when Dipak first asked whether AI could do medical interpretation. Globo had a strong engineering team, but no one whose full-time job was tracking AI.
          </p>
        </div>
      </section>

      <PlusDivider />

      {/* Why Progression Labs */}
      <section id="partner" className="story-section">
        <div className="story-section-label">Why Progression Labs</div>
        <div className="story-section-body">
          <h2 className="story-h2">Three things, in Dipak&apos;s words.</h2>

          <p>
            Dipak&apos;s a former engineer and former consultant.{' '}
            <em>&ldquo;It always helps to bring an outside-in perspective,&rdquo;</em> he says.{' '}
            <em>&ldquo;Sometimes you fall into the trap of seeing everything through the lens of your own organization.&rdquo;</em>{' '}
            Globo had a strong engineering team, but no one whose full-time job was tracking AI, and they wanted to spend wisely without hiring a department to keep up.
          </p>

          <p>So Dipak set three bars for any partner.</p>

          <div className="criteria">
            <div className="criterion">
              <div className="criterion-id">01</div>
              <h3 className="criterion-title">Experts in an evolving field</h3>
              <p className="criterion-desc">
                &ldquo;I needed people that were experts in this evolving technology. It was moving so quickly. People aware of the latest trends with a perspective on where it would go.&rdquo;
              </p>
            </div>
            <div className="criterion">
              <div className="criterion-id">02</div>
              <h3 className="criterion-title">A partner, not a vendor</h3>
              <p className="criterion-desc">
                &ldquo;Someone who would not just say yes, yes, yes, but help challenge me, take time to understand where we&apos;re going as a business, and help me in different situations.&rdquo;
              </p>
            </div>
            <div className="criterion">
              <div className="criterion-id">03</div>
              <h3 className="criterion-title">Dependable</h3>
              <p className="criterion-desc">
                &ldquo;In order for us to be successful, we have to move really quickly. I need a partner I can call up and say, hey, I need this, and know it&apos;s going to get done.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      <PlusDivider />

      {/* Pull quote 1 */}
      <section className="story-quote-section">
        <p className="story-quote">
          &ldquo;They&apos;ve gone beyond just a number of engineers that I&apos;m outsourcing AI for. They truly have been a <em>thought partner</em>. Someone dependable, someone who has actually helped me shape my strategy at Globo.&rdquo;
        </p>
        <div className="story-quote-author">
          <div className="story-quote-line"></div>
          <span><strong>Dipak Patel</strong> · CEO, Globo</span>
          <div className="story-quote-line"></div>
        </div>
      </section>

      <PlusDivider />

      {/* The work */}
      <section id="work" className="story-section">
        <div className="story-section-label">The work</div>
        <div className="story-section-body">
          <h2 className="story-h2">From <em>&ldquo;you can&apos;t&rdquo;</em> to industry-first, in the same year.</h2>

          <p>
            The first thing Globo asked us to build was a prototype of an AI medical interpreter. Everyone in the industry had said it couldn&apos;t be done. Within a short timeline, the prototype worked, and turned into <strong>Kai</strong>: the first AI interpreter deployed inside U.S. hospital systems for real medical conversations.
          </p>

          <p>
            Alongside Kai, we built <strong>GAIT</strong> (Globo AI Toolkit), an event-driven microservices platform on AWS ECS Fargate. Six services in total: a FastAPI gateway (GAITWAY) that manages sessions, WebSocket connections, and webhook delivery, plus five AI capability services that process data in parallel.
          </p>

          <p>
            Two of those capabilities call <strong>Claude on AWS Bedrock</strong>. Image analysis (Sonnet 4.5) evaluates interpreter screenshots against a structured rubric for lighting, framing, background, and professionalism. Translation accuracy (Sonnet 4) assesses transcript segments for omissions, terminology errors, and dead air. We picked Claude over GPT-4 and Gemini for two reasons that mattered here: more reliable structured-JSON output for the webhooks Globo&apos;s HQ parses programmatically, and native vision for the screenshot rubric. AWS Transcribe handles speech-to-text. A self-hosted YAMNet model classifies background audio. Everything stays inside Globo&apos;s VPC.
          </p>

          <p>
            The result is a system that monitors <strong>every interpretation session</strong> across five quality dimensions: visual, audio, transcription, translation, and session lifecycle. Instead of the manual sample-based review that came before. A two-person team shipped this in production with 1,500+ unit tests, with <strong>Claude Code (Opus 4.6)</strong> as our daily engineering tool.
          </p>
        </div>
      </section>

      <PlusDivider />

      {/* Pull quote 2 */}
      <section className="story-quote-section">
        <p className="story-quote">
          &ldquo;Progression Labs is an extension of the team. To the point where you guys have our email addresses. Even when we talk to customers, we view you as part of the team.&rdquo;
        </p>
        <div className="story-quote-author">
          <div className="story-quote-line"></div>
          <span><strong>Dipak Patel</strong> · CEO, Globo</span>
          <div className="story-quote-line"></div>
        </div>
      </section>

      <PlusDivider />

      {/* Results / outcome */}
      <section className="story-section">
        <div className="story-section-label">The outcome</div>
        <div className="story-section-body">
          <h2 className="story-h2">Sub-3-second latency. <strong>Every session monitored.</strong></h2>

          <p>
            First-transcription latency dropped <strong>75%</strong>, from 10+ seconds to 2.5. Interpreters and QA teams now see live transcripts in real time, enabling intervention rather than post-call review.
          </p>

          <p>
            Deploy times across all services dropped <strong>76%</strong>, from 4 minutes 19 seconds to 1 minute 1 second, after a Docker layer-caching insight: deployment metadata declared as ENV at the top of a Dockerfile invalidates every subsequent cached layer on every deploy. Moving them to the end fixed it.
          </p>

          <p>
            QA monitoring went from a single-digit manual sample to <strong>100% automated coverage</strong> across every interpretation session. And Kai, the first AI medical interpreter deployed inside U.S. hospital systems, is live.
          </p>
        </div>
      </section>

      <PlusDivider />

      {/* Partnership */}
      <section className="story-section">
        <div className="story-section-label">The partnership</div>
        <div className="story-section-body">
          <h2 className="story-h2">Weekly trends. Strategic conversations. Co-invested bets.</h2>

          <p>
            Every week, the team sits down with Dipak and walks through what&apos;s changed in AI. Not as a sales pitch, but as a working session that ends up influencing Globo&apos;s overall strategy.{' '}
            <em>&ldquo;They came prepared with a document,&rdquo;</em> Dipak says of the first one.{' '}
            <em>&ldquo;They were very thorough about all the trends that happened that week.&rdquo;</em>
          </p>

          <p>
            The conversations rarely stay in the technology lane. Pricing models, competitive positioning, how other companies in adjacent industries are leveraging different LLMs:{' '}
            <em>&ldquo;They challenge it when appropriate,&rdquo;</em> Dipak says.{' '}
            <em>&ldquo;They&apos;ve actually helped me shape my strategy at Globo.&rdquo;</em>
          </p>

          <p>
            When a new opportunity surfaced with no obvious return, Dipak said he wasn&apos;t sure he could justify the engineering capacity. The response was to co-invest: a finite period, shared risk, and a real test of whether the product worked.{' '}
            <em>&ldquo;That just demonstrates their willingness to partner,&rdquo;</em> he says.
          </p>

          <p>
            Three years in, the two engineering teams operate as one. Globo&apos;s CTO, head of product, and the Progression Labs team share email addresses, take customer calls together, and ship as a single function. The kind of arrangement that&apos;s only possible when expertise, partnership, and dependability all show up at once.
          </p>
        </div>
      </section>

      {/* Reuse the live site CTA + pre-footer + WavesCanvas footer */}
      <CTASection />

      {/* Bottom-of-page Read more shortcut back to homepage */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 80px 48px', borderTop: '1px dashed rgba(255,255,255,0.06)' }}>
        <Link
          href="/"
          style={{
            color: 'var(--exp-text-secondary)',
            fontSize: 12,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          ← Back to Progression Labs
        </Link>
      </div>
    </>
  )
}
