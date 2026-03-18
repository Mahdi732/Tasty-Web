export const HERO_ORDER_BUTTON_LABEL = 'Order';

export const HERO_SNACK_CARD_TITLE = 'Explore Our Restorent';

export const HERO_SNACK_IMAGE_ALT = 'Snack preview';

export const HERO_SNACK_ARROW_LABEL = 'Open snacks preview';

export const HERO_BURGER_IMAGE_SRC = '/burger.png';
export const HERO_BURGER_IMAGE_ALT = 'Burger product';

export const HERO_BEEF_IMAGE_SRC = '/beef.png';
export const HERO_BEEF_IMAGE_ALT = 'Beef ingredient';

export const HERO_PIZZA_IMAGE_SRC = '/pizza.png';
export const HERO_PIZZA_IMAGE_ALT = 'Pizza product';

export const HERO_PEPPERONI_IMAGE_SRC = '/papperoni.png';
export const HERO_PEPPERONI_IMAGE_ALT = 'Pepperoni ingredient';

export const HERO_JUICE_IMAGE_SRC = '/juice.png';
export const HERO_JUICE_IMAGE_ALT = 'Juice product';

export const HERO_STRAWBERRY_IMAGE_SRC = '/strawbery.png';
export const HERO_STRAWBERRY_IMAGE_ALT = 'Strawberry ingredient';

export const HERO_RAMEN_IMAGE_SRC = '/ramen.png';
export const HERO_RAMEN_IMAGE_ALT = 'Ramen product';

export const HERO_EGG_IMAGE_SRC = '/egg.png';
export const HERO_EGG_IMAGE_ALT = 'Egg ingredient';

export interface HeroMealScene {
  id: string;
  backgroundColor: string;
  headingLeft: string;
  headingRight: string;
  description: string;
  productImageSrc: string;
  productImageAlt: string;
  ingredientImageSrc: string;
  ingredientImageAlt: string;
  burgerRotate: number;
  burgerY: number;
  backgroundIngredients: readonly string[];
  foregroundIngredients: readonly string[];
}

export const HERO_SEQUENCE_TIMING = {
  entryDuration: 0.72,
  holdDuration: 1.0,
  exitDuration: 0.55,
  backgroundTransitionDuration: 0.4,
} as const;

export const HERO_BURGER_ENTRY_SPRING = {
  stiffness: 126,
  damping: 18,
  mass: 1.35,
  restSpeed: 0.12,
  restDelta: 0.12,
} as const;

export const HERO_BURGER_EXIT_EASE = [0.36, 0, 1, 1] as const;

export const HERO_INGREDIENT_MOTION = {
  delayRange: {
    min: 0.05,
    max: 0.25,
  },
  entrance: {
    foreground: {
      stiffness: 122,
      damping: 16,
      mass: 0.95,
    },
    background: {
      stiffness: 102,
      damping: 18,
      mass: 0.85,
    },
  },
  exit: {
    foregroundDelayMultiplier: 0.2,
    backgroundDelayMultiplier: 0.14,
  },
} as const;

