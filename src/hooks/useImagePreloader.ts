import { useEffect, useState } from 'react';

export const useImagePreloader = (imageUrls: string[], delay: number = 1000) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => {
      imageUrls.forEach((url) => {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(url));
        };
        img.src = url;
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [imageUrls, delay]);

  return loadedImages;
};