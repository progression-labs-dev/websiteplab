// ── Careers page content — single source of truth for the preview ──
//
// Everything here is PLACEHOLDER copy/assets so we can see the page shape
// before real assets land (founder video/letter, team headshots/quotes, JDs,
// photography — gated on a filming day + team-interview session). Imagery under
// /public/careers is AI-generated brand art (Gemini/Palindrom): hand-drawn
// pixel-dissolve illustrations + photoreal London-office ambiance. Team quotes
// and "Previously" pedigrees below are ILLUSTRATIVE placeholders — swap for the
// real thing after the interview session. Components read only from this file.

export const ANNOUNCEMENT = {
  text: 'We’re hiring Forward Deployed Engineers in London',
  cta: 'View open roles',
  href: '#open-roles',
} as const

export const CAREERS_HERO = {
  eyebrow: 'Careers at Progression Labs',
  headline: 'Build what 50-person teams can’t.',
  subhead:
    'A handful of senior engineers, AI-leveraged, out-shipping companies many times our size. High agency. Total ownership. No fat. If that’s the work you’ve been looking for, you’ll know it reading this page.',
  primaryCta: { label: 'View open roles', href: '#open-roles' },
  secondaryCta: { label: 'Read the founder’s letter', href: '#founders-letter' },
  image: '/careers/hero.png',
  imageAlt:
    'Illustration of a figure stepping through a doorway, half-dissolving into blue pixels',
} as const

// Northslope-style culture/product/team tabs — a tabbed showcase of photoreal
// London-office ambiance with one line of copy each.
export interface CultureTab {
  key: string
  label: string
  heading: string
  body: string
  image: string
  imageAlt: string
}

export const CULTURE = {
  eyebrow: 'Life at Progression Labs',
  heading: 'A small team, in the room, building real things.',
  tabs: [
    {
      key: 'craft',
      label: 'The craft',
      heading: 'Senior people, end to end.',
      body: 'No layers, no hand-offs. You sit with the problem, design the solution, and ship it, with AI leverage that makes one engineer move like a team.',
      image: '/careers/culture-work.png',
      imageAlt: 'Engineers collaborating at a whiteboard in a London office',
    },
    {
      key: 'office',
      label: 'The office',
      heading: 'In person, in London.',
      body: 'A real base built for focused, high-bandwidth work: light, plants, good coffee, and people who actually want to be in the room together.',
      image: '/careers/culture-office.png',
      imageAlt: 'Warm modern London startup office with engineers at work',
    },
    {
      key: 'city',
      label: 'The city',
      heading: 'At the centre of it.',
      body: 'London on the doorstep: clients, talent, and the wider AI scene a short walk away. We’re where the work, and the people who do it, already are.',
      image: '/careers/culture-london.png',
      imageAlt: 'A classic London street beside a modern glass office',
    },
  ] as CultureTab[],
} as const

// Video suite — the ticket's biggest differentiator. Posters are placeholder
// brand imagery; drop real 60-90s clips in once the filming day lands. The
// first item renders full-width as the lead clip.
export interface VideoClip {
  key: string
  label: string
  title: string
  duration: string
  poster: string
}

export const VIDEO_SUITE = {
  eyebrow: 'In their words',
  heading: 'See the work, and the people who do it.',
  intro:
    'No stock footage, no scripts. Short, honest films from inside the team: what the work actually is, why people join, and a day in the life in London. (Coming with our next filming day.)',
  clips: [
    { key: 'why-join', label: 'Founder', title: 'Why join Progression Labs', duration: '2:10', poster: '/careers/hero.png' },
    { key: 'what-fde', label: 'The role', title: 'What is a Forward Deployed Engineer?', duration: '1:40', poster: '/careers/why-leverage.png' },
    { key: 'meet-team', label: 'The team', title: 'Meet the team', duration: '1:25', poster: '/careers/culture-work.png' },
    { key: 'day-life', label: 'London', title: 'A day in the life', duration: '1:55', poster: '/careers/culture-office.png' },
    { key: 'the-craft', label: 'The craft', title: 'How we work, end to end', duration: '2:30', poster: '/careers/culture-london.png' },
  ] as VideoClip[],
} as const

