'use client'

import { useEffect, useRef, useCallback } from 'react'
import ScrollDecode from './ScrollDecode'

interface BlogPost {
  category: string
  date: string
  title: string
  excerpt: string
  image?: string
  video?: string
}

const posts: BlogPost[] = [
  {
    category: 'Engineering',
    date: '2026-02-28',
    title: 'Vibe Coding and the Death of Syntax',
    excerpt:
      'Karpathy coined it — programming via natural language, forgetting code exists. What this means for engineering teams and the future of software craft.',
    image: '/blog/vibe-coding.png',
    video: '/blog/pink horse.mp4',
  },
  {
    category: 'Insights',
    date: '2026-02-12',
    title: 'Ghost Intelligence: Why LLMs Are Not What You Think',
    excerpt:
      'LLMs are "summoned ghosts", not gradually evolving animals. A fundamentally new type of intelligence that demands a new mental model.',
    image: '/blog/ghost-intelligence.png',
    video: '/blog/blue frog.mp4',
  },
  {
    category: 'Strategy',
    date: '2026-01-24',
    title: 'RLVR: The Quiet Revolution in How Models Learn to Reason',
    excerpt:
      'Reinforcement Learning from Verifiable Rewards — the shift from probabilistic imitation to logical reasoning that defined 2025.',
    image: '/blog/rlvr-revolution.png',
    video: '/blog/green jellyfish.mp4',
  },
  {
    category: 'Process',
    date: '2026-01-08',
    title: 'The Magnitude 9 Earthquake: Engineering in the Agent Era',
    excerpt:
      'The profession is being dramatically refactored — agents, subagents, prompts, MCP, tools, plugins. How to ride the wave instead of drowning in it.',
    image: '/blog/magnitude-earthquake.png',
    video: '/blog/pink flower.mp4',
  },
]

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function BlogSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const video = e.currentTarget.querySelector('video')
    if (video) {
      video.currentTime = 0
      video.play().catch(() => {})
    }
  }, [])

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const video = e.currentTarget.querySelector('video')
    if (video) {
      video.pause()
      video.currentTime = 0
    }
  }, [])

  useEffect(() => {
    let ctx: { revert: () => void } | null = null

    const initGsap = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      const el = sectionRef.current
      if (!el) return

      const cards = el.querySelectorAll('.exp-blog-card')
      if (cards.length === 0) return

      ctx = gsap.context(() => {
        gsap.set(cards, { opacity: 0 })
        gsap.to(cards, {
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
        })
      })
    }

    initGsap()
    return () => { ctx?.revert() }
  }, [])

  return (
    <div ref={sectionRef} className="exp-blog-section">
      <div className="exp-blog-header">
        <div className="exp-tag">Blog</div>
        <ScrollDecode
          text="From the Lab"
          trigger="inView"
          tag="h2"
          className="exp-section-heading"
          duration={800}
        />
      </div>

      <div className="exp-blog-grid">
        {posts.map((post) => (
          <a
            key={post.title}
            href="#"
            className="exp-blog-card"
            onMouseEnter={post.video ? handleMouseEnter : undefined}
            onMouseLeave={post.video ? handleMouseLeave : undefined}
          >
            <div className="exp-blog-image">
              {post.video ? (
                <video
                  src={post.video}
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="exp-blog-video exp-blog-video--visible"
                />
              ) : post.image ? (
                <img src={post.image} alt="" loading="lazy" />
              ) : null}
            </div>
            <div className="exp-blog-body">
              <span className="exp-blog-category">{post.category}</span>
              <h3 className="exp-blog-title">{post.title}</h3>
              <p className="exp-blog-excerpt">{post.excerpt}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
