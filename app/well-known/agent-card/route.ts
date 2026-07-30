import { CONTACT_EMAIL, LINKEDIN_URL } from '../../experiment/data/siteContent'

// Canonical host is www.
const SITE_URL = 'https://www.progressionlabs.com'
const AGENT_CARD_VERSION = '1.0.0'

/**
 * A2A (Agent2Agent) Agent Card.
 *
 * Served (via next.config.js rewrites) at:
 *   - /.well-known/agent-card.json  (current convention)
 *   - /.well-known/agent.json       (legacy mirror)
 *
 * This is a route handler rather than a static public/ file so that
 * siteContent.ts stays the single source of truth — matching the
 * app/llms.txt/route.ts pattern. Next.js ignores dot-prefixed segments in the
 * app dir, hence the non-dotted folder + rewrite.
 */
function buildAgentCard() {
  return {
    protocolVersion: '0.3.0',
    name: 'Progression Labs Intake Agent',
    description:
      'Discovery and intake agent for Progression Labs, an AI consultancy that builds custom, production-grade AI agents and systems for complex real-world problems. Submit a project inquiry and receive a structured acknowledgement plus next steps.',
    version: AGENT_CARD_VERSION,
    url: `${SITE_URL}/api/intake`,
    // Lightweight REST intake (plain JSON POST), not a JSON-RPC server.
    preferredTransport: 'HTTP+JSON',
    provider: {
      organization: 'Progression Labs',
      url: SITE_URL,
    },
    iconUrl: `${SITE_URL}/logo-black.png`,
    documentationUrl: `${SITE_URL}/llms.txt`,
    capabilities: {
      streaming: false,
      pushNotifications: false,
      stateTransitionHistory: false,
    },
    defaultInputModes: ['application/json', 'text/plain'],
    defaultOutputModes: ['application/json', 'text/plain'],
    securitySchemes: {
      // Open intake — no auth required to submit an inquiry.
      none: {
        type: 'none',
        description:
          'Public intake endpoint. No authentication required to submit an inquiry.',
      },
    },
    security: [{ none: [] }],
    skills: [
      {
        id: 'submit-project-inquiry',
        name: 'Submit a project inquiry',
        description:
          'Submit a project inquiry to Progression Labs on behalf of a user or organization. ' +
          'Provide project details (name, description, budget range, timeline, technologies, contact email, message). ' +
          'Returns a structured acknowledgement with an inquiry_id, status, estimated response time, and next steps. ' +
          `Inquiries are also reachable as a guaranteed fallback by emailing ${CONTACT_EMAIL}.`,
        tags: ['intake', 'sales', 'consulting', 'ai', 'rest'],
        examples: [
          'We need a custom RAG agent over our internal docs, ~$50k budget, live in 8 weeks.',
          'Our AI project stalled on data pipeline issues — can you do project surgery?',
        ],
        inputModes: ['application/json'],
        outputModes: ['application/json'],
        // Agents POST this JSON body to {url}.
        inputSchema: {
          $schema: 'https://json-schema.org/draft/2020-12/schema',
          type: 'object',
          additionalProperties: false,
          required: ['project_description', 'contact_email'],
          properties: {
            project_name: {
              type: 'string',
              maxLength: 200,
              description: 'Short name or title for the project.',
            },
            project_description: {
              type: 'string',
              minLength: 10,
              maxLength: 5000,
              description: 'What you want to build or the problem to solve.',
            },
            budget_range: {
              type: 'string',
              enum: [
                'under_25k',
                '25k_50k',
                '50k_100k',
                '100k_250k',
                '250k_plus',
                'not_sure',
              ],
              description: 'Approximate budget range in USD.',
            },
            timeline: {
              type: 'string',
              maxLength: 200,
              description: 'Desired timeline or target launch date (free text).',
            },
            technologies: {
              type: 'array',
              maxItems: 50,
              items: { type: 'string', maxLength: 100 },
              description: 'Relevant technologies, stacks, or constraints.',
            },
            contact_email: {
              type: 'string',
              format: 'email',
              maxLength: 320,
              description: 'Email of the human we should reply to.',
            },
            message: {
              type: 'string',
              maxLength: 5000,
              description: 'Any additional context for the team.',
            },
          },
        },
        outputSchema: {
          $schema: 'https://json-schema.org/draft/2020-12/schema',
          type: 'object',
          required: ['inquiry_id', 'status', 'contact_email'],
          properties: {
            inquiry_id: {
              type: 'string',
              description: 'Unique id for this inquiry (UUID).',
            },
            status: { type: 'string', enum: ['received'] },
            estimated_response_time: { type: 'string' },
            next_steps: { type: 'array', items: { type: 'string' } },
            contact_email: {
              type: 'string',
              format: 'email',
              description:
                'Guaranteed human channel — email this address directly for a guaranteed response.',
            },
          },
        },
      },
    ],
    // Human/agent-operator convenience.
    additionalInterfaces: [{ url: `${SITE_URL}/api/intake`, transport: 'REST' }],
    contact: {
      email: CONTACT_EMAIL,
      linkedin: LINKEDIN_URL,
    },
  }
}

export async function GET() {
  return new Response(JSON.stringify(buildAgentCard(), null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
}
