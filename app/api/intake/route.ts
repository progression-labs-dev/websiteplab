import { NextRequest, NextResponse } from 'next/server'
import { CONTACT_EMAIL } from '../../experiment/data/siteContent'

// Node runtime (matches app/api/tools/mosaic/download/route.ts). crypto.randomUUID
// and fetch are available; AbortSignal.timeout is reliable here.
export const runtime = 'nodejs'

const MAX_BODY_BYTES = 16 * 1024 // 16 KB — generous for JSON intake, blocks abuse.
const ESTIMATED_RESPONSE_TIME = '1–2 business days'

const BUDGET_RANGES = [
  'under_25k',
  '25k_50k',
  '50k_100k',
  '100k_250k',
  '250k_plus',
  'not_sure',
] as const

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}

interface Inquiry {
  inquiry_id: string
  project_name?: string
  project_description: string
  budget_range?: string
  timeline?: string
  technologies?: string[]
  contact_email: string
  message?: string
  received_at: string
  source: string
  user_agent: string | null
}

type InquiryFields = Omit<
  Inquiry,
  'inquiry_id' | 'received_at' | 'source' | 'user_agent'
>

// ── Validation (hand-rolled; zod is not a dependency) ────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isString(v: unknown): v is string {
  return typeof v === 'string'
}

function validate(
  raw: unknown,
): { ok: true; data: InquiryFields } | { ok: false; errors: string[] } {
  const errors: string[] = []
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { ok: false, errors: ['Body must be a JSON object.'] }
  }
  const b = raw as Record<string, unknown>

  if (!isString(b.project_description) || b.project_description.trim().length < 10) {
    errors.push('project_description is required (string, min 10 chars).')
  } else if (b.project_description.length > 5000) {
    errors.push('project_description must be <= 5000 chars.')
  }

  if (
    !isString(b.contact_email) ||
    !EMAIL_RE.test(b.contact_email) ||
    b.contact_email.length > 320
  ) {
    errors.push('contact_email is required and must be a valid email.')
  }

  if (
    b.project_name !== undefined &&
    (!isString(b.project_name) || b.project_name.length > 200)
  ) {
    errors.push('project_name must be a string <= 200 chars.')
  }
  if (
    b.budget_range !== undefined &&
    (!isString(b.budget_range) || !BUDGET_RANGES.includes(b.budget_range as never))
  ) {
    errors.push(`budget_range must be one of: ${BUDGET_RANGES.join(', ')}.`)
  }
  if (
    b.timeline !== undefined &&
    (!isString(b.timeline) || b.timeline.length > 200)
  ) {
    errors.push('timeline must be a string <= 200 chars.')
  }
  if (b.technologies !== undefined) {
    if (
      !Array.isArray(b.technologies) ||
      b.technologies.length > 50 ||
      !b.technologies.every((t) => isString(t) && t.length <= 100)
    ) {
      errors.push(
        'technologies must be an array (<=50) of strings (each <=100 chars).',
      )
    }
  }
  if (b.message !== undefined && (!isString(b.message) || b.message.length > 5000)) {
    errors.push('message must be a string <= 5000 chars.')
  }

  if (errors.length) return { ok: false, errors }

  return {
    ok: true,
    data: {
      project_name: b.project_name as string | undefined,
      project_description: (b.project_description as string).trim(),
      budget_range: b.budget_range as string | undefined,
      timeline: b.timeline as string | undefined,
      technologies: b.technologies as string[] | undefined,
      contact_email: (b.contact_email as string).trim(),
      message: b.message as string | undefined,
    },
  }
}

