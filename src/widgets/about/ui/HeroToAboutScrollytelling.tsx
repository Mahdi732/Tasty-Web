'use client';

import { motion, useMotionTemplate, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';
import type { HeroMealScene } from '@/widgets/hero/config/hero.config';

interface HeroToAboutScrollytellingProps {
  scene: HeroMealScene;
  onDetachChange?: (isDetached: boolean) => void;
}

export const HeroToAboutScrollytelling = ({ scene, onDetachChange }: HeroToAboutScrollytellingProps) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const detachedRef = useRef(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 30,
    mass: 0.2,
  });

  const mealY = useTransform(smoothProgress, [0, 0.55, 1], [-300, -20, 180]);
  const mealScale = useTransform(smoothProgress, [0, 0.75, 1], [1.1, 1.02, 0.86]);
  const mealRotate = useTransform(smoothProgress, [0, 1], [scene.burgerRotate - 4, 0]);

  const revealOpacity = useTransform(smoothProgress, [0.08, 0.28, 0.52, 0.78], [0, 0.98, 0.7, 0.22]);
  const revealMask = useMotionTemplate`radial-gradient(240px 210px at 50% calc(50% + ${mealY}px), rgba(0,0,0,0.98), rgba(0,0,0,0.7) 55%, rgba(0,0,0,0) 100%)`;

  const aboutOpacity = useTransform(smoothProgress, [0.54, 0.76], [0, 1]);
  const leftVisualX = useTransform(smoothProgress, [0.54, 0.84], [-80, 0]);
  const rightTextX = useTransform(smoothProgress, [0.54, 0.84], [90, 0]);

  useMotionValueEvent(smoothProgress, 'change', (latest) => {
    const nextDetached = latest > 0.035 && latest < 0.91;

    if (nextDetached === detachedRef.current) {
      return;
    }

    detachedRef.current = nextDetached;
    onDetachChange?.(nextDetached);
  });

  useEffect(() => {
    return () => {
      onDetachChange?.(false);
    };
  }, [onDetachChange]);

  return (
    <section ref={sectionRef} className="relative h-[220vh] bg-[#f6e7d5]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.33),transparent_42%),radial-gradient(circle_at_76%_78%,rgba(112,37,28,0.16),transparent_40%)]" />

        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
          <span className="select-none text-[28vw] font-black uppercase leading-none tracking-[0.08em] text-[#34120f]/[0.07] sm:text-[22vw]">
            TASTY
          </span>

          <motion.span
            style={{
              opacity: revealOpacity,
              WebkitMaskImage: revealMask,
              maskImage: revealMask,
            }}
            className="absolute select-none text-[28vw] font-black uppercase leading-none tracking-[0.08em] text-[#f8d49f] sm:text-[22vw]"
          >
            TASTY
          </motion.span>
        </div>

        <motion.img
          src={scene.productImageSrc}
          alt={scene.productImageAlt}
          style={{
            y: mealY,
            scale: mealScale,
            rotate: mealRotate,
          }}
          className="pointer-events-none absolute left-1/2 top-1/2 z-30 w-[340px] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_28px_70px_rgba(0,0,0,0.35)] will-change-transform sm:w-[430px] lg:w-[510px]"
        />

        <motion.div
          style={{ opacity: aboutOpacity }}
          className="absolute inset-x-0 bottom-10 z-20 mx-auto w-full max-w-6xl px-6 sm:px-10"
        >
          <div className="grid grid-cols-1 items-center gap-6 rounded-[2.25rem] bg-[#431813]/85 p-6 text-[#f7e8cf] shadow-[0_24px_60px_rgba(42,10,8,0.35)] backdrop-blur-md lg:grid-cols-[1fr_auto_1fr] lg:p-8">
            <motion.div
              style={{ x: leftVisualX }}
              className="rounded-3xl border border-[#f7e8cf]/20 bg-[#5c231c]/65 p-4"
            >
              <img
                src={scene.ingredientImageSrc}
                alt={scene.ingredientImageAlt}
                className="h-44 w-full rounded-2xl object-contain sm:h-52"
              />
              <p className="mt-3 text-sm text-[#f7e8cf]/80">Layered ingredients and hand-finished details in every order.</p>
            </motion.div>

            <div className="hidden w-[300px] lg:block" />

            <motion.div style={{ x: rightTextX }} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f5c48a]">About Us</p>
              <h2 className="text-2xl font-extrabold uppercase tracking-[0.05em] text-[#fff3de] sm:text-3xl">
                Crafted For Bold Taste
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-[#f7e8cf]/85 sm:text-base">
                We blend premium ingredients, playful presentation, and kitchen precision to create meals that feel as good as they look. Every plate is designed to be memorable, balanced, and unmistakably Tasty.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
