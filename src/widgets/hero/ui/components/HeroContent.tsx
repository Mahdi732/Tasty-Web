import {
  HERO_ORDER_BUTTON_LABEL,
  HERO_SNACK_ARROW_LABEL,
  HERO_SNACK_CARD_TITLE,
  HERO_SNACK_IMAGE_ALT,
  HERO_SNACK_IMAGE_SRC,
  type HeroMealScene,
} from '../../config/hero.config';

interface HeroContentProps {
  scene: HeroMealScene;
}

export const HeroContent = ({ scene }: HeroContentProps) => {
  return (
    <div className="relative z-[25] mx-auto flex h-full w-full max-w-7xl items-end justify-between px-6 pb-10 sm:px-10 sm:pb-14">
      <div className="max-w-md space-y-6">
        <p className="text-base leading-relaxed text-white sm:text-lg">{scene.description}</p>

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
            {'->'}
          </button>
        </div>
      </div>
    </div>
  );
};
