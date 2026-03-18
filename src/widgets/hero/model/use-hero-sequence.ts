import { useEffect, useMemo, useState } from 'react';
import { HERO_MEAL_SCENES, HERO_SEQUENCE_TIMING, type HeroMealScene } from '../config/hero.config';

export type HeroSequencePhase = 'enter' | 'hold' | 'exit';

const getPhaseDurationMs = (phase: HeroSequencePhase) => {
  if (phase === 'enter') {
    return HERO_SEQUENCE_TIMING.entryDuration * 1000;
  }
  if (phase === 'hold') {
    return HERO_SEQUENCE_TIMING.holdDuration * 1000;
  }
  return HERO_SEQUENCE_TIMING.exitDuration * 1000;
};

export const useHeroSequence = () => {
  const [phase, setPhase] = useState<HeroSequencePhase>('enter');
  const [sceneIndex, setSceneIndex] = useState(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (phase === 'enter') {
        setPhase('hold');
        return;
      }

      if (phase === 'hold') {
        setPhase('exit');
        return;
      }

      setSceneIndex((prev) => (prev + 1) % HERO_MEAL_SCENES.length);
      setPhase('enter');
    }, getPhaseDurationMs(phase));

    return () => window.clearTimeout(timeoutId);
  }, [phase]);

  const scene: HeroMealScene = useMemo(() => HERO_MEAL_SCENES[sceneIndex], [sceneIndex]);

  return {
    phase,
    scene,
    sceneIndex,
  };
};
