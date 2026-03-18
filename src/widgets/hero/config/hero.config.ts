export const HERO_BACKGROUND_HEADING = 'YOUR ONE STOP FLAVOR';
export const HERO_BACKGROUND_HEADING_LEFT = 'YOUR ONE ';
export const HERO_BACKGROUND_HEADING_RIGHT = 'STOP FLAVOR';

export const HERO_DESCRIPTION =
  'Crave-worthy bites, signature sauces, and bold comfort food crafted for every mood.';

export const HERO_ORDER_BUTTON_LABEL = 'Order';

export const HERO_SNACK_CARD_TITLE = 'Explore Our Restorent';

export const HERO_SNACK_IMAGE_ALT = 'Snack preview';

export const HERO_SNACK_ARROW_LABEL = 'Open snacks preview';

export const HERO_BURGER_IMAGE_SRC = '/burger.png';
export const HERO_BURGER_IMAGE_ALT = 'Tasty hero burger';

export const HERO_BEEF_IMAGE_SRC = '/beef.png';
export const HERO_BEEF_IMAGE_ALT = 'Decorative beef element';

export const HERO_BACKGROUND_BEEF_LAYERS = [
  'left-[15%] top-[18%] w-[200px] scale-80 opacity-60 ',
  'right-[16%] top-[30%] w-[190px] scale-60 opacity-60 ',
  'left-[31%] bottom-[16%] w-[180px] scale-75 opacity-60 ',
] as const;

export const HERO_FOREGROUND_BEEF_LAYERS = [
  'right-[-12%] bottom-[-23%] w-[270px] scale-[1.5] blur-[2px] sm:w-[330px]',
  'left-[-10%] top-[-20%] w-[260px] scale-[1.3] blur-[1.5px] sm:w-[310px]',
] as const;

export const HERO_SECONDARY_FADE_DELAY = 0.28;
export const HERO_SECONDARY_FADE_DURATION = 0.6;

export const HERO_BURGER_FALL_PHYSICS = {
  stiffness: 118,
  damping: 15,
  mass: 1.2,
  restSpeed: 0.18,
  restDelta: 0.18,
} as const;

const snackPreviewSvg = `
<svg xmlns='http://www.w3.org/2000/svg' width='160' height='112' viewBox='0 0 160 112'>
  <defs>
    <linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0%' stop-color='#fbbf24'/>
      <stop offset='100%' stop-color='#f97316'/>
    </linearGradient>
  </defs>
  <rect x='0' y='0' width='160' height='112' rx='20' fill='url(#bg)'/>
  <circle cx='48' cy='56' r='22' fill='#fff7ed'/>
  <circle cx='86' cy='44' r='16' fill='#fde68a'/>
  <circle cx='110' cy='68' r='18' fill='#fff7ed'/>
  <circle cx='124' cy='44' r='10' fill='#fef3c7'/>
</svg>
`;

export const HERO_SNACK_IMAGE_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(snackPreviewSvg)}`;