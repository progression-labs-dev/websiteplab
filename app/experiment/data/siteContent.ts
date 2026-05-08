// ── Shared site content — single source of truth for human + machine views ──

// ── Navigation ──
export const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Proof', href: '#work' },
  { label: 'Contact', href: '#contact' },
] as const

// ── Contact / Email ──
export const CONTACT_EMAIL = 'gabor.soter@progressionlabs.com'
export const LINKEDIN_URL = 'https://linkedin.com/company/progressionlabs'

// ── Hero ──
// A/B test: same headline, different CTA
export const HERO_CONTENT = {
  control: {
    headline: "We're building custom AI agents that scale for the most complex problems in the real world",
    cta: 'Request a brainstorm',
  },
  variant: {
    headline: "We're building custom AI agents that scale for the most complex problems in the real world",
    cta: 'Start a conversation',
  },
} as const

// ── CTA Section ──
export const CTA_CONTENT = {
  heading: 'Ready to build something extraordinary?',
  subheading: "Let's talk about what AI can do for your business.",
  cta: 'Request a brainstorm',
} as const

// ── Service Finder ──
export type Role = 'ceo' | 'cto' | 'product' | 'commercial' | 'other'
export type Journey = 'no_start' | 'know_what' | 'stuck' | 'need_hands' | 'scaling'

export interface Recommendation {
  title: string
  desc: string
  services: string[]
  cta: string
}

export const ROLES = [
  { id: 'ceo' as Role, label: 'CEO / Founder' },
  { id: 'cto' as Role, label: 'CTO / VP Engineering' },
  { id: 'product' as Role, label: 'Product Leader' },
  { id: 'commercial' as Role, label: 'Commercial Leader' },
  { id: 'other' as Role, label: 'Other' },
] as const

export const JOURNEYS = [
  { id: 'no_start' as Journey, label: "We haven't started with AI" },
  { id: 'know_what' as Journey, label: 'We know what we want to build' },
  { id: 'stuck' as Journey, label: "We started but hit a wall" },
  { id: 'need_hands' as Journey, label: "We're building, need more hands" },
  { id: 'scaling' as Journey, label: "We're live and need to scale" },
] as const

