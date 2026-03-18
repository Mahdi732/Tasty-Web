'use client';

import { useCallback, useState } from 'react';
import { IslandNavbar } from '@/features/navbar/ui/IslandNavbar';
import { HeroSection } from '@/widgets/hero/ui/HeroSection';
import { useHeroSequence } from '@/widgets/hero/model/use-hero-sequence';
import { HeroToAboutScrollytelling } from '@/widgets/about/ui/HeroToAboutScrollytelling';

export const HomeExperience = () => {
  const [isMealDetached, setIsMealDetached] = useState(false);
  const { scene, phase } = useHeroSequence({ paused: isMealDetached });

  const handleDetachChange = useCallback((nextDetached: boolean) => {
    setIsMealDetached((prev) => (prev === nextDetached ? prev : nextDetached));
  }, []);

  return (
    <div className="min-h-screen bg-[#c81f25]">
      <IslandNavbar />
      <HeroSection scene={scene} phase={phase} pauseSequence={isMealDetached} showMeal={!isMealDetached} />
      <HeroToAboutScrollytelling scene={scene} onDetachChange={handleDetachChange} />
    </div>
  );
};
