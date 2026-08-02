import { useState, useCallback } from 'react';
import { toPng, toBlob } from 'html-to-image';

const MAX_RETRIES = 2;

/**
 * Convert an <img> element's src to a base64 data URL to avoid
 * cross-origin canvas taint when html-to-image captures the DOM.
 */
async function imgToBase64(img) {
  return new Promise((resolve, reject) => {
    // Already a data URL — no conversion needed
    if (img.src.startsWith('data:')) {
      resolve(img.src);
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width || 200;
    canvas.height = img.naturalHeight || img.height || 64;
    const ctx = canvas.getContext('2d');
    try {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png'));
    } catch (e) {
      // If canvas is tainted, fall back to the original src
      console.warn('Image conversion to base64 failed (likely CORS), keeping original src:', e);
      resolve(img.src);
    }
  });
}

/**
 * Replace all <img> src attributes inside the container with base64 data URLs
 * to prevent cross-origin taint during html-to-image capture.
 * Returns a cleanup function to restore original src values.
 */
async function embedImagesAsBase64(container) {
  const images = container.querySelectorAll('img');
  const originals = [];

  for (const img of images) {
    // Skip already-broken or tiny placeholder images
    if (!img.src || img.src === window.location.href) continue;
    try {
      const dataUrl = await imgToBase64(img);
      originals.push({ img, originalSrc: img.src });
      img.src = dataUrl;
    } catch {
      // keep original — will try as-is
    }
  }

  return () => {
    for (const { img, originalSrc } of originals) {
      img.src = originalSrc;
    }
  };
}

export function useExport() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  const exportPNG = useCallback(async (ref, theme) => {
    if (!ref) {
      setError('Export container not found. Please try again.');
      return;
    }

    // Ensure the container has non-zero dimensions
    const rect = ref.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      setError(
        'Export preview is not visible. Ensure standings are generated and the preview is rendered.'
      );
      return;
    }

    setExporting(true);
    setError(null);

    // Convert images to base64 before capture to avoid CORS taint
    const restoreImages = await embedImagesAsBase64(ref);

    let lastError = null;

    try {
      // Let DOM settle
      await new Promise((r) => setTimeout(r, 200));

      // Retry loop
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const dataUrl = await toPng(ref, {
            cacheBust: true,
            pixelRatio: 2,
            skipFonts: true,
            preferredFontFormat: 'woff2',
            includeQueryParams: true,
            backgroundColor: theme.background,
            style: {
              transform: 'scale(1)',
              width: ref.offsetWidth + 'px',
              height: ref.offsetHeight + 'px',
            },
            filter: (node) => {
              const tag = node.tagName;
              if (tag === 'SCRIPT' || tag === 'STYLE') return false;
              if (node.classList?.contains('no-export')) return false;
              return true;
            },
          });

          // Success — trigger download
          const link = document.createElement('a');
          link.download = `standings-${theme.id}-${Date.now()}.png`;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return; // done
        } catch (err) {
          lastError = err;
          console.warn(`toPng attempt ${attempt}/${MAX_RETRIES} failed:`, err);
          if (attempt < MAX_RETRIES) {
            // Brief delay before retry
            await new Promise((r) => setTimeout(r, 300));
          }
        }
      }

      // All toPng attempts failed — try toBlob fallback
      console.warn('toPng failed after retries, trying toBlob fallback...');
      try {
        const blob = await toBlob(ref, {
          cacheBust: true,
          pixelRatio: 2,
          skipFonts: true,
          preferredFontFormat: 'woff2',
          includeQueryParams: true,
          backgroundColor: theme.background,
          style: {
            transform: 'scale(1)',
            width: ref.offsetWidth + 'px',
            height: ref.offsetHeight + 'px',
          },
          filter: (node) => {
            const tag = node.tagName;
            if (tag === 'SCRIPT' || tag === 'STYLE') return false;
            if (node.classList?.contains('no-export')) return false;
            return true;
          },
        });

        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `standings-${theme.id}-${Date.now()}.png`;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          return;
        }
      } catch (blobErr) {
        console.error('toBlob fallback also failed:', blobErr);
      }

      // Everything failed
      const msg =
        lastError instanceof Error ? lastError.message : 'Unknown export error';
      setError(
        `Export failed: ${msg}. Try refreshing or using Chrome/Firefox.`
      );
    } finally {
      restoreImages();
      setExporting(false);
    }
  }, []);

  return { exportPNG, exporting, error };
}
