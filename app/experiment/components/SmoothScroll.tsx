'use client'

// Smooth-scroll (Lenis) removed — scrolling reverts to the browser's native
// behaviour with no inertia. Components that previously read `window.__lenis`
// already null-check, so removing it is safe.
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
