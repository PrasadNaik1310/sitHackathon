import { useEffect } from 'react';

let isLoaded = false;

export function useMaterialIcons() {
  useEffect(() => {
    if (isLoaded) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,100,0,0';
    document.head.appendChild(link);
    isLoaded = true;

    return () => {
      // Optional: remove on unmount if needed
      // document.head.removeChild(link);
    };
  }, []);
}
