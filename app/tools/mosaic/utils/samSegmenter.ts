/**
 * samSegmenter.ts — SlimSAM (Segment Anything Model) integration for browser-based segmentation.
 *
 * Architecture: SAM splits into a heavy image encoder (run once per image) and a lightweight
 * mask decoder (run per click). We cache the encoder output so each click only costs ~50ms.
 *
 * Uses dynamic import() to avoid loading the ~25MB model during SSR.
 */

import type { ImageBuffer } from './imageProcessing';

// ---- Types ----

export interface PointPrompt {
  x: number;
  y: number;
  label: 0 | 1; // 0 = background, 1 = foreground
}

export interface ImageEmbeddings {
  image_embeddings: unknown;       // Tensor from transformers.js
  image_positional_embeddings: unknown; // Tensor from transformers.js
}

export interface SAMLoadProgress {
  status: string;
  file?: string;
  progress?: number;
  loaded?: number;
  total?: number;
}

// ---- Module-level singleton state ----

let model: any = null;
let processor: any = null;
let loading: Promise<void> | null = null;

const MODEL_ID = 'Xenova/slimsam-77-uniform';

// ---- Public API ----

/**
 * Lazily loads the SlimSAM model and processor. Subsequent calls return
 * immediately if already loaded. The onProgress callback receives download
 * progress events (file name, bytes loaded, total).
 */
export async function loadSAM(
  onProgress?: (info: SAMLoadProgress) => void
): Promise<void> {
  if (model && processor) return;
  if (loading) return loading;

  loading = (async () => {
    const { SamModel, AutoProcessor } = await import('@huggingface/transformers');

    const progressCallback = onProgress
      ? (event: any) => {
          onProgress({
            status: event.status,
            file: event.file,
            progress: event.progress,
            loaded: event.loaded,
            total: event.total,
          });
        }
      : undefined;

    // Load model and processor in parallel
    const [m, p] = await Promise.all([
      SamModel.from_pretrained(MODEL_ID, {
        progress_callback: progressCallback,
      }),
      AutoProcessor.from_pretrained(MODEL_ID),
    ]);

    model = m;
    processor = p;
  })();

  try {
    await loading;
  } catch (err) {
    // Reset so a retry can attempt loading again
    loading = null;
    throw err;
  }
}

/**
 * Runs the heavy image encoder on an ImageBuffer. Returns cached embeddings
 * that can be reused for multiple decode calls on the same image.
 *
 * Expects loadSAM() to have been called first.
 */
export async function encodeImage(
  imageBuffer: ImageBuffer
): Promise<ImageEmbeddings> {
  if (!model || !processor) {
    throw new Error('SAM model not loaded. Call loadSAM() first.');
  }

  const { RawImage } = await import('@huggingface/transformers');

  // Create a RawImage from the RGBA Uint8ClampedArray
  const rawImage = new RawImage(
    imageBuffer.data,
    imageBuffer.width,
    imageBuffer.height,
    4 // RGBA channels
  );

  // Process the image to get pixel_values (resized/normalized for SAM)
  const processed = await processor(rawImage);

  // Run the image encoder only
  const embeddings = await model.get_image_embeddings({
    pixel_values: processed.pixel_values,
  });

  return {
    image_embeddings: embeddings.image_embeddings,
    image_positional_embeddings: embeddings.image_positional_embeddings,
  };
}

/**
 * Runs the lightweight mask decoder with cached embeddings and point prompts.
 * Returns a flat Uint8Array with 1 byte per pixel (1 = foreground, 0 = background),
 * same dimensions as the original image.
 *
 * The decoder produces 3 candidate masks with IoU scores; we pick the best one.
 */
