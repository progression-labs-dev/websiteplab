import type { MetadataRoute } from 'next'

const SITE_URL = 'https://www.progressionlabs.com'

// AI / answer-engine crawlers we explicitly welcome for GEO (Generative Engine
// Optimization). Naming each user-agent token makes our intent unambiguous to
// every operator — a missing token can default to "blocked" for some bots.
const AI_CRAWLERS = [
  'GPTBot', // OpenAI — training
  'OAI-SearchBot', // OpenAI — ChatGPT Search index
  'ChatGPT-User', // OpenAI — live fetch on user request
  'ClaudeBot', // Anthropic — crawl/index
  'Claude-User', // Anthropic — live fetch on user request
  'Claude-SearchBot', // Anthropic — search index
  'anthropic-ai', // Anthropic — legacy token
  'PerplexityBot', // Perplexity — index
  'Perplexity-User', // Perplexity — live fetch on user request
  'Google-Extended', // Google — Gemini / Vertex training opt-in
  'Applebot-Extended', // Apple — Apple Intelligence training opt-in
  'Bingbot', // Microsoft — also powers Copilot
  'CCBot', // Common Crawl — corpus many models train on
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Welcome each AI crawler with full-site access.
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: '/',
      })),
      // Everyone else: allowed, but keep API routes out of crawl scope.
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
      // Bytespider (ByteDance) — aggressive crawler, negligible GEO/SEO value.
      {
        userAgent: 'Bytespider',
        disallow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
