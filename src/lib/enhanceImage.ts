/**
 * Post-capture image processing — handles mirroring, filters, and bloom.
 *
 * CRITICAL: iOS Safari does NOT support ctx.filter on Canvas2D.
 * All filter effects (brightness, contrast, sepia, grayscale, saturation,
 * hue-rotate) are applied via direct pixel manipulation using
 * getImageData/putImageData. This is the ONLY approach that works
 * universally across all browsers including iOS Safari.
 *
 * Accepts both data-URL strings and Blob inputs.
 * Returns a Blob (image/jpeg at quality 0.97).
 */

import { BloomConfig, PixelFilterConfig } from "./filters";

export interface EnhanceOptions {
  /** Flip the image horizontally (for front-camera captures) */
  mirror?: boolean;
  /** Pixel-level filter config to bake into the image */
  pixelFilter?: PixelFilterConfig;
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

    // CORS for remote images (Supabase storage etc.)
    if (typeof input === 'string' && input.startsWith('http')) {
      img.crossOrigin = "anonymous";
    }

    img.onload = () => {
      if (input instanceof Blob) URL.revokeObjectURL(url);

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;

      // Apply mirror transform if requested (selfie)
      if (options.mirror) {
        ctx.translate(img.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(img, 0, 0);

      // Reset transform before pixel work
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // Apply pixel-level filters (works on ALL browsers including iOS Safari)
      if (options.pixelFilter && Object.keys(options.pixelFilter).length > 0) {
        applyPixelFilter(ctx, canvas.width, canvas.height, options.pixelFilter);
      }

      // Apply Bloom / Mist effect if requested
      // Note: bloom uses ctx.filter for blur which Safari partially supports,
      // but we use a manual box-blur fallback for full compatibility
      if (options.bloom) {
        applyBloom(ctx, canvas, options.bloom);
      }

      canvas.toBlob(
        (blob) => {
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

    // Cache-buster for CORS requests to avoid Safari cached-CORS bug
    if (typeof input === 'string' && input.startsWith('http')) {
      img.src = url + (url.includes('?') ? '&' : '?') + 'cb=' + Date.now();
    } else {
      img.src = url;
    }
  });
}

/**
 * Applies brightness, contrast, saturation, sepia, grayscale, and hue-rotate
 * directly to pixel data. Zero dependency on ctx.filter.
 */
function applyPixelFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  filter: PixelFilterConfig
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const brightness = filter.brightness ?? 1;
  const contrast = filter.contrast ?? 1;
  const saturate = filter.saturate ?? 1;
  const sepia = filter.sepia ?? 0;
  const grayscale = filter.grayscale ?? 0;
  const hueRotateDeg = filter.hueRotate ?? 0;

  // Pre-compute the hue rotation matrix if needed
  const needsHueRotate = hueRotateDeg !== 0;
  let hueMatrix: number[] | null = null;
  if (needsHueRotate) {
    hueMatrix = computeHueRotateMatrix(hueRotateDeg);
  }

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // 1. Brightness
    if (brightness !== 1) {
      r *= brightness;
      g *= brightness;
      b *= brightness;
    }

    // 2. Contrast
    if (contrast !== 1) {
      r = (r - 128) * contrast + 128;
      g = (g - 128) * contrast + 128;
      b = (b - 128) * contrast + 128;
    }

    // 3. Grayscale
    if (grayscale > 0) {
      const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      r = r + (gray - r) * grayscale;
      g = g + (gray - g) * grayscale;
      b = b + (gray - b) * grayscale;
    }

    // 4. Sepia
    if (sepia > 0) {
      const sr = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
      const sg = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
      const sb = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
      r = r + (sr - r) * sepia;
      g = g + (sg - g) * sepia;
      b = b + (sb - b) * sepia;
    }

    // 5. Saturate
    if (saturate !== 1) {
      const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      r = gray + (r - gray) * saturate;
      g = gray + (g - gray) * saturate;
      b = gray + (b - gray) * saturate;
    }

    // 6. Hue rotate
    if (hueMatrix) {
      const nr = hueMatrix[0] * r + hueMatrix[1] * g + hueMatrix[2] * b;
      const ng = hueMatrix[3] * r + hueMatrix[4] * g + hueMatrix[5] * b;
      const nb = hueMatrix[6] * r + hueMatrix[7] * g + hueMatrix[8] * b;
      r = nr;
      g = ng;
      b = nb;
    }

    // Clamp
    data[i]     = Math.max(0, Math.min(255, Math.round(r)));
    data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
    data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Compute the 3x3 hue-rotation matrix for a given angle in degrees.
 * Based on the CSS filter spec's hue-rotate algorithm.
 */
function computeHueRotateMatrix(degrees: number): number[] {
  const rad = (degrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  // CSS spec hue-rotate matrix
  return [
    0.213 + cos * 0.787 - sin * 0.213,
    0.715 - cos * 0.715 - sin * 0.715,
    0.072 - cos * 0.072 + sin * 0.928,
    0.213 - cos * 0.213 + sin * 0.143,
    0.715 + cos * 0.285 + sin * 0.140,
    0.072 - cos * 0.072 - sin * 0.283,
    0.213 - cos * 0.213 - sin * 0.787,
    0.715 - cos * 0.715 + sin * 0.715,
    0.072 + cos * 0.928 + sin * 0.072,
  ];
}

/** 
 * Applies a cinematic bloom/mist effect by downsampling, blurring, 
 * and blending it back over the original image. 
 * Uses a manual multi-pass box blur instead of ctx.filter for Safari compat.
 */
function applyBloom(ctx: CanvasRenderingContext2D, mainCanvas: HTMLCanvasElement, config: BloomConfig) {
  const scale = 0.25;
  const smallWidth = Math.max(1, Math.floor(mainCanvas.width * scale));
  const smallHeight = Math.max(1, Math.floor(mainCanvas.height * scale));

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = smallWidth;
  tempCanvas.height = smallHeight;
  const tempCtx = tempCanvas.getContext("2d")!;

  // Draw the main canvas into the small one (downsampling acts as blur itself)
  tempCtx.drawImage(mainCanvas, 0, 0, smallWidth, smallHeight);

  // Apply multi-pass box blur on the downsampled canvas for Safari compat
  const blurPasses = Math.max(1, Math.round(config.radius / 10));
  applyCanvasBoxBlur(tempCtx, smallWidth, smallHeight, blurPasses);

  // Composite back
  ctx.save();
  ctx.globalCompositeOperation = config.blendMode;
  ctx.globalAlpha = config.opacity;
  ctx.drawImage(tempCanvas, 0, 0, smallWidth, smallHeight, 0, 0, mainCanvas.width, mainCanvas.height);
  ctx.restore();

  tempCanvas.width = 0;
  tempCanvas.height = 0;
}

/** Multi-pass box blur applied directly to canvas pixel data */
function applyCanvasBoxBlur(ctx: CanvasRenderingContext2D, width: number, height: number, passes: number) {
  for (let p = 0; p < passes; p++) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const src = imageData.data;
    const dst = new Uint8ClampedArray(src.length);

    // Horizontal pass
    const radius = 3;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0, count = 0;
        for (let kx = -radius; kx <= radius; kx++) {
          const px = Math.min(Math.max(x + kx, 0), width - 1);
          const idx = (y * width + px) * 4;
          r += src[idx]; g += src[idx+1]; b += src[idx+2]; a += src[idx+3];
          count++;
        }
        const idx = (y * width + x) * 4;
        dst[idx] = r / count;
        dst[idx+1] = g / count;
        dst[idx+2] = b / count;
        dst[idx+3] = a / count;
      }
    }

    // Vertical pass
    const dst2 = new Uint8ClampedArray(src.length);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0, count = 0;
        for (let ky = -radius; ky <= radius; ky++) {
          const py = Math.min(Math.max(y + ky, 0), height - 1);
          const idx = (py * width + x) * 4;
          r += dst[idx]; g += dst[idx+1]; b += dst[idx+2]; a += dst[idx+3];
          count++;
        }
        const idx = (y * width + x) * 4;
        dst2[idx] = r / count;
        dst2[idx+1] = g / count;
        dst2[idx+2] = b / count;
        dst2[idx+3] = a / count;
      }
    }

    const out = new ImageData(dst2, width, height);
    ctx.putImageData(out, 0, 0);
  }
}
