import { useState, useCallback, useEffect, useRef } from 'react';

export function useLogos() {
  const [logo, setLogo] = useState({ file: null, objectURL: null });
  const prevObjectURL = useRef(null);

  const handleLogoUpload = useCallback(
    (file) => {
      if (!file || !file.type.startsWith('image/')) return;
      // Revoke previous object URL
      if (prevObjectURL.current) {
        URL.revokeObjectURL(prevObjectURL.current);
      }
      const objectURL = URL.createObjectURL(file);
      prevObjectURL.current = objectURL;
      setLogo({ file, objectURL });
    },
    []
  );

  const removeLogo = useCallback(() => {
    if (prevObjectURL.current) {
      URL.revokeObjectURL(prevObjectURL.current);
      prevObjectURL.current = null;
    }
    setLogo({ file: null, objectURL: null });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (prevObjectURL.current) {
        URL.revokeObjectURL(prevObjectURL.current);
      }
    };
  }, []);

  return { logo, handleLogoUpload, removeLogo };
}
