'use client';

/* eslint-disable @next/next/no-img-element */

import { AnimatePresence, motion, useMotionTemplate, useTransform, type MotionValue } from 'framer-motion';
import type { RefObject } from 'react';
import { ABOUT_CATEGORIES, ABOUT_FOOTER_TAGLINE, ABOUT_STAGE_PIN_SCROLL_PX } from './Config';
import { useAboutSectionLogic } from './Logic';
import { useAboutSectionAnimation } from './Animation';
import type { HeroMealScene } from '@/components/HeroSection/Config';

interface AboutSectionProps {
  sectionRef: RefObject<HTMLElement | null>;
  scene: HeroMealScene;
  progress: MotionValue<number>;
  subjectY: MotionValue<number>;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const AboutSection = ({ sectionRef, scene, progress, subjectY }: AboutSectionProps) => {
  const {
    activeJourneyIndex,
    activeCategoryIndex,
    activeStepIndex,
    activeCategory,
    activeStep,
    transitionDuration,
    journeyStateCount,
    handleCategoryClick,
  } = useAboutSectionLogic({ sectionRef, progress });

  const {
    carryOpacity,
    carryBgDriftY,
    carryFgDriftY,
    carryBgScale,
    carryFgScale,
    aboutShellOpacity,
    leftContainerOpacity,
    leftContainerX,
    rightContainerOpacity,
    rightContainerX,
    sideFilter,
  } = useAboutSectionAnimation(progress);

  const counterLabel = `${String(activeStepIndex + 1).padStart(2, '0')}/${String(activeCategory.steps.length).padStart(2, '0')}`;

  const bleedRadius = useTransform(progress, [0, 0.7, 1], [180, 560, 980]);
  const bleedOpacity = useTransform(progress, [0.02, 0.3, 0.8, 1], [0.14, 0.56, 0.96, 1]);
  const fullBeigeOpacity = useTransform(progress, [0.38, 1], [0, 1]);
  const navLift = useTransform(progress, [0.56, 0.78], [-16, 0]);
  const mealBleed = useMotionTemplate`radial-gradient(circle ${bleedRadius}px at 50% calc(50% + ${subjectY}px), rgba(246,231,213,0.96) 0%, rgba(246,231,213,0.76) 36%, rgba(246,231,213,0.42) 58%, rgba(246,231,213,0) 82%)`;

  const watermarkOpacity = useTransform(progress, [0.11, 0.42, 0.78, 1], [0, 0.42, 0.24, 0.14]);
  const revealMask = useMotionTemplate`radial-gradient(300px 250px at 50% calc(50% + ${subjectY}px), rgba(0,0,0,0.96), rgba(0,0,0,0.38) 62%, rgba(0,0,0,0) 100%)`;

  return (
    <section ref={sectionRef} className="relative" style={{ height: `calc(100vh + ${ABOUT_STAGE_PIN_SCROLL_PX}px)` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div style={{ backgroundColor: scene.backgroundColor }} className="absolute inset-0" />
        <motion.div style={{ opacity: bleedOpacity, backgroundImage: mealBleed }} className="absolute inset-0" />
        <motion.div style={{ opacity: fullBeigeOpacity }} className="absolute inset-0 bg-[#f6e7d5]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.26),transparent_42%),radial-gradient(circle_at_76%_78%,rgba(112,37,28,0.12),transparent_40%)]" />

        <motion.div style={{ opacity: carryOpacity }} className="pointer-events-none absolute inset-0 z-[8]">
          {scene.backgroundIngredients.map((className) => (
            <motion.div
              key={`${scene.id}-carry-bg-${className}`}
              style={{ y: carryBgDriftY, scale: carryBgScale }}
              className={`absolute ${className}`}
            >
              <img src={scene.ingredientImageSrc} alt={scene.ingredientImageAlt} className="w-full" />
            </motion.div>
          ))}
        </motion.div>

        <motion.div style={{ opacity: carryOpacity }} className="pointer-events-none absolute inset-0 z-[12]">
          {scene.foregroundIngredients.map((className) => (
            <motion.div
              key={`${scene.id}-carry-fg-${className}`}
              style={{ y: carryFgDriftY, scale: carryFgScale }}
              className={`absolute ${className}`}
            >
              <img src={scene.ingredientImageSrc} alt={scene.ingredientImageAlt} className="w-full" />
            </motion.div>
          ))}
        </motion.div>

        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
          <span className="select-none text-[28vw] font-black uppercase leading-none tracking-[0.08em] text-[#32130f]/[0.08] sm:text-[22vw]">
            TASTY
          </span>

          <motion.span
            style={{
              opacity: watermarkOpacity,
              WebkitMaskImage: revealMask,
              maskImage: revealMask,
            }}
            className="absolute select-none text-[28vw] font-black uppercase leading-none tracking-[0.08em] text-[#fff5df]/80 mix-blend-soft-light sm:text-[22vw]"
          >
            TASTY
          </motion.span>
        </div>

        <motion.div
          style={{ opacity: aboutShellOpacity }}
          className="absolute inset-0 z-20 mx-auto w-full max-w-[1700px] px-6 sm:px-10"
        >
          <div className="relative h-full">
            <motion.nav
              style={{
                opacity: aboutShellOpacity,
                y: navLift,
                filter: sideFilter,
              }}
              className="pointer-events-auto absolute left-1/2 top-8 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/34 bg-white/22 p-2 shadow-[0_18px_44px_rgba(43,28,18,0.17)] backdrop-blur-2xl"
            >
              {ABOUT_CATEGORIES.map((category, index) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryClick(index)}
                  aria-pressed={index === activeCategoryIndex}
                  className={`rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] transition-all duration-300 ${
                    index === activeCategoryIndex
                      ? 'scale-[1.03] bg-[#2f1f19] text-[#f7e5cf] shadow-[0_8px_22px_rgba(31,20,14,0.3)]'
                      : 'text-[#4c3125]/80 hover:bg-white/30 hover:text-[#2f1f19]'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </motion.nav>

            <div className="grid h-full grid-cols-1 items-center gap-8 py-24 lg:grid-cols-[minmax(300px,1fr)_minmax(420px,1fr)_minmax(300px,1fr)] lg:gap-24">
              <motion.div
                style={{
                  opacity: leftContainerOpacity,
                  x: leftContainerX,
                  filter: sideFilter,
                }}
                className="mx-auto w-full max-w-[460px] text-center lg:mx-0 lg:text-left"
              >
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={`title-${activeCategory.id}-${activeStep.id}`}
                    initial={{ opacity: 0, y: 36, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -30, filter: 'blur(9px)' }}
                    transition={{ duration: transitionDuration, ease: [0.16, 1, 0.3, 1] }}
                    className="text-4xl font-black uppercase leading-[1.02] tracking-[0.05em] text-[#2b1a14] sm:text-5xl lg:text-6xl xl:text-7xl"
                  >
                    {activeStep.title}
                  </motion.h2>
                </AnimatePresence>
              </motion.div>

              <div className="hidden lg:flex lg:items-end lg:justify-center lg:pb-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`middle-${activeCategory.id}-${activeStep.id}`}
                    initial={{ opacity: 0, y: 22, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -18, filter: 'blur(6px)' }}
                    transition={{ duration: clamp(transitionDuration * 0.82, 0.42, 0.9), ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-full border border-white/30 bg-white/18 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5a3f31]/90 backdrop-blur-xl"
                  >
                    {activeCategory.label} {counterLabel}
                  </motion.div>
                </AnimatePresence>
              </div>

              <motion.div
                style={{
                  opacity: rightContainerOpacity,
                  x: rightContainerX,
                  filter: sideFilter,
                }}
                className="mx-auto w-full max-w-[420px] rounded-[2rem] border border-white/30 bg-white/18 p-7 shadow-[0_24px_58px_rgba(42,28,18,0.14)] backdrop-blur-2xl lg:mx-0"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`content-${activeCategory.id}-${activeStep.id}`}
                    initial={{ opacity: 0, y: 36, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -30, filter: 'blur(8px)' }}
                    transition={{ duration: transitionDuration, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#6b4936]/85">{counterLabel}</p>
                    <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[#4d2f21]/80">{activeCategory.label}</p>
                    <p className="mt-5 text-sm leading-7 tracking-[0.01em] text-[#36241b]/85 sm:text-base">
                      {activeStep.description}
                    </p>
                    <div className="mt-6 h-[2px] w-full rounded-full bg-[#5a3e2c]/15">
                      <motion.div
                        key={`progress-line-${activeCategory.id}-${activeStep.id}`}
                        initial={{ width: '0%' }}
                        animate={{ width: `${((activeStepIndex + 1) / activeCategory.steps.length) * 100}%` }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full bg-[#452b1f]/75"
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>

            <motion.p
              style={{ opacity: aboutShellOpacity }}
              className="pointer-events-none absolute inset-x-0 bottom-8 text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-[#6d4d3c]/75"
            >
              {ABOUT_FOOTER_TAGLINE} / STEP {activeJourneyIndex + 1} OF {journeyStateCount}
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
