import { getBrightness } from '../../mosaic/utils/imageProcessing';

export type GradientMode = 'brightness' | 'top-to-bottom' | 'radial' | 'diagonal';

export interface Centroid {
  cx: number;
  cy: number;
  maxDist: number;
}

/**
 * Computes the average (x, y) of all mask=1 pixels and the max distance
 * from that centroid to any mask=1 pixel.
 *
 * Guards against empty masks by returning { cx: 0, cy: 0, maxDist: 1 }.
 */
export function computeSubjectCentroid(
  mask: Uint8Array | Uint8ClampedArray,
  maskW: number,
  maskH: number
): Centroid {
  let sumX = 0;
  let sumY = 0;
  let count = 0;

  for (let y = 0; y < maskH; y++) {
    for (let x = 0; x < maskW; x++) {
      if (mask[y * maskW + x] === 1) {
        sumX += x;
        sumY += y;
        count++;
      }
    }
  }

  if (count === 0) {
    return { cx: 0, cy: 0, maxDist: 1 };
  }

  const cx = sumX / count;
  const cy = sumY / count;

  let maxDist = 0;
  for (let y = 0; y < maskH; y++) {
    for (let x = 0; x < maskW; x++) {
      if (mask[y * maskW + x] === 1) {
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (dist > maxDist) {
          maxDist = dist;
        }
      }
    }
  }

  // Guard against all mask pixels being at the same location
  if (maxDist === 0) {
    maxDist = 1;
  }

  return { cx, cy, maxDist };
}

/**
 * Returns a 0-255 value representing the gradient position for a cell,
 * based on the selected gradient mode.
 *
 * For 'radial' mode, cellX/cellY (in image space) are converted to mask
 * space using maskW/maskH relative to imageWidth/imageHeight.
 */
export function getGradientPosition(
  mode: GradientMode,
  cellX: number,
  cellY: number,
  imageWidth: number,
  imageHeight: number,
  r: number,
  g: number,
  b: number,
  centroid?: Centroid,
  maskW?: number,
  maskH?: number
): number {
  switch (mode) {
    case 'brightness':
      return getBrightness(r, g, b);

    case 'top-to-bottom':
      return (cellY / imageHeight) * 255;

    case 'radial': {
      if (!centroid || maskW == null || maskH == null) {
        return 128;
      }
      // Convert cell coords from image space to mask space
      const mx = (cellX / imageWidth) * maskW;
      const my = (cellY / imageHeight) * maskH;
      const dist = Math.sqrt((mx - centroid.cx) ** 2 + (my - centroid.cy) ** 2);
      return Math.min((dist / centroid.maxDist) * 255, 255);
    }

    case 'diagonal':
      return ((cellX / imageWidth + cellY / imageHeight) / 2) * 255;

    default:
      return 128;
  }
}
