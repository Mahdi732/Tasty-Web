export interface AboutStep {
  id: string;
  title: string;
  description: string;
}

export interface AboutCategory {
  id: string;
  label: string;
  steps: readonly [AboutStep, AboutStep, AboutStep];
}

export const ABOUT_CATEGORIES: readonly AboutCategory[] = [
  {
    id: 'about-us',
    label: 'ABOUT US',
    steps: [
      {
        id: 'about-1',
        title: 'CRAFTED FOR TASTE',
        description:
          'Tasty blends culinary craft, design, and service precision into one elevated brand journey from first glance to final bite.',
      },
      {
        id: 'about-2',
        title: 'BUILT AROUND PEOPLE',
        description:
          'Our teams choreograph speed, warmth, and consistency across every service moment so guests feel care in every interaction.',
      },
      {
        id: 'about-3',
        title: 'DESIGNED TO RETURN',
        description:
          'From visual identity to menu rhythm, each detail is intentional to create a brand memory that brings customers back.',
      },
    ],
  },
  {
    id: 'rules',
    label: 'RULES',
    steps: [
      {
        id: 'rules-1',
        title: 'STRICT RULES',
        description:
          'Every station follows exact timing, temperature, and plating standards before service can move to the next handoff.',
      },
      {
        id: 'rules-2',
        title: 'NO SHORTCUT ZONE',
        description:
          'Process discipline protects flavor. We block rushed prep paths to keep texture, seasoning, and presentation consistent.',
      },
      {
        id: 'rules-3',
        title: 'AUDITED IN REAL TIME',
        description:
          'Shift leads verify key checkpoints continuously so quality variance is corrected before it reaches the guest.',
      },
    ],
  },
  {
    id: 'quality',
    label: 'QUALITY',
    steps: [
      {
        id: 'quality-1',
        title: 'PREMIUM QUALITY',
        description:
          'Ingredients are selected for flavor integrity first, then validated for consistency across batch, prep, and service.',
      },
      {
        id: 'quality-2',
        title: 'FRESHNESS PROTOCOL',
        description:
          'Cold-chain control, prep windows, and hold-time limits preserve freshness so each order lands clean and vibrant.',
      },
      {
        id: 'quality-3',
        title: 'DETAIL AS STANDARD',
        description:
          'Finishing checks on balance, structure, and garnish guarantee that premium is delivered, not just promised.',
      },
    ],
  },
];

export const ABOUT_FOOTER_TAGLINE = 'TASTY / CRAFTED FOR BOLD TASTE';

export const ABOUT_STAGE_PIN_SCROLL_PX = 6000;
export const ABOUT_STEP_SCROLL_EFFORT_PX = 1000;
export const ABOUT_STEP_DWELL_MS = 1000;
export const ABOUT_INTERACTION_START_PROGRESS = 0.6;
export const ABOUT_FIRST_STEP_HOLD_MULTIPLIER = 1.35;

export const ABOUT_REVEAL_TIMING = {
  ingredientCleanupStart: 0.48,
  ingredientCleanupEnd: 0.66,
  revealStart: 0.62,
  revealEnd: 0.78,
} as const;

export const ABOUT_REVEAL_EASING = {
  expo: [0.19, 1, 0.22, 1],
  quint: [0.23, 1, 0.32, 1],
} as const;
