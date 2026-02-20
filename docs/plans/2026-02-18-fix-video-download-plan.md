# Fix Video Export Download — Plan

## Objective

Fix the mosaic tool's video export so downloads save with the correct `.mp4` filename across all browsers (Chrome, Arc, Safari, Firefox). Currently, downloads either save with a UUID filename or fail silently.

## Root Cause

**User gesture expiration.** The browser's transient user activation expires ~5 seconds after the "Export" button click. Video encoding takes 30-120 seconds. By the time `downloadBlob()` runs, no gesture context remains. Arc browser (Chromium-based) enforces stricter gesture requirements than vanilla Chrome for programmatic downloads.

All 8 previous attempts failed because they all triggered the download AFTER the gesture window closed.

## Architecture Overview

**Two-pronged approach — gesture-aware download pipeline:**

```
User clicks "Export Video"
  ├─ [Chromium browsers] showSaveFilePicker() called IMMEDIATELY
  │   ├─ User picks save location (gesture consumed here)
  │   ├─ File handle stored
  │   ├─ Encoding begins (30-120s)
  │   ├─ Blob written to file handle (no gesture needed)
  │   └─ Done ✓
  │
  └─ [Safari/Firefox/fallback] Encoding begins immediately
      ├─ Encoding completes → blob stored in state
      ├─ UI shows "Download Ready" button (replaces progress bar)
      ├─ User clicks "Download Ready" (FRESH gesture)
      ├─ downloadBlob() runs with active gesture
      │   ├─ Strategy A: API route POST → window.location.href GET
      │   └─ Strategy B: Blob URL anchor click (fallback)
      └─ Done ✓
```

## Work Breakdown

### Unit 1: Restructure useVideoExporter hook
**Files:** `app/tools/mosaic/hooks/useVideoExporter.ts`
**Changes:**
- Add `showSaveFilePicker` support BEFORE encoding starts
- Add `pendingBlob` to ExportState for the two-step UX fallback
- Add `downloadPendingBlob()` method for the fresh-gesture download
- Keep existing API route strategy as Strategy A in downloadBlob
- Keep blob URL anchor click as Strategy B fallback
- Add TypeScript types for FileSystemFileHandle
**Verification:** TypeScript compiles, export flow logic is correct

### Unit 2: Update page.tsx export flow
**Files:** `app/tools/mosaic/page.tsx`
**Changes:**
- Restructure `handleExportVideo` to call `showSaveFilePicker` first
- Pass file handle to `startExport` when available
- Add `handleDownloadReady` callback for the two-step UX button click
**Verification:** Export button click triggers file picker dialog in Chrome/Arc

### Unit 3: Update ControlPanel for "Download Ready" state
**Files:** `app/tools/mosaic/components/ControlPanel.tsx`
**Changes:**
- Add "Download Ready" button state when `exportState.pendingBlob` exists
- Clicking it calls `onDownloadReady()` with fresh user gesture
- Auto-dismiss after successful download
- Style consistent with existing export UI
**Verification:** Visual — progress bar transitions to "Download Ready" button

### Unit 4: Keep API route as-is (no changes needed)
**Files:** `app/api/tools/mosaic/download/route.ts`
**Changes:** None — the route is architecturally correct
**Verification:** Existing route serves files with correct headers

### Unit 5: End-to-end browser test
**Verification:**
- Open mosaic tool in Arc browser
- Upload a video, apply mosaic effects
- Click "Export Video" → file picker dialog appears (Arc/Chrome)
- After encoding, file saves with correct `.mp4` filename
- Test in Safari: encoding → "Download Ready" button → click → download with correct filename

## Tech Stack & Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Primary download method | `showSaveFilePicker` | Called during user gesture, no timing issues. Chromium 86+ (covers Chrome, Edge, Arc, Opera) |
| Fallback download method | Two-step UX (button) | Provides fresh gesture for Safari/Firefox where showSaveFilePicker isn't available |
| API route for fallback | Keep existing POST/GET pattern | Already implemented, correct headers, proven architecture |
| Content-Type | `application/octet-stream` | Prevents Safari from trying to play video inline |

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| showSaveFilePicker not available in Arc | Unlikely (Arc is Chromium 86+), but two-step UX handles it |
| User cancels file picker | Detect AbortError, cancel export gracefully |
| File handle write fails mid-export | Catch error, fall back to two-step UX |
| Large video exceeds API route body limit | Next.js default is 4MB; increase via route config if needed |
| User confused by two-step UX | Clear "Download Ready" button with pulsing animation |

## Verification Strategy

1. **TypeScript check**: `npx tsc --noEmit`
2. **Build check**: `npm run build`
3. **Manual test in Arc**: Export video → verify `.mp4` filename
4. **Manual test in Safari**: Export video → "Download Ready" → verify `.mp4` filename
5. **Console log audit**: Verify strategy selection logs appear correctly
