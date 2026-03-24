import { HERO_INGREDIENT_MOTION } from './Config';
import { mapRange, randomFromSeed } from '@/services/utils/random';

export type IngredientDepth = 'foreground' | 'background';

export interface IngredientMotionProfile {
  delay: number;
  entranceYOffset: number;
  settleRotate: number;
}

export const buildIngredientMotion = (index: number): IngredientMotionProfile => {
  const delayRatio = randomFromSeed(index + 1);

  return {
    delay: mapRange(delayRatio, HERO_INGREDIENT_MOTION.delayRange.min, HERO_INGREDIENT_MOTION.delayRange.max),
    entranceYOffset: mapRange(randomFromSeed(index + 241), 80, 180),
    settleRotate: mapRange(randomFromSeed(index + 271), -4, 4),
  };
};
