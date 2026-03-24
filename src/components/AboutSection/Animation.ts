import { cubicBezier, useMotionTemplate, useTransform, type MotionValue } from 'framer-motion';
import { ABOUT_REVEAL_EASING, ABOUT_REVEAL_TIMING } from './Config';

export const useAboutSectionAnimation = (progress: MotionValue<number>) => {
  const expoOut = cubicBezier(...ABOUT_REVEAL_EASING.expo);
  const quintOut = cubicBezier(...ABOUT_REVEAL_EASING.quint);

  const carryOpacity = useTransform(
    progress,
    [
      ABOUT_REVEAL_TIMING.ingredientCleanupStart,
      (ABOUT_REVEAL_TIMING.ingredientCleanupStart + ABOUT_REVEAL_TIMING.ingredientCleanupEnd) / 2,
      ABOUT_REVEAL_TIMING.ingredientCleanupEnd,
    ],
    [0.92, 0.38, 0],
  );
  const carryBgDriftY = useTransform(
    progress,
    [ABOUT_REVEAL_TIMING.ingredientCleanupStart, ABOUT_REVEAL_TIMING.ingredientCleanupEnd],
    [0, -124],
    { ease: expoOut },
  );
  const carryFgDriftY = useTransform(
    progress,
    [ABOUT_REVEAL_TIMING.ingredientCleanupStart, ABOUT_REVEAL_TIMING.ingredientCleanupEnd],
    [0, -168],
    { ease: expoOut },
  );
  const carryBgScale = useTransform(
    progress,
    [ABOUT_REVEAL_TIMING.ingredientCleanupStart, ABOUT_REVEAL_TIMING.ingredientCleanupEnd],
    [1, 0.82],
    { ease: quintOut },
  );
  const carryFgScale = useTransform(
    progress,
    [ABOUT_REVEAL_TIMING.ingredientCleanupStart, ABOUT_REVEAL_TIMING.ingredientCleanupEnd],
    [1, 0.76],
    { ease: quintOut },
  );

  const aboutShellOpacity = useTransform(
    progress,
    [ABOUT_REVEAL_TIMING.revealStart, ABOUT_REVEAL_TIMING.revealEnd],
    [0, 1],
    { ease: quintOut },
  );

  const leftContainerOpacity = useTransform(
    progress,
    [ABOUT_REVEAL_TIMING.revealStart, ABOUT_REVEAL_TIMING.revealEnd],
    [0, 1],
    { ease: expoOut },
  );
  const leftContainerX = useTransform(
    progress,
    [ABOUT_REVEAL_TIMING.revealStart, ABOUT_REVEAL_TIMING.revealEnd],
    [-190, 0],
    { ease: quintOut },
  );

  const rightContainerOpacity = useTransform(
    progress,
    [ABOUT_REVEAL_TIMING.revealStart, ABOUT_REVEAL_TIMING.revealEnd],
    [0, 1],
    { ease: expoOut },
  );
  const rightContainerX = useTransform(
    progress,
    [ABOUT_REVEAL_TIMING.revealStart, ABOUT_REVEAL_TIMING.revealEnd],
    [190, 0],
    { ease: quintOut },
  );

  const sideBlur = useTransform(
    progress,
    [ABOUT_REVEAL_TIMING.revealStart, ABOUT_REVEAL_TIMING.revealEnd],
    [16, 0],
    { ease: expoOut },
  );
  const sideFilter = useMotionTemplate`blur(${sideBlur}px)`;

  return {
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
  };
};
