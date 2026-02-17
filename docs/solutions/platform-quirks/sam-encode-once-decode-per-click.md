---
title: "SAM encode-once decode-per-click architecture for browser ML"
category: platform-quirks
tags: [sam, segment-anything, transformers-js, ml, browser, performance]
module: app/tools/mosaic/utils/samSegmenter.ts
symptom: "Slow segmentation if encoder runs on every click"
root_cause: "SAM's architecture splits into heavy encoder and lightweight decoder — must cache encoder output"
date: 2026-02-17
---

## Problem

Integrating Segment Anything Model (SAM) in the browser requires understanding its two-phase architecture. Naively running the full model on every click takes 1-2 seconds per interaction, making it feel sluggish.

## Root Cause

SAM has two distinct components:
- **Image encoder** (~1-2s): Generates image embeddings — runs once per image
- **Mask decoder** (~50ms): Takes embeddings + click points, generates mask — runs per click

If you don't cache the encoder output, every click re-runs the expensive encoder.

## Solution

Cache the encoder output (`image_embeddings` + `image_positional_embeddings`) and only re-run the decoder when points change:

```ts
// Run once per image:
const embeddings = await model.get_image_embeddings({ pixel_values });

// Run per click (reuses cached embeddings):
const outputs = await model.forward({
  image_embeddings: embeddings.image_embeddings,
  image_positional_embeddings: embeddings.image_positional_embeddings,
  input_points: processed.input_points,
  input_labels: processed.input_labels,
});
```

### Model choice: SlimSAM vs full SAM

| Model | Params | Download | Encode | Decode |
|-------|--------|----------|--------|--------|
| SAM-ViT-H | 632M | ~2.5GB | ~10s | ~100ms |
| SlimSAM-77 | 5.5M | ~25MB | ~1-2s | ~50ms |

SlimSAM (`Xenova/slimsam-77-uniform`) is the only viable option for browser use.

### Decoder output: picking the best mask

SAM's decoder produces 3 candidate masks with IoU (Intersection over Union) scores. Always pick the one with the highest IoU:

```ts
const iouData = outputs.iou_scores.data as Float32Array;
let bestIdx = 0, bestIou = -Infinity;
for (let i = 0; i < 3; i++) {
  if (iouData[i] > bestIou) { bestIou = iouData[i]; bestIdx = i; }
}
```

### Key gotchas

1. **Dynamic imports required** — `import()` for all transformers.js code to avoid SSR bundling
2. **Clear mask on new image** — old mask dimensions don't match new image
3. **Reference equality for cache** — use `===` on buffer reference to detect image changes
4. **Debounce rapid clicks** — 50ms debounce prevents queueing multiple decoder calls

## Prevention

- Always split SAM integration into `loadModel()`, `encodeImage()`, `decodeMask()` with cached embeddings between encode and decode
- Test with both fast and slow clicks to verify debouncing works
- Clear all mask state when the source image changes
