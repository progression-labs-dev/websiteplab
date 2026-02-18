'use client';

import { Muxer, ArrayBufferTarget } from 'mp4-muxer';

/**
 * Returns true if the current browser supports the WebCodecs API
 * and the VideoEncoder/VideoFrame interfaces needed for export.
 */
export function supportsWebCodecs(): boolean {
  return (
    typeof VideoEncoder !== 'undefined' &&
    typeof VideoFrame !== 'undefined' &&
    typeof VideoDecoder !== 'undefined'
  );
}

export interface VideoEncoderConfig {
  width: number;
  height: number;
  fps: number;
  bitrate: number;
  keyframeInterval?: number; // frames between forced keyframes, default 60
}

export interface MosaicVideoEncoder {
  encodeFrame: (canvas: HTMLCanvasElement, timestampMicros: number) => Promise<void>;
  finalize: () => Promise<Blob>;
  close: () => void;
}

/**
 * Creates a VideoEncoder + Muxer pipeline configured for H.264 baseline
 * output in an MP4 container. Returns an object with `encodeFrame`,
 * `finalize`, and `close` methods.
 *
 * Backpressure strategy: we await a small busy-wait loop when
 * `encodeQueueSize` exceeds a threshold before pushing another frame.
 */
export async function createVideoEncoder(config: VideoEncoderConfig): Promise<MosaicVideoEncoder> {
  if (!supportsWebCodecs()) {
    throw new Error(
      'WebCodecs API is not available in this browser. ' +
      'Please use Chrome 94+ or Edge 94+.'
    );
  }

  const { fps, bitrate, keyframeInterval = 60 } = config;

  // H.264 requires even dimensions — round down if odd
  const width = config.width % 2 === 0 ? config.width : config.width - 1;
  const height = config.height % 2 === 0 ? config.height : config.height - 1;

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: {
      codec: 'avc',
      width,
      height,
    },
    fastStart: 'in-memory',
  });

  let encoderError: Error | null = null;

  const encoder = new VideoEncoder({
    output: (chunk, meta) => {
      muxer.addVideoChunk(chunk, meta);
    },
    error: (e) => {
      encoderError = e;
      console.error('[videoEncoder] VideoEncoder error:', e);
    },
  });

  encoder.configure({
    codec: 'avc1.640028', // H.264 High Profile Level 4.0 (best macOS/QuickTime compat)
    width,
    height,
    bitrate,
    framerate: fps,
    latencyMode: 'quality',
  });

  let frameCount = 0;

  /**
   * Waits until the encoder's internal queue drains below a safe threshold.
   * This prevents memory exhaustion when frames are generated faster than
   * the encoder can process them.
   */
  async function waitForBackpressure(): Promise<void> {
    const MAX_QUEUE = 8;
    while (encoder.encodeQueueSize > MAX_QUEUE) {
      await new Promise<void>(resolve => setTimeout(resolve, 10));
    }
  }

  async function encodeFrame(canvas: HTMLCanvasElement, timestampMicros: number): Promise<void> {
    if (encoderError) throw encoderError;

    await waitForBackpressure();

    const frame = new VideoFrame(canvas, { timestamp: timestampMicros });
    const isKeyFrame = frameCount % keyframeInterval === 0;

    encoder.encode(frame, { keyFrame: isKeyFrame });
    frame.close();
    frameCount++;
  }

  async function finalize(): Promise<Blob> {
    if (encoderError) throw encoderError;

    // Flush drains all pending encode operations.
    await encoder.flush();

    muxer.finalize();

    const { buffer } = (muxer.target as ArrayBufferTarget);
    return new Blob([buffer], { type: 'video/mp4' });
  }

  function close(): void {
    try {
      if (encoder.state !== 'closed') {
        encoder.close();
      }
    } catch {
      // Ignore errors on close — encoder may already be closed
    }
  }

  return { encodeFrame, finalize, close };
}
