import { NextRequest, NextResponse } from 'next/server';

/**
 * Temporary in-memory store for pending video downloads.
 * The client POSTs the encoded MP4 blob, receives a token,
 * then navigates to the GET endpoint with that token.
 * The GET responds with Content-Disposition: attachment,
 * which forces the browser to download with the correct filename.
 */
const pending = new Map<string, { data: ArrayBuffer; filename: string; expires: number }>();

function cleanup() {
  const now = Date.now();
  pending.forEach((val, key) => {
    if (val.expires < now) pending.delete(key);
  });
}

export async function POST(request: NextRequest) {
  cleanup();

  const data = await request.arrayBuffer();
  const filename = request.headers.get('x-filename') || `mosaic-export-${Date.now()}.mp4`;
  const token = crypto.randomUUID();

  // Store for 2 minutes — plenty of time for the GET redirect
  pending.set(token, { data, filename, expires: Date.now() + 120_000 });

  return NextResponse.json({ token });
}

export async function GET(request: NextRequest) {
  cleanup();

  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return new NextResponse('Missing token', { status: 400 });
  }

  const download = pending.get(token);
  if (!download) {
    return new NextResponse('Download expired or not found', { status: 404 });
  }

  // One-time use — delete immediately
  pending.delete(token);

  return new NextResponse(download.data, {
    status: 200,
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment; filename="${download.filename}"`,
      'Content-Length': String(download.data.byteLength),
    },
  });
}
