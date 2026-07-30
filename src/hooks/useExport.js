import { useState, useCallback } from 'react';
import { toPng } from 'html-to-image';

export function useExport() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  const exportPNG = useCallback(async (ref, theme, logo) => {
    if (!ref) {
      setError('Export container not found');
      return;
    }

    setExporting(true);
    setError(null);

    try {
      // Wait for any images in the container to load
      const images = ref.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise((resolve, reject) => {
              if (img.complete) {
                resolve();
              } else {
                img.onload = resolve;
                img.onerror = reject;
              }
            })
        )
      );

      // Small delay to ensure styles are fully applied
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dataUrl = await toPng(ref, {
        cacheBust: true,
        pixelRatio: 2,
        style: {
          transform: 'scale(1)',
        },
        backgroundColor: theme.background,
        filter: (node) => {
          return !node.classList?.contains('no-export');
        },
      });

      // Trigger download
      const link = document.createElement('a');
      link.download = `standings-${theme.id}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      setError(err.message || 'Export failed');
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  }, []);

  return { exportPNG, exporting, error };
}
