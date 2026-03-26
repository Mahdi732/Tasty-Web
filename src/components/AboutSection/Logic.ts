import { useEffect, useRef, useState, type RefObject } from 'react';
import { useMotionValueEvent, type MotionValue } from 'framer-motion';
import {
  ABOUT_CATEGORIES,
  ABOUT_FIRST_STEP_HOLD_MULTIPLIER,
  ABOUT_FIRST_STEP_MIN_VISIBLE_MS,
  ABOUT_REVEAL_TIMING,
  ABOUT_STEP_DWELL_MS,
  ABOUT_STEP_SCROLL_EFFORT_PX,
} from './Config';

const STEPS_PER_CATEGORY = 3;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

interface UseAboutSectionLogicOptions {
  sectionRef: RefObject<HTMLElement | null>;
  progress: MotionValue<number>;
}

export const useAboutSectionLogic = ({ sectionRef, progress }: UseAboutSectionLogicOptions) => {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [stepByCategory, setStepByCategory] = useState<number[]>(() => ABOUT_CATEGORIES.map(() => 0));
  const [transitionDuration, setTransitionDuration] = useState(0.88);

  const activeCategoryIndexRef = useRef(0);
  const stepByCategoryRef = useRef<number[]>(ABOUT_CATEGORIES.map(() => 0));
  const firstHoldConsumedRef = useRef(false);
  const clickLockUntilRef = useRef(0);
  const revealReadyRef = useRef(false);
  const lastDirectionRef = useRef<1 | -1>(1);
  const effortAccumulatorRef = useRef(0);
  const effortWindowMsRef = useRef(0);
  const lastTickAtRef = useRef(0);
  const lastStepChangeAtRef = useRef(0);
  const interactionUnlockedRef = useRef(false);
  const firstStepEnteredAtRef = useRef<number[]>(ABOUT_CATEGORIES.map(() => 0));

  useMotionValueEvent(progress, 'change', (latest) => {
    const isRevealReady = latest >= ABOUT_REVEAL_TIMING.revealEnd;
    revealReadyRef.current = isRevealReady;
    interactionUnlockedRef.current = isRevealReady;

    if (!isRevealReady) {
      effortAccumulatorRef.current = 0;
      effortWindowMsRef.current = 0;
    }
  });

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      const now = performance.now();

      if (now < clickLockUntilRef.current) {
        return;
      }

      if (!interactionUnlockedRef.current) {
        return;
      }

      if (Math.abs(event.deltaY) < 0.5) {
        return;
      }

      const section = sectionRef.current;
      if (!section) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const isSectionPinned = rect.top <= 0 && rect.bottom >= window.innerHeight;
      if (!isSectionPinned) {
        return;
      }

      const direction: 1 | -1 = event.deltaY > 0 ? 1 : -1;
      if (direction !== lastDirectionRef.current) {
        effortAccumulatorRef.current = 0;
        effortWindowMsRef.current = 0;
        lastDirectionRef.current = direction;
      }

      // Freeze content transitions for a short period after each visible step change.
      if (now - lastStepChangeAtRef.current < ABOUT_STEP_DWELL_MS) {
        effortAccumulatorRef.current = 0;
        effortWindowMsRef.current = 0;
        return;
      }

      const frameDt = lastTickAtRef.current > 0 ? now - lastTickAtRef.current : 16;
      lastTickAtRef.current = now;

      effortAccumulatorRef.current += Math.abs(event.deltaY);
      effortWindowMsRef.current += frameDt;

      const currentCategory = activeCategoryIndexRef.current;
      const currentStep = stepByCategoryRef.current[currentCategory] ?? 0;

      const requiredEffort = currentStep === 0 && !firstHoldConsumedRef.current
        ? ABOUT_STEP_SCROLL_EFFORT_PX * ABOUT_FIRST_STEP_HOLD_MULTIPLIER
        : ABOUT_STEP_SCROLL_EFFORT_PX;

      if (currentStep === 0 && now - (firstStepEnteredAtRef.current[currentCategory] ?? 0) < ABOUT_FIRST_STEP_MIN_VISIBLE_MS) {
        return;
      }

      if (effortAccumulatorRef.current < requiredEffort) {
        return;
      }

      const stepCount = 1;
      const consumedEffort = requiredEffort;
      effortAccumulatorRef.current -= consumedEffort;
      lastStepChangeAtRef.current = now;
      const effortVelocity = (consumedEffort / Math.max(120, effortWindowMsRef.current)) * 1000;
      effortWindowMsRef.current = 0;

      const nextDuration = clamp(1.08 - effortVelocity / 3200, 0.56, 1.08);
      setTransitionDuration(nextDuration);

      setStepByCategory((prev) => {
        const next = [...prev];
        const prevStep = next[currentCategory] ?? 0;
        const nextStep = direction === 1 ? prevStep + stepCount : prevStep - stepCount;
        const clampedStep = clamp(nextStep, 0, STEPS_PER_CATEGORY - 1);

        if (prevStep === 0 && clampedStep > 0) {
          firstHoldConsumedRef.current = true;
        }

        if (clampedStep === 0) {
          firstStepEnteredAtRef.current[currentCategory] = now;
        }

        next[currentCategory] = clampedStep;
        return next;
      });
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [sectionRef]);

  const handleCategoryClick = (index: number) => {
    const now = performance.now();

    setActiveCategoryIndex(index);
    setStepByCategory((prev) => {
      const next = [...prev];
      next[index] = 0;
      return next;
    });
    firstStepEnteredAtRef.current[index] = now;
    setTransitionDuration(0.72);
    firstHoldConsumedRef.current = false;
    interactionUnlockedRef.current = revealReadyRef.current;
    effortAccumulatorRef.current = 0;
    effortWindowMsRef.current = 0;
    lastStepChangeAtRef.current = now;
    lastTickAtRef.current = now;
    clickLockUntilRef.current = now + 420;
  };

  useEffect(() => {
    activeCategoryIndexRef.current = activeCategoryIndex;
  }, [activeCategoryIndex]);

  useEffect(() => {
    stepByCategoryRef.current = stepByCategory;
  }, [stepByCategory]);

  useEffect(() => {
    const now = performance.now();
    firstStepEnteredAtRef.current = ABOUT_CATEGORIES.map(() => now);
  }, []);

  const activeCategory = ABOUT_CATEGORIES[activeCategoryIndex] ?? ABOUT_CATEGORIES[0];
  const activeStepIndex = stepByCategory[activeCategoryIndex] ?? 0;
  const activeStep = activeCategory.steps[activeStepIndex] ?? activeCategory.steps[0];

  return {
    activeJourneyIndex: activeStepIndex,
    activeCategoryIndex,
    activeStepIndex,
    activeCategory,
    activeStep,
    transitionDuration,
    journeyStateCount: STEPS_PER_CATEGORY,
    handleCategoryClick,
  };
};
