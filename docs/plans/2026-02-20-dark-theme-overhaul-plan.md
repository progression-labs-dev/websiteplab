# Dark Theme Overhaul - Plan

## Objective
Transform the Progression Labs demo site from its current warm beige palette to a full dark theme with black backgrounds, white text, blue accents, and subtle architectural grid lines inspired by distyl.ai. Also improve the TextScramble animation smoothness and limit the video carousel to the single blue flower video.

## Architecture Overview

The site is a single-page Next.js 14 app with these key layers:
- **CSS custom properties** in `:root` (globals.css lines 8-44) — the foundation of all colors
- **IntroAnimation** (canvas-based P-logo reveal) — currently beige bg with dark shapes
- **PixelVine** (canvas scroll animation) — already converted to blue
- **Nav** — already converted to `nav-black`
- **Hero section** — warm beige bg, dark text, video carousel
- **Content sections** (Services, Case Studies, Team, Blog, CTA) — all warm beige
- **Footer** — already dark (charcoal)
- **TextScramble** — character-by-character reveal animation

## Work Breakdown

### Unit 1: CSS Custom Properties & Base Dark Theme
**Files**: `app/globals.css`
**Dependencies**: None
**Verification**: Visual — all sections should have dark backgrounds

Changes to `:root`:
- `--bg-warm` → `#0a0a0a` (near-black)
- `--bg-cream` → `#111111`
- `--charcoal` → `#ffffff` (text is now white)
- `--charcoal-hover` → `#e0e0e0`
- `--text-primary` → `#ffffff`
- `--text-secondary` → `rgba(255, 255, 255, 0.65)`
- `--text-tertiary` → `rgba(255, 255, 255, 0.45)`
- `--grid-line` → `rgba(255, 255, 255, 0.06)`
- `--grid-line-dark` → `rgba(255, 255, 255, 0.12)`
- `--border-light` → `rgba(255, 255, 255, 0.06)`
- `--border-medium` → `rgba(255, 255, 255, 0.12)`

Body background grid lines: change from brown-tinted to white-tinted (distyl.ai style):
```css
background-image:
  linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
  linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
```

Update all hardcoded color references throughout globals.css:
- `.hero-dark-title` color → `#ffffff`
- `.hero-dark-subtitle` color → `rgba(255, 255, 255, 0.65)`
- `.hero-fullscreen-content` border → use updated `--grid-line`
- Corner brackets → use updated `--grid-line-dark`
- `.service-tile` background → `#0a0a0a`
- `#case-studies .testimonial-carousel` bg → `#0a0a0a`
- `#blog` bg → `#0a0a0a`
- `.cta-section` bg → `#0a0a0a`
- `.footer` bg → `#050505` (slightly darker than main)
- `.platform-visual` bg → `#111111`
- `.platform-mockup` bg → `#1a1a1a`
- `.btn-dark` → white bg, dark text (inverted)
- `.btn-ghost` border/text → white tones
- `.btn-primary` (salmon) → keep as accent
- `.cta-email` color → blue accent `#60a5fa`
- `.service-card` bg/border → dark
- `.nav-warm` → remove or update (we're using nav-black now)
- Mockup card bars → update to work on dark bg
- `.mobile-menu` → dark bg
- `.announcement-bar` → dark bg with subtle border

### Unit 2: IntroAnimation Dark Theme
**Files**: `app/components/IntroAnimation.tsx`
**Dependencies**: Unit 1 (needs dark CSS vars)
**Verification**: Reload page — white logo on black bg, white dither blocks

- Background fill: `#f0e6d3` → `#0a0a0a` (5 occurrences)
- Logo shapes (P, circles): `rgba(26, 26, 26, ...)` → `rgba(255, 255, 255, ...)`
- Grid lines in drawWhiteGrid: `rgba(26, 26, 26, ...)` → `rgba(255, 255, 255, ...)`
- Black circle cutouts: `#f0e6d3` → `#0a0a0a` (punches back to bg)
- `ditherColors`: dark→light grays become light→dark (white to gray)
- `blendWithWhite` function: blend with black `#0a0a0a` instead of beige
- Video sample source: `/green-rocket.mp4` → `/blue-flower-no-background.mp4`
- Background style in JSX: `#f0e6d3` → `#0a0a0a`

### Unit 3: VideoCarousel — Blue Flower Only
**Files**: `app/components/VideoCarousel.tsx`
**Dependencies**: None
**Verification**: Only one video shows, no cycling

- Remove all videos except `blue-flower-no-background.mp4`
- Simplify: single video, always active, no carousel cycling needed
- Remove interval logic since there's only one video

### Unit 4: TextScramble Smoothness
**Files**: `app/components/TextScramble.tsx`
**Dependencies**: None
**Verification**: Title animations appear smooth, not jagged

Current issues:
- CHARSET uses harsh symbols (`@#$%&*`) which create visual noise
- Characters resolve left-to-right uniformly (no natural randomness)
- Duration might be too fast for the amount of text

Improvements:
- Change CHARSET to use softer characters: uppercase + lowercase mix, fewer symbols
- Add per-character random delay so resolution feels more organic (wave-like, not linear)
- Slightly increase default duration to ~1200ms for smoother perceived transition
- Use cubic-bezier easing instead of simple power curve
- Add a subtle opacity fade per character as it resolves (0.5 → 1.0)

### Unit 5: Grid Lines (Distyl.ai Style)
**Files**: `app/globals.css`
**Dependencies**: Unit 1
**Verification**: Subtle white grid visible on dark background

Distyl.ai uses:
- Primary color `#121212` background
- Very subtle grid lines at ~4% opacity white
- Clean section dividers

Implementation (already partially in Unit 1):
- Body grid: `rgba(255, 255, 255, 0.04)` lines at 60px spacing
- Section dividers: `rgba(255, 255, 255, 0.08)` — slightly more visible
- `.grid-section::before` updated to use new `--grid-line`
- Add vertical grid guides at container edges (optional, distyl-inspired)
- Ensure the grid is visible but extremely subtle — should feel architectural

## Tech Stack & Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Dark bg color | `#0a0a0a` not `#000000` | Pure black is harsh on screens; near-black is softer and more premium |
| Grid opacity | 4% | Distyl.ai uses very subtle lines — just enough to feel structured |
| Text color | `#ffffff` | Full white for readability on dark bg |
| Accent color | Keep salmon + add blue `#60a5fa` | Salmon as CTA accent, blue for links/interactive |
| TextScramble charset | Softer mix | Reduces visual jarring during animation |

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Hardcoded beige colors throughout CSS | Search for all `#f0e6d3`, `rgba(44,`, `rgba(80, 60, 30` references |
| IntroAnimation canvas has many color refs | Systematic find-replace of all color strings |
| Dark-on-dark contrast issues | Test all sections visually after changes |
| PixelVine colors may need adjustment on dark bg | Already blue; verify multiply blend mode still works |
| Mobile menu styling | Ensure mobile menu gets dark treatment too |

## Verification Strategy

1. **After Unit 1**: Screenshot full page — all sections dark
2. **After Unit 2**: Reload — intro animation white on black
3. **After Unit 3**: Only blue flower visible in hero
4. **After Unit 4**: Watch title scramble — smooth, wave-like resolution
5. **After Unit 5**: Zoom into background — subtle grid visible
6. **Final**: Full page screenshot, mobile viewport check
