# Mosaic Video Support — Plan

## Objective

Extend the mosaic tool to fully support video: real-time preview with all mosaic effects (pixel, circle, ASCII, gradient, split, subject mask), AI-powered subject tracking across frames, and offline video export to MP4.

**Strategy:** Real-time preview at reduced resolution/framerate. Offline export at full quality, frame-by-frame.

## Architecture Overview

```
Video Upload → useVideoPlayer (frame extraction)
                    ↓
              ImageBuffer (per frame)
                    ↓
        ┌───────────┴───────────┐
        │                       │
   PREVIEW MODE            EXPORT MODE
   (real-time)             (offline, frame-by-frame)
        │                       │
   Downscaled buffer       Full-res buffer
   Last-known mask         Keyframe re-encoding
   RAF throttled           WebCodecs encoder
   Canvas render           → mp4-muxer → MP4 blob
```

### Subject Tracking Strategy

**During preview:** User pauses video, clicks to define subject on a frame (existing SAM flow). Mask persists during playback — good enough for preview since it's fast and the subject position doesn't change drastically frame-to-frame at 30fps.

**During export:** Keyframe-based re-encoding. Every N frames (default: 30 = ~1s at 30fps), re-run SAM image encoder + decoder with the original click points. Between keyframes, reuse the previous mask. This provides tracking that adapts to subject movement over time without being prohibitively slow.

**Future upgrade path:** Replace SlimSAM with SAM3 Tracker (`onnx-community/sam3-tracker-ONNX`) for proper temporal propagation. The architecture is designed so the tracking strategy is swappable.

## Work Breakdown

### Unit 1: Preview Performance Optimization
**Files:** `hooks/useVideoPlayer.ts`, `hooks/useMosaicRenderer.ts`, `page.tsx`
**Dependencies:** None
**What:**
- Add resolution scaling to useVideoPlayer — during playback, extract frames at 50% resolution (configurable)
- Add frame skipping: only call onFrame every Nth RAF tick (target ~15fps for preview)
- Expose `previewScale` param so the renderer works on smaller buffers during playback
- On pause/seek, extract at full resolution for crisp single-frame viewing
- Add FPS counter display (dev-only or toggle)

**Verification:** Load a 1080p video, play it — should maintain smooth preview without browser frame drops. Console.log actual FPS achieved.

