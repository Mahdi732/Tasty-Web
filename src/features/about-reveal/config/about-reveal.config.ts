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
