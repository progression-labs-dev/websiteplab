---
title: "Stale closure in useCallback with rapid events"
category: react-patterns
tags: [react, hooks, useCallback, closure, state, ref]
module: app/tools/mosaic/hooks/useSubjectMask.ts
symptom: "Rapid clicks drop intermediate points — only last click's data is preserved"
root_cause: "useCallback captures state value at creation time; rapid calls between re-renders all see same stale snapshot"
date: 2026-02-17
---

## Problem

When using `useCallback` that reads a state variable (e.g., `points`) and appends to it, rapid calls between React re-renders all capture the same stale snapshot of `points`. The second click overwrites the first instead of appending.

```ts
// BUG: stale closure on `points`
const addPoint = useCallback((x, y, label) => {
  const newPoints = [...points, { x, y, label }]; // points is stale!
  setPoints(newPoints);
  runDecoder(newPoints);
}, [points, runDecoder]);
```

## Investigation

React's `useCallback` creates a new function only when deps change. Between re-renders, all calls to the cached function see the same closure values. If two clicks fire before React re-renders, both read the same `points` array and both append only their own point — the first click's point is silently lost.

## Root Cause

JavaScript closures capture **values at creation time**, not live references. React state updates are batched, so `setPoints(newPoints)` doesn't immediately update the `points` variable that the callback closes over.

## Solution

Use a **ref mirror** (`pointsRef`) that is always kept in sync with state. Read from the ref inside callbacks to get the latest value:

```ts
const pointsRef = useRef<PointPrompt[]>([]);

const addPoint = useCallback((x, y, label) => {
  const newPoints = [...pointsRef.current, { x, y, label }];
  pointsRef.current = newPoints;
  setPoints(newPoints);
  runDecoder(pointsRef.current);
}, [runDecoder]); // no `points` dependency needed
```

Key: update `pointsRef.current` in ALL mutation paths (`addPoint`, `removeLastPoint`, `clearMask`).

## Prevention

- When a callback both reads and writes state that can be called faster than React re-renders (click handlers, keyboard events, scroll events), always use a ref mirror
- Alternative: use `setPoints(prev => [...prev, newPoint])` functional updater, but this doesn't help when the derived value (like `newPoints` for the decoder) is needed outside `setPoints`
- Warning sign: `useCallback` with a state variable in both the body and the dependency array, called from rapid user interactions

## Test Cases

1. Click rapidly (< 50ms apart) on different locations — all points should appear
2. Click 5 times quickly — `points.length` should be 5, not fewer
3. Undo after rapid clicks — should remove points in correct LIFO order
