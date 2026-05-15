// 4 subjects for the blog-card imagery refresh.
// Palette stops are mirrored from app/tools/mosaic/hooks/useMosaicRenderer.ts (BRAND_PALETTES)
// so generated images stay coherent with the on-site mosaic tool.

export type RGB = [number, number, number];

export interface PaletteStop {
  color: RGB;
  label: string;
}

export type PaletteId = 'purple' | 'green' | 'sunset' | 'salmon' | 'blue';

export interface Subject {
  slug: string;
  label: string;
  paletteId: PaletteId;
  palette: PaletteStop[];
  silhouettePrompt: string;
  blogPostTitle: string;
  // Optional override for the mask generation prompt. When set, --gen-mask uses
  // this string as the partial-mask instruction (e.g. "render only the central
  // stamen disc and one upper petal as white") instead of the default
  // whole-subject mask.
  maskInstruction?: string;
}

// Mirrors BRAND_PALETTES in app/tools/mosaic/hooks/useMosaicRenderer.ts verbatim.
export const PALETTES: Record<PaletteId, PaletteStop[]> = {
  purple: [
    { color: [40, 12, 52], label: 'deep plum shadow' },
    { color: [186, 85, 211], label: 'orchid mid-tone' },
    { color: [245, 245, 245], label: 'white smoke highlight' },
  ],
  green: [
    { color: [20, 38, 12], label: 'deep moss shadow' },
    { color: [185, 233, 121], label: 'electric green mid-tone' },
    { color: [245, 245, 245], label: 'white smoke highlight' },
  ],
  sunset: [
    { color: [40, 12, 52], label: 'deep purple shadow' },
    { color: [186, 85, 211], label: 'orchid mid-tone' },
    { color: [255, 160, 122], label: 'salmon highlight' },
  ],
  salmon: [
    { color: [52, 22, 16], label: 'burnt umber shadow' },
    { color: [255, 160, 122], label: 'salmon mid-tone' },
    { color: [245, 245, 245], label: 'white smoke highlight' },
  ],
  blue: [
    { color: [8, 12, 48], label: 'deep navy shadow' },
    { color: [20, 60, 200], label: 'mid blue' },
    { color: [80, 160, 240], label: 'light blue' },
    { color: [220, 240, 255], label: 'ice blue highlight' },
  ],
};

