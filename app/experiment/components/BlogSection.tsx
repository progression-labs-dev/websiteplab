'use client'

import { useEffect, useRef } from 'react'
import ScrollDecode from './ScrollDecode'
import PanelCorners from './PanelCorners'
import ArrowIcon from './ArrowIcon'

interface BlogPost {
  category: string
  date: string
  title: string
  excerpt: string
}

const posts: BlogPost[] = [
  {
    category: 'Strategy',
    date: '2026-02-18',
    title: 'Why Most AI Projects Fail Before They Start',
    excerpt:
      'The biggest risk isn\'t technical — it\'s strategic. We break down the patterns we see in failed AI initiatives and the framework we use to avoid them.',
  },
  {
    category: 'Engineering',
    date: '2026-01-24',
    title: 'Building Production AI Agents: Lessons from the Field',
    excerpt:
      'Agents that work in demos rarely survive production. Here\'s what we\'ve learned shipping agent systems across industries.',
  },
  {
    category: 'Process',
    date: '2026-01-08',
    title: 'The AI Audit Framework We Use with Every Client',
    excerpt:
      'Before we write a line of code, we run a structured audit. This is the exact framework — open-sourced for your team.',
  },
  {
    category: 'Insights',
    date: '2025-12-15',
    title: 'From Exploration to Scale: Mapping the AI Journey',
    excerpt:
      'Every organisation follows a similar arc from curiosity to capability. Understanding where you are changes what you should do next.',
  },
]

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function BlogSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

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
          <div key={post.title} className="exp-blog-card">
            <PanelCorners />
            <div className="exp-blog-meta">
              <span className="exp-blog-category">{post.category}</span>
              <span className="exp-blog-date">{formatDate(post.date)}</span>
            </div>
            <h3 className="exp-blog-title">{post.title}</h3>
            <p className="exp-blog-excerpt">{post.excerpt}</p>
            <span className="exp-blog-read-more">
              Read more <ArrowIcon />
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