export const HERO_MEAL_SCENES: readonly HeroMealScene[] = [
  {
    id: 'signature-burger',
    backgroundColor: '#c81f25',
    headingLeft: 'YOUR ONE',
    headingRight: 'STOP FLAVOR',
    description: 'Crave-worthy bites, signature sauces, and bold comfort food crafted for every mood.',
    productImageSrc: HERO_BURGER_IMAGE_SRC,
    productImageAlt: HERO_BURGER_IMAGE_ALT,
    ingredientImageSrc: HERO_BEEF_IMAGE_SRC,
    ingredientImageAlt: HERO_BEEF_IMAGE_ALT,
    burgerRotate: 18,
    burgerY: 26,
    backgroundIngredients: [
      'left-[15%] top-[18%] w-[200px] scale-80 opacity-60',
      'right-[16%] top-[30%] w-[190px] scale-60 opacity-60',
      'left-[31%] bottom-[16%] w-[180px] scale-75 opacity-60',
    ],
    foregroundIngredients: [
      'right-[-12%] bottom-[-23%] w-[270px] scale-[1.5] blur-[2px] sm:w-[330px]',
      'left-[-10%] top-[-20%] w-[260px] scale-[1.3] blur-[1.5px] sm:w-[310px]',
      'right-[-9%] top-[-18%] w-[230px] scale-[1.25] blur-[1.5px] sm:w-[280px]',
      'left-[-11%] bottom-[-20%] w-[235px] scale-[1.28] blur-[1.7px] sm:w-[285px]',
    ],
  },
  {
    id: 'pizza-pepperoni',
    backgroundColor: '#a81d1f',
    headingLeft: 'PIZZA',
    headingRight: 'NIGHT',
    description: 'Stone-baked slices layered with spicy pepperoni and rich melted goodness.',
    productImageSrc: HERO_PIZZA_IMAGE_SRC,
    productImageAlt: HERO_PIZZA_IMAGE_ALT,
    ingredientImageSrc: HERO_PEPPERONI_IMAGE_SRC,
    ingredientImageAlt: HERO_PEPPERONI_IMAGE_ALT,
    burgerRotate: 12,
    burgerY: 18,
    backgroundIngredients: [
      'left-[12%] top-[22%] w-[190px] scale-75 opacity-60',
      'right-[22%] top-[20%] w-[170px] scale-60 opacity-60',
      'left-[36%] bottom-[14%] w-[165px] scale-75 opacity-60',
    ],
    foregroundIngredients: [
      'right-[-14%] bottom-[-25%] w-[280px] scale-[1.55] blur-[2px] sm:w-[340px]',
      'left-[-11%] top-[-18%] w-[250px] scale-[1.25] blur-[1.5px] sm:w-[300px]',
      'right-[-10%] top-[-17%] w-[225px] scale-[1.22] blur-[1.5px] sm:w-[275px]',
      'left-[-12%] bottom-[-22%] w-[240px] scale-[1.3] blur-[1.7px] sm:w-[295px]',
    ],
  },
  {
    id: 'juice-strawberry',
    backgroundColor: '#a7174c',
    headingLeft: 'JUICY',
    headingRight: 'SPLASH',
    description: 'Fresh fruit blend with bright strawberry notes and a clean vibrant finish.',
    productImageSrc: HERO_JUICE_IMAGE_SRC,
    productImageAlt: HERO_JUICE_IMAGE_ALT,
    ingredientImageSrc: HERO_STRAWBERRY_IMAGE_SRC,
    ingredientImageAlt: HERO_STRAWBERRY_IMAGE_ALT,
    burgerRotate: 8,
    burgerY: 16,
    backgroundIngredients: [
      'left-[19%] top-[24%] w-[180px] scale-75 opacity-60',
      'right-[14%] top-[34%] w-[185px] scale-60 opacity-60',
      'left-[28%] bottom-[12%] w-[170px] scale-75 opacity-60',
    ],
    foregroundIngredients: [
      'right-[-10%] bottom-[-24%] w-[290px] scale-[1.45] blur-[2px] sm:w-[350px]',
      'left-[-12%] top-[-22%] w-[255px] scale-[1.28] blur-[1.5px] sm:w-[305px]',
      'right-[-8%] top-[-19%] w-[220px] scale-[1.2] blur-[1.4px] sm:w-[270px]',
      'left-[-12%] bottom-[-21%] w-[245px] scale-[1.28] blur-[1.7px] sm:w-[300px]',
    ],
  },
  {
    id: 'ramen-egg',
    backgroundColor: '#9b2a16',
    headingLeft: 'RAMEN',
    headingRight: 'CRAFT',
    description: 'Slow-simmered comfort bowl crowned with rich egg and deep umami layers.',
    productImageSrc: HERO_RAMEN_IMAGE_SRC,
    productImageAlt: HERO_RAMEN_IMAGE_ALT,
    ingredientImageSrc: HERO_EGG_IMAGE_SRC,
    ingredientImageAlt: HERO_EGG_IMAGE_ALT,
    burgerRotate: 10,
    burgerY: 20,
    backgroundIngredients: [
      'left-[16%] top-[20%] w-[195px] scale-75 opacity-60',
      'right-[20%] top-[28%] w-[175px] scale-60 opacity-60',
      'left-[33%] bottom-[13%] w-[165px] scale-75 opacity-60',
    ],
    foregroundIngredients: [
      'right-[-11%] bottom-[-24%] w-[280px] scale-[1.5] blur-[2px] sm:w-[340px]',
      'left-[-11%] top-[-19%] w-[248px] scale-[1.24] blur-[1.5px] sm:w-[300px]',
      'right-[-9%] top-[-18%] w-[222px] scale-[1.18] blur-[1.4px] sm:w-[272px]',
      'left-[-11%] bottom-[-20%] w-[238px] scale-[1.26] blur-[1.7px] sm:w-[290px]',
    ],
  },
];

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