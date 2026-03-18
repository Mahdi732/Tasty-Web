import { motion } from 'framer-motion';
import {
  HERO_INGREDIENT_MOTION,
  HERO_SEQUENCE_TIMING,
  type HeroMealScene,
} from '../../config/hero.config';
import {
  buildIngredientMotion,
  type IngredientDepth,
} from '../../lib/ingredient-motion';
import type { HeroSequencePhase } from '../../model/use-hero-sequence';

interface IngredientLayerProps {
  depth: IngredientDepth;
  zIndexClass: string;
  fallDistance: number;
  scene: HeroMealScene;
  phase: HeroSequencePhase;
}

export const IngredientLayer = ({ depth, zIndexClass, fallDistance, scene, phase }: IngredientLayerProps) => {
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
        const motionConfig = buildIngredientMotion(index + indexOffset, depth);

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