export const RECOMMENDATIONS: Record<string, Recommendation> = {
  // ── CEO / Founder ──
  'ceo-no_start': {
    title: 'Find your highest-impact AI opportunity',
    desc: "You know AI matters, but it's hard to know where to start without wasting budget on the wrong thing. We run a focused strategy session with your leadership team and leave you with a clear, prioritised roadmap — not a slide deck.",
    services: ['AI Transformation', 'Ideation Sessions', 'AI Audit'],
    cta: 'Request a brainstorm',
  },
  'ceo-know_what': {
    title: 'Go from vision to production, fast',
    desc: "You've got the idea — now you need the team to build it properly. Our senior engineers embed alongside yours and ship production software from week one. You keep the code and the knowledge.",
    services: ['AI Builds', 'AI Expert'],
    cta: 'Request a brainstorm',
  },
  'ceo-stuck': {
    title: 'Get your AI project back on track',
    desc: "You've invested time and budget, and it's not delivering yet. That's more common than you'd think. We diagnose what stalled — architecture, data, team gaps — and fix it, usually within weeks.",
    services: ['Project Surgery', 'AI Expert', 'AI Audit'],
    cta: 'Request a brainstorm',
  },
  'ceo-need_hands': {
    title: 'Senior AI engineers, shipping from day one',
    desc: 'Hiring takes months. You need capacity now. Our engineers embed in your team immediately — no recruitment cycles, no ramp-up. They know the stack and start delivering from week one.',
    services: ['AI Expert', 'AI Builds'],
    cta: 'Request a brainstorm',
  },
  'ceo-scaling': {
    title: "Scale what's working without breaking it",
    desc: "Your AI is live and delivering value — now you need to expand without losing quality or velocity. We help you build the internal capability to scale independently, so you don't need us forever.",
    services: ['AI Transformation', 'AI Expert', 'AI Audit'],
    cta: 'Request a brainstorm',
  },

  // ── CTO / VP Engineering ──
  'cto-no_start': {
    title: 'AI Audit + Ideation Sessions',
    desc: 'Deep-dive technical assessment of your AI readiness — infrastructure, data, team skills. We deliver a prioritised roadmap your engineering team can execute.',
    services: ['AI Audit', 'Ideation Sessions'],
    cta: 'Get your audit',
  },
  'cto-know_what': {
    title: 'AI Builds + AI Expert',
    desc: 'Our senior engineers pair with yours to build production AI. Code you own, knowledge you keep. We handle the ML complexity so your team stays focused.',
    services: ['AI Builds', 'AI Expert'],
    cta: 'Start building',
  },
  'cto-stuck': {
    title: 'Project Surgery + AI Audit',
    desc: 'We diagnose the technical blockers — architecture, data pipeline, model performance, or integration issues — and get your project back on track with a clear fix.',
    services: ['Project Surgery', 'AI Audit', 'AI Expert'],
    cta: "Fix what's broken",
  },
  'cto-need_hands': {
    title: 'AI Expert + AI Builds',
    desc: 'Senior AI engineers who embed in your team and ship from day one. No recruitment cycles, no ramp-up — they know the stack and hit the ground running.',
    services: ['AI Expert', 'AI Builds'],
    cta: 'Add senior talent',
  },
  'cto-scaling': {
    title: 'AI Expert + AI Builds',
    desc: 'On-demand access to senior AI engineers who embed within your team. Scale your AI capability without the hiring lag.',
    services: ['AI Expert', 'AI Builds'],
    cta: 'Scale your team',
  },

  // ── Product Leader ──
  'product-no_start': {
    title: 'Ideation Sessions + AI Audit',
    desc: 'Structured workshops that turn product challenges into AI-powered features. Leave with prototyped concepts and a concrete action plan.',
    services: ['Ideation Sessions', 'AI Audit'],
    cta: 'Book a workshop',
  },
  'product-know_what': {
    title: 'AI Builds + AI Expert',
    desc: 'End-to-end AI product development. We work alongside your product team from spec to ship, building features your users will love.',
    services: ['AI Builds', 'AI Expert'],
    cta: 'Ship your feature',
  },
  'product-stuck': {
    title: 'Project Surgery + AI Builds',
    desc: "We diagnose why the feature stalled — scope, data, model fit, or UX — then rebuild with a clear path to ship. No more spinning wheels.",
    services: ['Project Surgery', 'AI Builds'],
    cta: 'Get unstuck',
  },
  'product-need_hands': {
    title: 'AI Expert + AI Builds',
    desc: 'Senior AI product engineers who slot into your team and ship features. They understand product thinking, not just model training.',
    services: ['AI Expert', 'AI Builds'],
    cta: 'Accelerate your roadmap',
  },
  'product-scaling': {
    title: 'AI Expert + AI Transformation',
    desc: 'Embed senior AI expertise into your product org. We help you build the processes and capabilities to ship AI features at scale.',
    services: ['AI Expert', 'AI Transformation'],
    cta: 'Level up your team',
  },

  // ── Commercial Leader ──
  'commercial-no_start': {
    title: 'AI Transformation + Ideation Sessions',
    desc: 'Understand where AI creates commercial value. We map opportunities across your business and help you build the case for investment.',
    services: ['AI Transformation', 'Ideation Sessions'],
    cta: 'Explore opportunities',
  },
  'commercial-know_what': {
    title: 'AI Builds + AI Transformation',
    desc: 'Turn commercial AI opportunities into working products. We build the tools and automations that drive revenue and efficiency.',
    services: ['AI Builds', 'AI Transformation'],
    cta: 'Build for growth',
  },
  'commercial-stuck': {
    title: 'Project Surgery + AI Transformation',
    desc: "We diagnose why your AI initiative isn't delivering commercial results — misaligned KPIs, wrong use case, or execution gaps — and course-correct.",
    services: ['Project Surgery', 'AI Transformation'],
    cta: 'Course-correct now',
  },
  'commercial-need_hands': {
    title: 'AI Builds + AI Expert',
    desc: 'More engineering capacity to ship your commercial AI projects. Our team builds the tools and integrations that drive measurable business impact.',
    services: ['AI Builds', 'AI Expert'],
    cta: 'Add capacity',
  },
  'commercial-scaling': {
    title: 'AI Transformation + AI Expert',
    desc: "Scale AI across your commercial operations. We help you expand what's working and build new AI-driven revenue streams.",
    services: ['AI Transformation', 'AI Expert'],
    cta: 'Scale your AI',
  },

  // ── Other ──
  'other-no_start': {
    title: 'AI Audit + Ideation Sessions',
    desc: "Start with a comprehensive assessment and hands-on workshop. We'll help you find the right starting point for your AI journey.",
    services: ['AI Audit', 'Ideation Sessions'],
    cta: 'Get started',
  },
  'other-know_what': {
    title: 'AI Builds + AI Expert',
    desc: 'Full-stack AI development with senior engineers. We build production-grade software tailored to your specific needs.',
    services: ['AI Builds', 'AI Expert'],
    cta: 'Start building',
  },
  'other-stuck': {
    title: 'Project Surgery + AI Audit',
    desc: "We diagnose what's blocking progress and chart a clear path forward. Fresh eyes and deep AI expertise to get things moving again.",
    services: ['Project Surgery', 'AI Audit'],
    cta: 'Get unstuck',
  },
  'other-need_hands': {
    title: 'AI Expert + AI Builds',
    desc: 'Experienced AI engineers who embed with your team. They ramp fast, ship real code, and transfer knowledge as they go.',
    services: ['AI Expert', 'AI Builds'],
    cta: 'Add AI talent',
  },
  'other-scaling': {
    title: 'AI Expert + AI Transformation',
    desc: 'Expert guidance to grow and optimise your AI operations. We embed senior talent and strategic advisory to help you scale.',
    services: ['AI Expert', 'AI Transformation'],
    cta: 'Scale with us',
  },
}

