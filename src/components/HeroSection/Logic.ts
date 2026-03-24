import { useFallDistance } from '@/services/layout/useFallDistance';
import { useHeroSequence, type HeroSequencePhase } from '@/services/hero/useHeroSequence';
import type { HeroMealScene } from './Config';

interface UseHeroSectionLogicOptions {
  scene?: HeroMealScene;
  phase?: HeroSequencePhase;
  pauseSequence?: boolean;
}

export const useHeroSectionLogic = ({ scene, phase, pauseSequence = false }: UseHeroSectionLogicOptions) => {
  const fallDistance = useFallDistance();
  const localSequence = useHeroSequence({ paused: pauseSequence });

  return {
    fallDistance,
    scene: scene ?? localSequence.scene,
    phase: phase ?? localSequence.phase,
  };
};
