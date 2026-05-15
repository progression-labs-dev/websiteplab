# gen-imagery

Generates the blog-card subject silhouettes (gradient-pixel-blocks + sparse ASCII overlay inside a silhouette, thin luminous outline) via Gemini 3 Pro Image Preview — aka Nano Banana Pro.

## Setup

1. Get a Gemini API key at https://aistudio.google.com/app/apikey
2. Add to `.env.local` at the project root: `GEMINI_API_KEY=AIza...`
3. Confirm `.env.local` is gitignored (`.gitignore` already excludes `.env*.local`)

## Run

```bash
# Smoke test — one subject, one variant
bun run gen:imagery owl --variants 1

# Full set — 4 subjects × 3 variants = 12 PNGs
bun run gen:imagery --all --variants 3

# Reuse cached silhouette base, regenerate only the stylized output
bun run gen:imagery phoenix --skip-pass-a --variants 5

# Generate only the silhouette base (no style pass)
bun run gen:imagery horse --pass-a-only
```

## How it works

Two passes per variant:

- **Pass A** — text-only prompt → clean high-contrast silhouette on black (cached at `cache/{slug}-base.png` so repeat variants share one base)
- **Pass B** — Pass A silhouette + `references/hero-gradient.png` + style prompt → final stylized PNG written to `/public/blog/{slug}-v{n}.png`

## References

- `references/hero-gradient.png` — screenshot of the homepage hero effect. Drives Pass B's visual target. Capture via Playwright MCP or manually; see plan file for instructions.

## Subjects & palettes

Defined in `subjects.ts`. Palette stops mirror `app/tools/mosaic/hooks/useMosaicRenderer.ts:BRAND_PALETTES` verbatim. ASCII charset in `prompts.ts` mirrors `app/tools/mosaic/utils/shapes.ts:ASCII_CHARSET` verbatim.

## Notes

- Aspect: 1:1 at 2K resolution.
- Costs: Gemini 3 Pro Image bills per image; check Google's pricing before running large variant sweeps.
- Outputs land in `public/blog/` alongside (not replacing) the existing `.mp4` files — wiring into `siteContent.ts` is a separate manual step after Joe picks winners.
