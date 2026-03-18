'use client';

import { motion } from 'framer-motion';

import { HERO_SEQUENCE_TIMING, type HeroMealScene } from '../config/hero.config';
import { useFallDistance } from '../model/use-fall-distance';
import { useHeroSequence, type HeroSequencePhase } from '../model/use-hero-sequence';
import { BackgroundHeadings } from './components/BackgroundHeadings';
import { MealHero } from './components/MealHero';
import { HeroContent } from './components/HeroContent';
import { IngredientLayer } from './components/IngredientLayer';

interface HeroSectionProps {
  scene?: HeroMealScene;
  phase?: HeroSequencePhase;
  pauseSequence?: boolean;
  showMeal?: boolean;
  className?: string;
}

export const HeroSection = ({
  scene: sceneOverride,
  phase: phaseOverride,
  pauseSequence = false,
  showMeal = true,
  className,
}: HeroSectionProps) => {
  const fallDistance = useFallDistance();
  const localSequence = useHeroSequence({ paused: pauseSequence });
  const scene = sceneOverride ?? localSequence.scene;
  const phase = phaseOverride ?? localSequence.phase;

  return (
    <motion.section
      animate={{ backgroundColor: scene.backgroundColor }}
      transition={{
        duration: HERO_SEQUENCE_TIMING.backgroundTransitionDuration,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`relative h-screen w-full overflow-hidden ${className ?? ''}`.trim()}
    >
      <BackgroundHeadings scene={scene} phase={phase} />
      <IngredientLayer
        depth="background"
        zIndexClass="z-10"
        fallDistance={fallDistance}
        scene={scene}
        phase={phase}
      />
      {showMeal ? <MealHero fallDistance={fallDistance} scene={scene} phase={phase} /> : null}
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