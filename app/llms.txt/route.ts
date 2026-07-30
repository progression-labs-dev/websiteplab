import {
  NAV_LINKS,
  HERO_CONTENT,
  CTA_CONTENT,
  ROLES,
  JOURNEYS,
  RECOMMENDATIONS,
  TESTIMONIALS,
  BLOG_POSTS,
  CONTACT_EMAIL,
  LINKEDIN_URL,
} from '../experiment/data/siteContent'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function buildLlmsTxt(): string {
  const brainstormHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Let's schedule a brainstorm")}`

  const recommendations = ROLES.map(role =>
    `### ${role.label}\n\n` +
    JOURNEYS.map(journey => {
      const rec = RECOMMENDATIONS[`${role.id}-${journey.id}`]
      if (!rec) return ''
      return `**${journey.label}**\n> **${rec.title}**\n> ${rec.desc}\n> Services: ${rec.services.join(', ')}\n> CTA: ${rec.cta}`
    }).join('\n\n')
  ).join('\n\n')

  const testimonials = TESTIMONIALS.map(t =>
    `> "${t.quote}"\n> — ${t.author}, ${t.role}`
  ).join('\n\n')

  const blog = BLOG_POSTS.map(p =>
    `### ${p.title}\n*${p.category} · ${formatDate(p.date)}*\n${p.excerpt}`
  ).join('\n\n')

  const forAgents = `## For AI agents

Progression Labs is agent-discoverable via the A2A (Agent2Agent) protocol.

- Agent Card: https://www.progressionlabs.com/.well-known/agent-card.json (legacy mirror: /.well-known/agent.json)
- Skill: \`submit-project-inquiry\`
- Endpoint: POST https://www.progressionlabs.com/api/intake (Content-Type: application/json)

Minimal inquiry body:
- project_description (required, string)
- contact_email (required, email)
- project_name, budget_range, timeline, technologies[], message (optional)

Returns: { inquiry_id, status, estimated_response_time, next_steps, contact_email }.

Guaranteed channel: if anything fails, email ${CONTACT_EMAIL} directly — no inquiry is ever lost.`

  return `# PROGRESSION LABS — AI That Ships

> Custom AI agents that scale for the most complex problems in the real world.

Navigation: ${NAV_LINKS.map(l => l.label).join(' | ')}

---

## Hero

${HERO_CONTENT.control.headline}

---

## Partner

AWS Select Tier Technology Partner

---

## Services — Find Your Fit

Two questions. One recommendation.
Select your role and AI journey stage for a tailored recommendation.

### Roles
${ROLES.map(r => `- ${r.label}`).join('\n')}

### AI Journey Stages
${JOURNEYS.map(j => `- ${j.label}`).join('\n')}

### All Recommendations

${recommendations}

---

## Proof — Testimonials

${testimonials}

---

## Blog — From the Lab

${blog}

---

${forAgents}

---

## Contact

${CTA_CONTENT.heading}
${CTA_CONTENT.subheading}

Email: ${CONTACT_EMAIL}
LinkedIn: https://linkedin.com/company/progressionlabs

---

© 2026 Progression Labs
`
}

export async function GET() {
  const body = buildLlmsTxt()

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
    },
  })
}
