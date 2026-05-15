import { GoogleGenAI } from '@google/genai';
import { readFileSync } from 'node:fs';

// Nano Banana Pro — high-res image gen with aspectRatio + imageSize config.
// Use this for both Pass A (silhouette base) and Pass B (style transfer).
const MODEL_ID = 'gemini-3-pro-image-preview';

export interface RefImage {
  path: string;
  mimeType: 'image/png' | 'image/jpeg';
}

export interface GenerateOpts {
  prompt: string;
  refImages?: RefImage[];
  aspectRatio?: '1:1' | '4:5' | '3:4' | '16:9' | '9:16';
  resolution?: '1K' | '2K' | '4K';
}

let _client: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (_client) return _client;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not set. Add it to .env.local at the project root.',
    );
  }
  _client = new GoogleGenAI({ apiKey });
  return _client;
}

function loadRef(ref: RefImage) {
  const data = readFileSync(ref.path).toString('base64');
  return { inlineData: { mimeType: ref.mimeType, data } };
}

export async function generateImage(opts: GenerateOpts): Promise<Buffer> {
  const parts: any[] = [];
  for (const ref of opts.refImages ?? []) {
    parts.push(loadRef(ref));
  }
  parts.push({ text: opts.prompt });

  const response = await client().models.generateContent({
    model: MODEL_ID,
    contents: [{ role: 'user', parts }],
    config: {
      imageConfig: {
        aspectRatio: opts.aspectRatio ?? '1:1',
        imageSize: opts.resolution ?? '2K',
      },
    } as any,
  });

  const candidate = response.candidates?.[0];
  if (!candidate?.content?.parts) {
    throw new Error('Gemini returned no content parts');
  }

  for (const part of candidate.content.parts) {
    const inline = (part as any).inlineData;
    if (inline?.data) {
      return Buffer.from(inline.data, 'base64');
    }
    if ((part as any).text) {
      // Surface any model commentary for debugging.
      console.error('[gemini text]', (part as any).text);
    }
  }

  throw new Error('Gemini response contained no image data');
}