// ── Finder A/B variant — outcome-focused "what happens next" tone ──
export const FINDER_VARIANT = {
  stepPrompts: ['Tell us about you', 'Where are you on your journey?'],
  resultHeader: "Here's what we'd do",
  resetLabel: '> try again',
}

export const RECOMMENDATIONS_VARIANT: Record<string, Recommendation> = {
  // ── CEO / Founder ──
  'ceo-no_start': {
    title: 'Find your highest-impact AI opportunity',
    desc: "Week one: a focused session with your leadership team. Week two: you'll have a prioritised AI roadmap with three concrete initiatives, estimated ROI, and a 90-day action plan. No slide decks — just a clear path forward.",
    services: ['AI Transformation', 'Ideation Sessions', 'AI Audit'],
    cta: "Let's talk",
  },
  'ceo-know_what': {
    title: 'Go from vision to production, fast',
    desc: "Our engineers join your team in week one and start shipping production code. Within a month, you'll have a working AI system — not a prototype. You own the code, your team learns as we build, and we leave when you're ready.",
    services: ['AI Builds', 'AI Expert'],
    cta: "Let's talk",
  },
  'ceo-stuck': {
    title: 'Get your AI project back on track',
    desc: "First, we diagnose exactly what stalled — architecture, data, team gaps, or scope. Then we fix it, usually within weeks. You'll get a clear post-mortem, a revised plan, and momentum back. This is more common than you'd think.",
    services: ['Project Surgery', 'AI Expert', 'AI Audit'],
    cta: "Let's talk",
  },
  'ceo-need_hands': {
    title: 'Senior AI engineers, shipping from day one',
    desc: "Tomorrow: senior engineers embedded in your team. This week: they're shipping real features. No recruitment lag, no ramp-up period. They know the stack, they understand the pressure, and they deliver from day one.",
    services: ['AI Expert', 'AI Builds'],
    cta: "Let's talk",
  },
  'ceo-scaling': {
    title: "Scale what's working without breaking it",
    desc: "We'll audit your current AI systems, identify the bottlenecks, and build a scaling plan that grows your capability without growing your dependency on us. The goal: you scale independently within 6 months.",
    services: ['AI Transformation', 'AI Expert', 'AI Audit'],
    cta: "Let's talk",
  },

  // ── CTO / VP Engineering ──
  'cto-no_start': {
    title: 'AI Audit + Ideation Sessions',
    desc: "You'll get a full technical assessment: infrastructure readiness, data maturity, team skill gaps, and tool recommendations. The output is an engineering-led roadmap your team can start executing immediately — no consultancy fluff.",
    services: ['AI Audit', 'Ideation Sessions'],
    cta: 'Book a technical deep-dive',
  },
  'cto-know_what': {
    title: 'AI Builds + AI Expert',
    desc: "Our engineers pair-program with yours from day one. You'll see PRs landing within the first week. We handle the ML complexity — model selection, training pipelines, inference optimisation — so your team stays focused on the product.",
    services: ['AI Builds', 'AI Expert'],
    cta: 'Get engineers on board',
  },
  'cto-stuck': {
    title: 'Project Surgery + AI Audit',
    desc: "We'll run a technical post-mortem: architecture review, data pipeline audit, model performance analysis. You'll get a concrete diagnosis and a fix plan — not a recommendation to start over. Most projects recover within 2-4 weeks.",
    services: ['Project Surgery', 'AI Audit', 'AI Expert'],
    cta: 'Get a diagnosis',
  },
  'cto-need_hands': {
    title: 'AI Expert + AI Builds',
    desc: "Senior engineers who pass your technical bar, know your stack, and ship from day one. No handholding required. They'll integrate with your CI/CD, follow your coding standards, and participate in code reviews like any team member.",
    services: ['AI Expert', 'AI Builds'],
    cta: 'See available engineers',
  },
  'cto-scaling': {
    title: 'AI Expert + AI Builds',
    desc: "We'll embed engineers who help you build the infrastructure and processes to scale: monitoring, A/B testing, model versioning, automated retraining. The goal is making your AI ops self-sustaining.",
    services: ['AI Expert', 'AI Builds'],
    cta: 'Plan your scale-up',
  },

  // ── Product Leader ──
  'product-no_start': {
    title: 'Ideation Sessions + AI Audit',
    desc: "A hands-on workshop where we turn your product challenges into AI feature specs. You'll leave with prototyped concepts, feasibility assessments, and a concrete action plan — not theoretical possibilities.",
    services: ['Ideation Sessions', 'AI Audit'],
    cta: 'Book a workshop',
  },
  'product-know_what': {
    title: 'AI Builds + AI Expert',
    desc: "We work alongside your product team from spec to ship. You'll see working features within the first sprint, not just technical demos. We think in user outcomes, not model metrics.",
    services: ['AI Builds', 'AI Expert'],
    cta: 'Start your first sprint',
  },
  'product-stuck': {
    title: 'Project Surgery + AI Builds',
    desc: "We'll figure out why it stalled — wrong scope, data issues, model fit, or UX problems — and rebuild with a clear path to ship. Most stalled features can be unblocked in 1-2 sprints with the right diagnosis.",
    services: ['Project Surgery', 'AI Builds'],
    cta: 'Unblock your feature',
  },
  'product-need_hands': {
    title: 'AI Expert + AI Builds',
    desc: "AI engineers who think like product people. They'll join your sprint ceremonies, understand your user stories, and ship features — not just models. They bridge the gap between what product needs and what ML can deliver.",
    services: ['AI Expert', 'AI Builds'],
    cta: 'Add to your team',
  },
  'product-scaling': {
    title: 'AI Expert + AI Transformation',
    desc: "We'll help you build repeatable processes for shipping AI features: from experimentation frameworks to model governance. Your product org will go from shipping one AI feature to shipping many, consistently.",
    services: ['AI Expert', 'AI Transformation'],
    cta: 'Build your AI playbook',
  },

  // ── Commercial Leader ──
  'commercial-no_start': {
    title: 'AI Transformation + Ideation Sessions',
    desc: "We'll map your business operations and identify where AI creates the most commercial value — revenue, efficiency, or competitive advantage. You'll get a business case with projected ROI, not a technology pitch.",
    services: ['AI Transformation', 'Ideation Sessions'],
    cta: 'See the opportunities',
  },
  'commercial-know_what': {
    title: 'AI Builds + AI Transformation',
    desc: "We'll build the tools and automations that drive measurable revenue and efficiency gains. You'll see results in your KPIs within the first quarter — pipeline acceleration, cost reduction, or new revenue streams.",
    services: ['AI Builds', 'AI Transformation'],
    cta: 'Build for impact',
  },
  'commercial-stuck': {
    title: 'Project Surgery + AI Transformation',
    desc: "We'll diagnose the disconnect between your AI investment and commercial results — misaligned KPIs, wrong use case, adoption gaps, or execution issues. Then we'll course-correct with a revised plan tied to business outcomes.",
    services: ['Project Surgery', 'AI Transformation'],
    cta: 'Fix the ROI gap',
  },
  'commercial-need_hands': {
    title: 'AI Builds + AI Expert',
    desc: "Engineering capacity focused on commercial impact. Our team builds the integrations, automations, and AI tools that move your business metrics — not just your technology stack.",
    services: ['AI Builds', 'AI Expert'],
    cta: 'Add engineering capacity',
  },
  'commercial-scaling': {
    title: 'AI Transformation + AI Expert',
    desc: "We'll help you replicate what's working across departments and geographies. You'll get a playbook for scaling AI commercially — including change management, training, and governance — so results compound.",
    services: ['AI Transformation', 'AI Expert'],
    cta: 'Scale across the business',
  },

  // ── Other ──
  'other-no_start': {
    title: 'AI Audit + Ideation Sessions',
    desc: "We'll start with an honest assessment of where you are and a hands-on workshop to explore what's possible. You'll leave with a clear starting point — not an overwhelming list of everything AI could theoretically do.",
    services: ['AI Audit', 'Ideation Sessions'],
    cta: 'Start the conversation',
  },
  'other-know_what': {
    title: 'AI Builds + AI Expert',
    desc: "Senior engineers building production software tailored to your needs. You'll see working code in the first week, a deployed system within the month, and full knowledge transfer so you can maintain it independently.",
    services: ['AI Builds', 'AI Expert'],
    cta: 'Start building together',
  },
  'other-stuck': {
    title: 'Project Surgery + AI Audit',
    desc: "Fresh eyes and deep expertise. We'll diagnose the blockers, chart a clear path forward, and get things moving again — usually within weeks, not months. No judgement, just solutions.",
    services: ['Project Surgery', 'AI Audit'],
    cta: 'Get a fresh perspective',
  },
  'other-need_hands': {
    title: 'AI Expert + AI Builds',
    desc: "Experienced engineers who ramp fast, ship real code, and transfer knowledge as they go. They'll feel like part of your team from day one — because that's exactly how we work.",
    services: ['AI Expert', 'AI Builds'],
    cta: 'Meet our engineers',
  },
  'other-scaling': {
    title: 'AI Expert + AI Transformation',
    desc: "Strategic advisory combined with hands-on engineering. We'll help you build the team, processes, and infrastructure to scale your AI operations — then step back when you're ready to run independently.",
    services: ['AI Expert', 'AI Transformation'],
    cta: 'Plan your next phase',
  },
}