export const SUBJECTS: Subject[] = [
  {
    slug: 'horse',
    label: 'Galloping Horse',
    paletteId: 'purple',
    palette: PALETTES.purple,
    blogPostTitle: 'Vibe Coding',
    silhouettePrompt:
      'A powerful horse mid-gallop, captured side-profile, with all four hooves off the ground, mane and tail trailing in motion. Dramatic, cinematic, anatomically precise.',
  },
  {
    slug: 'owl',
    label: 'Perched Owl',
    paletteId: 'green',
    palette: PALETTES.green,
    blogPostTitle: 'Ghost Intelligence',
    silhouettePrompt:
      'A great horned owl perched on a bare branch, facing the camera with piercing forward-facing eyes, feather tufts visible, wings folded. Hyper-still, watchful, almost spectral.',
  },
  {
    slug: 'phoenix',
    label: 'Rising Phoenix',
    paletteId: 'sunset',
    palette: PALETTES.sunset,
    blogPostTitle: 'RLVR Revolution',
    silhouettePrompt:
      'A phoenix rising with wings spread wide and tail feathers streaming downward, head tilted up, mid-ascent. Heroic three-quarter view, mythic and triumphant.',
  },
  {
    slug: 'jellyfish',
    label: 'Drifting Jellyfish',
    paletteId: 'salmon',
    palette: PALETTES.salmon,
    blogPostTitle: 'Magnitude Earthquake',
    silhouettePrompt:
      'A translucent moon jellyfish drifting downward, bell open and pulsing, long delicate tentacles trailing below in graceful arcs. Otherworldly, weightless, suspended.',
  },
  {
    slug: 'flower',
    label: 'Hibiscus (B&W half / blue ASCII half)',
    paletteId: 'blue',
    palette: PALETTES.blue,
    blogPostTitle: '(standalone)',
    silhouettePrompt:
      'A single hibiscus flower in dramatic high-contrast BLACK AND WHITE photography — pure grayscale, zero colour saturation. HEAD-ON / FRONT-FACING composition: the camera is looking directly INTO the fully open bloom from the front, so the five large heart-shaped petals radiate outward symmetrically around the central throat like a five-pointed star. The long stamen column protrudes straight TOWARD the camera from the centre of the flower with the anthers and stigma clearly visible at the tip, slightly foreshortened. The bloom fills 60-70% of the square canvas and is centred horizontally and vertically. Two or three large dark leaves are tucked behind the petals at the bottom edge of the frame. Strong soft top-down lighting picks out the radial veins on each petal and the texture inside the throat. The background is NOT pure black — there is moody atmospheric depth: dim out-of-focus tropical foliage at the edges, soft volumetric haze, faint drifting dust motes, a subtle dark gradient suggesting jungle depth behind the bloom. The flower is the brightest subject; the background is several stops darker and softer but still visibly present. Photographic realism, museum botanical specimen feel — strictly monochrome.',
  },
  {
    slug: 'bird-of-paradise',
    label: 'Bird of Paradise (Strelitzia)',
    paletteId: 'blue',
    palette: PALETTES.blue,
    blogPostTitle: '(standalone)',
    silhouettePrompt:
      'A bird-of-paradise flower (Strelitzia reginae) in dramatic high-contrast BLACK AND WHITE photography — pure grayscale, zero colour saturation. The iconic crane-like inflorescence: a horizontal boat-shaped spathe with several pointed tongue-petals fanning upward like a tropical bird\'s crested head. Single bloom centred and filling 60-70% of the square canvas, viewed at a slight three-quarter angle so the layered petals separate clearly. Long curved leaf-blade visible behind the bloom angling out of frame. Strong directional rim-light from above-and-behind picks out each petal\'s edge and the spathe\'s ridged texture. The background is NOT pure black — moody atmospheric depth: dim out-of-focus tropical foliage suggesting dense jungle behind, soft volumetric mist drifting through the frame, faint dust motes, a subtle dark gradient. The flower is the brightest subject; the background is several stops darker but still visibly present. Photographic realism, museum botanical specimen feel — strictly monochrome.',
  },
  {
    slug: 'plumeria',
    label: 'Plumeria (Frangipani)',
    paletteId: 'blue',
    palette: PALETTES.blue,
    blogPostTitle: '(standalone)',
    silhouettePrompt:
      'A single plumeria / frangipani flower in dramatic high-contrast BLACK AND WHITE photography — pure grayscale, zero colour saturation. HEAD-ON view of the five large rounded overlapping petals forming a pinwheel around the deep central throat (which glows bright in grayscale). Bloom centred and filling 60-70% of the square canvas. One or two adjacent buds and a glossy dark leaf tucked at the bottom corner. Strong soft directional lighting catches each petal\'s curved edge and the waxy surface. The background is NOT pure black — moody atmospheric depth: dim out-of-focus distant tropical foliage, soft drifting haze, faint dust motes, a subtle dark gradient suggesting depth. The flower is the brightest subject; the background is several stops darker but still visibly present. Photographic realism, museum botanical specimen feel — strictly monochrome.',
  },
  {
    slug: 'protea',
    label: 'King Protea',
    paletteId: 'blue',
    palette: PALETTES.blue,
    blogPostTitle: '(standalone)',
    silhouettePrompt:
      'A king protea flower in dramatic high-contrast BLACK AND WHITE photography — pure grayscale, zero colour saturation. HEAD-ON view of the massive crown-like bloom: a dense bowl of long pointed bracts radiating outward around the central fuzzy crown of white filaments. Bloom centred and filling 65-75% of the square canvas. Two large dark leathery leaves tucked behind the bracts at the bottom of the frame. Strong directional rim-light from above-and-behind picks out each bract\'s edge and the textured central crown. The background is NOT pure black — moody atmospheric depth: dim out-of-focus distant fynbos foliage, soft volumetric haze, faint drifting particles, a subtle dark gradient suggesting depth. The flower is the brightest subject; the background is several stops darker but still visibly present. Photographic realism, museum botanical specimen feel — strictly monochrome.',
  },
  {
    slug: 'heliconia',
    label: 'Heliconia (Lobster Claw)',
    paletteId: 'blue',
    palette: PALETTES.blue,
    blogPostTitle: '(standalone)',
    silhouettePrompt:
      'A heliconia lobster-claw flower in dramatic high-contrast BLACK AND WHITE photography — pure grayscale, zero colour saturation. The cascading inflorescence shown side-on: alternating boat-shaped bracts hanging in a zigzag pattern down the central stem like a string of stacked beaks. Stem centred diagonally across the square canvas, filling 60-70% of the frame, with the topmost bracts at upper-left and the lower bracts trailing toward bottom-right. Two long dark heliconia leaves visible behind the stem. Strong directional rim-light picks out each bract\'s sharp edge and the waxy textured surface. The background is NOT pure black — moody atmospheric depth: dim out-of-focus distant rainforest foliage, soft volumetric mist, faint drifting particles, a subtle dark gradient suggesting jungle depth. The inflorescence is the brightest subject; the background is several stops darker but still visibly present. Photographic realism, museum botanical specimen feel — strictly monochrome.',
  },
  {
    slug: 'anthurium',
    label: 'Anthurium',
    paletteId: 'blue',
    palette: PALETTES.blue,
    blogPostTitle: '(standalone)',
    silhouettePrompt:
      'A single anthurium flower in dramatic high-contrast BLACK AND WHITE photography — pure grayscale, zero colour saturation. HEAD-ON view of the iconic heart-shaped spathe (the broad flat outer leaf-petal) with the long protruding spadix curving upward from its centre. Bloom centred and filling 60-70% of the square canvas, slightly tilted so the spadix arcs visibly. Two glossy large dark leaves tucked behind the spathe at the bottom corners. Strong directional rim-light catches the waxy lacquered surface of the spathe and the textured spadix tip. The background is NOT pure black — moody atmospheric depth: dim out-of-focus distant tropical foliage, soft volumetric haze, faint drifting dust motes, a subtle dark gradient suggesting depth. The flower is the brightest subject; the background is several stops darker but still visibly present. Photographic realism, museum botanical specimen feel — strictly monochrome.',
  },
  {
    slug: 'horse-flora',
    label: 'Galloping horse (Flora poster style)',
    paletteId: 'blue',
    palette: PALETTES.blue,
    blogPostTitle: '(standalone)',
    silhouettePrompt:
      '*** ABSOLUTE FRAMING RULE ***\nThe output MUST be a flat, full-bleed photograph extending from corner to corner of the square canvas. The output is NOT a canvas hanging on a wall, NOT a framed print, NOT a poster mockup. NO 3D canvas object. NO wall behind. NO border. Just a 2D edge-to-edge photograph.\n\n*** SUBJECT ***\nA single horse caught at the peak of a FULL GALLOP, photographed in dramatic high-contrast BLACK AND WHITE wildlife photography. National Geographic equestrian story style. The horse is in full SIDE PROFILE facing LEFT: body fully extended horizontally, ALL FOUR LEGS clearly visible and spread wide in the airborne moment of the gallop stride (front legs reaching forward, hind legs powerfully extended backward), mane flowing back in the wind, tail streaming behind, head locked forward, nostrils flared.\n\n*** ENVIRONMENT (CRITICAL — this is a natural-environment shot) ***\nThe horse is sprinting through an OPEN ROLLING FIELD or MEADOW visible all around it. The scene includes: tall wild grass and wildflowers in the foreground (some motion-blurred from the gallop), distant rolling hills and a sparse line of trees on the horizon, an atmospheric sky with broken clouds catching soft directional light. Mist rises off the field, dust kicks up from the hooves. The composition feels like a single decisive moment from a wildlife/equestrian-action shoot — the horse is *in* its environment, not floating in a void.\n\n*** TONAL BALANCE ***\nB&W only, zero colour. The horse is the visually dominant element (sharpest, with the strongest tonal contrast — dark body against the brighter sky/field). The field, hills, sky, grass all sit in MID-TO-DARK grayscale tones (rgb 30-150 roughly) so the surrounding scene is visibly present but doesn\'t compete with the horse. Dramatic chiaroscuro, soft sunlit/overcast light, visible film grain.\n\nThe horse fills about 65-75% of the canvas width, centred horizontally and vertically. Strictly monochrome grayscale, zero colour saturation.',
  },
  {
    slug: 'frog-flora',
    label: 'Frog leaping off a branch (Flora poster style)',
    paletteId: 'blue',
    palette: PALETTES.blue,
    blogPostTitle: '(standalone)',
    silhouettePrompt:
      '*** ABSOLUTE FRAMING RULE ***\nThe output MUST be a flat, full-bleed photograph extending from corner to corner of the square canvas. The output is NOT a canvas hanging on a wall, NOT a framed print, NOT a poster mockup, NOT a gallery presentation, NOT an object photograph. There is NO 3D canvas object. NO wall behind. NO shadow underneath. NO frame edge. NO border. Just a 2D edge-to-edge photograph. If you produce a framed canvas mockup the output is WRONG.\n\n*** ABSOLUTE BACKGROUND RULE ***\nThe background must be CREAM / OFF-WHITE / WARM-GREY paper tone — rgb approximately 238, 234, 226. NOT BLACK. NOT WHITE. NOT BLUE. Specifically a vintage botanical-print paper colour. Subtle paper grain texture is welcome. If you produce a black background the output is WRONG.\n\n*** SUBJECT ***\nA small tree frog caught mid-LEAP off a thin mossy branch, photographed in dramatic high-contrast BLACK AND WHITE museum-print style. The frog is airborne, fully stretched out in a dynamic leap pose: all four legs extended (front legs reaching forward, back legs powerfully extended backward pushing off the branch), webbed feet visible, body in side profile, head facing forward in the direction of the leap. The branch is just visible at one edge of the frame (lower-left or right corner) with a small piece of moss or a leaf hanging off it — the branch is the take-off point but the frog has just left it.\n\nThe frog renders as a soft mid-grey body with darker shadow modelling along its spine and limbs, slightly translucent skin showing rib detail, glistening eyes catching a highlight. The branch and any moss/leaves are dark grey to near-black. Faint paper grain and a few dust specks drift through the cream background suggesting atmospheric depth without obscuring the subject.\n\nThe frog fills about 50% of the canvas (centred slightly above the midline with the leap arc rising up-and-forward); the branch occupies about 15% of the lower-corner area. Photographic realism, dramatic chiaroscuro, museum-print feel. Strictly monochrome grayscale, zero colour saturation.\n\nReminder: full-bleed photograph, cream background, no frame, no canvas object.',
  },
  {
    slug: 'jellyfish-flora',
    label: 'Jellyfish in the sea (Flora poster style)',
    paletteId: 'blue',
    palette: PALETTES.blue,
    blogPostTitle: '(standalone)',
    silhouettePrompt:
      '*** ABSOLUTE FRAMING RULE ***\nThe output MUST be a flat, full-bleed photograph extending from corner to corner of the square canvas. The output is NOT a canvas hanging on a wall, NOT a framed print, NOT a poster mockup, NOT a gallery presentation, NOT an object photograph. There is NO 3D canvas object. NO wall behind. NO shadow underneath. NO frame edge. NO border. Just a 2D edge-to-edge photograph. If you produce a framed canvas mockup the output is WRONG.\n\n*** ABSOLUTE BACKGROUND RULE ***\nThe background must be CREAM / OFF-WHITE / WARM-GREY paper tone — rgb approximately 238, 234, 226. NOT BLACK. NOT WHITE. NOT BLUE. Specifically a vintage botanical-print paper colour. Subtle paper grain texture is welcome. If you produce a black background the output is WRONG.\n\n*** SUBJECT ***\nA single translucent moon jellyfish drifting through soft pale water, photographed in dramatic high-contrast BLACK AND WHITE museum-print style. The jellyfish bell is rounded and luminous, gently pulsing open, with long delicate tentacles trailing below in graceful curving arcs. The bell is in the upper-middle third of the canvas; the tentacles flow down through the lower frame.\n\nThe jellyfish renders as a translucent silver-grey ghost shape against the cream paper — its bell glows softly with pale white internal veining, the tentacles read as soft pearl-grey thinning to near-transparent silver at the tips. Faint suspended particles (plankton, bubble flecks, paper grain) drift through the cream background suggesting depth.\n\nThe jellyfish fills about 70% of the canvas height (bell + trailing tentacles together), centred horizontally. Photographic realism, dramatic chiaroscuro, museum-print feel. Strictly monochrome grayscale, zero colour saturation.\n\nReminder: full-bleed photograph, cream background, no frame, no canvas object.',
  },
  {
    slug: 'poppy-flora',
    label: 'Open Poppy / Anemone (Flora poster style)',
    paletteId: 'blue',
    palette: PALETTES.blue,
    blogPostTitle: '(standalone)',
    silhouettePrompt:
      'CRITICAL: A FULL-BLEED edge-to-edge photograph filling the entire square canvas. NO white border, NO gallery frame, NO mockup edges — just the pure photograph filling 100% of the output.\n\nAn open white anemone or single-flowered poppy bloom, shot in dramatic high-contrast BLACK AND WHITE museum-print photography. The flower has 5-6 large soft white petals fanning open in a slight side-three-quarter view, with a prominent dark cluster of stamens at the centre and one or two unopened buds tucked at the base of the stem.\n\nCRITICAL BACKGROUND: NOT black. The background is a CREAM / OFF-WHITE / WARM-GREY paper tone — like aged museum print paper — rgb roughly 238, 234, 226. The flower sits on this cream paper background. Subtle paper texture and a hint of vintage grain across the cream background is desirable, like a botanical print on aged paper. The petals are creamy whites that lift off the paper through gentle shadow modelling, the stamen cluster is deep near-black, the leaves and buds in shadow are mid-to-dark grey.\n\nThe flower fills about 75% of the canvas, centred horizontally and vertically. Photographic realism, dramatic chiaroscuro, museum-print feel. Strictly monochrome — pure grayscale, zero colour saturation anywhere in the image.',
    // Partial mask: only the stamen disc + one adjacent petal as white. Used
    // when we want the pixel-ASCII effect to land on just those two regions,
    // following their organic shapes rather than a geometric circle overlay.
    maskInstruction:
      'Render TWO REGIONS as solid pure white on a solid pure black background — and nothing else. The two white regions must be ORGANIC, FOLLOWING THE EXACT NATURAL OUTLINE of these parts of the flower in the reference photograph:\n\n  REGION 1 — The central STAMEN DISC: the circular cluster of dark stamens at the flower\'s centre. Render its tight circular boundary as one solid white shape.\n\n  REGION 2 — ONE adjacent petal: pick the upper-right petal (or any single clearly-visible petal) and render its full natural lobed silhouette — from its base near the stamen out to its rounded tip — as a SECOND solid white shape.\n\nThe two regions are SEPARATE shapes (or just touching at the petal-base/stamen-edge). They are NOT a single big circle or oval encompassing the whole flower centre. The shapes follow the flower\'s natural anatomy, not geometric primitives. Every other petal, every leaf, every stem, and the cream background must be PURE BLACK.',
  },
  {
    slug: 'jaguar-mask',
    label: 'Jaguar mask (clean silhouette for mask compositing)',
    paletteId: 'blue',
    palette: PALETTES.blue,
    blogPostTitle: '(internal)',
    silhouettePrompt:
      'A FULL-BLEED edge-to-edge image. PURE BINARY BLACK AND WHITE MASK: a running jaguar appears as a SOLID PURE-WHITE silhouette filled completely (no spots, no rosettes, no fur detail, no texture — just a solid white opaque shape) on a PURE BLACK background (RGB 0,0,0 — absolute black, no atmosphere, no gradient, no foliage). ONLY two colours: pure white (the cat) and pure black (everything else).\n\nEXACT POSE to render (matching a paired wildlife photograph): a jaguar at the PEAK of a FULL GALLOP, body fully extended horizontally, airborne mid-stride. The cat is in SIDE PROFILE FACING LEFT (head is to the LEFT of the canvas, tail trails to the RIGHT). Front legs reach forward-LEFT (one extended fully forward, the other bent back near the body). Hind legs extend back-RIGHT, both pushed off the ground mid-leap. Long tail streams back-RIGHT in a flowing curve, slightly arched. Back is horizontally stretched and slightly arched.\n\nCOMPOSITION: the white silhouette fills about 65-70% of the canvas WIDTH. The body is centred VERTICALLY at the midline of the canvas (the cat\'s belly is at roughly 50% of canvas height). The head/nose is positioned around 15-20% from the left edge. The tail tip extends to around 85-90% from the left edge. All four paws are clearly visible and distinct.\n\nClean crisp outline. Stencil cut-out style. Solid white fill. No internal detail.',
  },
  {
    slug: 'jaguar',
    label: 'Jaguar (running, side view)',
    paletteId: 'blue',
    palette: PALETTES.blue,
    blogPostTitle: '(standalone)',
    silhouettePrompt:
      'CRITICAL: A FULL-BLEED edge-to-edge photograph filling the entire square canvas. NO white border, NO frame, NO gallery wall — just the pure photograph filling 100% of the output.\n\nA jaguar caught at the peak of a FULL GALLOP, shot as a moody black-and-white wildlife photograph in its rainforest habitat. Pure monochrome grayscale, zero colour saturation. Eadweard Muybridge "cat in motion" energy — but cinematic.\n\nPOSE IS CRITICAL — the cat MUST be in a dramatic mid-stride moment with ALL FOUR LEGS CLEARLY VISIBLE and SPREAD WIDE: front legs fully extended FORWARD reaching ahead of the body, hind legs fully extended BACKWARD pushing off the ground, body stretched horizontally between them in an elongated airborne pose, all four paws off or barely-touching the ground, back slightly arched, long tail trailing behind in a flowing curve. The viewer should be able to count and see all four legs distinctly — no leg hidden, no static walk pose, no crouching. Think of a cheetah or jaguar at peak gallop with maximum leg extension.\n\nTONAL BALANCE IS THE SECOND-MOST IMPORTANT THING — strict separation:\n• The JAGUAR\'S BODY (head, neck, back, belly, ALL FOUR LEGS, tail) is rendered as a SOLID HIGH-KEY SUBJECT: almost pure white fur (rgb 200-255 grayscale across the whole body, like over-lit by harsh studio strobe), with crisp dark rosette spots and outline details. The cat is the BRIGHTEST element in the frame by a huge margin.\n• The ENTIRE REST of the frame (background, foreground, foliage, grass, vines, tree trunks, forest floor, mist) is rendered in DEEP LOW-KEY SHADOW: dark grayscale (rgb 0-60), murky and atmospheric, like a moonlit jungle.\n• Tonal GAP of at least 140 brightness levels between the jaguar and the surrounding scene.\n\nFull SIDE-PROFILE view of the entire body, the jaguar fills about 65-75% of the canvas width, centred horizontally and vertically.\n\nThe rainforest environment is visible at every edge of the frame: dim out-of-focus jungle foliage, tall grass in the foreground (motion-blurred from the run), hanging vines, tree trunks, a forest floor with leaf litter, soft ground mist drifting through the scene. ALL of this sits at rgb 0-60 grayscale — visible silhouettes but never bright. There are NO bright sunbeams, NO highlights catching the leaves, NO white sky — the only bright thing anywhere is the JAGUAR ITSELF.\n\nPhotographic realism, dramatic chiaroscuro, visible film grain. Strictly monochrome.',
  },
];

export function getSubject(slug: string): Subject | undefined {
  return SUBJECTS.find((s) => s.slug === slug);
}

export function paletteSwatch(stops: PaletteStop[]): string {
  return stops
    .map((s) => `${s.label} rgb(${s.color[0]}, ${s.color[1]}, ${s.color[2]})`)
    .join(' → ');
}
