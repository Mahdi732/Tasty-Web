import { useEffect, useState } from 'react';

export const useNavbarMorph = (threshold: number) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return {
    scrollY,
    isCollapsed: scrollY > threshold,
  };
};
