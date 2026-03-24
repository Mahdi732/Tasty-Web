import { useRef, useState } from 'react';
import { useHeroSequence } from '@/services/hero/useHeroSequence';

export const useMainPageLogic = () => {
  const transitionSectionRef = useRef<HTMLElement | null>(null);
  const [isMealDetached, setIsMealDetached] = useState(false);
  const { scene, phase } = useHeroSequence({ paused: isMealDetached });

  return {
    transitionSectionRef,
    isMealDetached,
    setIsMealDetached,
    scene,
    phase,
  };
};
