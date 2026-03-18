import { motion } from 'framer-motion';
import {
  HERO_BURGER_ENTRY_SPRING,
  HERO_BURGER_EXIT_EASE,
  HERO_SEQUENCE_TIMING,
  type HeroMealScene,
} from '../../config/hero.config';
import type { HeroSequencePhase } from '../../model/use-hero-sequence';

interface BurgerHeroProps {
  fallDistance: number;
  scene: HeroMealScene;
  phase: HeroSequencePhase;
}

export const MealHero = ({ fallDistance, scene, phase }: BurgerHeroProps) => {
  const isExiting = phase === 'exit';

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <motion.img
        key={scene.id}
        src={scene.productImageSrc}
        alt={scene.productImageAlt}
        initial={{ y: -fallDistance * 1.06, rotate: scene.burgerRotate - 20 }}
        animate={{
          y: isExiting ? -fallDistance * 1.08 : scene.burgerY,
          rotate: isExiting ? scene.burgerRotate + 7 : scene.burgerRotate,
        }}
        transition={{
          ...(isExiting
            ? {
              duration: HERO_SEQUENCE_TIMING.exitDuration,
              ease: HERO_BURGER_EXIT_EASE,
            }
            : {
              type: 'spring',
              ...HERO_BURGER_ENTRY_SPRING,
            }),
        }}
        className="w-[340px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] will-change-transform sm:w-[440px] lg:w-[540px]"
      />
    </div>
  );
};
