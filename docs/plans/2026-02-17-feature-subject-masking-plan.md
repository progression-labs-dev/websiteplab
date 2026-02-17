# Subject Masking (Click-to-Segment) — Plan

## Objective

Add AI-powered subject masking to the Mosaic tool. Users click on any object in an uploaded image, and SlimSAM generates a pixel-perfect segmentation mask. The mosaic/ASCII effect is applied ONLY to the selected subject. Multiple clicks refine the mask (positive = include, negative = exclude).

**Scope**: Image-only for v1. Video tracking is a follow-up.

---

## Architecture Overview

```
User clicks on canvas
        ↓
Canvas click → (x, y) normalized to image coords
        ↓
SlimSAM decoder (fast, ~50ms) + cached image embeddings
        ↓
Binary mask (Uint8Array, same dimensions as image)
        ↓
useMosaicRenderer checks mask per-cell → skip if mask=0
        ↓
Effect renders only on selected subject
```

**Key insight**: SlimSAM splits into encoder (heavy, once per image) and decoder (light, per click). The encoder runs when an image is uploaded (~1-2s). Each subsequent click only runs the decoder (~50ms), making interaction feel instant.

---

## Work Breakdown

### Unit 1: Install dependencies & model loading infrastructure
**Files**: `package.json`, `app/tools/mosaic/utils/samSegmenter.ts`
**Dependencies**: `@huggingface/transformers` (Transformers.js v3+)
**What**:
- Install `@huggingface/transformers`
- Create `samSegmenter.ts` with:
  - `loadSAM()` — lazy-loads SlimSAM model (`Xenova/slimsam-77-uniform`)
  - `encodeImage(imageBuffer)` — runs image encoder, returns embeddings
  - `decodeMask(embeddings, points)` — runs mask decoder with click points, returns Uint8Array mask
  - `disposeSAM()` — cleanup/free memory
- Model loaded lazily (only when user switches to Subject mask mode)
- Show loading progress in UI

**Verification**: `loadSAM()` resolves without error, console.log confirms model loaded

### Unit 2: Subject mask React hook
**Files**: `app/tools/mosaic/hooks/useSubjectMask.ts`
**What**:
- `useSubjectMask()` hook managing:
  - `mask: Uint8Array | null` — the current binary mask
  - `points: Array<{x, y, label: 0|1}>` — click history (1=foreground, 0=background)
  - `isEncoding: boolean` — loading state for image encoder
  - `isDecoding: boolean` — loading state for decoder
  - `encodeImage(buffer)` — triggers encoder when image changes
  - `addPoint(x, y, label)` — adds a click point, triggers decoder
  - `removeLastPoint()` — undo last click
  - `clearMask()` — reset all points and mask
- Caches image embeddings (re-encode only when buffer changes)
- Debounced decoder calls for rapid clicking

**Verification**: Hook returns mask after addPoint(), mask dimensions match image

### Unit 3: Integrate mask into renderer
**Files**: `app/tools/mosaic/hooks/useMosaicRenderer.ts`
**What**:
- Add `maskMode: 'none' | 'split' | 'subject'` to MosaicParams
- Add `subjectMask: Uint8Array | null` to render function params (passed alongside MosaicParams)
- In the per-cell loop, after split check:
  ```
  if (maskMode === 'subject' && subjectMask) {
    const maskIdx = (cellY * width + cellX);
    if (subjectMask[maskIdx] === 0) continue; // skip background
  }
  ```
- When maskMode='subject', skip the split check entirely (subject mask replaces split)
- When maskMode='none', render effect everywhere (no split, no subject mask)

**Depends on**: Unit 2
**Verification**: With a mock mask (all 1s), full effect renders. With half 0s, only half renders.

### Unit 4: Canvas click handling
**Files**: `app/tools/mosaic/components/MosaicCanvas.tsx`
**What**:
- When maskMode='subject', canvas listens for clicks
- Convert click (clientX/clientY) → canvas pixel coordinates → image coordinates
  - Account for CSS scaling (canvas.width vs canvas.clientWidth)
- Left-click = foreground point (label=1), Right-click = background point (label=0)
- Visual feedback: render small dots on click positions (green=foreground, red=background)
- Pass click coordinates up to parent via `onCanvasClick` callback

**Verification**: Click on canvas → correct image coordinates logged, visual dot appears

### Unit 5: Mask mode UI controls
**Files**: `app/tools/mosaic/components/ControlPanel.tsx`
**What**:
- Replace "Split Effect" section with "Mask Mode" section:
  - Three-way toggle: None | Split | Subject
  - When "Split" selected: show existing split controls (position, angle)
  - When "Subject" selected: show:
    - Loading indicator during model load / image encoding
    - "Clear Mask" button
    - "Undo Click" button
    - "Invert Mask" toggle
    - Click instruction text: "Left-click to select, right-click to exclude"
  - When "None" selected: no mask controls shown, full effect everywhere

**Verification**: Toggle between modes, UI updates correctly, mask mode changes in params

### Unit 6: Wire everything together in page.tsx
**Files**: `app/tools/mosaic/page.tsx`, `app/tools/mosaic/components/MosaicCanvas.tsx`
**What**:
- Import and use `useSubjectMask()` hook
- On image upload: trigger `encodeImage(buffer)` if maskMode='subject'
- On maskMode change to 'subject': trigger encode if not already done
- Pass mask to MosaicCanvas and renderer
- Pass click handler from hook to canvas
- Handle loading states (show spinner during encode)

**Depends on**: Units 1-5
**Verification**: Full flow: upload image → switch to Subject mode → click on object → mask generates → effect applies only to clicked subject

---

## Tech Stack & Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| ML library | Transformers.js (`@huggingface/transformers`) | Best browser ML library, well-maintained, SAM support built-in |
| Model | `Xenova/slimsam-77-uniform` | 100x smaller than full SAM (5.5M vs 637M params), still high quality |
| Inference | CPU (WASM) | WebGPU not reliably available across browsers yet; WASM is universal |
| Mask format | `Uint8Array` (1 byte per pixel) | Simple, fast lookup, same coordinate space as ImageBuffer |
| Encode/decode split | Encode once, decode per click | Image encoder is slow (~1-2s); decoder is fast (~50ms) |
| Click interaction | Left=foreground, Right=background | Standard SAM convention, intuitive |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Model download size (~25MB) | First-time load is slow | Lazy-load only when Subject mode activated; show progress bar; cache in browser (models cached by Transformers.js in IndexedDB) |
| Encoder latency (~1-2s per image) | Brief pause on upload | Show loading spinner; encode in background; cache embeddings |
| WASM performance on low-end devices | Slow inference | SlimSAM is already optimized; fallback to brightness threshold if too slow |
| Next.js SSR conflict | Transformers.js needs browser APIs | Dynamic import with `next/dynamic` or lazy `import()` in client component |
| Memory usage | Large images = large embeddings | Cap image to 1024px for SAM input (already capping at 2048px); dispose embeddings on image change |

---

## Verification Strategy

1. **Unit test**: `samSegmenter.ts` — load model, encode test image, decode with mock points, verify mask shape
2. **Integration test**: Upload image → click on subject → verify mask is non-zero in clicked region
3. **Visual test**: Playwright screenshot showing effect applied only to clicked subject
4. **Performance test**: Measure encode time (<3s) and decode time (<200ms) on 1080p image
5. **Edge cases**: Multiple clicks, undo, clear, switch mask modes, image change mid-mask