export async function decodeMask(
  embeddings: ImageEmbeddings,
  points: PointPrompt[],
  imageSize: { width: number; height: number }
): Promise<Uint8Array> {
  if (!model || !processor) {
    throw new Error('SAM model not loaded. Call loadSAM() first.');
  }

  if (points.length === 0) {
    // No points — return empty mask
    return new Uint8Array(imageSize.width * imageSize.height);
  }

  const { RawImage, Tensor } = await import('@huggingface/transformers');

  // Build a dummy image just to get original_sizes / reshaped_input_sizes
  // from the processor (we won't re-encode, we use cached embeddings).
  const dummyImage = new RawImage(
    new Uint8ClampedArray(imageSize.width * imageSize.height * 4),
    imageSize.width,
    imageSize.height,
    4
  );

  // Format points: [[[x1,y1], [x2,y2], ...]]  (3D → auto-batched to 4D)
  const inputPoints = [points.map(p => [p.x, p.y])];
  const inputLabels = [points.map(p => p.label)];

  const processed = await processor(dummyImage, {
    input_points: inputPoints,
    input_labels: inputLabels,
  });

  // Run the decoder with cached embeddings (skips the encoder)
  const outputs = await model.forward({
    image_embeddings: embeddings.image_embeddings,
    image_positional_embeddings: embeddings.image_positional_embeddings,
    input_points: processed.input_points,
    input_labels: processed.input_labels,
  });

  // Post-process: upscale masks to original image dimensions and binarize
  const masks = await processor.post_process_masks(
    outputs.pred_masks,
    processed.original_sizes,
    processed.reshaped_input_sizes
  );

  // masks[0] has shape [1, 3, height, width] (3 candidate masks, binarized to bool)
  // outputs.iou_scores has shape [1, 1, 3] — pick the mask with highest IoU
  const iouData = outputs.iou_scores.data as Float32Array;
  let bestIdx = 0;
  let bestIou = -Infinity;
  for (let i = 0; i < 3; i++) {
    if (iouData[i] > bestIou) {
      bestIou = iouData[i];
      bestIdx = i;
    }
  }

  // Extract the best mask: masks[0] is a Tensor with dims [1, 3, H, W]
  const maskTensor = masks[0];
  const h = imageSize.height;
  const w = imageSize.width;
  const maskData = maskTensor.data as Uint8Array;

  // The mask data is laid out as [num_prompts=1, num_masks=3, H, W]
  // We want maskData[bestIdx * H * W ... (bestIdx+1) * H * W]
  const offset = bestIdx * h * w;
  const bestMask = new Uint8Array(h * w);
  for (let i = 0; i < h * w; i++) {
    bestMask[i] = maskData[offset + i];
  }

  return bestMask;
}

/**
 * Returns true if the SAM model singleton has been loaded and is ready to use.
 */
export function isModelLoaded(): boolean {
  return model !== null && processor !== null;
}

/**
 * Tracks a subject across a video frame using keyframe-based re-encoding.
 *
 * On keyframes (`forceReencode = true`), encodes the frame and decodes a fresh
 * mask from the given point prompts. Between keyframes, returns `previousMask`
 * unchanged to avoid the expensive encoder step.
 *
 * Falls back to `previousMask` (or an empty mask if null) on any error.
 */
export async function trackSubjectOnFrame(
  frameBuffer: ImageBuffer,
  points: Array<{ x: number; y: number; label: 0 | 1 }>,
  previousMask: Uint8Array | null,
  forceReencode: boolean
): Promise<Uint8Array> {
  if (!model || !processor) {
    throw new Error('SAM model not loaded. Call loadSAM() first.');
  }

  if (!forceReencode) {
    // Between keyframes: reuse the previous mask as-is.
    if (previousMask) return previousMask;
    return new Uint8Array(frameBuffer.width * frameBuffer.height);
  }

  // Keyframe: run the full encode → decode pipeline.
  try {
    const embeddings = await encodeImage(frameBuffer);
    const imageSize = { width: frameBuffer.width, height: frameBuffer.height };
    return await decodeMask(embeddings, points, imageSize);
  } catch (err) {
    console.warn('[samSegmenter] trackSubjectOnFrame encode/decode failed, falling back to previous mask:', err);
    if (previousMask) return previousMask;
    return new Uint8Array(frameBuffer.width * frameBuffer.height);
  }
}

/**
 * Frees model and processor from memory.
 */
export async function disposeSAM(): Promise<void> {
  if (model) {
    if (typeof model.dispose === 'function') {
      await model.dispose();
    }
    model = null;
  }
  processor = null;
  loading = null;
}
