'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import {
  HERO_BACKGROUND_BEEF_LAYERS,
  HERO_BACKGROUND_HEADING_LEFT,
  HERO_BACKGROUND_HEADING_RIGHT,
  HERO_BEEF_IMAGE_ALT,
  HERO_BURGER_FALL_PHYSICS,
  HERO_BEEF_IMAGE_SRC,
  HERO_BURGER_IMAGE_ALT,
  HERO_BURGER_IMAGE_SRC,
  HERO_DESCRIPTION,
  HERO_FOREGROUND_BEEF_LAYERS,
  HERO_ORDER_BUTTON_LABEL,
  HERO_SECONDARY_FADE_DELAY,
  HERO_SECONDARY_FADE_DURATION,
  HERO_SNACK_ARROW_LABEL,
  HERO_SNACK_CARD_TITLE,
  HERO_SNACK_IMAGE_ALT,
  HERO_SNACK_IMAGE_SRC,
} from '../config/hero.config';

export const HeroSection = () => {
  const [fallDistance, setFallDistance] = useState(1200);

  useEffect(() => {
    const updateFallDistance = () => {
      setFallDistance(Math.max(window.innerHeight * 1.15, 920));
    };

    updateFallDistance();
    window.addEventListener('resize', updateFallDistance);
    return () => window.removeEventListener('resize', updateFallDistance);
  }, []);

  const secondaryFade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: {
      delay: HERO_SECONDARY_FADE_DELAY,
      duration: HERO_SECONDARY_FADE_DURATION,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#c81f25]">
      <motion.h1
        {...secondaryFade}
        className="pointer-events-none absolute inset-y-0 left-0 z-0 flex w-1/2 items-center justify-end pr-[18%] text-right text-5xl font-extrabold uppercase tracking-[0.1em] text-white/10 sm:text-7xl lg:text-9xl"
      >
        {HERO_BACKGROUND_HEADING_LEFT}
      </motion.h1>

      <motion.h1
        {...secondaryFade}
        className="pointer-events-none absolute inset-y-0 right-0 z-0 flex w-1/2 items-center justify-start pl-[18%] text-left text-5xl font-extrabold uppercase tracking-[0.1em] text-white/10 sm:text-7xl lg:text-9xl"
      >
        {HERO_BACKGROUND_HEADING_RIGHT}
      </motion.h1>

      <motion.div {...secondaryFade} className="pointer-events-none absolute inset-0 z-10">
        {HERO_BACKGROUND_BEEF_LAYERS.map((className) => (
          <img
            key={className}
            src={HERO_BEEF_IMAGE_SRC}
            alt={HERO_BEEF_IMAGE_ALT}
            className={`absolute ${className}`}
          />
        ))}
      </motion.div>

      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
        <motion.img
          src={HERO_BURGER_IMAGE_SRC}
          alt={HERO_BURGER_IMAGE_ALT}
          initial={{ y: -fallDistance, rotate: -7.2 }}
          animate={{ y: 0, rotate: -4 }}
          transition={{
            type: 'spring',
            ...HERO_BURGER_FALL_PHYSICS,
          }}
          className="w-[340px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] will-change-transform sm:w-[440px] lg:w-[540px]"
        />
      </div>

      <motion.div {...secondaryFade} className="pointer-events-none absolute inset-0 z-30">
        {HERO_FOREGROUND_BEEF_LAYERS.map((className) => (
          <img
            key={className}
            src={HERO_BEEF_IMAGE_SRC}
            alt={HERO_BEEF_IMAGE_ALT}
            className={`absolute ${className}`}
          />
        ))}
      </motion.div>

      <div className="relative z-[25] mx-auto flex h-full w-full max-w-7xl items-end justify-between px-6 pb-10 sm:px-10 sm:pb-14">
        <div className="max-w-md space-y-6">
          <p className="text-base leading-relaxed text-white sm:text-lg">{HERO_DESCRIPTION}</p>

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
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};