'use client';

import { motion, useMotionTemplate, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion';
import { useTime } from 'framer-motion';
import { useRef, useState } from 'react';
import { IslandNavbar } from '@/features/navbar/ui/IslandNavbar';
import { HeroSection } from '@/widgets/hero/ui/HeroSection';
import {
  HERO_BURGER_ENTRY_SPRING,
  HERO_BURGER_EXIT_EASE,
  HERO_SEQUENCE_TIMING,
} from '@/widgets/hero/config/hero.config';
import { useFallDistance } from '@/widgets/hero/model/use-fall-distance';
import { useHeroSequence } from '@/widgets/hero/model/use-hero-sequence';
import { HeroToAboutScrollytelling } from '@/widgets/about/ui/HeroToAboutScrollytelling';

export const HomeExperience = () => {
  const transitionSectionRef = useRef<HTMLElement | null>(null);
  const [isMealDetached, setIsMealDetached] = useState(false);
  const fallDistance = useFallDistance();
  const { scene, phase } = useHeroSequence({ paused: isMealDetached });

  const { scrollYProgress } = useScroll({
    target: transitionSectionRef,
    offset: ['start end', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 30,
    mass: 0.2,
  });

  const time = useTime();

  const travelTargetY = useTransform(smoothProgress, [0, 0.55, 1], [scene.burgerY, -14, 170]);
  const travelTargetScale = useTransform(smoothProgress, [0, 0.75, 1], [1, 1.02, 0.86]);
  const travelTargetRotate = useTransform(smoothProgress, [0, 1], [scene.burgerRotate, 0]);

  // Subject inertia: the meal trails the scroll target a bit to feel weighted.
  const travelingY = useSpring(travelTargetY, {
    stiffness: 92,
    damping: 21,
    mass: 0.84,
  });
  const travelingScale = useSpring(travelTargetScale, {
    stiffness: 112,
    damping: 24,
    mass: 0.64,
  });
  const travelingRotate = useSpring(travelTargetRotate, {
    stiffness: 106,
    damping: 22,
    mass: 0.68,
  });

  const travelingRotateX = useTransform(travelingY, [scene.burgerY, 170], [7, -7]);
  const travelingRotateY = useTransform(smoothProgress, [0, 0.35, 0.72, 1], [-5, 0, 4, 0]);
  const travelingShadowBlur = useTransform(smoothProgress, [0, 0.7, 1], [66, 82, 58]);
  const travelingShadowOpacity = useTransform(smoothProgress, [0, 0.72, 1], [0.34, 0.42, 0.24]);
  const travelingDropShadow = useMotionTemplate`0 32px ${travelingShadowBlur}px rgba(0,0,0,${travelingShadowOpacity})`;
  const idleBase = useTransform(time, (t) => Math.sin(t / 820) * 3.4);
  const idleAmount = useTransform(smoothProgress, [0.78, 1], [0, 1]);
  const idleLift = useTransform([idleBase, idleAmount], ([bob, amount]) => bob * amount);
  const cinematicY = useTransform([travelingY, idleLift], ([baseY, bob]) => baseY + bob);

  useMotionValueEvent(smoothProgress, 'change', (latest) => {
    const nextDetached = latest > 0.035 && latest < 0.985;
    setIsMealDetached((prev) => (prev === nextDetached ? prev : nextDetached));
  });

  const isExiting = phase === 'exit' && !isMealDetached;
  const heroY = isExiting ? -fallDistance * 1.08 : scene.burgerY;
  const heroRotate = isExiting ? scene.burgerRotate + 7 : scene.burgerRotate;

  return (
    <div className="min-h-screen bg-[#c81f25]">
      <IslandNavbar />
      <HeroSection scene={scene} phase={phase} pauseSequence={isMealDetached} showMeal={false} />

      <div className="pointer-events-none fixed inset-0 z-[35] flex items-center justify-center">
        <motion.img
          key={scene.id}
          src={scene.productImageSrc}
          alt={scene.productImageAlt}
          initial={{ y: -fallDistance * 1.06, rotate: scene.burgerRotate - 20 }}
          animate={isMealDetached ? undefined : { y: heroY, rotate: heroRotate, scale: 1 }}
          style={isMealDetached
            ? {
              y: cinematicY,
              scale: travelingScale,
              rotate: travelingRotate,
              rotateX: travelingRotateX,
              rotateY: travelingRotateY,
              transformPerspective: 1200,
              filter: `drop-shadow(${travelingDropShadow})`,
            }
            : undefined}
          transition={isMealDetached
            ? {
              type: 'spring',
              stiffness: 170,
              damping: 28,
              mass: 0.24,
            }
            : (isExiting
              ? {
                duration: HERO_SEQUENCE_TIMING.exitDuration,
                ease: HERO_BURGER_EXIT_EASE,
              }
              : {
                type: 'spring',
                ...HERO_BURGER_ENTRY_SPRING,
              })}
          className="w-[340px] will-change-transform sm:w-[430px] lg:w-[510px]"
        />
      </div>

      <HeroToAboutScrollytelling
        sectionRef={transitionSectionRef}
        scene={scene}
        progress={smoothProgress}
        subjectY={travelingY}
      />
    </div>
  );
};
