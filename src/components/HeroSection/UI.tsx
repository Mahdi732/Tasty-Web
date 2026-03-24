'use client';

import { motion } from 'framer-motion';
import {
  HERO_BURGER_ENTRY_SPRING,
  HERO_BURGER_EXIT_EASE,
  HERO_INGREDIENT_MOTION,
  HERO_ORDER_BUTTON_LABEL,
  HERO_SEQUENCE_TIMING,
  HERO_SNACK_ARROW_LABEL,
  HERO_SNACK_CARD_TITLE,
  HERO_SNACK_IMAGE_ALT,
  HERO_SNACK_IMAGE_SRC,
  type HeroMealScene,
} from './Config';
import { buildIngredientMotion, type IngredientDepth } from './Animation';
import { useHeroSectionLogic } from './Logic';
import type { HeroSequencePhase } from '@/services/hero/useHeroSequence';

interface HeroSectionProps {
  scene?: HeroMealScene;
  phase?: HeroSequencePhase;
  pauseSequence?: boolean;
  showMeal?: boolean;
  className?: string;
}

interface IngredientLayerProps {
  depth: IngredientDepth;
  zIndexClass: string;
  fallDistance: number;
  scene: HeroMealScene;
  phase: HeroSequencePhase;
}

const IngredientLayer = ({ depth, zIndexClass, fallDistance, scene, phase }: IngredientLayerProps) => {
  const layers = depth === 'foreground' ? scene.foregroundIngredients : scene.backgroundIngredients;
  const spring = HERO_INGREDIENT_MOTION.entrance[depth];
  const indexOffset = depth === 'foreground' ? scene.backgroundIngredients.length : 0;
  const isExiting = phase === 'exit';
  const exitDelayMultiplier = depth === 'foreground'
    ? HERO_INGREDIENT_MOTION.exit.foregroundDelayMultiplier
    : HERO_INGREDIENT_MOTION.exit.backgroundDelayMultiplier;

  return (
    <div className={`pointer-events-none absolute inset-0 ${zIndexClass}`}>
      {layers.map((className, index) => {
        const motionConfig = buildIngredientMotion(index + indexOffset);

        return (
          <motion.div
            key={`${scene.id}-${depth}-${className}`}
            initial={{ y: -(fallDistance + motionConfig.entranceYOffset), opacity: 0 }}
            animate={{
              y: isExiting ? -(fallDistance + motionConfig.entranceYOffset * 0.6) : 0,
              opacity: 1,
              rotate: isExiting ? motionConfig.settleRotate + 3 : motionConfig.settleRotate,
            }}
            transition={{
              ...(isExiting
                ? {
                  delay: motionConfig.delay * exitDelayMultiplier,
                  duration: HERO_SEQUENCE_TIMING.exitDuration,
                  ease: [0.36, 0, 1, 1],
                }
                : {
                  delay: motionConfig.delay,
                  type: 'spring',
                  ...spring,
                }),
            }}
            className={`absolute ${className} will-change-transform`}
          >
            <img src={scene.ingredientImageSrc} alt={scene.ingredientImageAlt} className="w-full" />
          </motion.div>
        );
      })}
    </div>
  );
};

export const HeroSection = ({
  scene: sceneOverride,
  phase: phaseOverride,
  pauseSequence = false,
  showMeal = true,
  className,
}: HeroSectionProps) => {
  const { fallDistance, scene, phase } = useHeroSectionLogic({
    scene: sceneOverride,
    phase: phaseOverride,
    pauseSequence,
  });

  const isExiting = phase === 'exit';

  return (
    <motion.section
      animate={{ backgroundColor: scene.backgroundColor }}
      transition={{
        duration: HERO_SEQUENCE_TIMING.backgroundTransitionDuration,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`relative h-screen w-full overflow-hidden ${className ?? ''}`.trim()}
    >
      <>
        <motion.h1
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: isExiting ? 0.55 : 1, y: 0 }}
          transition={{ duration: HERO_SEQUENCE_TIMING.entryDuration * 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute inset-y-0 left-0 z-0 flex w-1/2 items-center justify-end pr-[18%] text-right text-5xl font-extrabold uppercase tracking-[0.1em] text-white/10 sm:text-7xl lg:text-9xl"
        >
          {scene.headingLeft}
        </motion.h1>

        <motion.h1
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: isExiting ? 0.55 : 1, y: 0 }}
          transition={{ duration: HERO_SEQUENCE_TIMING.entryDuration * 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute inset-y-0 right-0 z-0 flex w-1/2 items-center justify-start pl-[18%] text-left text-5xl font-extrabold uppercase tracking-[0.1em] text-white/10 sm:text-7xl lg:text-9xl"
        >
          {scene.headingRight}
        </motion.h1>
      </>

      <IngredientLayer
        depth="background"
        zIndexClass="z-10"
        fallDistance={fallDistance}
        scene={scene}
        phase={phase}
      />

      {showMeal ? (
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
      ) : null}

      <IngredientLayer
        depth="foreground"
        zIndexClass="z-30"
        fallDistance={fallDistance}
        scene={scene}
        phase={phase}
      />

      <div className="relative z-[25] mx-auto flex h-full w-full max-w-7xl items-end justify-between px-6 pb-10 sm:px-10 sm:pb-14">
        <div className="max-w-md space-y-6">
          <p className="text-base leading-relaxed text-white sm:text-lg">{scene.description}</p>

          <button
            type="button"
            className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold tracking-wide text-[#a31116]"
          >
            {HERO_ORDER_BUTTON_LABEL}
          </button>
        </div>

        <div className="w-[280px] rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
          <img
            src={HERO_SNACK_IMAGE_SRC}
            alt={HERO_SNACK_IMAGE_ALT}
            className="h-28 w-full rounded-2xl object-cover"
          />

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm font-medium text-white">{HERO_SNACK_CARD_TITLE}</p>
            <button
              type="button"
              aria-label={HERO_SNACK_ARROW_LABEL}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#a31116]"
            >
              {'->'}
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
