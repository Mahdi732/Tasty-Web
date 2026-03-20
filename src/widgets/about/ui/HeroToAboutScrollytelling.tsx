'use client';

import { motion, useMotionTemplate, useTransform, type MotionValue } from 'framer-motion';
import type { RefObject } from 'react';
import { useAboutRevealOrchestration } from '@/features/about-reveal/model/useAboutRevealOrchestration';
import type { HeroMealScene } from '@/widgets/hero/config/hero.config';

interface HeroToAboutScrollytellingProps {
  sectionRef: RefObject<HTMLElement | null>;
  scene: HeroMealScene;
  progress: MotionValue<number>;
  subjectY: MotionValue<number>;
}

export const HeroToAboutScrollytelling = ({ sectionRef, scene, progress, subjectY }: HeroToAboutScrollytellingProps) => {
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
  } = useAboutRevealOrchestration(progress);

  const bleedRadius = useTransform(progress, [0, 0.7, 1], [180, 560, 980]);
  const bleedOpacity = useTransform(progress, [0.02, 0.3, 0.8, 1], [0.14, 0.56, 0.96, 1]);
  const fullBeigeOpacity = useTransform(progress, [0.38, 1], [0, 1]);
  const mealBleed = useMotionTemplate`radial-gradient(circle ${bleedRadius}px at 50% calc(50% + ${subjectY}px), rgba(246,231,213,0.96) 0%, rgba(246,231,213,0.76) 36%, rgba(246,231,213,0.42) 58%, rgba(246,231,213,0) 82%)`;

  const watermarkOpacity = useTransform(progress, [0.11, 0.42, 0.78, 1], [0, 0.42, 0.24, 0.14]);
  const revealMask = useMotionTemplate`radial-gradient(300px 250px at 50% calc(50% + ${subjectY}px), rgba(0,0,0,0.96), rgba(0,0,0,0.38) 62%, rgba(0,0,0,0) 100%)`;

  return (
    <section ref={sectionRef} className="relative h-[220vh]">
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
          className="absolute inset-x-0 bottom-8 z-20 mx-auto w-full max-w-7xl px-6 sm:px-10"
        >
          <div className="grid grid-cols-1 items-center gap-6 rounded-[2.25rem] bg-[#431813]/85 p-6 text-[#f7e8cf] shadow-[0_24px_60px_rgba(42,10,8,0.35)] backdrop-blur-md lg:grid-cols-[auto_1fr_auto] lg:p-8">
            <motion.div
              style={{
                opacity: leftContainerOpacity,
                x: leftContainerX,
                filter: sideFilter,
              }}
              className="h-[240px] w-[240px] rounded-[2rem] border border-[#f7e8cf]/24 bg-[#5c231c]/70 p-4"
            >
              <img
                src="/hotel.jpg"
                alt="Chef action visual"
                className="h-full w-full rounded-[1.3rem] object-cover"
              />
            </motion.div>

            <div className="hidden lg:block" />

            <motion.div
              style={{
                opacity: rightContainerOpacity,
                x: rightContainerX,
                filter: sideFilter,
              }}
              className="h-[240px] w-[240px] rounded-[2rem] border border-[#f7e8cf]/24 bg-[#5c231c]/70 p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f5c48a]">About Us</p>
              <h2 className="mt-3 text-lg font-extrabold uppercase tracking-[0.05em] text-[#fff3de]">
                Crafted For Bold Taste
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#f7e8cf]/85">
                Tasty blends culinary craft, design, and service precision into one elevated brand journey from first glance to final bite.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