### Unit 2: Subject Mask Persistence for Video
**Files:** `page.tsx`, `hooks/useSubjectMask.ts`
**Dependencies:** None (parallel with Unit 1)
**What:**
- When video is playing and maskMode is 'subject', keep applying the last-computed mask to all frames (don't re-encode per frame)
- When video is paused, allow clicking to define/refine the subject mask (existing flow)
- Add a `maskLocked` state — when playing, mask is locked; when paused, mask is editable
- Clear mask when user uploads a new video
- Show visual indicator that mask is "frozen" during playback (small lock icon or text)

**Verification:** Upload video, pause, switch to subject mode, click subject, see mask. Hit play — mosaic effect applies with the mask on all subsequent frames.

### Unit 3: Video Export Pipeline (WebCodecs + mp4-muxer)
**Files:** NEW `hooks/useVideoExporter.ts`, NEW `utils/videoEncoder.ts`
**Dependencies:** npm install `mp4-muxer`
**What:**
- `useVideoExporter` hook manages the export lifecycle:
  - Seeks video to frame 0
  - Extracts each frame sequentially at full resolution
  - Renders mosaic effect to an offscreen canvas
  - Feeds VideoFrame to WebCodecs VideoEncoder
  - Muxes encoded chunks via mp4-muxer
  - Produces final MP4 blob → download
- Export runs in a tight loop (not real-time — as fast as the encoder allows)
- Configurable: resolution (original, 1080p, 720p), bitrate, keyframe interval
- Properly handles encoder backpressure (check `encodeQueueSize`)
- Falls back to MediaRecorder if WebCodecs unavailable

**Verification:** Export a 10-second video clip. Open exported MP4 — should play with all mosaic effects baked in. Verify no frame drops or corruption.

### Unit 4: Keyframe-Based Subject Tracking for Export
**Files:** `hooks/useVideoExporter.ts`, `utils/samSegmenter.ts`
**Dependencies:** Unit 2 + Unit 3
**What:**
- During export, if subject mask is active:
  - On keyframes (every N frames), re-run `encodeImage()` + `decodeMask()` with original click points
  - Between keyframes, reuse the previous mask
  - This adapts the mask to subject movement over time
- Add `trackingKeyframeInterval` setting (default: 30 frames)
- Progress callback reports: "Encoding frame 120/900, Re-encoding mask..."
- Handle the case where SAM produces an empty mask on a keyframe (fall back to previous mask)

**Verification:** Export a video where the subject moves significantly. Compare frames at 0s, 5s, 10s — mask should roughly follow the subject.

### Unit 5: Export UI & Progress
**Files:** `components/ControlPanel.tsx`, `mosaic.css`, `page.tsx`
**Dependencies:** Unit 3
**What:**
- Replace "Export PNG" with smart export button:
  - Image loaded → "Export PNG" (existing behavior)
  - Video loaded → "Export Video" button
  - During export → progress bar with frame count, ETA, cancel button
- Export settings panel (collapsed by default):
  - Resolution dropdown: Original / 1080p / 720p
  - Quality slider (maps to bitrate)
  - Subject tracking toggle + keyframe interval (only when mask active)
- Disable play/pause/scrub controls during export
- Show estimated file size and export time before starting
- On completion: download trigger + "Export complete" toast/message

**Verification:** Start an export, see progress bar advancing. Cancel mid-export — verify cleanup (no lingering encoder). Complete export — verify download triggers.

### Unit 6: Audio Passthrough
**Files:** `hooks/useVideoExporter.ts`, `utils/videoEncoder.ts`
**Dependencies:** Unit 3
**What:**
- Extract audio track from source video using AudioDecoder (WebCodecs)
- Re-encode audio as AAC via AudioEncoder
- Mux audio + video tracks together in mp4-muxer
- If no audio track, export video-only (already works from Unit 3)
- Maintain audio sync by matching frame timestamps

**Verification:** Export a video that has audio. Play exported MP4 — audio should be present and in sync with video.

## Tech Stack & Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Video export | WebCodecs + mp4-muxer | Hardware-accelerated, faster-than-realtime, 94% browser support, small bundle |
| Fallback export | MediaRecorder | For older browsers, produces WebM instead of MP4 |
| Subject tracking | Keyframe re-encoding with existing SlimSAM | Works now, no new model download. SAM3 Tracker upgrade is future work |
| Preview strategy | Downscaled frames + frame skipping | Keeps UI responsive without WebGL or Web Workers |
| Audio | WebCodecs AudioDecoder/Encoder | Same API family as video, avoids ffmpeg.wasm dependency |

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| WebCodecs not available in user's browser | Export fails | Fallback to MediaRecorder (WebM, lower quality) with clear messaging |
| Large videos exhaust memory | OOM crash | Cap export resolution, process frames sequentially (don't buffer all frames), use `VideoFrame.close()` aggressively |
| SAM re-encoding during export is slow | Long export times | Configurable keyframe interval, progress UI with ETA, cancel button |
| Audio codec not supported | Export without audio | Graceful degradation — export video-only with warning |
| mp4-muxer bundle size | Larger initial load | Dynamic import — only load when user clicks "Export Video" |

## Verification Strategy

1. **Unit tests:** Mock VideoEncoder/mp4-muxer for export pipeline logic
2. **Manual testing:** Upload various video formats (MP4 H.264, WebM VP9), lengths (5s, 30s, 2min), resolutions (720p, 1080p, 4K)
3. **Visual verification:** Playwright screenshot of export progress UI + play exported MP4
4. **Edge cases:** No audio track, very short clips (<1s), very large files, cancel mid-export, browser without WebCodecs
5. **Performance:** Log FPS during preview, export time per frame during export