// ── Delivery seam ────────────────────────────────────────────────────────────
// THE ONE PLACE to wire real delivery (email / Slack / Notion) later. Interim
// behavior = server-side PostHog capture + structured log. Never throws to the
// caller — the response always points the agent at CONTACT_EMAIL as a guaranteed
// channel, so no inquiry is ever silently lost.
async function deliverInquiry(inquiry: Inquiry): Promise<void> {
  // 1. Structured log — visible in Vercel function logs, greppable, never lost.
  console.info('[intake] inquiry received', JSON.stringify(inquiry))

  // 2. Server-side PostHog capture (reuses the already-public NEXT_PUBLIC_ key —
  //    no new secret introduced).
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com'
  if (key) {
    try {
      await fetch(`${host.replace(/\/$/, '')}/i/v0/e/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: key,
          event: 'agent_intake_submitted',
          distinct_id: inquiry.contact_email || inquiry.inquiry_id,
          properties: {
            inquiry_id: inquiry.inquiry_id,
            project_name: inquiry.project_name ?? null,
            budget_range: inquiry.budget_range ?? null,
            timeline: inquiry.timeline ?? null,
            technologies: inquiry.technologies ?? [],
            description_length: inquiry.project_description.length,
            source: inquiry.source,
            $lib: 'progression-labs-intake-api',
            user_agent: inquiry.user_agent,
          },
          timestamp: inquiry.received_at,
        }),
        // Don't let a slow analytics host block the agent's response.
        signal: AbortSignal.timeout(3000),
      })
    } catch (err) {
      console.error('[intake] posthog capture failed (inquiry still logged)', err)
    }
  }

  // TODO(intake-delivery): wire real delivery here once the destination is decided.
  // e.g. await sendEmail(CONTACT_EMAIL, inquiry) / postToSlack(inquiry) / createNotionPage(inquiry).
}

// ── POST /api/intake ─────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const ct = request.headers.get('content-type') || ''
  if (!ct.includes('application/json')) {
    return NextResponse.json(
      { error: 'Content-Type must be application/json.', contact_email: CONTACT_EMAIL },
      { status: 415, headers: CORS_HEADERS },
    )
  }

  const declaredLen = Number(request.headers.get('content-length') || '0')
  if (declaredLen > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: `Payload too large (max ${MAX_BODY_BYTES} bytes).`, contact_email: CONTACT_EMAIL },
      { status: 413, headers: CORS_HEADERS },
    )
  }

  const rawText = await request.text()
  if (rawText.length > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: `Payload too large (max ${MAX_BODY_BYTES} bytes).`, contact_email: CONTACT_EMAIL },
      { status: 413, headers: CORS_HEADERS },
    )
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(rawText)
  } catch {
    return NextResponse.json(
      { error: 'Malformed JSON.', contact_email: CONTACT_EMAIL },
      { status: 400, headers: CORS_HEADERS },
    )
  }

  const result = validate(parsed)
  if (!result.ok) {
    return NextResponse.json(
      {
        error: 'Validation failed.',
        details: result.errors,
        contact_email: CONTACT_EMAIL,
        hint: `If you cannot complete this submission, email ${CONTACT_EMAIL} directly — that is the guaranteed channel.`,
      },
      { status: 422, headers: CORS_HEADERS },
    )
  }

  const inquiry: Inquiry = {
    inquiry_id: crypto.randomUUID(),
    ...result.data,
    received_at: new Date().toISOString(),
    source: 'a2a-intake-api',
    user_agent: request.headers.get('user-agent'),
  }

  await deliverInquiry(inquiry)

  return NextResponse.json(
    {
      inquiry_id: inquiry.inquiry_id,
      status: 'received',
      estimated_response_time: ESTIMATED_RESPONSE_TIME,
      next_steps: [
        `A member of the Progression Labs team will review your inquiry and reply within ${ESTIMATED_RESPONSE_TIME}.`,
        `For a guaranteed response, also email ${CONTACT_EMAIL} and reference inquiry_id ${inquiry.inquiry_id}.`,
      ],
      contact_email: CONTACT_EMAIL,
    },
    { status: 201, headers: CORS_HEADERS },
  )
}

// ── GET /api/intake — self-describing ────────────────────────────────────────
export async function GET() {
  return NextResponse.json(
    {
      service: 'Progression Labs project intake',
      method: 'POST',
      content_type: 'application/json',
      agent_card: 'https://www.progressionlabs.com/.well-known/agent-card.json',
      required_fields: ['project_description', 'contact_email'],
      optional_fields: ['project_name', 'budget_range', 'timeline', 'technologies', 'message'],
      budget_range_values: BUDGET_RANGES,
      guaranteed_channel: CONTACT_EMAIL,
      note: 'Submit a project inquiry by POSTing JSON. See the Agent Card for the full input/output schema.',
    },
    { status: 200, headers: CORS_HEADERS },
  )
}

// ── OPTIONS preflight ────────────────────────────────────────────────────────
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}
