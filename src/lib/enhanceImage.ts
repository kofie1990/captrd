/**
 * Post-capture image processing — handles mirroring (selfies) and optional
 * sharpening in a SINGLE canvas pass to minimize memory pressure.
 *
 * For high-resolution images (> 4MP), the pixel-level unsharp mask is skipped
 * because full-sensor captures are already sharp — the sharpening was designed
 * for low-res video-frame screenshots. This prevents ~200MB+ of temporary
 * allocations that crash Safari PWAs on memory-constrained devices like iPhone XR.
 *
 * Accepts both data-URL strings and Blob inputs.
 * Returns a Blob (image/jpeg at quality 0.97).
 */

import { BloomConfig } from "./filters";

// Pixel threshold above which we skip the expensive unsharp mask.
// 4MP = ~2304×1728 — anything above this is already sharp from the sensor.
const SHARPEN_PIXEL_LIMIT = 4_000_000;

export interface EnhanceOptions {
  /** Flip the image horizontally (for front-camera captures) */
  mirror?: boolean;
  /** CSS filter string to bake into the image (e.g. "sepia(1) contrast(1.25)") */
  cssFilter?: string;
  /** Bloom configuration for cinematic mist effects */
  bloom?: BloomConfig;
}

export async function enhanceImage(
  input: string | Blob,
  options: EnhanceOptions = {}
): Promise<Blob> {
  const url = input instanceof Blob ? URL.createObjectURL(input) : input;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      if (input instanceof Blob) URL.revokeObjectURL(url);

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;

      // Apply aesthetic filter if provided (bake it into the image)
      if (options.cssFilter) {
        ctx.filter = options.cssFilter;
      }

      // Apply mirror transform if requested (selfie)
      if (options.mirror) {
        ctx.translate(img.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(img, 0, 0);

      // Reset filter before any pixel-level processing or compositing
      ctx.filter = "none";

      // Apply Bloom / Mist effect if requested
      if (options.bloom) {
        applyBloom(ctx, canvas, options.bloom);
      }

      // Only apply the expensive unsharp mask for smaller images.
      // Full-sensor captures (12MP+) are already sharp and the pixel-level
      // processing would allocate ~150MB+ of temporary buffers.
      const totalPixels = img.width * img.height;
      if (totalPixels <= SHARPEN_PIXEL_LIMIT) {
        applyUnsharpMask(ctx, canvas.width, canvas.height);
      }

      canvas.toBlob(
        (blob) => {
          // Eagerly free the canvas bitmap memory
          canvas.width = 0;
          canvas.height = 0;

          if (blob) resolve(blob);
          else reject(new Error("Canvas toBlob returned null"));
        },
        "image/jpeg",
        0.97
      );
    };
    img.onerror = () => {
      if (input instanceof Blob) URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for enhancement"));
    };
    img.src = url;
  });
}

/** 
 * Applies a cinematic bloom/mist effect by downsampling, blurring, 
 * and blending it back over the original image. 
 */
function applyBloom(ctx: CanvasRenderingContext2D, mainCanvas: HTMLCanvasElement, config: BloomConfig) {
  // Downsample to 25% for performance and to increase the perceived blur radius
  const scale = 0.25;
  const smallWidth = Math.max(1, Math.floor(mainCanvas.width * scale));
  const smallHeight = Math.max(1, Math.floor(mainCanvas.height * scale));

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = smallWidth;
  tempCanvas.height = smallHeight;
  const tempCtx = tempCanvas.getContext("2d")!;

  // Draw the main canvas into the small one (downsampling)
  tempCtx.drawImage(mainCanvas, 0, 0, smallWidth, smallHeight);

  ctx.save();
  ctx.globalCompositeOperation = config.blendMode;
  ctx.globalAlpha = config.opacity;
  
  // Apply the blur while drawing the small canvas back up to full size
  ctx.filter = `blur(${config.radius}px)`;
  ctx.drawImage(tempCanvas, 0, 0, smallWidth, smallHeight, 0, 0, mainCanvas.width, mainCanvas.height);
  
  ctx.restore();
  
  // Eagerly free memory
  tempCanvas.width = 0;
  tempCanvas.height = 0;
}

/** Applies a subtle unsharp mask in-place on the canvas. */
function applyUnsharpMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const blurred = boxBlur(data, width, height, 1);
  const amount = 0.35;
  for (let i = 0; i < data.length; i += 4) {
    data[i]     = clamp(data[i]     + (data[i]     - blurred[i])     * amount);
    data[i + 1] = clamp(data[i + 1] + (data[i + 1] - blurred[i + 1]) * amount);
    data[i + 2] = clamp(data[i + 2] + (data[i + 2] - blurred[i + 2]) * amount);
  }

  ctx.putImageData(imageData, 0, 0);
}

function boxBlur(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number
): Uint8ClampedArray {
  const output = new Uint8ClampedArray(data.length);
  const size = radius * 2 + 1;
  const area = size * size;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const px = Math.min(Math.max(x + kx, 0), width - 1);
          const py = Math.min(Math.max(y + ky, 0), height - 1);
          const idx = (py * width + px) * 4;
          r += data[idx];
          g += data[idx + 1];
          b += data[idx + 2];
        }
      }
      const idx = (y * width + x) * 4;
      output[idx]     = r / area;
      output[idx + 1] = g / area;
      output[idx + 2] = b / area;
      output[idx + 3] = data[idx + 3];
    }
  }
  return output;
}

function clamp(val: number): number {
  return Math.max(0, Math.min(255, Math.round(val)));
}
