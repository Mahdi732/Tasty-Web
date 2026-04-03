import { useEffect, useState } from 'react';

export const useNavbarMorph = (threshold: number) => {
  const [scrollY, setScrollY] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    const onResize = () => setViewportWidth(window.innerWidth);

    onScroll();
    onResize();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const forceCollapsedForViewport = viewportWidth > 0 && viewportWidth < 1280;

  return {
    scrollY,
    isCollapsed: forceCollapsedForViewport || scrollY > threshold,
  };
};
