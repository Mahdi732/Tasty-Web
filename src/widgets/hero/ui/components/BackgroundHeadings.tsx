import { motion } from 'framer-motion';
import {
  HERO_SEQUENCE_TIMING,
  type HeroMealScene,
} from '../../config/hero.config';
import type { HeroSequencePhase } from '../../model/use-hero-sequence';

interface BackgroundHeadingsProps {
  scene: HeroMealScene;
  phase: HeroSequencePhase;
}

export const BackgroundHeadings = ({ scene, phase }: BackgroundHeadingsProps) => {
  const isExiting = phase === 'exit';

  return (
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
  );
};
