import {
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTime,
  useTransform,
} from 'framer-motion';
import { HERO_BURGER_ENTRY_SPRING, HERO_BURGER_EXIT_EASE, HERO_SEQUENCE_TIMING } from '@/components/HeroSection/Config';
import { useFallDistance } from '@/services/layout/useFallDistance';
import { MAIN_PAGE_DETACH_THRESHOLD } from './Config';
import type { RefObject } from 'react';
import type { HeroMealScene } from '@/components/HeroSection/Config';
import type { HeroSequencePhase } from '@/services/hero/useHeroSequence';

interface UseMainPageAnimationOptions {
  transitionSectionRef: RefObject<HTMLElement | null>;
  scene: HeroMealScene;
  phase: HeroSequencePhase;
  isMealDetached: boolean;
  setIsMealDetached: (value: boolean | ((prev: boolean) => boolean)) => void;
}

export const useMainPageAnimation = ({
  transitionSectionRef,
  scene,
  phase,
  isMealDetached,
  setIsMealDetached,
}: UseMainPageAnimationOptions) => {
  const fallDistance = useFallDistance();

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

  const travelTargetY = useTransform(smoothProgress, [0, 0.18, 0.92, 1], [scene.burgerY, -12, -12, -8]);
  const travelTargetScale = useTransform(smoothProgress, [0, 0.2, 0.9, 1], [1, 1.02, 1.02, 0.98]);
  const travelTargetRotate = useTransform(smoothProgress, [0, 0.6, 1], [scene.burgerRotate, 0, 0]);

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
    const nextDetached = latest > MAIN_PAGE_DETACH_THRESHOLD;
    setIsMealDetached((prev) => (prev === nextDetached ? prev : nextDetached));
  });

  const isExiting = phase === 'exit' && !isMealDetached;
  const heroY = isExiting ? -fallDistance * 1.08 : scene.burgerY;
  const heroRotate = isExiting ? scene.burgerRotate + 7 : scene.burgerRotate;

  const mealAnimate = isMealDetached ? undefined : { y: heroY, rotate: heroRotate, scale: 1 };
  const mealStyle = isMealDetached
    ? {
      y: cinematicY,
      scale: travelingScale,
      rotate: travelingRotate,
      rotateX: travelingRotateX,
      rotateY: travelingRotateY,
      transformPerspective: 1200,
      filter: `drop-shadow(${travelingDropShadow})`,
    }
    : undefined;

  const mealTransition = isMealDetached
    ? {
      type: 'spring' as const,
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
        type: 'spring' as const,
        ...HERO_BURGER_ENTRY_SPRING,
      });

  return {
    smoothProgress,
    travelingY,
    fallDistance,
    mealAnimate,
    mealStyle,
    mealTransition,
  };
};
