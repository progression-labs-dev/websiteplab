export interface ImageBuffer {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export async function loadImageToBuffer(file: File): Promise<ImageBuffer> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Cap at 2048px max dimension to prevent memory issues
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      const maxDim = 2048;

      if (w > maxDim || h > maxDim) {
        const scale = maxDim / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);

      resolve({ data: imageData.data, width: w, height: h });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

export function sampleColorAt(
  buffer: ImageBuffer,
  x: number,
  y: number
): [number, number, number] {
  const px = Math.min(Math.max(Math.round(x), 0), buffer.width - 1);
  const py = Math.min(Math.max(Math.round(y), 0), buffer.height - 1);
  const i = (py * buffer.width + px) * 4;
  return [buffer.data[i], buffer.data[i + 1], buffer.data[i + 2]];
}

export function getBrightness(r: number, g: number, b: number): number {
  // Perceptual luminance (ITU-R BT.709)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
