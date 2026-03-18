'use client';

import { motion } from 'framer-motion';

import { HERO_SEQUENCE_TIMING } from '../config/hero.config';
import { useFallDistance } from '../model/use-fall-distance';
import { useHeroSequence } from '../model/use-hero-sequence';
import { BackgroundHeadings } from './components/BackgroundHeadings';
import { MealHero } from './components/MealHero';
import { HeroContent } from './components/HeroContent';
import { IngredientLayer } from './components/IngredientLayer';

export const HeroSection = () => {
  const fallDistance = useFallDistance();
  const { scene, phase } = useHeroSequence();

  return (
    <motion.section
      animate={{ backgroundColor: scene.backgroundColor }}
      transition={{
        duration: HERO_SEQUENCE_TIMING.backgroundTransitionDuration,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative h-screen w-full overflow-hidden"
    >
      <BackgroundHeadings scene={scene} phase={phase} />
      <IngredientLayer
        depth="background"
        zIndexClass="z-10"
        fallDistance={fallDistance}
        scene={scene}
        phase={phase}
      />
      <MealHero fallDistance={fallDistance} scene={scene} phase={phase} />
      <IngredientLayer
        depth="foreground"
        zIndexClass="z-30"
        fallDistance={fallDistance}
        scene={scene}
        phase={phase}
      />
      <HeroContent scene={scene} />
    </motion.section>
  );
};