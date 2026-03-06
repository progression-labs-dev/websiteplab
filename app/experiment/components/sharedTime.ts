// Shared time origin for syncing WebGL shader and ASCII overlay clocks
export const SHARED_START = performance.now() / 1000
export function getElapsed() {
  return performance.now() / 1000 - SHARED_START
}
