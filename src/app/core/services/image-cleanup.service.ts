import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ImageCleanupService {
  private cache = new Map<string, string>();
  private processing = new Set<string>();

  /**
   * Detects if image has a non-white background by sampling the corners.
   * Returns true if background is mostly white (no cleanup needed).
   */
  async hasWhiteBackground(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(true);

          ctx.drawImage(img, 0, 0);
          const samples = [
            ctx.getImageData(2, 2, 1, 1).data,
            ctx.getImageData(img.width - 3, 2, 1, 1).data,
            ctx.getImageData(2, img.height - 3, 1, 1).data,
            ctx.getImageData(img.width - 3, img.height - 3, 1, 1).data,
          ];
          const avgBrightness =
            samples.reduce((sum, p) => sum + (p[0] + p[1] + p[2]) / 3, 0) / samples.length;
          resolve(avgBrightness > 235);
        } catch {
          resolve(true);
        }
      };
      img.onerror = () => resolve(true);
      img.src = url;
    });
  }

  /**
   * Remove background using @imgly/background-removal (lazy-loaded).
   * Returns a blob URL of the cleaned image.
   */
  async removeBackground(url: string): Promise<string> {
    if (this.cache.has(url)) return this.cache.get(url)!;
    if (this.processing.has(url)) return url;

    this.processing.add(url);
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      const blob = await removeBackground(url);
      const cleanUrl = URL.createObjectURL(blob);
      this.cache.set(url, cleanUrl);
      return cleanUrl;
    } catch {
      return url;
    } finally {
      this.processing.delete(url);
    }
  }
}
