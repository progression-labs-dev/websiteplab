#!/usr/bin/env bun
// Generate subject-silhouette hero-effect imagery via Nano Banana Pro.
//
// Usage:
//   bun run gen:imagery <slug|--all> [--variants N] [--skip-pass-a] [--pass-a-only]
//
// Examples:
//   bun run gen:imagery owl --variants 1            # smoke test
//   bun run gen:imagery --all --variants 3          # full set: 4 subjects × 3 variants
//   bun run gen:imagery phoenix --skip-pass-a       # reuse cached silhouette
//   bun run gen:imagery horse --pass-a-only         # generate only the silhouette base
//
// Output:
//   public/blog/{slug}-v{n}.png                     # final stylized variants
//   scripts/gen-imagery/cache/{slug}-base.png       # Pass A silhouette base (cached)

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { generateImage, type RefImage } from './gemini';
import { passAMaskPrompt, passASilhouettePrompt, passBStylePrompt } from './prompts';
import { SUBJECTS, getSubject, type Subject } from './subjects';

// Manual .env.local loader. Bun auto-loads .env.local, but a parent shell
// exporting an empty GEMINI_API_KEY="" overrides that load. Belt-and-braces:
// re-read the file ourselves and fill in any missing/empty keys.
(function loadEnvLocal() {
  const envPath = join(import.meta.dir, '..', '..', '.env.local');
  if (!existsSync(envPath)) return;
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const [, k, vRaw] = m;
    const v = vRaw.replace(/^["']|["']$/g, '');
    if (!process.env[k] || process.env[k] === '') process.env[k] = v;
  }
})();

const PROJECT_ROOT = join(import.meta.dir, '..', '..');
const PUBLIC_BLOG = join(PROJECT_ROOT, 'public', 'blog');
const CACHE_DIR = join(import.meta.dir, 'cache');
const REFS_DIR = join(import.meta.dir, 'references');
const HERO_REF = join(REFS_DIR, 'hero-gradient.png');
const HERO_ASCII_REF = join(REFS_DIR, 'hero-ascii-overlay.png');

interface CliArgs {
  target: 'all' | string;
  variants: number;
  skipPassA: boolean;
  passAOnly: boolean;
  genMask: boolean;
}

function parseArgs(): CliArgs {
  const argv = process.argv.slice(2);
  let target: string | undefined;
  let variants = 3;
  let skipPassA = false;
  let passAOnly = false;
  let genMask = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--all') target = 'all';
    else if (arg === '--variants') variants = parseInt(argv[++i] ?? '3', 10);
    else if (arg === '--skip-pass-a') skipPassA = true;
    else if (arg === '--pass-a-only') passAOnly = true;
    else if (arg === '--gen-mask') genMask = true;
    else if (!arg.startsWith('--')) target = arg;
  }

  if (!target) {
    console.error('Usage: bun run gen:imagery <slug|--all> [--variants N] [--pass-a-only] [--gen-mask]');
    console.error('Available slugs:', SUBJECTS.map((s) => s.slug).join(', '));
    process.exit(1);
  }

  if (!Number.isFinite(variants) || variants < 1) {
    console.error('--variants must be a positive integer');
    process.exit(1);
  }

  return { target, variants, skipPassA, passAOnly, genMask };
}

function ensureDir(path: string) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

function writePng(path: string, bytes: Buffer) {
  ensureDir(dirname(path));
  writeFileSync(path, bytes);
  const kb = (bytes.byteLength / 1024).toFixed(0);
  console.log(`  → wrote ${path.replace(PROJECT_ROOT + '/', '')} (${kb} KB)`);
}

async function ensurePassA(subject: Subject, skip: boolean): Promise<string> {
  const cachePath = join(CACHE_DIR, `${subject.slug}-base.png`);

  if (skip && existsSync(cachePath)) {
    console.log(`  (skip Pass A — using cached ${subject.slug}-base.png)`);
    return cachePath;
  }

  console.log(`  Pass A: generating ${subject.label} silhouette base…`);
  const bytes = await generateImage({
    prompt: passASilhouettePrompt(subject),
    aspectRatio: '1:1',
    resolution: '2K',
  });
  writePng(cachePath, bytes);
  return cachePath;
}

async function runPassB(
  subject: Subject,
  passAPath: string,
  variantIdx: number,
): Promise<void> {
  const outPath = join(PUBLIC_BLOG, `${subject.slug}-v${variantIdx}.png`);
  console.log(`  Pass B v${variantIdx}: style-transferring ${subject.label}…`);

  const refImages: RefImage[] = [];
  if (existsSync(HERO_REF)) {
    refImages.push({ path: HERO_REF, mimeType: 'image/png' });
  } else {
    console.warn(
      `  ⚠ hero-gradient.png not found at ${HERO_REF}. Style will rely on text-only description.`,
    );
  }
  if (existsSync(HERO_ASCII_REF)) {
    refImages.push({ path: HERO_ASCII_REF, mimeType: 'image/png' });
  }
  refImages.push({ path: passAPath, mimeType: 'image/png' });

  const bytes = await generateImage({
    prompt: passBStylePrompt(subject),
    refImages,
    aspectRatio: '1:1',
    resolution: '2K',
  });
  writePng(outPath, bytes);
}

async function runMaskGeneration(subject: Subject): Promise<void> {
  const photoPath = join(CACHE_DIR, `${subject.slug}-base.png`);
  if (!existsSync(photoPath)) {
    console.error(
      `  ✗ Photo not found at ${photoPath}. Run 'bun run gen:imagery ${subject.slug} --pass-a-only' first.`,
    );
    process.exit(1);
  }

  console.log(`  Mask gen (image-to-image): asking Gemini to silhouette the subject from the photo…`);
  const bytes = await generateImage({
    prompt: passAMaskPrompt(subject),
    refImages: [{ path: photoPath, mimeType: 'image/png' }],
    aspectRatio: '1:1',
    resolution: '2K',
  });
  const outPath = join(CACHE_DIR, `${subject.slug}-mask-aligned.png`);
  writePng(outPath, bytes);
}

async function runSubject(subject: Subject, args: CliArgs): Promise<void> {
  console.log(`\n=== ${subject.label} (${subject.slug}, palette: ${subject.paletteId}) ===`);

  if (args.genMask) {
    await runMaskGeneration(subject);
    return;
  }

  const passAPath = await ensurePassA(subject, args.skipPassA);

  if (args.passAOnly) {
    console.log('  (--pass-a-only set, skipping Pass B)');
    return;
  }

  for (let i = 1; i <= args.variants; i++) {
    try {
      await runPassB(subject, passAPath, i);
    } catch (err) {
      console.error(`  ✗ variant ${i} failed:`, err instanceof Error ? err.message : err);
    }
  }
}

async function main() {
  const args = parseArgs();

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY missing. Bun should auto-load .env.local — confirm the file exists at the project root.');
    process.exit(1);
  }

  ensureDir(PUBLIC_BLOG);
  ensureDir(CACHE_DIR);

  const targets: Subject[] =
    args.target === 'all'
      ? SUBJECTS
      : (() => {
          const s = getSubject(args.target);
          if (!s) {
            console.error(`Unknown subject "${args.target}". Available:`, SUBJECTS.map((x) => x.slug).join(', '));
            process.exit(1);
          }
          return [s];
        })();

  console.log(
    `Generating ${targets.length} subject(s) × ${args.variants} variant(s) → /public/blog/`,
  );

  for (const subject of targets) {
    await runSubject(subject, args);
  }

  console.log('\n✓ Done. Outputs in public/blog/');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
