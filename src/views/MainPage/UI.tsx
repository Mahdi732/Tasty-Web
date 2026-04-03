'use client';

import { motion } from 'framer-motion';
import { HeroSection } from '@/components/HeroSection/UI';
import { AboutSection } from '@/components/AboutSection/UI';
import { MAIN_PAGE_BACKGROUND } from './Config';
import { useMainPageLogic } from './Logic';
import { useMainPageAnimation } from './Animation';

export const MainPage = () => {
  const {
    transitionSectionRef,
    isMealDetached,
    setIsMealDetached,
    scene,
    phase,
  } = useMainPageLogic();

  const {
    smoothProgress,
    travelingY,
    fallDistance,
    mealAnimate,
    mealStyle,
    mealTransition,
  } = useMainPageAnimation({
    transitionSectionRef,
    scene,
    phase,
    isMealDetached,
    setIsMealDetached,
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: MAIN_PAGE_BACKGROUND }}>
      <HeroSection scene={scene} phase={phase} pauseSequence={isMealDetached} showMeal={false} />

      <div className="pointer-events-none fixed inset-0 z-[35] flex items-center justify-center">
        <motion.img
          key={scene.id}
          src={scene.productImageSrc}
          alt={scene.productImageAlt}
          initial={{ y: -fallDistance * 1.06, rotate: scene.burgerRotate - 20 }}
          animate={mealAnimate}
          style={mealStyle}
          transition={mealTransition}
          className="w-[340px] will-change-transform sm:w-[430px] lg:w-[510px]"
        />
      </div>

      <AboutSection
        sectionRef={transitionSectionRef}
        scene={scene}
        progress={smoothProgress}
        subjectY={travelingY}
      />
    </div>
  );
};
