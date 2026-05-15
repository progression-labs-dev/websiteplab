import type { Subject } from './subjects';
import { paletteSwatch } from './subjects';

// ASCII charset matches app/tools/mosaic/utils/shapes.ts:ASCII_CHARSET exactly
// so generated glyphs blend with the existing hero overlay if rendered side-by-side.
const ASCII_CHARSET = '0123456789@#$%&*+=?<>{}[]/\\|LABS';

// Image-to-image mask prompt: takes the existing photographed subject as a
// reference image and asks Nano Banana Pro to produce a binary white-on-black
// mask of that exact pose/position. Used to bypass brightness-based silhouette
// detection for textured subjects (e.g. spotted jaguar in dappled jungle)
// where per-pixel luminance can't isolate the subject from the background.
export function passAMaskPrompt(subject: Subject): string {
  // Subject-level override for partial masks (e.g. "stamen + one petal only").
  // When set, replaces the default whole-subject mask instruction.
  const subjectClause = subject.maskInstruction
    ? subject.maskInstruction
    : [
        `Look at the reference photograph attached. Identify the primary subject — the ${subject.label.toLowerCase()}.`,
        ``,
        `Render that subject as a SOLID PURE-WHITE shape filling its EXACT pose, position, scale, and orientation from the reference photograph. The mask outline must trace the subject's silhouette faithfully, including all limbs, head, tail, ears, and any extremities. If the subject is mid-air or mid-motion, preserve that exact pose.`,
        ``,
        `Everything else in the frame (background, foliage, foreground vegetation, sky, dust, mist, ground, shadows) must be SOLID PURE BLACK.`,
      ].join('\n');

  return [
    `Produce a PURE BINARY BLACK-AND-WHITE MASK image at 2K resolution.`,
    ``,
    subjectClause,
    ``,
    `STRICT CONSTRAINTS:`,
    `- ONLY two colours allowed: pure white (#FFFFFF) for the kept regions, pure black (#000000) for everything else.`,
    `- No greys. No anti-aliased gradient at edges. No internal detail or texture inside the white regions. The white fill is solid and opaque.`,
    `- Full-bleed edge-to-edge composition, square 1:1, matching the reference image dimensions exactly.`,
    `- DO NOT change the position, scale, or proportions of the kept regions from the reference. The mask must overlay cleanly on the reference.`,
    `- No text, no labels, no watermark.`,
  ].join('\n');
}

export function passASilhouettePrompt(subject: Subject): string {
  return [
    subject.silhouettePrompt,
    '',
    'Render as a clean, high-contrast subject portrait centered in frame, occupying about 70% of the canvas height.',
    'Pure jet-black background (#000000), no environment, no props, no ground, no shadow on the ground.',
    'Soft cinematic rim-lighting from below and behind to define the silhouette edge crisply against the black.',
    'Anatomically precise, sharp clean edges, no blur. Photographic realism, no text, no watermark, no signature.',
    'Square 1:1 aspect ratio.',
  ].join('\n');
}

export function passBStylePrompt(subject: Subject): string {
  const swatch = paletteSwatch(subject.palette);

  return [
    `Three reference images are attached, in order:`,
    `  1) STYLE REFERENCE — full hero gradient (smooth gradient blend with a sparse pixel-block + ASCII overlay).`,
    `  2) ASCII REFERENCE — the sparse ASCII-character overlay isolated on black, showing the exact character set, density, and grid spacing.`,
    `  3) SUBJECT REFERENCE — the silhouette / pose / proportions to preserve.`,
    ``,
    `Re-render the ${subject.label.toLowerCase()} from the SUBJECT REFERENCE as if its silhouette were entirely constructed from the gradient-pixel-block and ASCII-overlay effect shown in the STYLE and ASCII references.`,
    '',
    'STRICT CONSTRAINTS:',
    '',
    `1. SILHOUETTE: Preserve the subject's exact outline, pose, and proportions from the subject reference. No part of the subject's form should be lost or distorted.`,
    '',
    `2. INTERIOR FILL — chunky pixel-art blocks (THIS IS THE KEY EFFECT):`,
    `   • The interior of the silhouette must be rendered as a LOW-RESOLUTION PIXEL-ART MOSAIC. Think 8-bit / 16-bit video game sprite, not a filtered photograph.`,
    `   • Replace ALL photographic detail with a regular grid of large, uniform, square pixel blocks. Each block is approximately 40–60 pixels per side at 2K output resolution (i.e. the entire subject is built from on the order of 20–40 blocks tall × wide).`,
    `   • Each block is a single FLAT solid color — no gradients, no texture, no soft edges within a block. Block edges are crisp and pixel-perfect, aligned to a regular grid.`,
    `   • Choose each block's color by sampling the broad luminance of the underlying photograph at that location, then mapping to the 3-stop palette:`,
    `     - dark / shadowed regions → SHADOW: ${swatch.split(' → ')[0]}`,
    `     - mid-tones → MID: ${swatch.split(' → ')[1]}`,
    `     - bright / highlight regions → HIGHLIGHT: ${swatch.split(' → ')[2]}`,
    `   • Smoothly interpolate between the 3 palette stops based on local luminance, but every block remains a single flat color — the gradient lives across many blocks, not within any one block.`,
    `   • The original photographic fine detail (individual feathers, fur, scales, ripples) MUST be completely lost; only the broad silhouette and the gross luminance distribution survive.`,
    '',
    `3. ASCII OVERLAY:`,
    `   • Scatter individual ASCII characters across the interior of the silhouette at roughly 30% density — every third block, give or take, gets one character. The other ~70% of blocks are pure colored pixel with no character on top.`,
    `   • Characters are picked RANDOMLY and INDEPENDENTLY from this exact set: ${ASCII_CHARSET}. Do NOT lay them out in alphabetical or numerical order. Do NOT cluster them into a grid, alphabet chart, table, or legend. Each character's position and identity should look stochastic and disorderly.`,
    `   • One character per block at most, centered in the block, sized to roughly the block height, in faint smoky white (#F5F5F5) with about 70% opacity, sans-serif (Inter-like). Characters must spread evenly across the entire silhouette interior — head, chest, wings, legs — never bunched in one region.`,
    `   • Crucial: the overlay should feel like atmospheric noise scattered over the mosaic, not a typed message or a character set sample sheet.`,
    '',
    `4. OUTLINE: Trace a thin (~2px at 2K) crisp luminous stroke around the entire outer silhouette of the subject, drawn in the HIGHLIGHT color from the palette. The outline sits on top of the fill, defining the subject's edge against the black background.`,
    '',
    `5. BACKGROUND: Pure jet-black (#000000) outside the silhouette. No gradient leakage, no spill, no glow, no haze. The contrast between the dense interior fill and the empty black background is the whole point.`,
    '',
    `6. NO TEXT, NO WATERMARK, NO SIGNATURE. No artist credit. No descriptive caption.`,
    '',
    `7. ASPECT: Square 1:1. The subject occupies roughly the same area as in the subject reference.`,
    '',
    `AESTHETIC TARGET: The final image should read as a luminous mosaic in the shape of the ${subject.label.toLowerCase()}, floating on pure black — like an ASCII art portrait built from low-resolution gradient pixel data, with a thin glowing outline.`,
  ].join('\n');
}
