import { useEffect, useRef, useState, type RefObject } from 'react';
import { useMotionValueEvent, type MotionValue } from 'framer-motion';
import {
  ABOUT_CATEGORIES,
  ABOUT_FIRST_STEP_HOLD_MULTIPLIER,
  ABOUT_INTERACTION_START_PROGRESS,
  ABOUT_STEP_DWELL_MS,
  ABOUT_STEP_SCROLL_EFFORT_PX,
} from './Config';

const STEPS_PER_CATEGORY = 3;
const JOURNEY_STATE_COUNT = ABOUT_CATEGORIES.length * STEPS_PER_CATEGORY;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

interface UseAboutSectionLogicOptions {
  sectionRef: RefObject<HTMLElement | null>;
  progress: MotionValue<number>;
}

export const useAboutSectionLogic = ({ sectionRef, progress }: UseAboutSectionLogicOptions) => {
  const [activeJourneyIndex, setActiveJourneyIndex] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState(0.88);

  const activeJourneyIndexRef = useRef(0);
  const firstHoldConsumedRef = useRef(false);
  const clickLockUntilRef = useRef(0);
  const lastProgressRef = useRef(0);
  const progressPrimedRef = useRef(false);
  const lastDirectionRef = useRef<1 | -1>(1);
  const effortAccumulatorRef = useRef(0);
  const effortWindowMsRef = useRef(0);
  const lastTickAtRef = useRef(0);
  const lastStepChangeAtRef = useRef(0);

  const scrollToCategoryAnchor = (index: number) => {
    if (!sectionRef.current) {
      return;
    }

    const rect = sectionRef.current.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top;
    const sectionBottom = sectionTop + rect.height;
    const scrollStart = sectionTop - window.innerHeight + 2;
    const targetY = scrollStart + index * STEPS_PER_CATEGORY * ABOUT_STEP_SCROLL_EFFORT_PX;
    const clampedTargetY = clamp(targetY, scrollStart, sectionBottom - window.innerHeight);

    window.scrollTo({ top: clampedTargetY, behavior: 'smooth' });
  };

  useMotionValueEvent(progress, 'change', (latest) => {
    if (!sectionRef.current) {
      return;
    }

    const now = performance.now();

    if (now < clickLockUntilRef.current) {
      lastProgressRef.current = latest;
      return;
    }

    if (!progressPrimedRef.current) {
      lastProgressRef.current = latest;
      progressPrimedRef.current = true;
      lastTickAtRef.current = now;
      return;
    }

    const delta = latest - lastProgressRef.current;
    if (Math.abs(delta) < 0.0001) {
      return;
    }

    const frameDt = lastTickAtRef.current > 0 ? now - lastTickAtRef.current : 16;
    lastTickAtRef.current = now;

    // Delay internal step progression until About shell is visibly established.
    if (latest < ABOUT_INTERACTION_START_PROGRESS) {
      effortAccumulatorRef.current = 0;
      effortWindowMsRef.current = 0;
      lastProgressRef.current = latest;
      return;
    }

    const direction: 1 | -1 = delta > 0 ? 1 : -1;
    if (direction !== lastDirectionRef.current) {
      effortAccumulatorRef.current = 0;
      effortWindowMsRef.current = 0;
      lastDirectionRef.current = direction;
    }

    const scrollSpanPx = sectionRef.current.offsetHeight + window.innerHeight;
    const frameEffort = Math.abs(delta) * scrollSpanPx;
    effortAccumulatorRef.current += frameEffort;
    effortWindowMsRef.current += frameDt;
    lastProgressRef.current = latest;

    const requiredEffort = activeJourneyIndexRef.current === 0 && !firstHoldConsumedRef.current
      ? ABOUT_STEP_SCROLL_EFFORT_PX * ABOUT_FIRST_STEP_HOLD_MULTIPLIER
      : ABOUT_STEP_SCROLL_EFFORT_PX;

    if (effortAccumulatorRef.current < requiredEffort) {
      return;
    }
    if (now - lastStepChangeAtRef.current < ABOUT_STEP_DWELL_MS) {
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

    setActiveJourneyIndex((prev) => {
      const next = direction === 1 ? prev + stepCount : prev - stepCount;
      if (prev === 0 && next > 0) {
        firstHoldConsumedRef.current = true;
      }
      return clamp(next, 0, JOURNEY_STATE_COUNT - 1);
    });
  });

  const handleCategoryClick = (index: number) => {
    const now = performance.now();
    const targetJourneyIndex = index * STEPS_PER_CATEGORY;

    setActiveJourneyIndex(targetJourneyIndex);
    setTransitionDuration(0.72);
    firstHoldConsumedRef.current = targetJourneyIndex > 0;
    effortAccumulatorRef.current = 0;
    effortWindowMsRef.current = 0;
    lastStepChangeAtRef.current = now;
    lastTickAtRef.current = now;
    clickLockUntilRef.current = now + 420;
    progressPrimedRef.current = true;
    lastProgressRef.current = progress.get();
    scrollToCategoryAnchor(index);
  };

  useEffect(() => {
    activeJourneyIndexRef.current = activeJourneyIndex;
  }, [activeJourneyIndex]);

  const activeCategoryIndex = Math.floor(activeJourneyIndex / STEPS_PER_CATEGORY);
  const activeStepIndex = activeJourneyIndex % STEPS_PER_CATEGORY;
  const activeCategory = ABOUT_CATEGORIES[activeCategoryIndex] ?? ABOUT_CATEGORIES[0];
  const activeStep = activeCategory.steps[activeStepIndex] ?? activeCategory.steps[0];

  return {
    activeJourneyIndex,
    activeCategoryIndex,
    activeStepIndex,
    activeCategory,
    activeStep,
    transitionDuration,
    journeyStateCount: JOURNEY_STATE_COUNT,
    handleCategoryClick,
  };
};
