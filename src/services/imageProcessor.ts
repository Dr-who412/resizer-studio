export interface CornerRadii {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
}

export interface ImageProcessingOptions {
  width: number;
  height: number;
  format: 'image/png' | 'image/jpeg' | 'image/webp';
  quality: number; // 0.1 to 1.0
  corners: CornerRadii;
  removeTransparency: boolean;
  solidBackgroundColor: string; // hex or rgb
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fitMode?: 'stretch' | 'fit' | 'cover';
  smoothing?: 'high' | 'medium' | 'low' | 'pixelated';
}

export interface ProcessedImageResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  fileSizeBytes: number;
  format: string;
}

/**
 * Load an image from a File or Data URL
 */
export function loadImage(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image. File may be corrupt or unsupported.'));

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Draws rounded rectangle path with individual corner radii
 */
export function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radii: CornerRadii
) {
  const { topLeft, topRight, bottomRight, bottomLeft } = radii;

  // Clamp radii so they don't overlap
  const maxRadius = Math.min(width, height) / 2;
  const tl = Math.max(0, Math.min(topLeft, maxRadius));
  const tr = Math.max(0, Math.min(topRight, maxRadius));
  const br = Math.max(0, Math.min(bottomRight, maxRadius));
  const bl = Math.max(0, Math.min(bottomLeft, maxRadius));

  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + width - tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + tr);
  ctx.lineTo(x + width, y + height - br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
  ctx.lineTo(x + bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - bl);
  ctx.lineTo(x, y + tl);
  ctx.quadraticCurveTo(x, y, x + tl, y);
  ctx.closePath();
}

/**
 * Process image with resizing, cropping, corner radii, background color, and format encoding
 */
export async function processImage(
  sourceImg: HTMLImageElement,
  options: ImageProcessingOptions
): Promise<ProcessedImageResult> {
  const targetWidth = Math.max(1, Math.round(options.width));
  const targetHeight = Math.max(1, Math.round(options.height));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d', { alpha: !options.removeTransparency });
  if (!ctx) {
    throw new Error('Canvas 2D context could not be created');
  }

  // Smoothing
  if (options.smoothing === 'pixelated') {
    ctx.imageSmoothingEnabled = false;
  } else {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = options.smoothing || 'high';
  }

  // 1. Corner Radii Clipping setup
  const hasRoundedCorners =
    options.corners.topLeft > 0 ||
    options.corners.topRight > 0 ||
    options.corners.bottomRight > 0 ||
    options.corners.bottomLeft > 0;

  if (hasRoundedCorners) {
    ctx.save();
    drawRoundedRectPath(ctx, 0, 0, targetWidth, targetHeight, options.corners);
    ctx.clip();
  }

  // 2. Solid background color if transparency removal is requested or format is JPEG
  const requiresSolidBg = options.removeTransparency || options.format === 'image/jpeg';
  if (requiresSolidBg) {
    ctx.fillStyle = options.solidBackgroundColor || '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  // 3. Cropping & Drawing coordinates
  let sx = 0;
  let sy = 0;
  let sw = sourceImg.naturalWidth || sourceImg.width;
  let sh = sourceImg.naturalHeight || sourceImg.height;

  if (options.crop) {
    sx = Math.max(0, options.crop.x);
    sy = Math.max(0, options.crop.y);
    sw = Math.min(options.crop.width, (sourceImg.naturalWidth || sourceImg.width) - sx);
    sh = Math.min(options.crop.height, (sourceImg.naturalHeight || sourceImg.height) - sy);
  }

  const fit = options.fitMode || 'fit';

  if (fit === 'stretch') {
    ctx.drawImage(sourceImg, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
  } else if (fit === 'cover') {
    const targetRatio = targetWidth / targetHeight;
    const sourceRatio = sw / sh;
    let renderSw = sw;
    let renderSh = sh;
    let renderSx = sx;
    let renderSy = sy;

    if (sourceRatio > targetRatio) {
      renderSw = sh * targetRatio;
      renderSx = sx + (sw - renderSw) / 2;
    } else {
      renderSh = sw / targetRatio;
      renderSy = sy + (sh - renderSh) / 2;
    }
    ctx.drawImage(sourceImg, renderSx, renderSy, renderSw, renderSh, 0, 0, targetWidth, targetHeight);
  } else {
    // 'fit' (contain)
    const scale = Math.min(targetWidth / sw, targetHeight / sh);
    const renderW = Math.round(sw * scale);
    const renderH = Math.round(sh * scale);
    const renderX = Math.round((targetWidth - renderW) / 2);
    const renderY = Math.round((targetHeight - renderH) / 2);

    ctx.drawImage(sourceImg, sx, sy, sw, sh, renderX, renderY, renderW, renderH);
  }

  if (hasRoundedCorners) {
    ctx.restore();
  }

  // 4. Output encoding
  const mimeType = options.format;
  const quality = (mimeType === 'image/jpeg' || mimeType === 'image/webp') ? options.quality : undefined;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create image blob'));
          return;
        }
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve({
          blob,
          dataUrl,
          width: targetWidth,
          height: targetHeight,
          fileSizeBytes: blob.size,
          format: mimeType
        });
      },
      mimeType,
      quality
    );
  });
}

/**
 * Format bytes into human readable string (KB, MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Trigger browser file download
 */
export function triggerDownload(urlOrBlob: string | Blob, filename: string) {
  const link = document.createElement('a');
  let objectUrl = '';
  if (typeof urlOrBlob === 'string') {
    link.href = urlOrBlob;
  } else {
    objectUrl = URL.createObjectURL(urlOrBlob);
    link.href = objectUrl;
  }
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
  }
}