export const WHY_PL = {
  eyebrow: 'Why Progression Labs',
  heading: 'Smallness is the advantage.',
  intro:
    'We’re deliberately small. That’s not a stage we’re trying to grow out of. It’s the point. Senior people, leverage, and speed beat headcount.',
  image: '/careers/why-leverage.png',
  imageAlt:
    'Illustration of one person building a structure far larger than themselves out of blue pixel blocks',
  values: [
    {
      title: 'High agency',
      body: 'No tickets handed down a chain. You see the problem, you own the call, you ship the fix. Operators thrive here; cog-seekers don’t.',
    },
    {
      title: 'Total ownership',
      body: 'You own outcomes end to end, from client conversation to production. The credit and the accountability are both yours.',
    },
    {
      title: 'AI-leveraged speed',
      body: 'We build with AI in the loop, not as a demo. One engineer here moves like a small team. That’s how we out-ship the giants.',
    },
    {
      title: 'No fat',
      body: 'Few meetings, no politics, no busywork. The work is the work. What you make is what matters.',
    },
  ],
} as const

export const FOUNDERS_LETTER = {
  eyebrow: 'A letter from our founder',
  greeting: 'Future Progression Labs FDE,',
  // Placeholder long-form letter — replace with Gabor's real letter (honest,
  // personal, "interview us too" tone; Northslope's is the gold standard).
  paragraphs: [
    'Most careers pages sell you. This one is going to be honest with you instead.',
    'When we started Progression Labs, the bet was simple: a few exceptional people, given real ownership and the best tools, would out-build teams ten times their size. Two years in, that bet keeps paying off, and the people who’ve passed through here have gone on to Anthropic, Arm, and to start their own funded companies.',
    'I won’t pretend this is for everyone. If you want a narrow lane and a manager to tell you what to do, you’ll be unhappy here. But if you’ve been waiting for a place that trusts you with the whole problem, that moves at the speed you can actually work, and where the quality of what you make is the only thing that counts: read on, and then come talk to us.',
    'We take hiring as seriously as we take the work. You should too. Ask us hard questions. We’ll answer them.',
  ],
  signature: 'Gabor Soter',
  signatureRole: 'Founder & CEO',
  portrait: '/team/gabor-soter.jpg',
} as const

export interface Role {
  title: string
  type: string
  location: string
  blurb: string
}

export const OPEN_ROLES = {
  eyebrow: 'Open positions',
  heading: 'Roles open right now.',
  // Placeholder roles — real listings reuse the PDF JDs from the design asset
  // pack. Application flow (ATS vs simple form) is still an open decision, so
  // these CTAs are inert in the preview.
  note: 'No specific stack required. We hire for judgement and agency, not a checklist of frameworks.',
  roles: [
    {
      title: 'Forward Deployed Engineer',
      type: 'Full-time',
      location: 'London / Hybrid',
      blurb: 'Own client problems end to end, from the first conversation to production AI systems in the real world.',
    },
    {
      title: 'Senior Forward Deployed Engineer',
      type: 'Full-time',
      location: 'London / Hybrid',
      blurb: 'Lead the hardest delivery problems and set the technical bar for how we build with AI.',
    },
    {
      title: 'Founding Designer',
      type: 'Full-time',
      location: 'London / Hybrid',
      blurb: 'Shape the craft and product surface of everything we ship, across client work and our own brand.',
    },
  ] as Role[],
  viewAllLabel: 'View all roles',
} as const

export interface HiringStep {
  label: string
  title: string
  body: string
}

export const HOW_WE_HIRE = {
  eyebrow: 'How we hire',
  heading: 'Your path to Progression Labs.',
  fdeNarrative:
    'An FDE at Progression Labs isn’t defined by a language or a framework. It’s someone who can sit with an ambiguous real-world problem, design a solution, build it with AI leverage, and stand behind it in front of a client. If that’s you, the stack is a detail.',
  // Northslope-style 00–04 numbering.
  steps: [
    { label: '00', title: 'Intro conversation', body: 'A real two-way chat. You learn about us, we learn about you. No trick questions.' },
    { label: '01', title: 'Craft deep-dive', body: 'We dig into something you’ve actually built. We care how you think, not whether you memorised algorithms.' },
    { label: '02', title: 'Working session', body: 'We solve a realistic problem together, the way we’d actually work day to day.' },
    { label: '03', title: 'Meet the team', body: 'You meet the people you’d work with and ask us anything. Mutual fit, both directions.' },
    { label: '04', title: 'Offer', body: 'If it’s a yes from both sides, we move fast and make it easy.' },
  ] as HiringStep[],
} as const

export interface TeamMember {
  name: string
  role: string
  location: string
  previously: string
  quote: string
  imageUrl: string | null
}