// ── Testimonials ──
export interface Testimonial {
  quote: string
  author: string
  role: string
  /** Optional link to a full case study page for this customer. */
  caseStudyHref?: string
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: "They've gone beyond just a number of engineers that I'm outsourcing AI for. They truly have been a thought partner, someone that's been very dependable and someone who helped us shape our strategy.",
    author: 'Dipak Patel',
    role: 'CEO of Globo',
    caseStudyHref: '/customers/globo',
  },
  {
    quote: "Progression Labs transformed our approach to AI implementation. Their team delivered beyond our expectations and helped us achieve results we didn't think were possible.",
    author: 'Sarah Chen',
    role: 'CTO of TechVentures',
  },
  {
    quote: 'Working with Progression Labs has been a game-changer. They brought deep expertise and a collaborative approach that made all the difference in our AI journey.',
    author: 'Michael Roberts',
    role: 'VP Engineering at DataFlow',
  },
]

// ── Blog Posts ──
export interface BlogPost {
  category: string
  date: string
  title: string
  excerpt: string
  image?: string
  video?: string
}

export const BLOG_POSTS: BlogPost[] = [
  {
    category: 'Engineering',
    date: '2026-02-28',
    title: 'Vibe Coding and the Death of Syntax',
    excerpt:
      'Karpathy coined it — programming via natural language, forgetting code exists. What this means for engineering teams and the future of software craft.',
    image: '/blog/vibe-coding.png',
    video: '/blog/blue-white-horse.mp4',
  },
  {
    category: 'Insights',
    date: '2026-02-12',
    title: 'Ghost Intelligence: Why LLMs Are Not What You Think',
    excerpt:
      'LLMs are "summoned ghosts", not gradually evolving animals. A fundamentally new type of intelligence that demands a new mental model.',
    image: '/blog/ghost-intelligence.png',
    video: '/blog/green-yellow-frog.mp4',
  },
  {
    category: 'Strategy',
    date: '2026-01-24',
    title: 'RLVR: The Quiet Revolution in How Models Learn to Reason',
    excerpt:
      'Reinforcement Learning from Verifiable Rewards — the shift from probabilistic imitation to logical reasoning that defined 2025.',
    image: '/blog/rlvr-revolution.png',
    video: '/blog/vibrant-green-flower.mp4',
  },
  {
    category: 'Process',
    date: '2026-01-08',
    title: 'The Magnitude 9 Earthquake: Engineering in the Agent Era',
    excerpt:
      'The profession is being dramatically refactored — agents, subagents, prompts, MCP, tools, plugins. How to ride the wave instead of drowning in it.',
    image: '/blog/magnitude-earthquake.png',
    video: '/blog/salmon-pink-jelly.mp4',
  },
]
