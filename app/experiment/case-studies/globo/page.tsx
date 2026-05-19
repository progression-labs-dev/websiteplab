'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import ExperimentNav from '../../components/ExperimentNav'
import PixelGradientCanvas from '../../components/PixelGradientCanvas'
import FinderAsciiOverlay from '../../components/FinderAsciiOverlay'

export default function GloboCaseStudyPage() {
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: { scrollTo: (target: number, opts?: { immediate?: boolean }) => void } }).__lenis
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }
    if (navRef.current) {
      navRef.current.style.opacity = '1'
    }
  }, [])

  return (
    <>
      <ExperimentNav ref={navRef} showBrand={true} forceLight={true} />

      <div data-theme="light" className="exp-light-wrapper exp-case-study-page">
        {/* Slim hero banner — same WebGL pixel gradient as Find Your Fit
            (dark navy at top fading to parchment at bottom), faint ASCII
            shimmer, and PL × Globo lockup on top. */}
        <section className="exp-cs-hero-banner" aria-label="Progression Labs and Globo partnership">
          <PixelGradientCanvas lightMode={true} />
          <FinderAsciiOverlay />
          <div className="exp-cs-hero-banner-overlay" aria-hidden="true" />
          <div className="exp-cs-hero-banner-lockup">
            <img
              src="/logo-white.png"
              alt="Progression Labs"
              className="exp-cs-hero-banner-logo exp-cs-hero-banner-logo--pl"
            />
            <span className="exp-cs-hero-banner-divider" aria-hidden="true" />
            <span
              role="img"
              aria-label="Globo"
              className="exp-cs-hero-banner-logo exp-cs-hero-banner-logo--globo"
            />
          </div>
        </section>

        {/* Story hero */}
        <header className="exp-cs-story-hero">
          <Link href="/experiment#work" className="exp-case-study-back">
            <span aria-hidden="true">←</span> All case studies
          </Link>

          <div className="exp-cs-story-hero-inner">
            <div className="exp-cs-story-eyebrow">
              <span className="exp-cs-story-eyebrow-dot" aria-hidden="true" />
              <span>Customer Story</span>
              <span className="exp-cs-story-eyebrow-sep">·</span>
              <span>Globo</span>
            </div>

            <h1 className="exp-cs-story-h1">
              How <strong>Globo</strong> turned interpretation into an{' '}
              <em>industry-first AI product</em>, with an embedded partner
              instead of an outsourced one.
            </h1>

            <p className="exp-cs-story-lede">
              Globo connects patients and providers across 250+ languages.
              Progression Labs joined as their AI partner, and stayed long
              enough to ship Kai, the first AI medical interpreter deployed
              inside hospital systems, and GAIT, real-time QA across every
              clinical session.
            </p>
          </div>

          <div className="exp-cs-story-meta">
            <div className="exp-cs-story-meta-item">
              <span className="exp-cs-story-meta-k">Industry</span>
              <span className="exp-cs-story-meta-v">Healthcare · Health Tech</span>
            </div>
            <div className="exp-cs-story-meta-item">
              <span className="exp-cs-story-meta-k">Region</span>
              <span className="exp-cs-story-meta-v">United States</span>
            </div>
            <div className="exp-cs-story-meta-item">
              <span className="exp-cs-story-meta-k">Engaged</span>
              <span className="exp-cs-story-meta-v">January 2024 to Present</span>
            </div>
            <div className="exp-cs-story-meta-item">
              <span className="exp-cs-story-meta-k">Models</span>
              <span className="exp-cs-story-meta-v">Claude · AWS Bedrock</span>
            </div>
          </div>
        </header>

        <div className="exp-cs-plus-divider"><span className="exp-cs-plus-divider-mark">+</span></div>

        {/* Stats strip */}
        <section className="exp-cs-story-stats">
          <div className="exp-cs-story-stat">
            <div className="exp-cs-story-stat-num">75%</div>
            <div className="exp-cs-story-stat-label">
              faster first transcription{' '}
              <span className="exp-cs-story-stat-muted">(10s to 2.5s)</span>
            </div>
          </div>
          <div className="exp-cs-story-stat">
            <div className="exp-cs-story-stat-num">100%</div>
            <div className="exp-cs-story-stat-label">
              real-time QA coverage{' '}
              <span className="exp-cs-story-stat-muted">across every session</span>
            </div>
          </div>
          <div className="exp-cs-story-stat">
            <div className="exp-cs-story-stat-num">
              1<span className="exp-cs-story-stat-suffix">st</span>
            </div>
            <div className="exp-cs-story-stat-label">
              AI medical interpreter{' '}
              <span className="exp-cs-story-stat-muted">deployed in U.S. hospitals</span>
            </div>
          </div>
        </section>

        <div className="exp-cs-plus-divider"><span className="exp-cs-plus-divider-mark">+</span></div>

        {/* Customer testimonial video — Dipak Patel, Globo */}
        <section className="exp-cs-story-video-section" aria-label="Customer testimonial video">
          <div className="exp-cs-story-video-frame">
            <video
              className="exp-cs-story-video"
              src="/case-studies/globo-testimonial.mp4"
              poster="/case-studies/globo-testimonial-poster.jpg"
              controls
              preload="metadata"
              playsInline
            />
          </div>
        </section>

        <div className="exp-cs-plus-divider"><span className="exp-cs-plus-divider-mark">+</span></div>

        {/* About Globo */}
        <section className="exp-cs-story-section">
          <div className="exp-cs-story-section-label">About Globo</div>
          <div className="exp-cs-story-section-body">
            <p>
              Globo provides real-time interpretation services for healthcare
              organizations, connecting patients who speak{' '}
              <strong>250+ languages</strong> with qualified interpreters via
              video calls. Their HQ platform manages thousands of
              interpretation sessions every day across hospitals, clinics, and
              telehealth providers.
            </p>
            <p>
              When CEO Dipak Patel set out to bring AI into the business, he
              didn&rsquo;t want to outsource it.{' '}
              <em>&ldquo;I just didn&rsquo;t want to outsource to a bunch of engineers,&rdquo;</em>{' '}
              he says. He wanted three things: <strong>real expertise</strong>,
              a <strong>real partner</strong>, and <strong>dependability</strong>.
            </p>
          </div>
        </section>

        <div className="exp-cs-plus-divider"><span className="exp-cs-plus-divider-mark">+</span></div>

        {/* The challenge */}
        <section id="challenge" className="exp-cs-story-section">
          <div className="exp-cs-story-section-label">The challenge</div>
          <div className="exp-cs-story-section-body">
            <h2 className="exp-cs-story-h2">
              &ldquo;Healthcare is too complicated. The technology isn&rsquo;t there.&rdquo;
            </h2>

            <p>
              Before this engagement, Globo had no automated way to monitor
              interpretation quality in real time. Whether interpreters were
              presenting professionally on camera, whether background noise was
              disrupting calls, whether transcriptions were accurate, whether
              medical terminology was being faithfully conveyed: all of it was
              reviewed manually, after the fact.
            </p>
            <p>
              Quality assurance was{' '}
              <strong>manual, sample-based, and retrospective</strong>. A
              process that couldn&rsquo;t scale with Globo&rsquo;s growth, and
              one that left compliance gaps in a sector where miscommunication
              carries real patient-safety risk.
            </p>
            <p>
              That opening sentence was the industry consensus when Dipak first
              asked whether AI could do medical interpretation. Globo had a
              strong engineering team, but no one whose full-time job was
              tracking AI.
            </p>
          </div>
        </section>

        <div className="exp-cs-plus-divider"><span className="exp-cs-plus-divider-mark">+</span></div>

        {/* Why Progression Labs */}
        <section id="partner" className="exp-cs-story-section">
          <div className="exp-cs-story-section-label">Why Progression Labs</div>
          <div className="exp-cs-story-section-body">
            <h2 className="exp-cs-story-h2">Three things, in Dipak&rsquo;s words.</h2>

            <p>
              Dipak&rsquo;s a former engineer and former consultant — someone
              who values an outside-in perspective when an internal team risks
              getting too close to the work. Globo had a strong engineering
              team, but no one whose full-time job was tracking AI, and they
              wanted to spend wisely without hiring a department to keep up.
            </p>

            <p>So Dipak set three bars for any partner.</p>

            <div className="exp-cs-criteria">
              <div className="exp-cs-criterion">
                <div className="exp-cs-criterion-id">01</div>
                <h3 className="exp-cs-criterion-title">Experts in an evolving field</h3>
                <p className="exp-cs-criterion-desc">
                  &ldquo;I needed people that were experts in this evolving
                  technology. It was moving so quickly. People aware of the
                  latest trends with a perspective on where it would go.&rdquo;
                </p>
              </div>
              <div className="exp-cs-criterion">
                <div className="exp-cs-criterion-id">02</div>
                <h3 className="exp-cs-criterion-title">A partner, not a vendor</h3>
                <p className="exp-cs-criterion-desc">
                  &ldquo;Someone who would not just say yes, yes, yes, but help
                  challenge me, take time to understand where we&rsquo;re going
                  as a business, and help me in different situations.&rdquo;
                </p>
              </div>
              <div className="exp-cs-criterion">
                <div className="exp-cs-criterion-id">03</div>
                <h3 className="exp-cs-criterion-title">Dependable</h3>
                <p className="exp-cs-criterion-desc">
                  &ldquo;In order for us to be successful, we have to move
                  really quickly. I need a partner I can call up and say, hey,
                  I need this, and know it&rsquo;s going to get done.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="exp-cs-plus-divider"><span className="exp-cs-plus-divider-mark">+</span></div>

        {/* Pull quote 1 */}
        <section className="exp-cs-story-quote-section">
          <p className="exp-cs-story-quote">
            &ldquo;They&rsquo;ve gone beyond just a number of engineers that
            I&rsquo;m outsourcing AI for. They truly have been a{' '}
            <em>thought partner</em>. Someone dependable, someone who has
            actually helped me shape my strategy at Globo.&rdquo;
          </p>
          <div className="exp-cs-story-quote-author">
            <div className="exp-cs-story-quote-line" />
            <span><strong>Dipak Patel</strong> · CEO, Globo</span>
            <div className="exp-cs-story-quote-line" />
          </div>
        </section>

        <div className="exp-cs-plus-divider"><span className="exp-cs-plus-divider-mark">+</span></div>

        {/* The work */}
        <section id="work" className="exp-cs-story-section">
          <div className="exp-cs-story-section-label">The work</div>
          <div className="exp-cs-story-section-body">
            <h2 className="exp-cs-story-h2">
              From <em>&ldquo;you can&rsquo;t&rdquo;</em> to industry-first, in
              the same year.
            </h2>

            <p>
              The first thing Globo asked us to build was a prototype of an AI
              medical interpreter. Everyone in the industry had said it
              couldn&rsquo;t be done. Within a short timeline, the prototype
              worked, and turned into <strong>Kai</strong>: the first AI
              interpreter deployed inside U.S. hospital systems for real medical
              conversations.
            </p>

            <p>
              Alongside Kai, we built <strong>GAIT</strong> (Globo AI Toolkit),
              an event-driven microservices platform on AWS ECS Fargate. Six
              services in total: a FastAPI gateway (GAITWAY) that manages
              sessions, WebSocket connections, and webhook delivery, plus five
              AI capability services that process data in parallel.
            </p>

            <p>
              Two of those capabilities call{' '}
              <strong>Claude on AWS Bedrock</strong>. Image analysis (Sonnet
              4.5) evaluates interpreter screenshots against a structured rubric
              for lighting, framing, background, and professionalism.
              Translation accuracy (Sonnet 4) assesses transcript segments for
              omissions, terminology errors, and dead air. We picked Claude
              over GPT-4 and Gemini for two reasons that mattered here: more
              reliable structured-JSON output for the webhooks Globo&rsquo;s HQ
              parses programmatically, and native vision for the screenshot
              rubric. AWS Transcribe handles speech-to-text. A self-hosted
              YAMNet model classifies background audio. Everything stays inside
              Globo&rsquo;s VPC.
            </p>

            <p>
              The result is a system that monitors{' '}
              <strong>every interpretation session</strong> across five quality
              dimensions: visual, audio, transcription, translation, and
              session lifecycle &mdash; instead of the manual sample-based
              review that came before. Shipped in production with{' '}
              <strong>1,500+ unit tests</strong>, with{' '}
              <strong>Claude Code (Opus 4.6)</strong> as our daily engineering
              tool.
            </p>
          </div>
        </section>

        <div className="exp-cs-plus-divider"><span className="exp-cs-plus-divider-mark">+</span></div>

        {/* Why Claude — Anthropic partnership pillar */}
        <section id="claude" className="exp-cs-story-section">
          <div className="exp-cs-story-section-label">Powered by Claude</div>
          <div className="exp-cs-story-section-body">
            <h2 className="exp-cs-story-h2">
              Three reasons we picked <em>Claude</em> for Globo.
            </h2>

            <p>
              GAIT runs on <strong>Anthropic&rsquo;s Claude via AWS Bedrock</strong>{' '}
              — Sonnet 4.5 for image analysis of interpreter screenshots, and
              Sonnet 4 for transcript QA across 250+ languages. Before we
              committed, we evaluated Claude head-to-head against GPT-4 and
              Gemini on the two production tasks. Claude won on three fronts
              that mattered in a regulated healthcare environment.
            </p>

            <div className="exp-cs-criteria">
              <div className="exp-cs-criterion">
                <div className="exp-cs-criterion-id">01</div>
                <h3 className="exp-cs-criterion-title">
                  Structured-output reliability
                </h3>
                <p className="exp-cs-criterion-desc">
                  Every Claude response feeds straight into a webhook payload
                  that Globo&rsquo;s HQ platform parses programmatically.
                  Sonnet 4.5&rsquo;s instruction-following for JSON schemas
                  was measurably more consistent than the alternatives — fewer
                  schema violations, fewer hallucinated fields. In regulated
                  healthcare, output reliability is non-negotiable.
                </p>
              </div>
              <div className="exp-cs-criterion">
                <div className="exp-cs-criterion-id">02</div>
                <h3 className="exp-cs-criterion-title">
                  Vision for the screenshot rubric
                </h3>
                <p className="exp-cs-criterion-desc">
                  Sonnet 4.5 evaluates interpreter screenshots against a
                  structured rubric — lighting, framing, background,
                  professionalism — in a single multimodal prompt. Competing
                  models needed heavier preprocessing or produced less granular
                  assessments.
                </p>
              </div>
              <div className="exp-cs-criterion">
                <div className="exp-cs-criterion-id">03</div>
                <h3 className="exp-cs-criterion-title">
                  AWS Bedrock — data stays in Globo&rsquo;s VPC
                </h3>
                <p className="exp-cs-criterion-desc">
                  Globo runs entirely on AWS. Bedrock keeps every Claude call
                  inside their cloud boundary; no patient-adjacent data ever
                  leaves their VPC. We use cross-region inference profiles for
                  resilience without compromising the data perimeter.
                </p>
              </div>
            </div>

            <p>
              On the engineering side,{' '}
              <strong>Claude Code (Opus 4.6)</strong> was the force multiplier
              behind shipping five real-time AI capabilities, 1,500+ unit
              tests, and sub-3-second latency. We used it daily for codebase
              archaeology, multi-model code review (Claude + Codex + Gemini
              cross-validation), tracing async race conditions through
              CloudWatch logs, and designing the Docker layer-caching changes
              that cut deploy times by 76%. The pace and rigour the platform
              ships at wouldn&rsquo;t have been feasible without it.
            </p>
          </div>
        </section>

        <div className="exp-cs-plus-divider"><span className="exp-cs-plus-divider-mark">+</span></div>

        {/* Results */}
        <section className="exp-cs-story-section">
          <div className="exp-cs-story-section-label">The outcome</div>
          <div className="exp-cs-story-section-body">
            <h2 className="exp-cs-story-h2">
              Sub-3-second latency. <strong>Every session monitored.</strong>
            </h2>

            <p>
              First-transcription latency dropped <strong>75%</strong>, from
              10+ seconds to 2.5. Interpreters and QA teams now see live
              transcripts in real time, enabling intervention rather than
              post-call review.
            </p>

            <p>
              Deploy times across all services dropped <strong>76%</strong>,
              from 4 minutes 19 seconds to 1 minute 1 second, after a Docker
              layer-caching insight: deployment metadata declared as ENV at the
              top of a Dockerfile invalidates every subsequent cached layer on
              every deploy. Moving them to the end fixed it.
            </p>

            <p>
              QA monitoring went from a single-digit manual sample to{' '}
              <strong>100% automated coverage</strong> across every
              interpretation session. And Kai, the first AI medical interpreter
              deployed inside U.S. hospital systems, is live.
            </p>
          </div>
        </section>

        <div className="exp-cs-plus-divider"><span className="exp-cs-plus-divider-mark">+</span></div>

        {/* Pull quote 2 */}
        <section className="exp-cs-story-quote-section">
          <p className="exp-cs-story-quote">
            &ldquo;Progression Labs is an extension of the team. To the point
            where you guys have our email addresses. Even when we talk to
            customers, we view you as part of the team.&rdquo;
          </p>
          <div className="exp-cs-story-quote-author">
            <div className="exp-cs-story-quote-line" />
            <span><strong>Dipak Patel</strong> · CEO, Globo</span>
            <div className="exp-cs-story-quote-line" />
          </div>
        </section>

        <div className="exp-cs-plus-divider"><span className="exp-cs-plus-divider-mark">+</span></div>

        {/* The partnership */}
        <section className="exp-cs-story-section">
          <div className="exp-cs-story-section-label">The partnership</div>
          <div className="exp-cs-story-section-body">
            <h2 className="exp-cs-story-h2">
              Weekly trends. Strategic conversations. Co-invested bets.
            </h2>

            <p>
              Every week, the team sits down with Dipak and walks through
              what&rsquo;s changed in AI. Not as a sales pitch, but as a
              working session that ends up influencing Globo&rsquo;s overall
              strategy — driven from the start by a thorough document of the
              week&rsquo;s trends and what they mean for the business.
            </p>

            <p>
              The conversations rarely stay in the technology lane. Pricing
              models, competitive positioning, how other companies in adjacent
              industries are leveraging different LLMs —{' '}
              <em>&ldquo;they&rsquo;ve actually helped me shape my strategy at Globo,&rdquo;</em>{' '}
              Dipak says.
            </p>

            <p>
              When a new opportunity surfaced with no obvious return, Dipak
              wasn&rsquo;t sure he could justify the engineering capacity. The
              response was to co-invest: a finite period, shared risk, and a
              real test of whether the product worked.
            </p>

            <p>
              Three years in, the two engineering teams operate as one.
              Globo&rsquo;s CTO, head of product, and the Progression Labs team
              share email addresses, take customer calls together, and ship as
              a single function. The kind of arrangement that&rsquo;s only
              possible when expertise, partnership, and dependability all show
              up at once.
            </p>
          </div>
        </section>

        <div className="exp-cs-plus-divider"><span className="exp-cs-plus-divider-mark">+</span></div>

        {/* CTA */}
        <section id="cta" className="exp-cs-story-cta">
          <div className="exp-cs-story-cta-eyebrow">// Let&rsquo;s build</div>
          <h2 className="exp-cs-story-cta-heading">
            Looking for the same kind of partner?
          </h2>
          <p className="exp-cs-story-cta-body">
            We work with a small number of companies turning AI from prototype
            into infrastructure. Tell us what you&rsquo;re trying to ship.
          </p>
          <div className="exp-cs-story-cta-buttons">
            <a
              href="mailto:hello@progressionlabs.com"
              className="exp-cs-btn exp-cs-btn-filled"
            >
              Request a brainstorm <span aria-hidden="true">→</span>
            </a>
            <Link href="/experiment#work" className="exp-cs-btn exp-cs-btn-outline">
              See more work <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