// Real names/roles pulled from ExperimentTeamSection. Quotes + "Previously"
// pedigrees are ILLUSTRATIVE placeholders to demo the carousel — replace with
// real ones after the team-interview session.
export const MEET_THE_TEAM = {
  eyebrow: 'Meet the team',
  heading: 'The minds behind the mission.',
  members: [
    { name: 'Gabor Soter', role: 'Founder & CEO', location: 'London', previously: 'Palantir', quote: 'I wanted a place where senior people are trusted with the whole problem. We built it.', imageUrl: '/team/gabor-soter.jpg' },
    { name: 'Sam Bourton', role: 'Head of Product', location: 'London', previously: 'Placeholder · Placeholder', quote: 'The gap between idea and shipped is measured in days here, not quarters.', imageUrl: null },
    { name: 'Endre Sagi', role: 'Head of Finance', location: 'London', previously: 'Placeholder · Placeholder', quote: 'Small and disciplined beats big and busy. The numbers agree.', imageUrl: null },
    { name: 'Jon Duffy', role: 'Head of Engineering', location: 'London', previously: 'Placeholder · Placeholder', quote: 'Everyone here can hold the whole system in their head. That changes how you build.', imageUrl: null },
    { name: 'Joe O’Meara', role: 'Associate', location: 'London', previously: 'Placeholder · Placeholder', quote: 'I’ve owned more here in months than I would have in years anywhere else.', imageUrl: '/team/joe-omeara.jpg' },
    { name: 'Conrad Guest', role: 'Senior Engineer', location: 'London', previously: 'Placeholder · Placeholder', quote: 'AI leverage means one of us ships what used to take a team. That’s the fun part.', imageUrl: null },
    { name: 'Chris Little', role: 'Senior Engineer', location: 'London', previously: 'Placeholder · Placeholder', quote: 'No politics, no busywork. Just the work and the people doing it.', imageUrl: null },
    { name: 'Talha Muhammad', role: 'Senior Engineer', location: 'London', previously: 'Placeholder · Placeholder', quote: 'You stand behind what you build, in front of the client. It keeps the bar high.', imageUrl: null },
  ] as TeamMember[],
} as const

export interface LogoItem {
  name: string
  // Monochrome logo asset in /public/logos (rendered as a silhouette, tinted
  // by CSS to match the section tone). null → render the name as a text tile.
  src: string | null
}

export const ALUMNI = {
  eyebrow: 'Where our people go',
  heading: 'This is where you grow, even if you eventually leave.',
  intro:
    'We’re not afraid to say it: some of the best people we’ve worked with have moved on to extraordinary places. That’s the point. Time here compounds.',
  image: '/careers/alumni-growth.png',
  imageAlt:
    'Illustration of a figure ascending a glowing blue pixel path toward a constellation',
  // Real logos for the destinations we’ve named; placeholders stay as text tiles.
  destinations: [
    { name: 'Anthropic', src: '/logos/anthropic.svg' },
    { name: 'Arm', src: '/logos/arm.svg' },
    { name: 'Palantir', src: '/logos/palantir.svg' },
    { name: 'Founded a funded startup', src: null },
  ] as LogoItem[],
  quote: {
    text: '“The two years I spent here did more for me than anywhere else I’ve worked.” (placeholder)',
    attribution: 'Former Progression Labs engineer',
  },
} as const

export const CREDIBILITY = {
  eyebrow: 'Credibility',
  heading: 'The bar we’re held to.',
  // Transparent-bg logos render as crisp silhouettes; the two without a clean
  // transparent asset (McKinsey, QuantumBlack) show as text tiles for now.
  previouslyAt: [
    { name: 'Palantir', src: '/logos/palantir.svg' },
    { name: 'McKinsey & Company', src: null },
    { name: 'QuantumBlack', src: null },
    { name: 'Spotify', src: '/logos/spotify.png' },
  ] as LogoItem[],
  proof: { label: 'Read the Globo case study', href: '#', caption: 'Proof of work (link placeholder)' },
  badges: ['Anthropic Partner (pending)', 'ISO 27001 (when ready)', 'SOC 2 (when ready)'],
} as const

export interface Benefit {
  title: string
  body: string
}

export const BENEFITS = {
  eyebrow: 'Built for growth',
  heading: 'What you get.',
  note: 'Placeholder. We’ll write these up honestly once we’ve decided exactly what PL offers. Some may ship as “coming soon”.',
  items: [
    { title: 'Meaningful equity', body: 'Real ownership in what we’re building together.' },
    { title: 'Health & wellness', body: 'Cover for you, plus a wellness budget.' },
    { title: 'Time off that’s real', body: 'Generous, and actually taken.' },
    { title: 'Offsites', body: 'We get the whole team together, properly.' },
    { title: 'A real office', body: 'A London base built for focused, in-person work.' },
    { title: 'Learning budget', body: 'Conferences, courses, tools. We invest in you.' },
  ] as Benefit[],
} as const
